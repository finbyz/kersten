import frappe
from erpnext.crm.utils import (
    copy_comments,
    link_communications,
)

def after_insert(self, method):
    processed_docs = set()
    for row in self.get("items"):
        if row.prevdoc_docname and row.prevdoc_docname not in processed_docs:
            copy_comments("Quotation", row.prevdoc_docname, self)
            link_communications("Quotation", row.prevdoc_docname, self)
            processed_docs.add(row.prevdoc_docname)
