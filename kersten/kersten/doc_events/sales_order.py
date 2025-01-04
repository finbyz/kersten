import frappe
from erpnext.crm.utils import (
    copy_comments,
    link_communications,
)

def after_insert(self, method):
    for row in self.get("items"):
        if row.prevdoc_docname:
            copy_comments("Quotation", row.prevdoc_docname, self)
            link_communications("Quotation", row.prevdoc_docname, self)