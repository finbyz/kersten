// Copyright (c) 2024, viral and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Website Itemgroup", {
// 	refresh(frm) {

// 	},
// });
// Copyright (c) 2020, Finbyz Tech Pvt Ltd and contributors
// For license information, please see license.txt

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
