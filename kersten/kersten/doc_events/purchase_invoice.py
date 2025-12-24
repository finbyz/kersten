from erpnext.stock.doctype.serial_no.serial_no import get_serial_nos
import frappe, datetime
from frappe import _, ValidationError


def on_submit(self, method):
	update_serial_no(self)

def on_cancel(self, method):
	# cancel_all(self)
	reupdate_serial_nos(self)


def update_serial_no(self):
	serial_list = []

	for row in self.items:
		if row.serial_no:
			serial_list.extend(get_serial_nos(row.serial_no))

	if not serial_list:
		return

	frappe.db.sql("""
		UPDATE `tabSerial No`
		SET
			custom_purchase_invoice_no = %s,
			custom_purchase_invoice_date = %s			   
		WHERE name IN ({})
	""".format(", ".join(["%s"] * len(serial_list))),
	[self.name, self.posting_date] + serial_list)

	frappe.msgprint(_("References are updated in Serial Nos"))


def reupdate_serial_nos(self):
	serial_list = []

	for row in self.items:
		if row.serial_no:
			serial_list.extend(get_serial_nos(row.serial_no))

	if not serial_list:
		return

	frappe.db.sql("""
		UPDATE `tabSerial No`
		SET
			custom_purchase_invoice_no = NULL
		WHERE name IN ({})
	""".format(", ".join(["%s"] * len(serial_list))),
	serial_list)

	frappe.msgprint(_("References are reverted in Serial Nos"))

