frappe.ui.form.on('Quotation', {
	setup(frm) {
		frm.set_indicator_formatter('item_code', function(doc) {
			return (doc.qty <= doc.actual_qty) ? "green" : "orange";
		});
	},
	refresh: function(frm) {
        if(frm.doc.docstatus == 0 || frm.doc.docstatus == 1 ){
            frm.add_custom_button(__('Link Opportunity'), function() {
                let d = new frappe.ui.Dialog({
                    title: 'Link Opportunity',
                    fields: [
                        {
                            label: 'Opportunity',
                            fieldname: 'opportunity',
                            fieldtype: 'Link',
                            options: 'Opportunity',
                            reqd: 1
                        }
                    ],
                    primary_action_label: 'Link',
                    primary_action(values) {
                        frappe.call({
                            method: "kersten.kersten.doc_events.quotation.link_quotation_to_opportunity", // server script method name
                            args: {
                                quotation: frm.doc.name,
                                opportunity: values.opportunity
                            },
                            callback: function(r) {
                                frappe.msgprint(r.message);
                                d.hide();
                                frm.reload_doc(); // refresh Quotation after link
                            }
                        });
                    }
                });
                d.show();
            });
        }
    }
});
