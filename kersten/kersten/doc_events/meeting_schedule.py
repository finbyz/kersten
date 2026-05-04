import frappe

def create_event_on_meeting_schedule(doc, method=None):
    doc = frappe.get_doc(doc)
    
    frappe.get_doc({    
        "doctype": "Event",
        "subject": f"Meeting: {doc.party}",
        "description": doc.meeting_agenda or "Meeting Schedule",
        "event_category": "Meeting",  # ✅ missing comma fixed
        "starts_on": doc.scheduled_from,
        "ends_on": doc.scheduled_to,
        "event_type": "Private",
        "reference_type": "Meeting",
        "reference_name": doc.name,
        "status": "Open",
        "all_day": 0,
        "owner": doc.owner,
        "event_participants": [
            {
                "reference_doctype": doc.party_type,
                "reference_docname": doc.party
            }
            
        ]
    }).insert(ignore_permissions=True)