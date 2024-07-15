import frappe
from frappe import _
from kersten.api import add_comment
def before_validate(self,method):
    create_opportunity(self)

@frappe.whitelist()
def create_opportunity(self):
    if self.sender == 'sweeping@kerstenuk.com':
        if frappe.db.exists("Opportunity", {"opportunity_from": "Customer", "contact_email": self.sender, "title":self.subject}):
            opportunity = frappe.get_doc("Opportunity", {"opportunity_from": "Customer", "contact_email": self.sender})
            opportunity.oppurtunity_type = "Sweeping"
        else:
            opportunity = frappe.new_doc("Opportunity")
            opportunity.opportunity_from = "Customer"
            opportunity.contact_email = self.sender
            opportunity.title = self.subject
            opportunity.oppurtunity_type = "Sweeping"
            opportunity.save(ignore_permissions = True)
            add_comment("Opportunity" , opportunity.name , content=self.message , comment_email = self.sender, comment_by = None)
