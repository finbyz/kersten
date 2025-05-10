import frappe
import frappe.defaults
from frappe import _, bold, throw
from frappe.contacts.doctype.address.address import get_address_display
from frappe.contacts.doctype.contact.contact import get_contact_name
from frappe.utils import cint, cstr, flt, get_fullname
from frappe.utils.nestedset import get_root_of
from frappe.core.doctype.file.utils import extract_images_from_html

from erpnext.accounts.utils import get_account_name
from webshop.webshop.doctype.webshop_settings.webshop_settings import (
	get_shopping_cart_settings,
)
# from erpnext.utilities.product import get_web_item_qty_in_stock
@frappe.whitelist()
def get_contact_list(txt, page_length=20, extra_filters: str | None = None) -> list[dict]:
	"""Return email ids for a multiselect field."""
	frappe.throw("hello")
	if extra_filters:
		extra_filters = frappe.parse_json(extra_filters)

	filters = [
		["Contact Email", "email_id", "is", "set"],
	]
	if extra_filters:
		filters.extend(extra_filters)

	fields = ["first_name", "middle_name", "last_name", "company_name"]
	contacts = frappe.get_list(
		"Contact",
		fields=["full_name", "`tabContact Email`.email_id","user"],
		filters=filters,
		or_filters=[[field, "like", f"%{txt}%"] for field in fields]
		+ [["Contact Email", "email_id", "like", f"%{txt}%"]],
		limit_page_length=page_length,
	)
	filtered_contacts = []
	for contact in contacts:
		if contact.user:
			if frappe.db.get_value("User", contact.user, "enabled") == 1:
				filtered_contacts.append(contact)
		else:
			filtered_contacts.append(contact)
	# The multiselect field will store the `label` as the selected value.
	# The `value` is just used as a unique key to distinguish between the options.
	# https://github.com/frappe/frappe/blob/6c6a89bcdd9454060a1333e23b855d0505c9ebc2/frappe/public/js/frappe/form/controls/autocomplete.js#L29-L35
	return [
		frappe._dict(
			value=d.email_id,
			label=d.email_id,
			description=d.full_name,
		)
		for d in filtered_contacts
	]
def add_comment(reference_doctype: str, reference_name: str, content: str, comment_email: str, comment_by: str):
	reference_doc = frappe.get_doc(reference_doctype, reference_name)

	comment = frappe.new_doc("Comment")
	comment.update(
		{
			"comment_type": "Comment",
			"reference_doctype": reference_doctype,
			"reference_name": reference_name,
			"comment_email": comment_email,
			"comment_by": comment_by,
			"content": extract_images_from_html(reference_doc, content, is_private=True),
		}
	)
	comment.insert(ignore_permissions=True)

	if frappe.get_cached_value("User", frappe.session.user, "follow_commented_documents"):
		follow_document(comment.reference_doctype, comment.reference_name, frappe.session.user)

	return comment

@frappe.whitelist(allow_guest=True)
def create_lead_for_item_inquiry(lead, subject, message):
	doc = frappe.parse_json(lead)
	
	sender = doc.email_id
	phone = doc.phone
	company_name = doc.company_name
	fullname = doc.lead_name
	message = """
		<div>
			<h5>{subject}</h5>
			<p>{message}</p>
		</div>
		""".format(
				subject=subject, message=message
			)

	contact_data = frappe.db.sql(f""" Select co.name , dl.link_name From `tabContact` as co
											  Left join `tabContact Email` as ce ON ce.parent = co.name
											  left join `tabDynamic Link` as dl ON dl.parent = co.name
											  Where ce.email_id = '{sender}' and dl.link_doctype = "Customer" 
											""",as_dict = 1)

	if contact_data:
		doc = frappe.new_doc("Opportunity")
		doc.opportunity_from = "Customer"
		doc.party_name = contact_data[0].link_name
		doc.contact_mobile = phone
		doc.contact_email = sender
		doc.save(ignore_permissions = True)
		
		add_comment("Opportunity" , doc.name , content=message , comment_email = sender, comment_by = None)

	contact_but_no_customer = frappe.db.sql(f""" Select co.name  From `tabContact` as co
											  Left join `tabContact Email` as ce ON ce.parent = co.name
											  Where ce.email_id = '{sender}'
											""",as_dict = 1)
	if not contact_but_no_customer:
		customer = frappe.new_doc("Customer")
		customer.customer_name=company_name
		customer.customer_type="Company"
		customer.customer_group="Account Sales"
		customer.territory="All Territories"
		customer.save(ignore_permissions = True)

		opportunity = frappe.new_doc("Opportunity")
		opportunity.opportunity_from = "Customer"
		opportunity.party_name = customer.name
		opportunity.contact_email = sender
		opportunity.contact_mobile = phone
		opportunity.source = ""
		opportunity.save(ignore_permissions = True)
		frappe.db.set_value("Customer" , customer.name , 'opportunity_name' , opportunity.name , update_modified=False)
		add_comment(reference_doctype = "Opportunity", reference_name=opportunity.name, content = message, comment_email=sender, comment_by = frappe.session.user)

		contact = frappe.new_doc("Contact")
		contact.first_name = fullname
		contact.email_id = sender
		contact.mobile_no = phone
		contact.append("email_ids",{
			"email_id":sender,
			"is_primary":1
		})
		contact.append("links",{
			"link_doctype":"Customer",
			"link_name":customer.name
		})
		contact.append("phone_nos",{
			"phone":phone,
			"is_primary_phone":1
		})
		contact.save(ignore_permissions=True)
	frappe.msgprint("Thank you for reaching out to us. We will get back to you at the earliest.")

import json
import frappe
from frappe.utils import cint
from kersten.kersten.product_data_engine.filters import ProductFiltersBuilder
from kersten.kersten.product_data_engine.query import ProductQuery
from kersten.kersten.doctype.website_itemgroup.website_itemgroup import get_child_groups_for_website


@frappe.whitelist(allow_guest=True)
def get_product_filter_data(query_args=None):
	"""
	Returns filtered products and discount filters.

	Args:
		query_args (dict): contains filters to get products list

	Query Args filters:
		search (str): Search Term.
		field_filters (dict): Keys include item_group, brand, etc.
		attribute_filters(dict): Keys include Color, Size, etc.
		start (int): Offset items by
		item_group (str): Valid Item Group
		from_filters (bool): Set as True to jump to page 1
	"""
	if isinstance(query_args, str):
		query_args = json.loads(query_args)

	query_args = frappe._dict(query_args)

	if query_args:
		search = query_args.get("search")
		field_filters = query_args.get("field_filters", {})
		attribute_filters = query_args.get("attribute_filters", {})
		start = cint(query_args.start) if query_args.get("start") else 0
		item_group = query_args.get("item_group")
		from_filters = query_args.get("from_filters")
	else:
		search, attribute_filters, item_group, from_filters = None, None, None, None
		field_filters = {}
		start = 0

	# if new filter is checked, reset start to show filtered items from page 1
	if from_filters:
		start = 0

	sub_categories = []
	if item_group:
		sub_categories = get_child_groups_for_website(item_group, immediate=True)

	engine = ProductQuery()

	try:
		result = engine.query(
			attribute_filters,
			field_filters,
			search_term=search,
			start=start,
			item_group=item_group,
		)
	except Exception:
		frappe.log_error("Product query with filter failed")
		return {"exc": "Something went wrong!"}

	# discount filter data
	filters = {}
	discounts = result["discounts"]

	if discounts:
		filter_engine = ProductFiltersBuilder()
		filters["discount_filters"] = filter_engine.get_discount_filters(discounts)

	return {
		"items": result["items"] or [],
		"filters": filters,
		"settings": engine.settings,
		"sub_categories": sub_categories,
		"items_count": result["items_count"],
	}

@frappe.whitelist()
def fetch_data():
    try:
        data = []
        # records = frappe.get_all('Opportunity', filters={"status": "Open"}, fields=["party_name","name"])
        records = frappe.get_all('Opportunity', filters=[["status", "not in", ["Closed", "Converted", "Lost"]]], fields=["party_name","title","name"])
        for record in records:
            children = frappe.get_all('CRM Note', filters={"parent": record.name}, fields=["*"], order_by='added_on desc',limit_page_length=1)
            for child in children:
                data.append({
                    "opportunity_val": record.name,
                    "party_name": record.title,
                    "note": child.note,
                    "date":child.added_on
                })
        return data
    except Exception as e:
        frappe.throw(f"An error occurred: {str(e)}")

@frappe.whitelist()
def get_dealer_contact(custom_dealer):

	result = frappe.db.sql('''
						SELECT phone from `tabAddress`
					 	where address_title = %s
					 ''',(custom_dealer))
	return result
	
@frappe.whitelist()
def get_contact_details(custom_dealer):
	
	result = frappe.db.sql('''
						select `tabContact`.name,`tabContact`.email_id,`tabContact`.phone,
						`tabDynamic Link`.link_name from `tabContact`, `tabDynamic Link` 
						where `tabDynamic Link`.link_doctype = 'Customer' 
						and (`tabDynamic Link`.link_name= %s) 
						and `tabContact`.name = `tabDynamic Link`.parent;
					 ''',(custom_dealer))
	return result

@frappe.whitelist()
def get_contact_data(custom_dealer):
	
	result = frappe.db.sql('''
						select `tabContact`.name,`tabContact`.email_id,`tabContact`.phone,
						`tabDynamic Link`.link_name from `tabContact`, `tabDynamic Link` 
						where `tabDynamic Link`.link_doctype = 'Customer' 
						and (`tabDynamic Link`.link_name= %s) 
						and `tabContact`.name = `tabDynamic Link`.parent;
					 ''',(custom_dealer))
	return result

@frappe.whitelist()
def get_contact(custom_dealer,custom_dealer_contact):
	
	result = frappe.db.sql('''
						select `tabContact`.phone,`tabContact`.email_id
						from `tabContact`, `tabDynamic Link` 
						where `tabDynamic Link`.link_doctype = 'Customer' 
					and `tabContact`.name = `tabDynamic Link`.parent						
					and (`tabDynamic Link`.link_name= %s) 
						and `tabContact`.name = %s;
					 ''',(custom_dealer,custom_dealer_contact))
	return result
