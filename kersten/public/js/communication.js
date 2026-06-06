frappe.ui.form.on("Communication", {
	onload: function (frm) {
		// Override the reference_doctype query on the form itself
		// to use our fixed get_communication_doctype function
		frm.set_query("reference_doctype", function () {
			return {
				query: "kersten.kersten.override.whitelisted_method.get_communication_doctype.get_communication_doctype",
			};
		});
	},

	refresh: function (frm) {
		if (frm.is_new()) return;

		// The core refresh handler adds a "Relink" button that calls
		// frm.trigger("show_relink_dialog"). Since doctype_js handlers are
		// additive, that trigger fires BOTH the core and our handler,
		// producing two dialogs. Fix: replace the button so it calls our
		// function directly, bypassing frm.trigger entirely.
		frm.remove_custom_button(__("Relink"));
		frm.add_custom_button(__("Relink"), function () {
			show_kersten_relink_dialog(frm);
		});
	},
});

function show_kersten_relink_dialog(frm) {
	var d = new frappe.ui.Dialog({
		title: __("Relink Communication"),
		fields: [
			{
				fieldtype: "Link",
				options: "DocType",
				label: __("Reference Doctype"),
				fieldname: "reference_doctype",
				get_query: function () {
					return {
						query: "kersten.kersten.override.whitelisted_method.get_communication_doctype.get_communication_doctype",
					};
				},
			},
			{
				fieldtype: "Dynamic Link",
				options: "reference_doctype",
				label: __("Reference Name"),
				fieldname: "reference_name",
			},
		],
	});
	d.set_value("reference_doctype", frm.doc.reference_doctype);
	d.set_value("reference_name", frm.doc.reference_name);
	d.set_primary_action(__("Relink"), function () {
		var values = d.get_values();
		if (values) {
			let message = values["reference_name"]
				? __("Are you sure you want to relink this communication to {0}?", [
						values["reference_name"],
				  ])
				: __("Are you sure you want to relink this communication?");
			frappe.confirm(
				message,
				function () {
					d.hide();
					frappe.call({
						method: "frappe.email.relink",
						args: {
							name: frm.doc.name,
							reference_doctype: values["reference_doctype"],
							reference_name: values["reference_name"],
						},
						callback: function () {
							frm.refresh();
						},
					});
				},
				function () {
					frappe.show_alert({
						message: __("Document not Relinked"),
						indicator: "info",
					});
				}
			);
		}
	});
	d.show();
}
