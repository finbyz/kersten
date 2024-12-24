import frappe


def on_update(self,method):
    create_opportunity(self)

def create_opportunity(self):
    if self.email_account == 'Sweeprite Sweeping' and self.custom_updated == 0 and self.reference_doctype == 'Opportunity':
        assigned_to_docs = frappe.get_all("ToDo", filters={"reference_type": "Opportunity", "reference_name": self.reference_name}, fields=["name"])
        for docs in assigned_to_docs:
            frappe.delete_doc("ToDo", docs["name"])
            frappe.db.commit()
        doc = frappe.get_doc("Opportunity", self.reference_name)
        doc.opportunity_type = "Sweeping"
        doc.flags.ignore_mandatory = True
        doc.save()
        self.db_set("custom_updated", 1)
