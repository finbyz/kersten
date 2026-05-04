frappe.ui.form.on('Opportunity', {
    refresh: function(frm) {
        set_dealer_filter(frm);
        set_dealer_contact_filter(frm);
    },
    custom_dealer: function(frm) {
        get_dealer_contact(frm);
    },
    custom_dealer_contact:function(frm){
        get_dealer_contact_details(frm);
    },

    refresh(frm) {
        // Fetch and render open tasks table
        render_open_tasks_table(frm);
	}
    
});

function set_dealer_contact_filter(frm){
    frm.set_query('custom_dealer_contact', function() {
        return {
            filters: {
                link_doctype: 'Customer',
                link_name: frm.doc.custom_dealer
            }
        };
    });
}
function set_dealer_filter(frm) {
    frm.set_query('custom_dealer', function() {
        return {
            filters: {
                stocking_dealer: 1  
            }
        };
    });
}

function get_dealer_contact(frm){
    if (frm.doc.custom_dealer) {
        frappe.call({
            method: "kersten.api.get_contact_data",
            args: {
                custom_dealer: frm.doc.custom_dealer
            },
            callback: function(r) {
                if (r.message && r.message.length > 0) {
                    const contact = r.message[0];
                    frm.set_value("custom_dealer_contact", contact[0]);
                }
                else{
                    frm.set_value("custom_dealer_contact", "");
                }
            }
        });
    }
}

function get_dealer_contact_details(frm){
    if (frm.doc.custom_dealer_contact) {
        frappe.call({
            method: "kersten.api.get_contact",
            args: {
                custom_dealer: frm.doc.custom_dealer,
                custom_dealer_contact:frm.doc.custom_dealer_contact
            },
            callback: function(r) {
                if (r.message && r.message.length > 0) {
                    const contact = r.message[0];
                    // console.log(contact)
                    frm.set_value("custom_dealer_contact_no", contact[0]);
                }
                else{
                    frm.set_value("custom_dealer_contact", "");
                }
            }
        });
    }
}

// 🔁 Add: Function to render open tasks table
function render_open_tasks_table(frm) {
    console.log("please chekc for open tasks.....")
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "ToDo",
            filters: {
                reference_type: "Opportunity",
                reference_name: frm.doc.name,
                status: "Open"
            },
            fields: ["name", "date", "allocated_to", "description", "status"]
        },
        callback: function(response) {
            const data = response.message;
            let html = "";

            if (data.length) {
                html += `<table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>TASK ID</th>
                            <th>Due Date</th>
                            <th>Allocated To</th>
                            <th>Description</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>`;

                data.forEach(task => {
                    const formatted_date = format_pretty_date(task.date);
                    html += `<tr>
                        <td>${task.name}</td>
                        <td>${formatted_date}</td>
                        <td>${task.allocated_to}</td>
                        <td>${task.description}</td>
                        <td>${task.status}</td>
                    </tr>`;
                });

                html += `</tbody></table>`;
            } else {
                html = "<p>No open tasks.</p>";
            }

            // Render to HTML field (make sure this field exists in Opportunity Doctype)
            if (frm.fields_dict.open_tasks_table) {
                frm.fields_dict.open_tasks_table.$wrapper.html(html);
            }
        }
    });
}

// Helper function to format date like "23rd May 2025"
function format_pretty_date(dateStr) {
    const dateObj = new Date(dateStr);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const year = dateObj.getFullYear();

    // Get ordinal suffix
    const ordinal = (d) => {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    return `${day}${ordinal(day)} ${month} ${year}`;
}