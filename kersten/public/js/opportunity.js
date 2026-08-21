frappe.ui.form.on('Opportunity', {
    refresh: function (frm) {
        set_dealer_filter(frm);
        set_dealer_contact_filter(frm);
        setup_notes_timeline_sync(frm);
    },
    custom_dealer: function (frm) {
        get_dealer_contact(frm);
    },
    custom_dealer_contact: function (frm) {
        get_dealer_contact_details(frm);
    },
    company: function (frm) {
        set_currency(frm);
    },
    party_name: function (frm) {
        set_currency(frm);
    },
    onload: function (frm) {
        set_currency(frm);
    }
});

function set_currency(frm) {
    if (frm.doc.currency) {
        return;
    }
    if (frm.doc.opportunity_from === "Customer" && frm.doc.party_name) {
        frappe.db.get_value("Customer", frm.doc.party_name, "default_currency", function (r) {
            let currency = (r && r.default_currency) ? r.default_currency : erpnext.get_currency(frm.doc.company);
            if (currency && frm.doc.currency !== currency) {
                frm.set_value("currency", currency);
            }
        });
    } else {
        let company_currency = erpnext.get_currency(frm.doc.company);
        if (company_currency && (!frm.doc.currency || frm.doc.currency !== company_currency)) {
            frm.set_value("currency", company_currency);
        }
    }
}
function set_dealer_contact_filter(frm) {
    frm.set_query('custom_dealer_contact', function () {
        return {
            query: "frappe.contacts.doctype.contact.contact.contact_query",
            filters: {
                link_doctype: 'Customer',
                link_name: frm.doc.custom_dealer
            }
        };
    });
}
function set_dealer_filter(frm) {
    frm.set_query('custom_dealer', function () {
        return {
            filters: {
                stocking_dealer: 1
            }
        };
    });
}

function get_dealer_contact(frm) {
    if (frm.doc.custom_dealer) {
        frappe.call({
            method: "kersten.api.get_contact_data",
            args: {
                custom_dealer: frm.doc.custom_dealer
            },
            callback: function (r) {
                if (r.message && r.message.length > 0) {
                    const contact = r.message[0];
                    frm.set_value("custom_dealer_contact", contact[0]);
                }
                else {
                    frm.set_value("custom_dealer_contact", "");
                }
            }
        });
    }
}

function get_dealer_contact_details(frm) {
    if (frm.doc.custom_dealer_contact) {
        frappe.call({
            method: "kersten.api.get_contact",
            args: {
                custom_dealer: frm.doc.custom_dealer,
                custom_dealer_contact: frm.doc.custom_dealer_contact
            },
            callback: function (r) {
                if (r.message && r.message.length > 0) {
                    const contact = r.message[0];
                    // console.log(contact)
                    frm.set_value("custom_dealer_contact_no", contact[0]);
                }
                else {
                    frm.set_value("custom_dealer_contact", "");
                }
            }
        });
    }
}

function patch_crm_notes_timeline_sync() {
    if (window.erpnext && erpnext.utils && erpnext.utils.CRMNotes && !erpnext.utils.CRMNotes._timeline_sync_patched) {
        erpnext.utils.CRMNotes._timeline_sync_patched = true;
        const orig_refresh = erpnext.utils.CRMNotes.prototype.refresh;
        erpnext.utils.CRMNotes.prototype.refresh = function () {
            orig_refresh.apply(this, arguments);
            const frm = this.frm;
            if (frm && frm.doctype === "Opportunity" && !frm.doc.__islocal) {
                if (frm.sidebar && frm.sidebar.reload_docinfo) {
                    frm.sidebar.reload_docinfo(function () {
                        if (frm.timeline && frm.timeline.refresh) {
                            frm.timeline.refresh();
                        }
                    });
                } else if (frm.timeline && frm.timeline.refresh) {
                    frm.timeline.refresh();
                }
            }
        };
    }
}

function setup_notes_timeline_sync(frm) {
    patch_crm_notes_timeline_sync();

    if (frm.doc.__islocal) {
        return;
    }

    // Also refresh timeline whenever notes field is refreshed or updated
    frm.timeline_notes_synced = true;
}