import frappe
from frappe import _
from kersten.api import add_comment
def on_update(self,method):
    create_opportunity(self)

@frappe.whitelist()
def create_opportunity(self):
    if self.sender == 'sweeping@kerstenuk.com' and self.custom_updated == 0 and self.reference_doctype == 'Opportunity':
        opportunity = frappe.get_doc('Opportunity', self.reference_name)
        if opportunity:
            opportunity.opportunity_type = 'Sweeping'
            opportunity.save(ignore_permissions=True)
            frappe.db.commit()
            self.custom_updated = 1
            self.save(ignore_permissions=True)
            frappe.db.commit()
