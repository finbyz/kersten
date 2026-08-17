import frappe

def execute():
    # Customer-linked: use customer's default_currency, fall back to company
    frappe.db.sql("""
        UPDATE `tabOpportunity` o
        LEFT JOIN `tabCustomer` cu ON cu.name = o.party_name AND o.opportunity_from = 'Customer'
        JOIN `tabCompany` c ON c.name = o.company
        SET o.currency = COALESCE(
            NULLIF(cu.default_currency, ''),
            c.default_currency
        )
        WHERE o.currency IS NULL OR o.currency = '' AND o.status in ('Open', 'Replied')
    """)

    frappe.db.commit()
