import frappe


@frappe.whitelist()
def link_quotation_to_opportunity(quotation, opportunity):
    quotation_doc = frappe.get_doc("Quotation", quotation)
    quotation_doc.db_set("opportunity", opportunity)
    return f'Quotation {quotation} linked to Opportunity <a href="/app/opportunity/{opportunity}">{opportunity}</a>'