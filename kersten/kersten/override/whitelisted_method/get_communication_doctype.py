import frappe
from frappe import _
from frappe.desk.search import PAGE_LENGTH_FOR_LINK_VALIDATION


@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def get_communication_doctype(doctype, txt, searchfield, start, page_len, filters, **kwargs):
    from frappe.modules import load_doctype_module

    user_perms = frappe.utils.user.UserPermissions(frappe.session.user)
    user_perms.build_permissions()
    can_read = user_perms.can_read

    is_link_validation = page_len >= PAGE_LENGTH_FOR_LINK_VALIDATION

    com_doctypes = []

    if len(txt) < 2 and not is_link_validation:
        for name in frappe.get_hooks("communication_doctypes"):
            try:
                module = load_doctype_module(name, suffix="_dashboard")
                if hasattr(module, "get_data"):
                    for i in module.get_data()["transactions"]:
                        com_doctypes += i["items"]
            except ImportError:
                pass
    else:
        com_doctypes = [
            d[0]
            for d in frappe.db.get_values(
                "DocType", {"issingle": 0, "istable": 0, "hide_toolbar": 0}
            )
        ]

    results = []
    txt_lower = txt.lower().replace("%", "")

    for dt in list(set(com_doctypes)):
        if dt in can_read:
            if not txt_lower or txt_lower in dt.lower() or txt_lower in _(dt).lower():
                results.append([dt])

    return results
