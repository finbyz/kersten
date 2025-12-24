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
			delivered = 1,
			reference_delivery_note = %s,
			dated_sold = %s,
			customer_name_end_user = %s,
			custom_invoice_address = %s,
			custom_shipping_address = %s
			   
			   
		WHERE name IN ({})
	""".format(", ".join(["%s"] * len(serial_list))),
	[self.name, self.posting_date, self.customer, self.address_display, self.shipping_address] + serial_list)

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
			delivered = 0,
			reference_delivery_note = NULL,
			reference_delivery_date = NULL,
			dated_sold = NULL,
			customer_name_end_user = NULL,
			custom_invoice_address = NULL,
			custom_shipping_address = NULL
			   
		WHERE name IN ({})
	""".format(", ".join(["%s"] * len(serial_list))),
	serial_list)

	frappe.msgprint(_("References are reverted in Serial Nos"))

