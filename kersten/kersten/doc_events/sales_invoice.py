import frappe
from frappe.utils import cint

def before_validate(doc, method):
	"""
	Fix for ERPNext Core Bug: 
	When 'allocate_advances_automatically' is enabled, advances fail to allocate on new invoices
	because grand_total is calculated AFTER set_advances() in AccountsController.validate().
	Also, validate_advance_entries() runs BEFORE set_advances(), causing a warning popup on portals.
	By calculating totals and setting advances here (before AccountsController.validate runs),
	we prevent the warning and ensure advances are correctly allocated.
	"""
	if cint(doc.allocate_advances_automatically) and not doc.advances:
		# Calculate totals so set_advances can allocate based on grand_total
		doc.calculate_taxes_and_totals()
		doc.set_advances()
