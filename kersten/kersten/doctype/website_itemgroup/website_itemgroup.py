# Copyright (c) 2024, viral and contributors
# For license information, please see license.txt

# import frappe
from frappe.utils.nestedset import NestedSet


class WebsiteItemgroup(NestedSet):
	pass
# -*- coding: utf-8 -*-
# Copyright (c) 2020, Finbyz Tech Pvt Ltd and contributors
# For license information, please see license.txt

import frappe
import copy
from frappe import _
from frappe.utils import cint
from frappe.utils.nestedset import NestedSet
from frappe.website.website_generator import WebsiteGenerator
from frappe.website.utils import clear_cache
# from frappe.website.doctype.website_slideshow.website_slideshow import get_slideshow
# from erpnext.shopping_cart.product_info import set_product_info_for_website
# from webshop.webshop.shopping_cart.product_info import set_product_info_for_website
# from erpnext.utilities.product import get_qty_in_stock
from six.moves.urllib.parse import quote
# from frappe.utils import getdate
from kersten.kersten.product_data_engine.filters import ProductFiltersBuilder
from frappe.website.doctype.web_page.web_page import get_web_blocks_html



class WebsiteItemgroup(WebsiteGenerator, NestedSet):
	nsm_parent_field = 'parent_website_itemgroup'
	website = frappe._dict(
		condition_field = "show_in_website",
		template = "templates/generators/website_itemgroup.html",
		no_cache = 1,
		no_breadcrumbs=1,
	)
	
	def validate(self):
		self.make_route()
		WebsiteGenerator.validate(self)
		
	def on_update(self):
		invalidate_cache_for(self)

	def make_route(self):
		"""Make website route"""
		if self.route:
			return

		self.route = ""
		if self.parent_website_itemgroup:
			parent_item_group = frappe.get_doc("Website Itemgroup", self.parent_website_itemgroup)

			# make parent route only if not root
			if parent_item_group.parent_website_itemgroup and parent_item_group.route:
				self.route = parent_item_group.route + "/"

		self.route += self.scrub(self.website_itemgroup_name)
		return self.route

	def on_trash(self):
		WebsiteGenerator.on_trash(self)
	
	def get_html(self, context):
		if self.get('content_type') == 'Page Builder':
			out = get_web_blocks_html(self.page_blocks)
			context.page_builder_html = out.html
			context.page_builder_scripts = out.scripts

	def get_context(self, context):
		context.show_search = True
		context.body_class = "product-page"
		context.page_length = (
			cint(frappe.db.get_single_value("Webshop Settings", "products_per_page")) or 6
		)
		context.search_link = "/product_search"
		self.get_html(context)
		filter_engine = ProductFiltersBuilder(self.name)

		context.field_filters = filter_engine.get_field_filters()
		context.attribute_filters = filter_engine.get_attribute_filters()

		context.update({"parents": get_parent_item_groups(self.parent_website_itemgroup), "title": self.name})

		if self.slideshow:
			values = {"show_indicators": 1, "show_controls": 0, "rounded": 1, "slider_name": self.slideshow}
			slideshow = frappe.get_doc("Website Slideshow", self.slideshow)
			slides = slideshow.get({"doctype": "Website Slideshow Item"})
			for index, slide in enumerate(slides):
				values[f"slide_{index + 1}_image"] = slide.image
				values[f"slide_{index + 1}_title"] = slide.heading
				values[f"slide_{index + 1}_subtitle"] = slide.description
				values[f"slide_{index + 1}_theme"] = slide.get("theme") or "Light"
				values[f"slide_{index + 1}_content_align"] = slide.get("content_align") or "Centre"
				values[f"slide_{index + 1}_primary_action"] = slide.url

			context.slideshow = values

		context.no_breadcrumbs = False
		context.title = self.website_title or self.name
		context.name = self.name
		context.item_group_name = self.website_itemgroup_name
		context.full_width = 0

		# related_items = frappe.db.sql("""
		# select name, route, image
		# from `tabWebsite Itemgroup`
		# where parent_website_itemgroup=%s
		# and show_in_website=1
		# order by creation desc
		# """, self.name, as_dict=1)

		related_items = get_super_child_groups_for_website(self.name, immediate=False, include_self=False)
		context.related_items = related_items

		return context

def get_super_child_groups_for_website(item_group_name, immediate=False, include_self=False):
    """Returns child item groups excluding the passed group unless include_self is True."""
    item_group = frappe.get_cached_value("Website Itemgroup", item_group_name, ["lft", "rgt"], as_dict=True)
    lft = item_group.get("lft")
    rgt = item_group.get("rgt")
    
    filters = ["show_in_website = 1"]
    params = []
    
    if include_self:
        filters.append("lft >= %s")
        filters.append("rgt <= %s")
        params.extend([lft, rgt])
    else:
        filters.append("lft > %s")
        filters.append("rgt < %s")
        params.extend([lft, rgt])
    
    if immediate:
        filters.append("parent_website_itemgroup = %s")
        params.append(item_group_name)
    
    filters_condition = " AND ".join(filters)
    
    child_groups = []
    stack = [item_group_name]

    while stack:
        parent_name = stack.pop()
        children = frappe.db.sql(f"""
            SELECT 
                DISTINCT wi.name, wi.route, wi.image
            FROM
                `tabWebsite Itemgroup` wi
                JOIN `tabWebsite Item Group` wig ON wi.name = wig.website_itemgroup 
                JOIN `tabWebsite Item` wia ON wig.parent = wia.name
            WHERE
                {filters_condition} AND wi.parent_website_itemgroup = %s
            GROUP BY
                wi.weightage DESC, wi.name ASC
        """, params + [parent_name], as_dict=True)
        child_groups.extend(children)
        if not immediate:
            stack.extend(child['name'] for child in children)

    return child_groups

def get_item_for_list_in_html(context):
	# add missing absolute link in files
	# user may forget it during upload
	if (context.get("website_image") or "").startswith("files/"):
		context["website_image"] = "/" + quote(context["website_image"])

	products_template = "templates/includes/products_as_list.html"

	return frappe.get_template(products_template).render(context)


def get_parent_item_groups(item_group_name, from_item=False):
	settings = frappe.get_cached_doc("Webshop Settings")

	if settings.enable_field_filters:
		base_nav_page = {"name": _("Shop by Category"), "route": "/shop-by-category"}
	else:
		base_nav_page = {"name": _("All Products"), "route": "/all-products"}

	if from_item and frappe.request.environ.get("HTTP_REFERER"):
		# base page after 'Home' will vary on Item page
		last_page = frappe.request.environ["HTTP_REFERER"].split("/")[-1].split("?")[0]
		if last_page and last_page in ("shop-by-category", "all-products"):
			base_nav_page_title = " ".join(last_page.split("-")).title()
			base_nav_page = {"name": _(base_nav_page_title), "route": "/" + last_page}

	base_parents = [
		{"name": _("Home"), "route": "/"},
		base_nav_page,
	]

	if not item_group_name:
		return base_parents

	if not item_group_name:
		return base_parents

	item_group = frappe.db.get_value("Website Itemgroup", item_group_name, ["lft", "rgt"], as_dict=1)
	if not item_group:
		frappe.throw(str(item_group_name))
	parent_groups = frappe.db.sql(
		"""select name, route from `tabWebsite Itemgroup`
		where lft <= %s and rgt >= %s
		and show_in_website=1
		order by lft asc""",
		(item_group.lft, item_group.rgt),
		as_dict=True,
	)

	return base_parents + parent_groups


def invalidate_cache_for(doc, item_group=None):
	if not item_group:
		item_group = doc.name
		
	if doc.doctype == "Website Itemgroup":
		item_group = doc.name

		for d in get_parent_item_groups(item_group):
			item_group_name = frappe.db.get_value("Website Itemgroup", d.get("name"))
			if item_group_name:
				clear_cache(frappe.db.get_value("Website Itemgroup", item_group_name, "route"))
	
	if doc.doctype == "Website Item":
		for row in doc.get("website_item_groups"):
			item_group = row.website_itemgroup

			for d in get_parent_item_groups(item_group):
				item_group_name = frappe.db.get_value("Website Itemgroup", d.get("name"))
				if item_group_name:
					clear_cache(frappe.db.get_value("Website Itemgroup", item_group_name, "route"))

def get_child_groups_for_website(item_group_name, immediate=False, include_self=False):
	"""Returns child item groups *excluding* passed group."""
	item_group = frappe.get_cached_value("Website Itemgroup", item_group_name, ["lft", "rgt"], as_dict=1)
	filters = {"lft": [">", item_group.lft], "rgt": ["<", item_group.rgt], "show_in_website": 1}

	if immediate:
		filters["parent_website_itemgroup"] = item_group_name

	if include_self:
		filters.update({"lft": [">=", item_group.lft], "rgt": ["<=", item_group.rgt]})

	return frappe.get_all("Website Itemgroup", filters=filters, fields=["name", "route"], order_by="name")



@frappe.whitelist()
def get_item_group_tree():
    def get_children(parent):
        children = frappe.get_all('Website Itemgroup', filters={'parent_website_itemgroup': parent}, fields=['name'])
        return [{'text': child.name, 'children': get_children(child.name)} for child in children]
    
    root_nodes = frappe.get_all('Website Itemgroup', filters={'parent_website_itemgroup': ''}, fields=['name'])
    tree_data = [{'text': node.name, 'children': get_children(node.name)} for node in root_nodes]
    return tree_data
