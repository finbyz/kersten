import frappe
from frappe.automation.doctype.assignment_rule.assignment_rule import AssignmentRule as _AssignmentRule
from frappe.desk.form import assign_to


class AssignmentRule(_AssignmentRule):
	def do_assignment(self, doc):
		# clear existing assignment, to reassign
		assign_to.clear(doc.get("doctype"), doc.get("name"), ignore_permissions=True)

		users = self.get_user(doc)

		if isinstance(users, str):
			users = [users]
		
		flag = False
		for user in users:
			if user:
				assign_to.add(
					dict(
						assign_to=[user],
						doctype=doc.get("doctype"),
						name=doc.get("name"),
						description=frappe.render_template(self.description, doc),
						assignment_rule=self.name,
						notify=True,
						date=doc.get(self.due_date_based_on) if self.due_date_based_on else None,
					),
					ignore_permissions=True,
				)

				# set for reference in round robin
				self.db_set("last_user", user)
				flag = True

		return flag
	def get_user(self, doc):
		"""
		Get the next user for assignment
		"""
		if self.rule == "Round Robin":
			return self.get_user_round_robin()
		elif self.rule == "Load Balancing":
			return self.get_user_load_balancing()
		elif self.rule == "Based on Field":
			return self.get_user_based_on_field(doc)
		elif self.rule == "Multi Assign":
			return self.get_user_multi_assign()
		
	def get_user_multi_assign(self):
		"""
		Get next user based on round robin
		"""

		return [user.user for user in self.users]