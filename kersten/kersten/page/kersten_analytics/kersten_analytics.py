import csv
import io
import json
from datetime import timedelta

import frappe
from frappe.utils import (
    add_days,
    add_months,
    get_first_day,
    get_last_day,
    getdate,
    nowdate,
)
from frappe.utils.pdf import get_pdf as _get_pdf

from kersten import analytics


@frappe.whitelist()
def export_dashboard_pdf(html, filename="Kersten_Analytics_Report"):
    """Generate a PDF from the provided HTML string and return it as a download.

    Security: The HTML is generated client-side from trusted dashboard state data
    that was already escaped with escapeHTML(). The endpoint requires login
    (frappe.whitelist) and the HTML is passed directly to wkhtmltopdf via
    frappe.utils.pdf.get_pdf which does not execute JS in the server context.
    """
    # TODO(security): Consider adding an HTML sanitization step (e.g. bleach)
    # if untrusted user input could ever reach this endpoint. Currently the HTML
    # is constructed entirely from server-provided dashboard data that was
    # pre-escaped on the client.
    if not html or not isinstance(html, str):
        frappe.throw("No HTML content provided for PDF generation.")

    # Limit payload size to 5MB to prevent DoS
    if len(html) > 5 * 1024 * 1024:
        frappe.throw("HTML content too large for PDF generation.")

    pdf_data = _get_pdf(html)

    frappe.response.filename = f"{filename}.pdf"
    frappe.response.filecontent = pdf_data
    frappe.response.type = "pdf"



CHART_FUNCTIONS = {
    "monthly_sales_revenue": analytics.monthly_sales_revenue_data,
    "revenue_by_company": analytics.revenue_by_company_data,
    "sales_commission_by_salesperson": analytics.sales_and_commission_by_salesperson_data,
    "revenue_per_commission_dollar": analytics.revenue_per_commission_dollar_data,
    "gross_profit_by_category": analytics.gross_profit_by_category_data,
    "gross_profit_by_customer": analytics.gross_profit_by_customer_data,
    "gross_profit_by_item": analytics.gross_profit_by_item_data,
    "slow_moving_inventory": analytics.slow_moving_inventory_data,
    "inventory_turnover": analytics.inventory_turnover_data,
    "inventory_accuracy": analytics.inventory_accuracy_data,
    "cash_and_bank_balance": analytics.cash_and_bank_balance_data,
    "cash_flow_forecast": analytics.cash_flow_forecast_data,
    "purchase_price_trends": analytics.purchase_price_trends_data,
    "fulfillment_time": analytics.fulfillment_time_data,

    # CRM & Pipeline Charts
    "opportunity_pipeline": analytics.opportunity_pipeline_data,
    "opportunity_by_type": analytics.opportunity_by_type_data,
    "opportunity_by_source": analytics.opportunity_by_source_data,
    "opportunity_monthly_trend": analytics.opportunity_monthly_trend_data,
    "quotation_win_rate": analytics.quotation_win_rate_data,
    "pipeline_velocity": analytics.pipeline_velocity_data,
    "revenue_by_territory": analytics.revenue_by_territory_data,
    "receivables_aging": analytics.receivables_aging_data,
    "delivery_performance": analytics.delivery_performance_data,
    "salesperson_performance": analytics.salesperson_performance_data,
}


CHART_META = {
    "monthly_sales_revenue": {
        "label": "Monthly Sales Revenue Comparison",
        "subtitle": "Submitted Sales Invoice revenue, current year vs previous year.",
        "dashboard": "sales",
        "route": "/app/sales-invoice?docstatus=1",
    },
    "revenue_by_company": {
        "label": "Revenue by Company",
        "subtitle": "Total revenue split across all companies.",
        "dashboard": "sales",
        "route": "/app/sales-invoice?docstatus=1",
    },
    "sales_commission_by_salesperson": {
        "label": "Sales and Commission by Salesperson",
        "subtitle": "Allocated amount and incentives.",
        "dashboard": "sales",
        "route": "/app/query-report/Sales Person-wise Transaction Summary",
    },
    "revenue_per_commission_dollar": {
        "label": "Revenue per Commission",
        "subtitle": "Sales divided by commission earned.",
        "dashboard": "sales",
        "route": "/app/query-report/Sales Person Commission Summary",
    },
    "opportunity_pipeline": {
        "label": "Opportunity Pipeline",
        "subtitle": "Opportunities by current status.",
        "dashboard": "crm",
        "route": "/app/opportunity",
    },
    "opportunity_by_type": {
        "label": "Opportunities by Type",
        "subtitle": "Distribution of Opportunity Types.",
        "dashboard": "crm",
        "route": "/app/opportunity",
    },
    "opportunity_by_source": {
        "label": "Opportunities by Source",
        "subtitle": "Where are our leads coming from?",
        "dashboard": "crm",
        "route": "/app/opportunity",
    },
    "opportunity_monthly_trend": {
        "label": "Monthly Opportunities",
        "subtitle": "New opportunities created vs won.",
        "dashboard": "crm",
        "route": "/app/opportunity",
    },
    "quotation_win_rate": {
        "label": "Quotation Win Rate",
        "subtitle": "Monthly quotation outcomes.",
        "dashboard": "crm",
        "route": "/app/quotation",
    },
    "pipeline_velocity": {
        "label": "Pipeline Velocity",
        "subtitle": "Average days between stages.",
        "dashboard": "crm",
        "route": "/app/opportunity",
    },
    "revenue_by_territory": {
        "label": "Revenue by Territory",
        "subtitle": "Total revenue split by sales territory.",
        "dashboard": "sales",
        "route": "/app/sales-invoice",
    },
    "receivables_aging": {
        "label": "Receivables Aging",
        "subtitle": "Outstanding amounts by age bucket.",
        "dashboard": "finance",
        "route": "/app/query-report/Accounts Receivable",
    },
    "delivery_performance": {
        "label": "Delivery Performance",
        "subtitle": "On-time vs Late deliveries.",
        "dashboard": "operations",
        "route": "/app/delivery-note",
    },
    "salesperson_performance": {
        "label": "Salesperson Performance",
        "subtitle": "Opportunities converted by salesperson.",
        "dashboard": "crm",
        "route": "/app/opportunity",
    },
    "gross_profit_by_category": {
        "label": "Gross Profit by Category",
        "subtitle": "Grouped by Item Group.",
        "dashboard": "profit",
        "route": "/app/query-report/Gross Profit?group_by=Item Group",
    },
    "gross_profit_by_customer": {
        "label": "Gross Profit by Customer",
        "subtitle": "Grouped by Customer.",
        "dashboard": "profit",
        "route": "/app/query-report/Gross Profit?group_by=Customer",
    },
    "gross_profit_by_item": {
        "label": "Gross Profit by Item",
        "subtitle": "Grouped by Item Code.",
        "dashboard": "profit",
        "route": "/app/query-report/Gross Profit?group_by=Item Code",
    },
    "slow_moving_inventory": {
        "label": "Slow Moving Inventory",
        "subtitle": "Stock value by days since last sale.",
        "dashboard": "inventory",
        "route": "/app/query-report/Stock Ageing",
    },
    "inventory_turnover": {
        "label": "Inventory Turnover",
        "subtitle": "COGS divided by current inventory value.",
        "dashboard": "inventory",
        "route": "/app/query-report/Stock Balance",
    },
    "inventory_accuracy": {
        "label": "Inventory Accuracy",
        "subtitle": "Stock Reconciliation variance.",
        "dashboard": "inventory",
        "route": "/app/stock-reconciliation",
    },
    "cash_and_bank_balance": {
        "label": "Cash & Bank Balance",
        "subtitle": "GL Entry balances.",
        "dashboard": "finance",
        "route": "/app/query-report/General Ledger",
    },
    "cash_flow_forecast": {
        "label": "Cash Flow Forecast",
        "subtitle": "Expected AR/AP inflows and outflows.",
        "description": "Next 90 Days Forecast",
        "dashboard": "finance",
        "route": "/app/query-report/Cash Flow",
    },
    "purchase_price_trends": {
        "label": "Purchase Price Trends",
        "subtitle": "Average Purchase Receipt item rates.",
        "dashboard": "finance",
        "route": "/app/purchase-receipt",
    },
    "fulfillment_time": {
        "label": "Fulfillment Time",
        "subtitle": "Days between Sales Order and Delivery Note.",
        "dashboard": "operations",
        "route": "/app/delivery-note",
    },
}


CARD_META = {
    "sales": {
        "label": "Total Sales",
        "fieldtype": "Currency",
        "route": "/app/sales-invoice?docstatus=1",
        "color": "indigo",
        "icon": "chart-line",
        "description": "Submitted Sales Invoice net total for the selected company and posting date range. Helps track overall top-line revenue generation.",
        "layout": "standard",
        "span": 1,
    },
    "gross_profit": {
        "label": "Gross Profit",
        "fieldtype": "Currency",
        "route": "/app/query-report/Gross Profit",
        "color": "green",
        "icon": "trending-up",
        "description": "Revenue minus Cost of Goods Sold (COGS). A key indicator of pricing strategy effectiveness and direct operational efficiency.",
        "layout": "standard",
        "span": 1
    },
    "open_opportunities": {
        "label": "Open Opportunities",
        "fieldtype": "Int",
        "route": "/app/opportunity?status=Open",
        "color": "emerald",
        "icon": "target",
        "description": "The total count of currently open opportunities in the sales pipeline. Indicates current sales momentum.",
    },
    "pipeline_value": {
        "label": "Pipeline Value",
        "fieldtype": "Currency",
        "route": "/app/opportunity",
        "color": "indigo",
        "icon": "briefcase",
        "description": "The total potential monetary value of all open and quoted opportunities. Crucial for forecasting future revenue.",
    },
    "quotation_win_rate": {
        "label": "Quotation Win Rate",
        "fieldtype": "Percent",
        "route": "/app/quotation",
        "color": "blue",
        "icon": "check-circle",
        "description": "Percentage of submitted quotations that successfully converted into confirmed Sales Orders. Highlights sales team closing efficiency.",
    },
    "avg_deal_cycle": {
        "label": "Avg Deal Cycle (Days)",
        "fieldtype": "Int",
        "route": "/app/opportunity",
        "color": "amber",
        "icon": "clock",
        "description": "The average number of days it takes to move a deal from initial Opportunity creation to finalized Sales Order. Lower is better.",
    },
    "inventory_value": {
        "label": "Inventory Value",
        "fieldtype": "Currency",
        "route": "/app/query-report/Stock Balance",
        "color": "purple",
        "icon": "package",
        "description": "Total current stock value across all warehouses, calculated based on standard moving average or FIFO valuation.",
    },
    "open_sales_orders": {
        "label": "Open Sales Orders",
        "fieldtype": "Int",
        "route": "/app/sales-order?status=To Deliver and Bill",
        "color": "orange",
        "icon": "shopping-cart",
        "description": "The number of confirmed Sales Orders that are still pending fulfillment (delivery) or final invoicing.",
        "layout": "standard",
        "span": 1
    },
    "open_purchase_orders": {
        "label": "Open Purchase Orders",
        "fieldtype": "Int",
        "route": "/app/purchase-order?status=To Receive and Bill",
        "color": "amber",
        "icon": "truck",
        "description": "The number of confirmed Purchase Orders that have not yet been fully received into stock or billed by the supplier.",
    },
    "commission_earned": {
        "label": "Commission Earned",
        "fieldtype": "Currency",
        "route": "/app/query-report/Sales Person Commission Summary",
        "color": "teal",
        "icon": "award",
        "description": "Total calculated sales team commission incentives based on finalized sales invoices over the selected period.",
        "layout": "standard",
        "span": 1,
    },
    "profit_after_commission": {
        "label": "Sales Profit After Commission",
        "fieldtype": "Currency",
        "route": "/app/query-report/Gross Profit",
        "color": "blue",
        "icon": "circle-dollar-sign",
        "description": "Net margin calculation derived by subtracting allocated sales team commissions from the Gross Profit. Reflects true contribution margin.",
        "layout": "standard",
        "span": 1,
    },
    "total_purchases": {
        "label": "Total Purchases",
        "fieldtype": "Currency",
        "route": "/app/purchase-invoice?docstatus=1",
        "color": "rose",
        "icon": "shopping-cart",
        "description": "The net total of submitted Purchase Invoices for the selected date range. Essential for tracking supplier spend.",
        "layout": "standard",
        "span": 1,
    },
    "gross_profit_percent": {
        "label": "Gross Profit %",
        "fieldtype": "Percent",
        "route": "/app/query-report/Gross Profit",
        "color": "green",
        "icon": "percent",
        "description": "Gross Profit expressed as a percentage of Total Sales. A fundamental metric for tracking overall business profitability margins.",
    },
}

# ----------------------------------------------------------------------
# Internal helpers
# ----------------------------------------------------------------------

@frappe.whitelist()
def get_companies():
    frappe.has_permission("Company", ptype="read", throw=True)
    return frappe.get_all("Company", pluck="name", order_by="name asc")


@frappe.whitelist()
def get_page_data(company=None, from_date=None, to_date=None, preset=None):
    company = _resolve_company(company)
    from_date, to_date = _resolve_dates(from_date, to_date)
    currency = frappe.get_cached_value("Company", company, "default_currency") \
        or frappe.db.get_default("currency")
    filters = {"company": company, "from_date": str(from_date), "to_date": str(to_date)}
    filters_json = json.dumps(filters)

    cards = _get_cards(company, from_date, to_date, currency)
    prev_from, prev_to = _previous_period(from_date, to_date, preset)
    prev_cards = _get_cards(company, prev_from, prev_to, currency, light=True)
    _attach_deltas(cards, prev_cards)

    return {
        "company": company,
        "currency": currency,
        "from_date": str(from_date),
        "to_date": str(to_date),
        "prev_from_date": str(prev_from),
        "prev_to_date": str(prev_to),
        "cards": cards,
        "charts": _get_charts(filters_json),
        "actions": {
            "stock_reorder_alerts": _get_stock_reorder_alerts(company),
            "top_items": _get_top_items(company, from_date, to_date),
            "top_customers": _get_top_customers(company, from_date, to_date),
            "top_suppliers": _get_top_suppliers(company, from_date, to_date),
            "overdue_invoices": _get_overdue_invoices(company),
            "overdue_bills": _get_overdue_bills(company),
            "recent_activity": _get_recent_activity(company),
        },
        "meta": {
            "card_meta": CARD_META,
            "chart_meta": CHART_META,
            "generated_at": frappe.utils.now_datetime().isoformat(),
        },
    }


@frappe.whitelist()
def get_kpi_trends(company=None, from_date=None, to_date=None, buckets=14):
    company = _resolve_company(company)
    from_date, to_date = _resolve_dates(from_date, to_date)
    rows = frappe.db.sql(
        """
        SELECT posting_date AS d,
               COALESCE(SUM(base_net_total), 0) AS sales
        FROM `tabSales Invoice`
        WHERE docstatus = 1 AND company = %s
          AND posting_date BETWEEN %s AND %s
        GROUP BY posting_date
        ORDER BY posting_date ASC
        """,
        (company, from_date, to_date),
        as_dict=True,
    )
    return {
        "sales": [float(r.sales or 0) for r in rows],
        "labels": [str(r.d) for r in rows],
    }


@frappe.whitelist()
def refresh_data(company=None, from_date=None, to_date=None):
    frappe.local.no_cache = True
    return get_page_data(company, from_date, to_date)


@frappe.whitelist()
def export_chart_csv(chart_key, company=None, from_date=None, to_date=None):
    company = _resolve_company(company)
    from_date, to_date = _resolve_dates(from_date, to_date)
    if chart_key not in CHART_FUNCTIONS:
        frappe.throw(frappe._("Unknown chart: {0}").format(chart_key))

    filters_json = json.dumps({
        "company": company,
        "from_date": str(from_date),
        "to_date": str(to_date),
    })
    chart = _safe_chart(CHART_FUNCTIONS[chart_key], filters_json, CHART_META.get(chart_key, {}))
    labels = chart.get("labels") or []
    datasets = chart.get("datasets") or []

    buf = io.StringIO()
    writer = csv.writer(buf)
    header = ["Label"] + [ds.get("name", f"Series {i + 1}") for i, ds in enumerate(datasets)]
    writer.writerow(header)
    for i, label in enumerate(labels):
        row = [label] + [(ds.get("values") or [None])[i] if i < len(ds.get("values") or []) else "" for ds in datasets]
        writer.writerow(row)

    frappe.response.filename = f"{chart_key}.csv"
    frappe.response.filecontent = buf.getvalue()
    frappe.response.type = "binary"


# ----------------------------------------------------------------------
# Internal helpers
# ----------------------------------------------------------------------

def _resolve_company(company=None):
    company = company or frappe.defaults.get_user_default("Company")
    if not company:
        company = frappe.db.get_single_value("Global Defaults", "default_company")
    if not company:
        companies = frappe.get_all("Company", limit=1, pluck="name")
        company = companies[0] if companies else None
    if not company:
        frappe.throw(frappe._("Company is required"))
    frappe.has_permission("Company", doc=company, ptype="read", throw=True)
    return company


def _resolve_dates(from_date=None, to_date=None):
    if not from_date or not to_date:
        today = getdate(nowdate())
        from_date = from_date or get_first_day(today)
        to_date = to_date or get_last_day(today)
    from_date = getdate(from_date)
    to_date = getdate(to_date)
    if from_date > to_date:
        frappe.throw(frappe._("From Date cannot be after To Date"))
    return from_date, to_date


def _previous_period(from_date, to_date, preset=None):
    if preset in ("this_year", "ytd"):
        return getdate(add_months(from_date, -12)), getdate(add_months(to_date, -12))
    elif preset == "this_month":
        return getdate(add_months(from_date, -1)), getdate(add_months(to_date, -1))
    elif preset == "this_quarter":
        return getdate(add_months(from_date, -3)), getdate(add_months(to_date, -3))

    span = (to_date - from_date).days + 1
    prev_to = add_days(from_date, -1)
    prev_from = add_days(prev_to, -(span - 1))
    return getdate(prev_from), getdate(prev_to)


def _currency_card(key, value, currency):
    meta = CARD_META[key].copy()
    meta.update({"value": value or 0, "options": currency})
    return meta


def _number_card(key, value):
    meta = CARD_META[key].copy()
    meta.update({"value": value or 0})
    return meta


def _percent_card(key, value):
    meta = CARD_META[key].copy()
    meta.update({"value": value or 0})
    return meta


def _get_cards(company, from_date, to_date, currency, light=False):
    sales = frappe.db.sql(
        """
        SELECT COALESCE(SUM(base_net_total), 0)
        FROM `tabSales Invoice`
        WHERE docstatus = 1 AND company = %s AND posting_date BETWEEN %s AND %s
        """,
        (company, from_date, to_date),
    )[0][0] or 0
    purchases = frappe.db.sql(
        """
        SELECT COALESCE(SUM(base_net_total), 0)
        FROM `tabPurchase Invoice`
        WHERE docstatus = 1 AND company = %s AND posting_date BETWEEN %s AND %s
        """,
        (company, from_date, to_date),
    )[0][0] or 0
    gross_profit = analytics._gross_profit(company, from_date, to_date) or 0
    commission = analytics._commission_earned(company, from_date, to_date) or 0
    gp_percent = (gross_profit / sales * 100) if sales > 0 else 0

    if light:
        return {
            "sales": _currency_card("sales", sales, currency),
            "total_purchases": _currency_card("total_purchases", purchases, currency),
            "gross_profit": _currency_card("gross_profit", gross_profit, currency),
            "gross_profit_percent": _percent_card("gross_profit_percent", gp_percent),
            "open_opportunities": _number_card("open_opportunities", 0),
            "pipeline_value": _currency_card("pipeline_value", 0, currency),
            "commission_earned": _currency_card("commission_earned", commission, currency),
            "profit_after_commission": _currency_card(
                "profit_after_commission", gross_profit - commission, currency
            ),
        }

    inventory = analytics.inventory_value(json.dumps({"company": company})).get("value") or 0
    
    # CRM Data
    open_opps = frappe.db.count("Opportunity", {
        "company": company,
        "status": "Open"
    })
    
    pipeline_val = frappe.db.sql("""
        SELECT COALESCE(SUM(opportunity_amount), 0)
        FROM `tabOpportunity`
        WHERE company = %s AND status IN ('Open', 'Quotation')
    """, company)[0][0] or 0
    
    quotations = frappe.db.sql("""
        SELECT 
            SUM(CASE WHEN status = 'Ordered' THEN 1 ELSE 0 END) as won,
            COUNT(*) as total
        FROM `tabQuotation`
        WHERE company = %s AND docstatus = 1
    """, company, as_dict=True)[0]
    
    win_rate = 0
    if quotations.total:
        win_rate = round((quotations.won / quotations.total) * 100, 1)
        
    avg_cycle = frappe.db.sql("""
        SELECT AVG(DATEDIFF(so.creation, o.creation))
        FROM `tabOpportunity` o
        INNER JOIN `tabQuotation` q ON q.opportunity = o.name
        INNER JOIN `tabSales Order Item` soi ON soi.prevdoc_docname = q.name
        INNER JOIN `tabSales Order` so ON so.name = soi.parent
        WHERE so.docstatus = 1 AND o.company = %s
    """, company)[0][0] or 0
    open_so = frappe.db.count("Sales Order", {
        "company": company,
        "docstatus": 1,
        "status": "To Deliver and Bill",
        "transaction_date": ["between", [from_date, to_date]],
    })
    open_po = frappe.db.count("Purchase Order", {
        "company": company,
        "docstatus": 1,
        "status": "To Receive and Bill",
        "transaction_date": ["between", [from_date, to_date]],
    })

    return {
        "sales": _currency_card("sales", sales, currency),
        "total_purchases": _currency_card("total_purchases", purchases, currency),
        "gross_profit": _currency_card("gross_profit", gross_profit, currency),
        "gross_profit_percent": _percent_card("gross_profit_percent", gp_percent),
        "open_opportunities": _number_card("open_opportunities", open_opps),
        "pipeline_value": _currency_card("pipeline_value", pipeline_val, currency),
        "quotation_win_rate": _percent_card("quotation_win_rate", win_rate),
        "avg_deal_cycle": _number_card("avg_deal_cycle", int(avg_cycle)),
        "inventory_value": _currency_card("inventory_value", inventory, currency),
        "open_sales_orders": _number_card("open_sales_orders", open_so),
        "open_purchase_orders": _number_card("open_purchase_orders", open_po),
        "commission_earned": _currency_card("commission_earned", commission, currency),
        "profit_after_commission": _currency_card(
            "profit_after_commission", gross_profit - commission, currency
        ),
    }


def _attach_deltas(cards, prev_cards):
    for key, card in cards.items():
        prev = prev_cards.get(key) or {}
        prev_val = prev.get("value")
        curr_val = card.get("value") or 0
        if prev_val is None:
            continue
        card["previous"] = prev_val
        if prev_val == 0:
            card["delta_pct"] = None if curr_val == 0 else 100.0
        else:
            card["delta_pct"] = round((curr_val - prev_val) / abs(prev_val) * 100, 2)


def _get_charts(filters_json):
    return {key: _safe_chart(fn, filters_json, CHART_META.get(key, {}))
            for key, fn in CHART_FUNCTIONS.items()}


def _safe_chart(function, filters_json, meta):
    try:
        chart = function(filters_json) or {}
    except Exception as e:
        import traceback
        frappe.log_error(title=f"Chart Error: {meta.get('label')}", message=traceback.format_exc())
        chart = {"labels": [], "datasets": [], "type": "bar", "error": True}
    chart.update({
        "label": meta.get("label"),
        "subtitle": meta.get("subtitle"),
        "dashboard": meta.get("dashboard"),
        "route": meta.get("route"),
    })
    chart.setdefault("labels", [])
    chart.setdefault("datasets", [])
    chart.setdefault("type", "bar")
    return chart


def _get_stock_reorder_alerts(company):
    return frappe.db.sql(
        """
        SELECT reorder.parent AS item_code,
            item.item_name,
            reorder.warehouse,
            COALESCE(bin.actual_qty, 0) AS current_qty,
            reorder.warehouse_reorder_level AS reorder_level,
            GREATEST(reorder.warehouse_reorder_level - COALESCE(bin.actual_qty, 0), 0) AS shortage_qty
        FROM `tabItem Reorder` reorder
        INNER JOIN `tabItem` item ON item.name = reorder.parent
        INNER JOIN `tabWarehouse` warehouse ON warehouse.name = reorder.warehouse
        LEFT JOIN `tabBin` bin ON bin.item_code = reorder.parent AND bin.warehouse = reorder.warehouse
        WHERE item.disabled = 0
            AND warehouse.company = %s
            AND IFNULL(reorder.warehouse, '') != ''
            AND reorder.warehouse_reorder_level > 0
            AND COALESCE(bin.actual_qty, 0) < reorder.warehouse_reorder_level
        ORDER BY shortage_qty DESC, reorder.parent ASC
        LIMIT 20
        """,
        company,
        as_dict=True,
    )


def _get_top_items(company, from_date, to_date):
    rows = frappe.db.sql(
        """
        SELECT item.item_code AS label,
            i.image AS image,
            COALESCE(SUM(item.base_net_amount), 0) AS value,
            COALESCE(SUM(item.qty), 0) AS qty
        FROM `tabSales Invoice Item` item
        INNER JOIN `tabSales Invoice` invoice ON invoice.name = item.parent
        LEFT JOIN `tabItem` i ON i.name = item.item_code
        WHERE invoice.docstatus = 1
            AND invoice.company = %s
            AND invoice.posting_date BETWEEN %s AND %s
        GROUP BY item.item_code
        ORDER BY value DESC
        LIMIT 10
        """,
        (company, from_date, to_date),
        as_dict=True,
    )
    for r in rows:
        r["initials"] = _get_initials(r.get("label"))
    return rows


def _get_initials(name):
    if not name: return ""
    parts = str(name).strip().split()
    if len(parts) > 1:
        return (parts[0][0] + parts[-1][0]).upper()
    elif parts:
        return parts[0][:2].upper()
    return ""


def _get_top_customers(company, from_date, to_date):
    rows = frappe.db.sql(
        """
        SELECT si.customer AS label,
            c.image AS image,
            COALESCE(SUM(si.base_net_total), 0) AS value
        FROM `tabSales Invoice` si
        LEFT JOIN `tabCustomer` c ON si.customer = c.name
        WHERE si.docstatus = 1
            AND si.company = %s
            AND si.posting_date BETWEEN %s AND %s
        GROUP BY si.customer
        ORDER BY value DESC
        LIMIT 10
        """,
        (company, from_date, to_date),
        as_dict=True,
    )
    for r in rows:
        r["initials"] = _get_initials(r.get("label"))
    return rows


def _get_top_suppliers(company, from_date, to_date):
    rows = frappe.db.sql(
        """
        SELECT pi.supplier AS label,
            s.image AS image,
            COALESCE(SUM(pi.base_net_total), 0) AS value
        FROM `tabPurchase Invoice` pi
        LEFT JOIN `tabSupplier` s ON pi.supplier = s.name
        WHERE pi.docstatus = 1
            AND pi.company = %s
            AND pi.posting_date BETWEEN %s AND %s
        GROUP BY pi.supplier
        ORDER BY value DESC
        LIMIT 10
        """,
        (company, from_date, to_date),
        as_dict=True,
    )
    for r in rows:
        r["initials"] = _get_initials(r.get("label"))
    return rows


def _get_overdue_invoices(company):
    return frappe.db.sql(
        """
        SELECT name, customer, due_date,
               COALESCE(outstanding_amount, 0) AS outstanding,
               DATEDIFF(CURDATE(), due_date) AS days_overdue
        FROM `tabSales Invoice`
        WHERE docstatus = 1
          AND company = %s
          AND outstanding_amount > 0
          AND due_date < CURDATE()
        ORDER BY days_overdue DESC
        LIMIT 15
        """,
        company,
        as_dict=True,
    )


def _get_overdue_bills(company):
    return frappe.db.sql(
        """
        SELECT name, supplier, due_date,
               COALESCE(outstanding_amount, 0) AS outstanding,
               DATEDIFF(CURDATE(), due_date) AS days_overdue
        FROM `tabPurchase Invoice`
        WHERE docstatus = 1
          AND company = %s
          AND outstanding_amount > 0
          AND due_date < CURDATE()
        ORDER BY days_overdue DESC
        LIMIT 15
        """,
        company,
        as_dict=True,
    )


def _get_recent_activity(company):
    invoices = frappe.db.sql(
        """
        SELECT si.name AS doc, 'Sales Invoice' AS doctype, si.customer AS party,
               c.image AS image,
               si.base_grand_total AS amount, si.modified
        FROM `tabSales Invoice` si
        LEFT JOIN `tabCustomer` c ON si.customer = c.name
        WHERE si.docstatus = 1 AND si.company = %s
        ORDER BY si.modified DESC LIMIT 5
        """,
        company, as_dict=True,
    )
    pos = frappe.db.sql(
        """
        SELECT po.name AS doc, 'Purchase Order' AS doctype, po.supplier AS party,
               s.image AS image,
               po.base_grand_total AS amount, po.modified
        FROM `tabPurchase Order` po
        LEFT JOIN `tabSupplier` s ON po.supplier = s.name
        WHERE po.docstatus = 1 AND po.company = %s
        ORDER BY po.modified DESC LIMIT 5
        """,
        company, as_dict=True,
    )
    rows = invoices + pos
    rows.sort(key=lambda r: r.get("modified") or "", reverse=True)
    rows = rows[:8]
    for r in rows:
        r["initials"] = _get_initials(r.get("party"))
    return rows