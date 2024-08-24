frappe.ui.form.on('Website Item', {
    custom_get_faq_questions: function(frm) {
        frappe.call({
            method: 'kersten.kersten.override.website_item.get_faq_questions_from_website_itemgroup',
            args: {
                doc: JSON.stringify(frm.doc),
            },
            callback: function(r) {
                frm.clear_table('faq');
                if (r.message) {
                    
                    r.message.forEach(function(faq) {
                        let row = frm.add_child("faq");
                        row.question = faq.question;
                    });
                    frm.save();
                }
            }
        });
    }
});
