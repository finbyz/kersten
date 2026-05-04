import frappe
from erpnext.crm.utils import (
    copy_comments,
    link_communications,
)

def after_insert(self, method):
    processed_docs = set()
    for row in self.get("items"):
        if row.prevdoc_docname and row.prevdoc_docname not in processed_docs:
            copy_comments("Quotation", row.prevdoc_docname, self)
            link_communications("Quotation", row.prevdoc_docname, self)
            processed_docs.add(row.prevdoc_docname)


@frappe.whitelist()
def link_sales_order_to_opportunity(sales_order, opportunity):
    sales_order_doc = frappe.get_doc("Sales Order", sales_order)
    for row in sales_order_doc.items:
        row.db_set("opportunity", opportunity)
    return f'Sales Order {sales_order} linked to Opportunity <a href="#Form/Opportunity/{opportunity}">{opportunity}</a>'
