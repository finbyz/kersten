
import frappe

def check_doctypes():
    doctypes = ["Opportunity", "Customer", "Sales Order", "Lead"]
    for dt in doctypes:
        try:
            meta = frappe.get_meta(dt)
            fields = [f.fieldname for f in meta.fields if "type" in f.fieldname.lower()]
            print(f"{dt} (Standard): {fields}")
            
            custom_fields = frappe.get_all("Custom Field", filters={"dt": dt}, fields=["fieldname", "label"])
            print(f"{dt} (Custom): {[cf.fieldname for cf in custom_fields if 'type' in cf.fieldname.lower()]}")
        except Exception as e:
            print(f"{dt}: Error {e}")

if __name__ == "__main__":
    check_doctypes()

