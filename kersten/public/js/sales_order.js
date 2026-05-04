frappe.ui.form.on('Sales Order', {
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
                            method: "kersten.kersten.doc_events.sales_order.link_sales_order_to_opportunity", // server script method name
                            args: {
                                sales_order: frm.doc.name,
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
