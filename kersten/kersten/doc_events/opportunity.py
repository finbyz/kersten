import re
import frappe
from frappe.utils import sanitize_html, get_fullname, now_datetime, format_datetime


NOTE_ID_PATTERN = re.compile(r'data-crm-note-id=["\']([^"\']+)["\']')


def format_note_comment(note_row):
    """
    Format a CRM Note / Call Log entry for the Activity timeline.
    Includes sanitization to prevent XSS and custom HTML markers for tracking.
    """
    if isinstance(note_row, dict):
        raw_note = note_row.get("note") or ""
        row_id = str(note_row.get("name") or "")
        added_on = note_row.get("added_on") or note_row.get("creation")
    else:
        raw_note = getattr(note_row, "note", "") or ""
        row_id = str(getattr(note_row, "name", "") or "")
        added_on = getattr(note_row, "added_on", None) or getattr(note_row, "creation", None)

    if not added_on:
        added_on = now_datetime()

    note_content = sanitize_html(raw_note)

    try:
        formatted_date_time = format_datetime(added_on, "dd-MM-yyyy hh:mm a")
    except Exception:
        try:
            formatted_date_time = format_datetime(added_on)
        except Exception:
            formatted_date_time = str(added_on)

    time_badge = (
        f'<span class="opportunity-note-time" style="display:inline-flex; align-items:center; font-size:11px; '
        f'font-weight:600; padding:2px 8px; border-radius:12px; background-color:#f1f5f9; color:#334155; '
        f'border:1px solid #cbd5e1;">'
        f'<i class="fa fa-clock-o" style="margin-right:4px; font-size:11px; color:#64748b;"></i>{formatted_date_time}'
        f'</span>'
    )

    return (
        f'<div class="opportunity-note-entry" data-crm-note-id="{row_id}">'
        f'<div class="opportunity-note-header" style="display:flex; align-items:center; margin-bottom:8px; flex-wrap:wrap;">'
        f'<span class="opportunity-note-badge" style="display:inline-flex; align-items:center; font-size:11px; font-weight:600; '
        f'padding:2px 8px; border-radius:12px; background-color:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; margin-right:8px;">'
        f'<i class="fa fa-phone" style="margin-right:4px; font-size:11px;"></i>Note / Call Log'
        f'</span>'
        f'{time_badge}'
        f'</div>'
        f'<div class="opportunity-note-body" style="font-size:13px; line-height:1.5; color:var(--text-color);">'
        f'{note_content}'
        f'</div>'
        f'</div>'
    )


def sync_notes_to_timeline(doc, method=None):
    """
    Doc event hook triggered on Opportunity save/update.
    Synchronizes child table 'notes' (CRM Note) entries into the Activity timeline (Comment doctype).
    Ensures correct chronological positioning, updates on edit, and cleanup on deletion.
    """
    if not doc.name or doc.get("__islocal"):
        return

    # 1. Fetch existing comments for this Opportunity
    existing_comments = frappe.get_all(
        "Comment",
        filters={
            "reference_doctype": "Opportunity",
            "reference_name": doc.name,
            "comment_type": "Comment",
        },
        fields=["name", "content", "creation", "comment_email"],
    )

    # Map tracked note_id -> comment dict
    tracked_comments = {}
    for c in existing_comments:
        match = NOTE_ID_PATTERN.search(c.content or "")
        if match:
            note_id = match.group(1)
            tracked_comments[note_id] = c

    # 2. Process current notes in doc
    current_note_ids = set()
    notes = doc.get("notes") or []

    for row in notes:
        if not row.name:
            continue

        row_id = str(row.name)
        current_note_ids.add(row_id)
        expected_content = format_note_comment(row)

        if row_id in tracked_comments:
            # Note already has a timeline comment - update if content changed
            existing = tracked_comments[row_id]
            if existing.content != expected_content:
                frappe.db.set_value(
                    "Comment",
                    existing.name,
                    "content",
                    expected_content,
                    update_modified=False,
                )
        else:
            # Create a new timeline comment
            user_email = (
                getattr(row, "added_by", None)
                or (row.get("added_by") if isinstance(row, dict) else None)
                or frappe.session.user
            )
            user_fullname = get_fullname(user_email) or user_email
            creation_time = (
                getattr(row, "added_on", None)
                or (row.get("added_on") if isinstance(row, dict) else None)
                or now_datetime()
            )

            comment = frappe.get_doc(
                {
                    "doctype": "Comment",
                    "comment_type": "Comment",
                    "reference_doctype": "Opportunity",
                    "reference_name": doc.name,
                    "content": expected_content,
                    "comment_email": user_email,
                    "comment_by": user_fullname,
                }
            )
            comment.flags.ignore_permissions = True
            comment.insert()

            # Synchronize creation timestamp with note's added_on datetime
            frappe.db.set_value(
                "Comment",
                comment.name,
                "creation",
                creation_time,
                update_modified=False,
            )

    # 3. Clean up comments for any deleted notes
    for note_id, c in tracked_comments.items():
        if note_id not in current_note_ids:
            frappe.delete_doc(
                "Comment",
                c.name,
                ignore_permissions=True,
                force=True,
            )


def sync_all_existing_opportunity_notes():
    """
    Utility / patch method to backfill and synchronize all historic Opportunity notes
    into the Activity timeline across the system.
    """
    opportunities_with_notes = frappe.db.sql(
        """
        SELECT DISTINCT parent FROM `tabCRM Note`
        WHERE parenttype = 'Opportunity'
        """,
        as_dict=True,
    )

    total = len(opportunities_with_notes)
    frappe.logger().info(f"Syncing notes for {total} Opportunities into Activity timeline...")

    synced = 0
    for row in opportunities_with_notes:
        try:
            opp = frappe.get_doc("Opportunity", row.parent)
            sync_notes_to_timeline(opp)
            synced += 1
        except Exception as e:
            frappe.log_error(
                f"Failed to sync notes for Opportunity {row.parent}: {str(e)}",
                "Opportunity Notes Sync",
            )

    frappe.db.commit()
    print(f"Successfully synced notes for {synced}/{total} Opportunities into Activity timeline.")
    return synced
