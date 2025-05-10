frappe.ui.form.on('Opportunity', {
    refresh: function(frm) {
        set_dealer_filter(frm);
        set_dealer_contact_filter(frm);
    },
    custom_dealer: function(frm) {
        get_dealer_contact(frm);
    },
    custom_dealer_contact:function(frm){
        get_dealer_contact_details(frm);
    }
    
});

function set_dealer_contact_filter(frm){
    frm.set_query('custom_dealer_contact', function() {
        return {
            filters: {
                link_doctype: 'Customer',
                link_name: frm.doc.custom_dealer
            }
        };
    });
}
function set_dealer_filter(frm) {
    frm.set_query('custom_dealer', function() {
        return {
            filters: {
                stocking_dealer: 1  
            }
        };
    });
}

function get_dealer_contact(frm){
    if (frm.doc.custom_dealer) {
        frappe.call({
            method: "kersten.api.get_contact_data",
            args: {
                custom_dealer: frm.doc.custom_dealer
            },
            callback: function(r) {
                if (r.message && r.message.length > 0) {
                    const contact = r.message[0];
                    frm.set_value("custom_dealer_contact", contact[0]);
                }
                else{
                    frm.set_value("custom_dealer_contact", "");
                }
            }
        });
    }
}

function get_dealer_contact_details(frm){
    if (frm.doc.custom_dealer_contact) {
        frappe.call({
            method: "kersten.api.get_contact",
            args: {
                custom_dealer: frm.doc.custom_dealer,
                custom_dealer_contact:frm.doc.custom_dealer_contact
            },
            callback: function(r) {
                if (r.message && r.message.length > 0) {
                    const contact = r.message[0];
                    // console.log(contact)
                    frm.set_value("custom_dealer_contact_no", contact[0]);
                }
                else{
                    frm.set_value("custom_dealer_contact", "");
                }
            }
        });
    }
}