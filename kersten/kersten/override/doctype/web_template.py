from frappe.website.doctype.web_template.web_template import WebTemplate as _WebTemplate
import frappe
from frappe import _
import os
from frappe import scrub, get_pymodule_path, get_pymodule_path
from frappe.modules.export_file import scrub_dt_dn, get_module_path


# def get_module_path(module, *joins):
# 	"""Get the path of the given module name.

# 	:param module: Module name.
# 	:param *joins: Join additional path elements using `os.path.join`."""
# 	# from frappe.modules.utils import get_module_app

# 	# app = get_module_app(module)

# 	for app in reversed(frappe.get_installed_apps()):
# 		try:
# 			path = get_pymodule_path(app + "." + scrub(module), *joins)
# 		except ModuleNotFoundError:
# 			continue
# 		else:
# 			return path
	
# 	frappe.throw(_("Module {} not found").format(module), exc=frappe.DoesNotExistError)
	 
class WebTemplate(_WebTemplate):
	def get_template_folder(self):
		"""Return the absolute path to the template's folder."""
		custom_module = None
		if self.name and frappe.db.exists("Web Template Module Map", self.name):
			custom_module = frappe.db.get_value("Web Template Module Map", self.name, "module")
		module = custom_module or self.module or "Website" 
		module_path = get_module_path(module)
		doctype, docname = scrub_dt_dn(self.doctype, self.name)

		return os.path.join(module_path, doctype, docname)
