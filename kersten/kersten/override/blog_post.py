import frappe
from frappe.website.doctype.blog_post.blog_post import BlogPost as _BlogPost
from frappe.utils import (
	cint,
	get_fullname,
	global_date_format,
	markdown,
	sanitize_html,
	strip_html_tags,
	today,
)
from frappe import _

from frappe.website.utils import (
	clear_cache,
	find_first_image,
	get_comment_list,
	get_html_content_based_on_type,
)

class BlogPost(_BlogPost):
	def get_context(self, context):
		# this is for double precaution. usually it wont reach this code if not published
		if not cint(self.published):
			raise Exception("This blog has not been published yet!")

		context.no_breadcrumbs = False

		# temp fields
		context.full_name = get_fullname(self.owner)
		context.updated = global_date_format(self.published_on)
		context.social_links = self.fetch_social_links_info()
		context.cta = self.fetch_cta()
		context.enable_cta = not self.hide_cta and frappe.db.get_single_value(
			"Blog Settings", "show_cta_in_blog", cache=True
		)

		if self.blogger:
			context.blogger_info = frappe.get_doc("Blogger", self.blogger).as_dict()
			context.author = self.blogger

		context.content = get_html_content_based_on_type(self, "content", self.content_type)

		# if meta description is not present, then blog intro or first 140 characters of the blog will be set as description
		context.description = (
			self.meta_description or self.blog_intro or strip_html_tags(context.content[:140])
		)

		context.metatags = {
			"name": self.meta_title,
			"description": context.description,
		}

		# if meta image is not present, then first image inside the blog will be set as the meta image
		image = find_first_image(context.content)
		context.metatags["image"] = self.meta_image or image or None

		self.load_comments(context)
		self.load_likes(context)

		context.category = frappe.db.get_value(
			"Blog Category", context.doc.blog_category, ["title", "route"], as_dict=1
		)
		context.parents = [
			{"name": _("Home"), "route": "/"},
			{"name": "Blog", "route": "/blog"},
			{"label": context.category.title, "route": context.category.route},
		]
		context.guest_allowed = frappe.db.get_single_value("Blog Settings", "allow_guest_to_comment")
