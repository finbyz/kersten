frappe.ui.form.on('Meeting', {
    refresh: function(frm) {
        // Set filter for custom_dealer_name in the child table
        // frm.fields_dict['custom_dealer_details_table'].grid.get_field('custom_dealer_name').get_query = function(doc, cdt, cdn) {
        //     return {
        //         filters: {
        //             stocking_dealer: 1
        //         }
        //     };
        // };
        frm.fields_dict['custom_dealer_details_table'].grid.get_field('dealer_contact').get_query = function(doc, cdt, cdn) {
            return {
                filters: {
                    link_doctype: 'Customer',
                    link_name: frm.doc.custom_dealer
                }
            };
        };
        set_dealer_filter(frm);
    },
    custom_dealer: function(frm) {

        frm.fields_dict['custom_dealer_details_table'].grid.get_field('dealer_contact').get_query = function(doc, cdt, cdn) {
                return {
                    filters: {
                        link_doctype: 'Customer',
                        link_name: frm.doc.custom_dealer
                    }
                };
            }
        if (frm.doc.__islocal) {
            let row_exists = false;
            $.each(frm.doc.custom_dealer_details_table || [], function(i, row) {
                if (row.custom_dealer === frm.doc.custom_dealer) {
                    row_exists = true;
                    return false; // Exit the loop
                }
            });
            if (!row_exists) {
                let row = frm.add_child("custom_dealer_details_table");
                if (frm.doc.custom_dealer) {
                    frappe.call({
                        method: "kersten.api.get_contact_details",
                        args: {
                            custom_dealer: frm.doc.custom_dealer
                             },
                             callback: function(r) {
                                if (r.message && r.message.length > 0) {
                                    const contact = r.message[0];
                                    // console.log(contact);
                                    frappe.model.set_value(row.doctype, row.name, 'dealer_contact', contact[0]); // update field in row
                                    frappe.model.set_value(row.doctype, row.name, 'email',contact[1]); // update field in row
                                    frappe.model.set_value(row.doctype, row.name, 'mobile_no', contact[2]); // update field in row
                                    frm.refresh_field('custom_dealer_details_table');
                                    }
                                else{
                                    ffrappe.model.set_value(row.doctype, row.name, 'dealer_contact',""); // update field in row
                                    frappe.model.set_value(row.doctype, row.name, 'email', ""); // update field in row
                                    frappe.model.set_value(row.doctype, row.name, 'mobile_no', "");
                                }
                             }
                    })
                }
            }
        }
    }
});

function set_dealer_filter(frm) {
    frm.set_query('custom_dealer', function() {
        return {
            filters: {
                stocking_dealer: 1  
            }
        };
    });
}

// Assuming 'Dealer Details Table' is your child doctype name
frappe.ui.form.on('Dealer Details Table', {
    dealer_contact: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];

        if (row.dealer_contact) {
            frappe.call({
                method: "kersten.api.get_contact",
                args: {
                    custom_dealer: frm.doc.custom_dealer,
                    custom_dealer_contact:row.dealer_contact
                },
                callback: function(r) {
                    if (r.message && r.message.length > 0) {
                        // console.log(r.message)
                        frappe.model.set_value(cdt, cdn, 'mobile_no', r.message[0][0]); // update field in row
                        frappe.model.set_value(cdt, cdn, 'email', r.message[0][1]); // update field in row
                    } else {
                        frappe.model.set_value(cdt, cdn, 'mobile_no', ''); // update field in row
                        frappe.model.set_value(cdt, cdn, 'email','');
                    }
                }
            });
        } else {
            frappe.model.set_value(cdt, cdn, 'dealer_contact', '');
        }
    }
});
