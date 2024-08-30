// Copyright (c) 2024, viral and contributors
// For license information, please see license.txt

// Copyright (c) 2020, Finbyz Tech Pvt Ltd and contributors
// For license information, please see license.txt

function open_web_template_values_editor_custom(template, current_values = {}) {
	return new Promise((resolve) => {
		frappe.model.with_doc("Web Template", template).then((doc) => {
			let d = new frappe.ui.Dialog({
				title: __("Edit Values"),
				fields: get_fields(doc),
				primary_action(values) {
					d.hide();
					resolve(values);
				},
			});
			d.set_values(current_values);
			d.show();

			d.sections.forEach((sect) => {
				let fields_with_value = sect.fields_list.filter(
					(field) => current_values[field.df.fieldname]
				);

				if (fields_with_value.length) {
					sect.collapse(false);
				}
			});
		});
	});

	function get_fields(doc) {
		let normal_fields = [];
		let table_fields = [];

		let current_table = null;
		for (let df of doc.fields) {
			if (current_table) {
				if (df.fieldtype != "Table Break") {
					current_table.fields.push(df);
				} else {
					table_fields.push(df);
					current_table = df;
				}
			} else if (df.fieldtype != "Table Break") {
				normal_fields.push(df);
			} else {
				table_fields.push(df);
				current_table = df;

				// start capturing fields in current_table till the next table break
				current_table.fields = [];
			}
		}

		return [
			...normal_fields,
			...table_fields.map((tf) => {
				let data = current_values[tf.fieldname] || [];
				return {
					label: tf.label,
					fieldname: tf.fieldname,
					fieldtype: "Table",
					fields: tf.fields.map((df, i) => ({
						...df,
						in_list_view: i <= 1,
						columns: tf.fields.length == 1 ? 10 : 5,
					})),
					data,
					get_data: () => data,
				};
			}),
		];
	}
}

frappe.ui.form.on('Website Itemgroup', {
	onload: function(frm) {
		frm.list_route = "Tree/Website Itemgroup";

		//get query select item group
		frm.fields_dict['parent_website_itemgroup'].get_query = function(doc,cdt,cdn) {
			return{
				filters:[
					['Website Itemgroup', 'is_group', '=', 1],
					['Website Itemgroup', 'name', '!=', doc.website_itemgroup_name]
				]
			}
		}	
	},

	refresh: function(frm) {
		// frm.trigger("set_root_readonly");
		frm.add_custom_button(__("Website Itemgroup Tree"), function() {
			frappe.set_route("Tree", "Website Itemgroup");
		});
	},
	set_meta_tags: (frm) => {
		frappe.utils.set_meta_tag(frm.doc.route);
	},
	set_root_readonly: function(frm) {
		// read-only for root item group
		frm.set_intro("");
		if(!frm.doc.parent_website_itemgroup && !frm.doc.__islocal) {
			frm.set_read_only();
			frm.set_intro(__("This is a root item group and cannot be edited."), true);
		}
	},

	page_name: frappe.utils.warn_page_name_change
});

frappe.ui.form.on("Web Page Block", {
	edit_values(frm, cdt, cdn) {
		let row = frm.selected_doc;
		let values = JSON.parse(row.web_template_values || "{}");
		open_web_template_values_editor_custom(row.web_template, values).then((new_values) => {
			frappe.model.set_value(cdt, cdn, "web_template_values", JSON.stringify(new_values));
		});
	},
});