import frappe


def on_update(self,method):
    create_opportunity(self)

def create_opportunity(self):
    if self.emial_account == 'Sweeprite Sweeping' and self.custom_updated == 0 and self.reference_doctype == 'Opportunity':
        frappe.db.set_value("Opportunity", self.reference_name, "opportunity_type", "Sweeping")
        self.db_set("custom_updated", 1)
