frappe.ui.form.on('Quotation', {
	setup(frm) {
		frm.set_indicator_formatter('item_code', function(doc) {
			return (doc.qty <= doc.actual_qty) ? "green" : "orange";
		});
	}
});
