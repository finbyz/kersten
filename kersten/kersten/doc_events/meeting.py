import frappe
from frappe.utils import cint, getdate, get_fullname, get_url_to_form,now_datetime


def create_tasks_from_meeting(doc, method):
	
	for row in doc.get("actionables") or []:
		user_id = frappe.db.get_value("Employee", row.responsible, "user_id") if row.responsible else None
		expected_date = getdate(row.expected_completion_date) if row.expected_completion_date else None
		subject = f"{row.actionable or ''}"

		task = frappe.get_doc({
			"doctype": "Task",
			"subject": subject,
			"assignee": user_id,
			"exp_start_date": doc.modified,
			"exp_end_date": expected_date,
			"status": "To Do"
		})
		task.insert()

	frappe.db.commit()
		