frappe.ui.form.on('Customer', {
	refresh(frm) {
		// Show button only if website field is set
		if (frm.doc.website) {
			frm.add_custom_button(__('Open Website'), () => {
				let url = frm.doc.website;

				// If user stored bare domain, prepend protocol
				if (!/^https?:\/\//i.test(url)) {
					url = 'https://' + url;
				}

				window.open(url, '_blank');
			});
		}
	},
});


