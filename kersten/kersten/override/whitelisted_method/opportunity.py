import frappe
from frappe.email.inbox import link_communication_to_document


@frappe.whitelist()
def make_opportunity_from_communication(communication, company, ignore_communication_links=False):
	from erpnext.crm.doctype.lead.lead import make_lead_from_communication

	doc = frappe.get_doc("Communication", communication)

	lead = doc.reference_name if doc.reference_doctype == "Lead" else None
	if not lead:
		lead = make_lead_from_communication(communication, ignore_communication_links=True)

	opportunity_from = "Lead"

	opportunity = frappe.get_doc(
		{
			"doctype": "Opportunity",
			"company": company,
			"opportunity_from": opportunity_from,
			"party_name": lead,
		}
	).insert(ignore_permissions=True,ignore_mandatory=True)

	link_communication_to_document(doc, "Opportunity", opportunity.name, ignore_communication_links)

	return opportunity.name