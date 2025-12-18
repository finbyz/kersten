from . import __version__ as app_version

app_name = "kersten"
app_title = "kersten"
app_publisher = "viral"
app_description = "kersten"
app_email = "viral@gmail.com"
app_license = "MIT"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/kersten/css/kersten.css"
# app_include_js = "/assets/kersten/js/kersten.js"
app_include_js = [
	"kersten.bundle.js",
    
]
# include js, css files in header of web template
web_include_css = "/assets/kersten/css/kersten.css"
web_include_js = "kerstenweb.bundle.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "kersten/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
doctype_js = {
	"Quotation": "public/js/quotation.js",
	# "Sales Order": "public/js/sales_order.js",
	"Task": "public/js/task_management/doctype_js/task.js",
	"Opportunity": "public/js/opportunity.js",
	"Meeting": "public/js/meeting.js",
	"Customer": "public/js/customer.js",
	"Supplier": "public/js/supplier.js",
}
doctype_list_js = {
    "Task": "public/js/task_management/list_js/task.js",
}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
doctype_calendar_js = {
    "Task": "public/js/task_management/task_calendar.js",
}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
#	"methods": "kersten.utils.jinja_methods",
#	"filters": "kersten.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "kersten.install.before_install"
# after_install = "kersten.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "kersten.uninstall.before_uninstall"
# after_uninstall = "kersten.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "kersten.utils.before_app_install"
# after_app_install = "kersten.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "kersten.utils.before_app_uninstall"
# after_app_uninstall = "kersten.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "kersten.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
#	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
#	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

override_doctype_class = {
	"Web Template": "kersten.kersten.override.doctype.web_template.WebTemplate",
    "Website Item": "kersten.kersten.override.website_item.WebsiteItem",  
    "Assignment Rule": "kersten.kersten.override.doctype.assignment_rule.AssignmentRule", 
	"Task":"kersten.task_management.override.doctype.task.Task",
	"Notification":"kersten.task_management.override.doctype.notification.Notification",
	"Auto Repeat":"kersten.task_management.override.doctype.auto_repeat.AutoRepeat"
}

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
	"Communication": {
		"on_update": "kersten.kersten.doc_events.communication.on_update",
	},
	"Sales Order": {
		"after_insert": "kersten.kersten.doc_events.sales_order.after_insert",
	},
    "Meeting": {
        "on_submit": "kersten.kersten.doc_events.meeting.create_tasks_from_meeting",
        # "on_submit": "kersten.kersten.doc_events.meeting.create_event_on_meeting_submit",
	},
    # "Meeting Schedule": {
    #     "after_insert": "kersten.kersten.doc_events.meeting_schedule.create_event_on_meeting_schedule",
	# }
}

# Scheduled Tasks
# ---------------

# scheduler_events = {
#	"all": [
#		"kersten.tasks.all"
#	],
#	"daily": [
#		"kersten.tasks.daily"
#	],
#	"hourly": [
#		"kersten.tasks.hourly"
#	],
#	"weekly": [
#		"kersten.tasks.weekly"
#	],
#	"monthly": [
#		"kersten.tasks.monthly"
#	],
# }
fixtures = [
    {"dt": "Custom Field","filters": [["module", "=","kersten"]]},
]
# Testing
# -------

# before_tests = "kersten.install.before_tests"

# Overriding Methods
# ------------------------------
#
override_whitelisted_methods = {
	"webshop.webshop.api.get_product_filter_data": "kersten.api.get_product_filter_data",
	"erpnext.crm.doctype.opportunity.opportunity.make_opportunity_from_communication": "kersten.kersten.override.whitelisted_method.opportunity.make_opportunity_from_communication"
}
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
override_doctype_dashboards = {
	"Sales Order": "kersten.kersten.doc_events.sales_order_dashboard.get_data"
}

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["kersten.utils.before_request"]
# after_request = ["kersten.utils.after_request"]

# Job Events
# ----------
# before_job = ["kersten.utils.before_job"]
# after_job = ["kersten.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
#	{
#		"doctype": "{doctype_1}",
#		"filter_by": "{filter_by}",
#		"redact_fields": ["{field_1}", "{field_2}"],
#		"partial": 1,
#	},
#	{
#		"doctype": "{doctype_2}",
#		"filter_by": "{filter_by}",
#		"partial": 1,
#	},
#	{
#		"doctype": "{doctype_3}",
#		"strict": False,
#	},
#	{
#		"doctype": "{doctype_4}"
#	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
#	"kersten.auth.validate"
# ]
