// Copyright (c) 2024, viral and contributors
// For license information, please see license.txt

frappe.ui.form.on("Blogs", {
	refresh(frm) {
        frm.set_query("blog_list", function(doc, cdt, cdn) {
            var d = locals[cdt][cdn];
            return {
                "filters": [
                    ["Blog Post", "published", "=", 1]
                ]
            };
        });
	},
});
