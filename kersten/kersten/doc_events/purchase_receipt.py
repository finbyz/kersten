from erpnext.stock.doctype.serial_no.serial_no import get_serial_nos
import frappe, datetime
from frappe import _, ValidationError


def on_submit(self, method):
	update_serial_no(self)

def on_cancel(self, method):
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
			custom_purchase_reciept_no = %s,
			date_purchased = %s,
			custom_supplier_name = %s		   
		WHERE name IN ({})
	""".format(", ".join(["%s"] * len(serial_list))),
	[self.name, self.posting_date, self.supplier] + serial_list)

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
			custom_purchase_reciept_no = NULL,
			date_purchased = NULL,
			custom_supplier_name = NULL
		WHERE name IN ({})
	""".format(", ".join(["%s"] * len(serial_list))),
	serial_list)

	frappe.msgprint(_("References are reverted in Serial Nos"))

