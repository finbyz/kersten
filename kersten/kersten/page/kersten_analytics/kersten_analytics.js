/*
 * Kersten Analytics — Ultra Pro
 * Frappe v16 Page script with Bento Grid, Glassmorphism, and E-commerce Funnels.
 */
frappe.pages["kersten-analytics"].on_page_load = function (wrapper) {
	frappe.ui.make_app_page({
		parent: wrapper,
		title: __("Kersten Analytics"),
		single_column: true,
	});

	const methodRoot = "kersten.kersten.page.kersten_analytics.kersten_analytics.";

	const escapeHTML = (str) => {
		if (str === null || str === undefined) return "";
		return String(str).replace(/[&<>'"]/g, match => ({
			'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
		}[match]));
	};

	window.naRouteToList = function (doctype, filterArg) {
		let filters = {};
		if (typeof filterArg === "string") {
			filters.status = filterArg;
		} else if (typeof filterArg === "object") {
			filters = Object.assign({}, filterArg);
		}
		const company = $("#na-company").val();
		if (company) filters.company = company;
		frappe.route_options = filters;
		frappe.set_route('List', doctype);
	};

	const state = {
		company: frappe.defaults.get_user_default("Company") || "",
		filters: defaultFilters(),
		data: null,
		trends: { sales: [] },
		loading: false,
		companies: [],
		apexReady: false,
		charts: {},
		theme: localStorage.getItem("na-theme") || "light",
		view: localStorage.getItem("na-view") || "all",
		density: localStorage.getItem("na-density") || "comfy",
		autoRefresh: false,
		autoTimer: null,
		search: "",
	};

	const PALETTE = {
		red: { bg: "rgba(228, 77, 46, 0.1)", fg: "#E44D2E" }, // Kersten Red
		kersten: { bg: "rgba(228, 77, 46, 0.1)", fg: "#E44D2E" }, // Primary Kersten Color
		blue: { bg: "var(--na-tint-blue)", fg: "#4F46E5" }, // Indigo
		green: { bg: "var(--na-tint-green)", fg: "#10B981" }, // Emerald
		purple: { bg: "var(--na-tint-purple)", fg: "#8B5CF6" }, // Violet
		orange: { bg: "var(--na-tint-orange)", fg: "#F97316" }, // Orange
		teal: { bg: "var(--na-tint-teal)", fg: "#14B8A6" }, // Teal
		amber: { bg: "var(--na-tint-amber)", fg: "#F59E0B" }, // Amber
		rose: { bg: "var(--na-tint-red)", fg: "#E11D48" },
		emerald: { bg: "var(--na-tint-emerald)", fg: "#059669" },
		indigo: { bg: "var(--na-tint-indigo)", fg: "#6366F1" },
	};

	// Premium modern color palette for charts - starting with Kersten red
	const CHART_COLORS = ["#E44D2E", "#10B981", "#F59E0B", "#6366F1", "#8B5CF6", "#06B6D4", "#F97316", "#EC4899", "#14B8A6"];

	const TABS = [
		{ id: "all", label: "Overview", icon: "grid" },
		{ id: "crm", label: "CRM & Pipeline", icon: "users" },
		{ id: "sales", label: "Sales", icon: "trending-up" },
		{ id: "profit", label: "Profit", icon: "circle-dollar-sign" },
		{ id: "inventory", label: "Inventory", icon: "package" },
		{ id: "finance", label: "Finance", icon: "wallet" },
		{ id: "operations", label: "Operations", icon: "truck" },
	];

	const $page = $(wrapper).find(".page-content");
	injectStyles();
	loadApexCharts();
	$page.addClass("na-page").attr("data-theme", state.theme).attr("data-density", state.density).html(getLayout());
	bindEvents();
	restoreFiltersFromURL();
	applyView(state.view);
	loadCompanies().then(() => loadPageData());

	// ============================================================
	// LAYOUT (Bento Grid Style)
	// ============================================================
	function getLayout() {
		return `
<div class="na-shell">

	<div class="na-filter-bar" style="margin-top: 16px;">
		<div class="na-filter-group" style="width: 100%; display: flex; align-items: center; gap: 12px; flex-wrap: nowrap; overflow: visible;">
			
			<div class="na-field na-field-icon" style="flex-shrink: 0; position: relative; display: none;">
				<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01"/></svg>
				<select id="na-company" style="padding-right: 24px; appearance: none;"></select>
			</div>
			<div class="na-field na-field-icon" style="flex-shrink: 0; position: relative;">
				<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
				<select id="na-preset" style="padding-right: 24px; appearance: none;">
					<option value="this_month">This Month</option>
					<option value="last_month">Last Month</option>
					<option value="this_quarter">This Quarter</option>
					<option value="this_year">This Year</option>
					<option value="ytd">Year to Date</option>
					<option value="custom">Custom Range</option>
				</select>
			</div>
			<div class="na-field na-date-field" style="display:none; flex-shrink: 0;"><input type="date" id="na-from-date"></div>
			<div class="na-field na-date-field" style="display:none; flex-shrink: 0;"><input type="date" id="na-to-date"></div>
			<button class="na-btn-apply" id="na-apply" style="flex-shrink: 0;">Apply</button>

			<div class="na-filter-right" style="margin-left: auto; display: flex; align-items: center; gap: 12px; flex-wrap: nowrap; flex-shrink: 0;">
				<div class="na-range-summary" id="na-range-summary" style="font-size: 13px; font-weight: 600; color: var(--na-text-2); white-space: nowrap; flex-shrink: 0;"></div>
			</div>
		</div>
		<div class="na-tabs-wrapper" style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--na-border); padding-top: 8px; margin-top: 4px; margin-bottom: 4px;">
			<div class="na-tabs" id="na-tabs" style="display: flex; gap: 6px; flex-wrap: wrap;">
				${TABS.map(t => `
					<button class="na-tab ${t.id === state.view ? "is-active" : ""}" data-view="${t.id}">
						${getIcon(t.icon)}<span>${t.label}</span>
					</button>`).join("")}
			</div>
			<div class="na-tabs-right" style="display: flex; align-items: center; gap: 12px;">
				<div class="na-search" style="flex: 1 1 auto; min-width: 120px; max-width: 250px;">
					<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
					<input id="na-search" placeholder="Search...">
				</div>
				<button class="na-icon-btn" id="na-export" title="Export Dashboard" style="padding: 0 12px; width: auto; font-size: 13px; font-weight: 600; gap: 6px;">
					<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
					Export
				</button>
				<button class="na-icon-btn" id="na-refresh" title="Refresh Data">
					<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-9-9c2.5 0 4.7 1 6.4 2.6L21 8M21 3v5h-5"/></svg>
				</button>
				<button class="na-icon-btn" id="na-theme" title="Toggle Theme">
					<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
				</button>
			</div>
		</div>
	</div>

	<div id="na-insights" style="margin-bottom:8px; display:flex; flex-wrap:nowrap; gap:8px; overflow-x:auto; overflow-y:hidden; scrollbar-width:none; width:100%;"></div>
	<div class="na-kpi-grid" id="na-kpis" style="margin-top:0;">
		${shimmer(6, "na-kpi-skeleton")}
	</div>

	<!-- CRM & Pipeline -->
	<div class="na-section" data-view="crm">
		${sectionTitle("CRM & Pipeline", "Opportunity funnels, quotation conversions, and pipeline velocity")}
		<div class="na-bento">
			<div class="na-bento-span-6">${chartPanel("opportunity_pipeline", "Opportunity Pipeline", "", "A visual breakdown of all opportunities traversing from Open to Quoted to Converted or Lost stages. Helps identify bottlenecks in the sales funnel.")}</div>
			<div class="na-bento-span-6">${chartPanel("quotation_win_rate", "Quotation Win Rate", "", "Monthly analysis of quotation outcomes. Shows the percentage of quotations that resulted in confirmed Orders versus those that Expired or were Lost.")}</div>
			<div class="na-bento-span-6">${chartPanel("opportunity_monthly_trend", "Monthly Opportunities", "", "Trendline comparing the volume of new opportunities created each month against the total number of opportunities successfully won.")}</div>
			<div class="na-bento-span-6">${chartPanel("pipeline_velocity", "Pipeline Velocity", "", "Tracks the average duration (in days) it takes to move a deal from initial Opportunity to Quotation, and from Quotation to finalized Sales Order.")}</div>
			<div class="na-bento-span-6">${chartPanel("opportunity_by_type", "Opportunities by Type", "", "Categorizes the sales pipeline into business segments such as Sweeping, Parts, Kersten Hire, and Service/Support.")}</div>
			<div class="na-bento-span-6">${chartPanel("opportunity_by_source", "Opportunities by Source", "", "Identifies the origin of leads (e.g., Contact Form, Dealer Enquiry, Exhibition) to evaluate marketing and acquisition channel effectiveness.")}</div>
			<div class="na-bento-span-12">${chartPanel("salesperson_performance", "Salesperson Performance", "", "Ranks the top 10 sales representatives based on their opportunity conversion rates and total pipeline value managed.")}</div>
		</div>
	</div>

	<!-- Sales & Commission -->
	<div class="na-section" data-view="sales">
		${sectionTitle("Sales & Commission", "Revenue, salesperson productivity, commission efficiency")}
		<div class="na-bento">
			<div class="na-bento-span-8">${chartPanel("monthly_sales_revenue", "Monthly Revenue Trend", "", "Year-over-year comparison of submitted Sales Invoice revenue to track business growth and seasonal trends.")}</div>
			<div class="na-bento-span-4">${chartPanel("sales_commission_by_salesperson", "Salesperson Performance", "", "Breakdown of allocated invoice amounts and the corresponding commission incentives earned by each salesperson.")}</div>
			<div class="na-bento-span-8">${chartPanel("revenue_by_company", "Revenue by Company", "", "Overall revenue contribution split across the different corporate entities within the system.")}</div>
			<div class="na-bento-span-4">${chartPanel("revenue_per_commission_dollar", "Revenue per Commission", "", "Return on Investment (ROI) metric measuring how much gross revenue is generated for every 1 unit of currency paid out in sales commissions. Higher is better.")}</div>
		</div>
	</div>

	<!-- Profitability -->
	<div class="na-section" data-view="profit">
		${sectionTitle("Profitability Analysis", "Where margin is being made — and lost")}
		<div class="na-bento">
			<div class="na-bento-span-4">${chartPanel("gross_profit_by_category", "Profit by Category", "", "Gross profit margins analyzed by product category (Item Group) to identify the most lucrative product lines.")}</div>
			<div class="na-bento-span-4">${chartPanel("gross_profit_by_customer", "Profit by Customer", "", "Gross profit margins broken down by individual customers to highlight the most valuable accounts.")}</div>
			<div class="na-bento-span-4">${chartPanel("gross_profit_by_item", "Profit by Item", "", "Gross profit margins detailed at the specific Item Code level for granular profitability tracking.")}</div>
		</div>
	</div>

	<!-- Inventory -->
	<div class="na-section" data-view="inventory">
		${sectionTitle("Inventory Intelligence", "Movement, ageing, turnover and accuracy")}
		<div class="na-bento">
			<div class="na-bento-span-12">${chartPanel("slow_moving_inventory", "Slow Moving Stock", "", "Identifies inventory items that have not been sold recently, categorized by the number of days since their last sale to help optimize stock levels.")}</div>
			<div class="na-bento-span-12">
				<div class="na-panel na-list-panel">
					<div class="na-panel-head">
						<div><h3>Stock Reorder Alerts</h3><span class="na-subtitle">Below reorder level</span></div>
						<div class="na-panel-actions"><button class="na-route-btn" data-chart-route="stock_reorder_alerts">↗</button></div>
					</div>
					<div class="na-panel-body na-p-0" id="na-list-reorder"></div>
				</div>
			</div>
		</div>
	</div>

	<!-- Finance -->
	<div class="na-section" data-view="finance">
		${sectionTitle("Finance & Liquidity", "Cash, forecast, and AP/AR")}
		<div class="na-bento">
			<div class="na-bento-span-6">${chartPanel("cash_and_bank_balance", "Cash & Bank Balances", "", "Current consolidated balances across all designated Cash and Bank General Ledger accounts for immediate liquidity insight.")}</div>
			<div class="na-bento-span-6">${chartPanel("cash_flow_forecast", "Cash Flow Forecast", `
				<div style="display:flex; align-items:center; gap:8px;">
					<span id="na-cashflow-badge" style="font-size:10px; font-weight:600; padding:2px 6px; border-radius:4px; background:rgba(99,102,241,0.1); color:#6366f1;">Forecast View</span>
					<select id="na-cashflow-mode" class="na-select" style="width:130px; font-size:11px; padding:2px 6px; height:24px;">
						<option value="future">Future Only</option>
						<option value="overdue">Include Overdue</option>
					</select>
				</div>
			`, "Predictive 90-day forecast modeling expected cash inflows from Accounts Receivable and outflows to Accounts Payable.")}</div>
			<div class="na-bento-span-12">${chartPanel("receivables_aging", "Receivables Aging", "", "Categorizes outstanding customer invoices into aging buckets (0-30 days, 31-60 days, etc.) to prioritize collection efforts.")}</div>
			<div class="na-bento-span-6">${chartPanel("purchase_price_trends", "Purchase Price Trends", "", "Tracks the historical average rates from Purchase Receipts to monitor supplier pricing and inflation impacts over time.")}</div>
			<div class="na-bento-span-6">
				<div class="na-panel na-list-panel">
					<div class="na-panel-head">
						<div><h3>Overdue Invoices</h3><span class="na-subtitle">AR aging — collect these first</span></div>
						<button class="na-route-btn" data-route="/app/sales-invoice?status=Overdue">View All ↗</button>
					</div>
					<div class="na-panel-body" id="na-list-overdue">${shimmerBlock()}</div>
				</div>
			</div>
			<div class="na-bento-span-6">
				<div class="na-panel na-list-panel">
					<div class="na-panel-head">
						<div><h3>Overdue Bills</h3><span class="na-subtitle">AP aging — pay these first</span></div>
						<button class="na-route-btn" data-route="/app/purchase-invoice?status=Overdue">View All ↗</button>
					</div>
					<div class="na-panel-body" id="na-list-overdue-bills">${shimmerBlock()}</div>
				</div>
			</div>
			<div class="na-bento-span-6">
				<div class="na-panel na-list-panel">
					<div class="na-panel-head">
						<div><h3>Recent Activity</h3><span class="na-subtitle">Latest submitted documents</span></div>
					</div>
					<div class="na-panel-body" id="na-list-activity">${shimmerBlock()}</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Operations -->
	<div class="na-section" data-view="operations">
		${sectionTitle("Operations & Fulfillment", "Order pipeline and delivery performance")}
		<div class="na-bento">
			<div class="na-bento-span-6">${chartPanel("delivery_performance", "Delivery Performance", "", "Measures operational efficiency by tracking the percentage of deliveries completed on or before the committed Sales Order delivery date.")}</div>
			<div class="na-bento-span-6">
				<div class="na-panel" id="na-delivery-summary">
					<div class="na-panel-head">
						<div><h3>Open Orders Summary</h3><span class="na-subtitle">Pending fulfillment</span></div>
					</div>
					<div class="na-panel-body" id="na-delivery-stats">${shimmerBlock()}</div>
				</div>
			</div>
			<div class="na-bento-span-6">
				<div class="na-panel">
					<div class="na-panel-head">
						<div><h3>Top Customers</h3><span class="na-subtitle">By revenue this period</span></div>
						<button class="na-route-btn" data-route="/app/customer">View All ↗</button>
					</div>
					<div class="na-panel-body" id="na-list-customers">${shimmerBlock()}</div>
				</div>
			</div>
			<div class="na-bento-span-6">
				<div class="na-panel">
					<div class="na-panel-head">
						<div><h3>Top Items</h3><span class="na-subtitle">By revenue this period</span></div>
						<button class="na-route-btn" data-route="/app/item">View All ↗</button>
					</div>
					<div class="na-panel-body" id="na-list-items">${shimmerBlock()}</div>
				</div>
			</div>
			<div class="na-bento-span-6">
				<div class="na-panel">
					<div class="na-panel-head">
						<div><h3>Top Suppliers</h3><span class="na-subtitle">By spend this period</span></div>
						<button class="na-route-btn" data-route="/app/purchase-invoice">View All ↗</button>
					</div>
					<div class="na-panel-body na-hbar-list" id="na-list-suppliers" style="padding: 16px 20px; overflow-y:auto; height:100%;">${shimmerBlock()}</div>
				</div>
			</div>
			<div class="na-bento-span-12">${chartPanel("fulfillment_time", "Average Fulfillment Time", "", "Calculates the average number of days taken to process an order from Sales Order confirmation to Delivery Note dispatch.")}</div>
		</div>
	</div>

	<div class="na-footer">
		<span id="na-footer-meta">—</span>
		<span class="na-kbd">Press <kbd>?</kbd> for shortcuts</span>
	</div>
</div>

<div class="na-modal" id="na-modal" style="display:none">
	<div class="na-modal-bg"></div>
	<div class="na-modal-card">
		<div class="na-modal-head">
			<h3 id="na-modal-title">Chart</h3>
			<div class="na-modal-actions">
				<button class="na-icon-btn" id="na-modal-csv" title="Export CSV">CSV</button>
				<button class="na-icon-btn" id="na-modal-close">✕</button>
			</div>
		</div>
		<div class="na-modal-body" id="na-modal-body"></div>
	</div>
</div>

<!-- Export Modal -->
	<div class="na-modal" id="na-export-modal" style="display:none;">
		<div class="na-modal-bg" onclick="$('#na-export-modal').hide()"></div>
		<div class="na-modal-card" style="width: 480px;">
			<div class="na-modal-head">
				<h3>Export Dashboard</h3>
				<button class="na-icon-btn" onclick="$('#na-export-modal').hide()"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
			</div>
			<div class="na-modal-body" style="padding: 24px; display:flex; flex-direction:column; gap:20px;">
				<!-- Export Type -->
				<div>
					<label style="font-size:12px; font-weight:700; color:var(--na-text-2); margin-bottom:8px; display:block;">Export Type</label>
					<div style="display:flex; gap:12px;">
						<label class="na-export-option">
							<input type="radio" name="na-export-type" value="snapshot" checked>
							<div class="na-export-box">
								<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
								<div>
									<div style="font-weight:700; color:var(--na-text);">Dashboard Snapshot</div>
									<div style="font-size:11px; color:var(--na-text-3);">Export exact current view</div>
								</div>
							</div>
						</label>
						<label class="na-export-option">
							<input type="radio" name="na-export-type" value="executive">
							<div class="na-export-box">
								<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
								<div>
									<div style="font-weight:700; color:var(--na-text);">Executive Report</div>
									<div style="font-size:11px; color:var(--na-text-3);">A4 pagination with cover</div>
								</div>
							</div>
						</label>
					</div>
				</div>

				<!-- Format -->
				<div>
					<label style="font-size:12px; font-weight:700; color:var(--na-text-2); margin-bottom:8px; display:block;">Format</label>
					<div style="display:flex; gap:12px;">
						<label style="display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="radio" name="na-export-format" value="pdf" checked> <span style="font-size:13px; font-weight:600;">PDF Document</span></label>
						<label style="display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="radio" name="na-export-format" value="png"> <span style="font-size:13px; font-weight:600;">PNG Image</span></label>
					</div>
				</div>

				<!-- Scope -->
				<div>
					<label style="font-size:12px; font-weight:700; color:var(--na-text-2); margin-bottom:8px; display:block;">Scope</label>
					<div style="display:flex; gap:12px;">
						<label style="display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="radio" name="na-export-scope" value="current" checked> <span style="font-size:13px; font-weight:600;">Current Section Only</span></label>
						<label style="display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="radio" name="na-export-scope" value="selected"> <span style="font-size:13px; font-weight:600;">Selected Sections</span></label>
					</div>
				</div>

				<!-- Section Selector -->
				<div id="na-export-sections" style="display:none; flex-direction:column; gap:8px; padding:12px; background:var(--na-surface-2); border-radius:8px; border:1px solid var(--na-border);">
					${TABS.map(t => `<label style="display:flex; align-items:center; gap:8px; cursor:pointer;"><input type="checkbox" class="na-export-section-cb" value="${t.id}" checked> <span style="font-size:13px; font-weight:600; display:flex; align-items:center; gap:6px;">${getIcon(t.icon)} ${t.label}</span></label>`).join("")}
				</div>

				<button class="na-btn-apply" id="na-run-export" style="width:100%; height:44px; margin-top:8px;">Generate Report</button>
			</div>
		</div>
	</div>

		`;
	}

	function sectionTitle(text, sub) {
		return `<div class="na-section-title"><span>${text}</span>${sub ? `<em>${sub}</em>` : ""}</div>`;
	}

	function chartPanel(id, title, cls, infoText = "") {
		const typeSelector = "";

		return `
		<div class="na-panel ${cls === "full" ? "na-full" : ""}" data-chart-panel="${id}">
			<div class="na-panel-head">
				<div style="display:flex; align-items:center; gap:6px;">
					<h3>${title}</h3>
					${infoText ? `<span class="na-custom-tooltip" data-tooltip="${infoText}" style="cursor:pointer; display:inline-flex; align-items:center; justify-content:center;"><svg style="color:var(--na-text-3); opacity:0.6;" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg></span>` : ""}
				</div>
				<div class="na-panel-actions">
					${typeSelector}
					<button class="na-icon-btn na-mini" data-csv="${id}" title="Export CSV">
						<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>
					</button>
					<button class="na-icon-btn na-mini" data-expand="${id}" title="Expand">
						<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6"/></svg>
					</button>
					<button class="na-route-btn" data-chart-route="${id}">↗</button>
				</div>
			</div>
			<div class="na-chart-wrap" id="na-chart-${id}">${shimmerBlock()}</div>
		</div>`;
	}

	function shimmer(count, cls) {
		return Array(count).fill(`<div class="${cls}"><div class="na-shimmer"></div></div>`).join("");
	}
	function shimmerBlock() {
		return '<div class="na-shimmer" style="height:100%; min-height:180px; border-radius:10px"></div>';
	}

	// ============================================================
	// EVENTS
	// ============================================================
	function bindEvents() {
		$page.on("click", ".na-hbar-row[data-route-doctype]", function () {
			const doctype = $(this).data("route-doctype");
			const name = $(this).data("route-name");
			frappe.set_route("Form", doctype, name);
		});

		$page.on("click", "#na-export", function () {
			openExportModal();
		});

		$page.on("change", "#na-preset", function () {
			const v = $(this).val();
			if (v === "custom") $page.find(".na-date-field").show();
			else { $page.find(".na-date-field").hide(); applyPreset(v); }
		});

		$page.on("click", "#na-apply", function () {
			const preset = $("#na-preset").val();
			if (preset === "custom") {
				state.filters.from_date = $("#na-from-date").val();
				state.filters.to_date = $("#na-to-date").val();
				state.filters.preset = "custom";
			} else applyPreset(preset);
			saveFiltersToURL();
			loadPageData();
		});

		$page.on("change", "#na-company", function () {
			state.company = $(this).val();
			saveFiltersToURL();
			loadPageData();
		});

		$page.on("change", "#na-cashflow-mode", function () {
			const mode = $(this).val();
			if (mode === "future") {
				$("#na-cashflow-badge").text("Forecast View").css({ "background": "rgba(99,102,241,0.1)", "color": "#6366f1" });
			} else {
				$("#na-cashflow-badge").text("Exposure View").css({ "background": "rgba(239,68,68,0.1)", "color": "#ef4444" });
			}

			const $wrap = $("#na-chart-cash_flow_forecast");
			$wrap.html(shimmerBlock());

			frappe.call({
				method: "kersten.kersten.analytics.cash_flow_forecast_data",
				args: { filters: JSON.stringify({ company: state.company, forecast_mode: mode }) },
				callback: function (r) {
					if (r.message) {
						if (!state.data) state.data = { charts: {} };
						if (!state.data.charts) state.data.charts = {};
						state.data.charts["cash_flow_forecast"] = r.message;
						renderApexChart("na-chart-cash_flow_forecast", r.message);
					}
				}
			});
		});

		$page.on("click", "[data-kpi-route-key]", e => { e.stopPropagation(); handleKpiRoute($(e.currentTarget).data("kpi-route-key")); });
		$page.on("click", "[data-route]", e => { e.stopPropagation(); handleRoute($(e.currentTarget).data("route")); });
		$page.on("click", "[data-chart-route]", e => { e.stopPropagation(); handleRoute(state.data?.charts?.[$(e.currentTarget).data("chart-route")]?.route); });
		$page.on("click", "[data-kpi-route]", e => { e.stopPropagation(); handleKpiRoute($(e.currentTarget).data("kpi")); });
		$page.on("click", "[data-csv]", e => { e.stopPropagation(); downloadChartCsv($(e.currentTarget).data("csv")); });
		$page.on("click", "[data-expand]", e => { e.stopPropagation(); openChartModal($(e.currentTarget).data("expand")); });

		$(document).on("click", function (e) {
			if (!$(e.target).closest(".na-dropdown").length) $(".na-dropdown-menu").removeClass("is-open");
		});

		$page.on("click", ".na-type-btn", function () {
			const $btn = $(this);
			const chartId = $btn.closest(".na-chart-type-selector").data("chart");
			const newType = $btn.data("type");

			$btn.siblings().removeClass("active");
			$btn.addClass("active");

			if (state.charts && state.charts["na-chart-" + chartId] && window.rawChartData && window.rawChartData[chartId]) {
				const chart = state.charts["na-chart-" + chartId];
				const raw = window.rawChartData[chartId];

				const newSeries = newType === "donut"
					? raw.ds[0].values
					: raw.ds.map(d => ({ name: d.name, data: d.values }));

				const updateOpts = {
					chart: { type: newType },
					series: newSeries
				};
				if (newType === "donut") updateOpts.labels = raw.labels;
				chart.updateOptions(updateOpts);
			}
		});

		$page.on("click", ".na-icon-btn[data-expand]", function () {
			const v = $(this).data("view");
			$(".na-tab").removeClass("is-active");
			$(this).addClass("is-active");
			renderLayout(v);
		});

		// Global Tooltip Logic
		let $tooltip = null;
		$page.on("mouseenter", ".na-custom-tooltip", function (e) {
			const text = $(this).attr("data-tooltip");
			if (!text) return;
			if (!$tooltip) {
				$tooltip = $('<div class="na-body-tooltip"></div>').appendTo(document.body);
			}
			$tooltip.text(text);
			const rect = this.getBoundingClientRect();
			$tooltip.css({
				top: rect.top - $tooltip.outerHeight() - 8,
				left: rect.left + (rect.width / 2) - ($tooltip.outerWidth() / 2)
			});
			// force reflow
			$tooltip[0].offsetWidth;
			$tooltip.addClass("is-visible");
		}).on("mouseleave", ".na-custom-tooltip", function () {
			if ($tooltip) $tooltip.removeClass("is-visible");
		});

		$page.on("click", ".na-tab", function () {
			const v = $(this).data("view");
			$(".na-tab").removeClass("is-active");
			$(this).addClass("is-active");
			state.view = v;
			localStorage.setItem("na-view", v);
			applyView(v);
		});

		$page.on("click", "#na-refresh", () => loadPageData(true));
		$page.on("click", "#na-theme", toggleTheme);
		$page.on("click", "#na-modal-close, .na-modal-bg", closeChartModal);
		$page.on("input", "#na-search", function () { state.search = $(this).val().toLowerCase(); applySearch(); });

	}

	function currentDateFilters() {
		return {
			company: state.company,
			from_date: state.filters.from_date,
			to_date: state.filters.to_date,
		};
	}

	function routeList(doctype, filters) {
		frappe.route_options = filters || {};
		frappe.set_route("List", doctype);
	}

	function routeReport(reportName, filters) {
		frappe.route_options = filters || {};
		frappe.set_route("query-report", reportName, filters || {});
	}

	function handleKpiRoute(key) {
		const f = currentDateFilters();
		if (!key) return;

		if (key === "sales") {
			routeList("Sales Invoice", {
				docstatus: 1,
				company: f.company,
				posting_date: ["between", [f.from_date, f.to_date]],
			});
			return;
		}
		if (key === "total_purchases") {
			routeList("Purchase Invoice", {
				docstatus: 1,
				company: f.company,
				posting_date: ["between", [f.from_date, f.to_date]],
			});
			return;
		}
		if (key === "open_sales_orders" || key === "open_orders") {
			routeList("Sales Order", {
				docstatus: 1,
				company: f.company,
				status: "To Deliver and Bill",
				transaction_date: ["between", [f.from_date, f.to_date]],
			});
			return;
		}
		if (key === "open_purchase_orders") {
			routeList("Purchase Order", {
				docstatus: 1,
				company: f.company,
				status: "To Receive and Bill",
				transaction_date: ["between", [f.from_date, f.to_date]],
			});
			return;
		}
		if (key === "commission_earned") {
			routeReport("Sales Person Commission Summary", {
				doc_type: "Sales Order",
				company: f.company,
				from_date: f.from_date,
				to_date: f.to_date,
			});
			return;
		}
		if (key === "gross_profit" || key === "profit_after_commission") {
			routeReport("Gross Profit", {
				company: f.company,
				from_date: f.from_date,
				to_date: f.to_date,
				group_by: "Invoice",
			});
			return;
		}
		if (key === "inventory_value") {
			routeReport("Stock Balance", { company: f.company, from_date: f.from_date, to_date: f.to_date });
			return;
		}
		const card = state.data?.cards?.[key];
		handleRoute(card?.route || state.data?.meta?.card_meta?.[key]?.route);
	}

	function handleRoute(routeStr) {
		if (!routeStr) return;
		let path = String(routeStr).replace(/^\/app\//, "").replace(/^\/desk\//, "");
		let p = path;
		let params = {};

		if (path.includes("?")) {
			const parts = path.split("?");
			p = parts[0];
			params = Object.fromEntries(new URLSearchParams(parts[1]));
		}

		// Inject global filters dynamically
		// Do not inject company for 'item' because Item is a global master and doesn't have a direct company field.
		if (state.company && p !== "item") {
			params.company = state.company;
		}

		if (p.startsWith("query-report/")) {
			if (state.filters.from_date) params.from_date = state.filters.from_date;
			if (state.filters.to_date) params.to_date = state.filters.to_date;
			routeReport(decodeURIComponent(p.replace("query-report/", "")), params);
			return;
		}

		if (Object.keys(params).length > 0) {
			frappe.route_options = params;
		}
		frappe.set_route(p);
	}

	function toggleTheme() {
		state.theme = state.theme === "light" ? "dark" : "light";
		$page.attr("data-theme", state.theme);
		localStorage.setItem("na-theme", state.theme);
		renderCharts();
	}

	function toggleAutoRefresh() {
		state.autoRefresh = !state.autoRefresh;
		$("#na-auto").toggleClass("is-on", state.autoRefresh);
		if (state.autoTimer) { clearInterval(state.autoTimer); state.autoTimer = null; }
		if (state.autoRefresh) state.autoTimer = setInterval(() => loadPageData(true), 60000);
		frappe.show_alert({ message: state.autoRefresh ? "Auto refresh on (60s)" : "Auto refresh off", indicator: state.autoRefresh ? "green" : "gray" });
	}

	function applyView(v) {
		if (v === "all") $page.find(".na-section").show();
		else $page.find(".na-section").each(function () { $(this).toggle($(this).data("view") === v); });
	}

	function applySearch() {
		const q = state.search;

		// Row-level filter
		$page.find("tr[data-row]").each(function () { $(this).toggle(!q || $(this).text().toLowerCase().includes(q)); });
		$page.find(".na-hbar-row").each(function () { $(this).toggle(!q || $(this).text().toLowerCase().includes(q)); });

		// Panel-level filter
		if (!q) {
			$page.find(".na-panel, .na-kpi-card").show();
			$page.find(".na-bento-span-4, .na-bento-span-6, .na-bento-span-8, .na-bento-span-12").show();
			return;
		}

		$page.find(".na-panel").each(function () {
			const text = $(this).text().toLowerCase();
			const $parent = $(this).parent();
			if (text.includes(q)) {
				$(this).show();
				if ($parent.attr("class") && $parent.attr("class").includes("na-bento-span")) $parent.show();
			} else {
				$(this).hide();
				if ($parent.attr("class") && $parent.attr("class").includes("na-bento-span")) $parent.hide();
			}
		});

		$page.find(".na-kpi-card").each(function () {
			const text = $(this).text().toLowerCase();
			$(this).toggle(text.includes(q));
		});
	}

	// ============================================================
	// DATA LOADING
	// ============================================================
	function loadCompanies() {
		return new Promise(resolve => {
			frappe.call({
				method: methodRoot + "get_companies",
				callback: r => {
					state.companies = r.message || [];
					const $sel = $("#na-company").empty();
					state.companies.forEach(c => $sel.append(`<option value="${c}" ${c === state.company ? "selected" : ""}>${c}</option>`));
					if (!state.company && state.companies.length) {
						state.company = state.companies[0];
						$sel.val(state.company);
					}
					resolve();
				},
				error: resolve,
			});
		});
	}



	function loadPageData(force) {
		if (state.loading) return;
		state.loading = true;
		setHeaderState("loading");

		frappe.call({
			method: methodRoot + "get_page_data",
			args: { company: state.company, from_date: state.filters.from_date, to_date: state.filters.to_date, preset: state.filters.preset },
			callback: r => {
				state.loading = false;
				state.data = r.message || {};
				renderDashboard();
				loadTrends();
				setHeaderState("ok");
			},
			error: () => {
				state.loading = false;
				setHeaderState("error");
				frappe.show_alert({ message: "Failed to load analytics", indicator: "red" });
			},
		});
	}

	function loadTrends() {
		frappe.call({
			method: methodRoot + "get_kpi_trends",
			args: { company: state.company, from_date: state.filters.from_date, to_date: state.filters.to_date },
			callback: r => { state.trends = r.message || { sales: [] }; renderSparklines(); },
			error: () => { },
		});
	}

	function downloadChartCsv(key) {
		const url = `/api/method/${methodRoot}export_chart_csv?chart_key=${encodeURIComponent(key)}`
			+ `&company=${encodeURIComponent(state.company)}`
			+ `&from_date=${encodeURIComponent(state.filters.from_date)}`
			+ `&to_date=${encodeURIComponent(state.filters.to_date)}`;
		window.open(url, "_blank");
	}

	// ============================================================
	// RENDER
	// ============================================================
	function renderDashboard() {
		renderHeaderMeta();
		renderKPIs();
		renderCharts();
		renderActions();
		renderDeliverySummary();
		renderOverdue();
		renderOverdueBills();
		renderActivity();
		applySearch();
	}

	function renderHeaderMeta() {
		const d = state.data;
		if (!d) return;

		$("#na-range-summary").html(`<span>${humanRange(d.from_date, d.to_date)}</span> <em style="font-style:normal; margin-left: 4px; padding-left: 8px; border-left: 1px solid var(--na-border);">vs ${humanRange(d.prev_from_date, d.prev_to_date)}</em>`);
		$("#na-footer-meta").text(`Generated ${d.meta?.generated_at ? new Date(d.meta.generated_at).toLocaleTimeString() : "—"}`);
	}

	function setHeaderState(s) {
		const dot = $(".na-brand-dot");
		dot.removeClass("is-loading is-error");
		if (s === "loading") dot.addClass("is-loading");
		else if (s === "error") dot.addClass("is-error");
	}

	function renderKPIs() {
		const d = state.data || {};
		const cards = d.cards || {};
		const currency = d.currency || "INR";
		const meta = d.meta?.card_meta || {};
		const order = ["sales", "total_purchases", "gross_profit", "profit_after_commission", "open_orders", "commission_earned"];

		const openSales = cards.open_sales_orders || { value: 0, fieldtype: "Int" };
		const openPurchase = cards.open_purchase_orders || { value: 0, fieldtype: "Int" };
		const synthetic = {
			open_orders: {
				label: "Open Orders",
				fieldtype: "Int",
				value: (Number(openSales.value) || 0) + (Number(openPurchase.value) || 0),
				delta_pct: null,
				route: "/app/sales-order",
				color: "orange",
				icon: "shopping-cart",
				description: "Open Sales Orders plus Open Purchase Orders.",
				parts: [
					{ key: "open_sales_orders", label: "SO", value: openSales.value || 0, route: meta.open_sales_orders?.route || "/app/sales-order" },
					{ key: "open_purchase_orders", label: "PO", value: openPurchase.value || 0, route: meta.open_purchase_orders?.route || "/app/purchase-order" },
				]
			}
		};

		let insightsHtml = "";
		const html = order.map(key => {
			const card = key === "open_orders" ? synthetic.open_orders : cards[key];
			if (!card) return "";
			const m = key === "open_orders" ? synthetic.open_orders : (meta[key] || {});
			const palette = PALETTE[m.color || card.color] || PALETTE.blue;
			const value = Number(card.value) || 0;
			const type = card.fieldtype || m.fieldtype || "Float";
			const delta = card.delta_pct;
			const hasDelta = delta !== null && delta !== undefined;
			const deltaCls = !hasDelta ? "is-flat" : delta > 0 ? "is-up" : delta < 0 ? "is-down" : "is-flat";
			const deltaIcon = !hasDelta ? "•" : delta > 0 ? "▲" : delta < 0 ? "▼" : "•";
			const deltaTxt = hasDelta ? `${deltaIcon} ${Math.abs(delta).toFixed(1)}%` : "• Current";
			const label = m.label || card.label || key;
			const route = m.route || card.route || "";
			const description = m.description || card.description || "";

			if (hasDelta && Math.abs(delta) >= 10) {
				const verb = delta > 0 ? "up" : "down";
				const color = delta > 0 ? "#10B981" : "#EF4444";
				insightsHtml += `<div class="na-insight-chip">
					<span style="color:${color};">${delta > 0 ? "▲" : "▼"}</span>
					<strong>${escapeHTML(label)}</strong> is ${verb} <span style="color:${color};font-weight:800;">${Math.abs(delta).toFixed(1)}%</span> vs previous period.
				</div>`;
			}

			const parts = card.parts ? `<div class="na-kpi-parts">
				${card.parts.map(part => `<button type="button" data-kpi-route-key="${escapeHTML(part.key)}"><span>${escapeHTML(part.label)}</span><strong>${formatValue(part.value || 0, "Int", currency)}</strong></button>`).join("")}
			</div>` : "";
			const tooltip = description ? `<span class="na-custom-tooltip na-kpi-info" data-tooltip="${escapeHTML(description)}">${getIcon("info")}</span>` : "";

			return `<div class="na-kpi-card" data-kpi-route="${escapeHTML(route)}" data-kpi="${escapeHTML(key)}" style="--kpi-fg:${palette.fg};--kpi-bg:${palette.bg};">
				<div class="na-kpi-topline">
					<div class="na-kpi-icon-wrap">${getIcon(m.icon || card.icon || "chart-line")}</div>
					<div class="na-kpi-title-wrap"><span class="na-kpi-label">${escapeHTML(label)}</span></div>
					${tooltip}
				</div>
				<div class="na-kpi-main">
					<div class="na-kpi-value" data-target="${value}" data-type="${escapeHTML(type)}">${formatValue(0, type, currency)}</div>
					<span class="na-kpi-delta ${deltaCls}" title="vs previous period">${deltaTxt}</span>
				</div>
				${parts}
				<div class="na-spark" id="na-spark-${escapeHTML(key)}"></div>
			</div>`;
		}).join("");

		$("#na-insights").html(insightsHtml);
		$("#na-kpis").html(html);

		setTimeout(() => {
			$("#na-kpis .na-kpi-value").each(function () {
				const $el = $(this);
				animateValue($el[0], 0, parseFloat($el.data("target")) || 0, 700, $el.data("type"), currency);
			});
			renderSparklines();
		}, 60);
	}

	function renderSparklines() {
		const sales = state.trends?.sales || [];
		const values = sales.length ? sales : [0, 0, 0, 0, 0, 0];
		const cards = state.data?.cards || {};
		const sparkConfig = {
			sales: { values, color: (PALETTE.indigo || PALETTE.blue).fg },
			total_purchases: { values: values.map(v => v * 0.35), color: (PALETTE.rose || PALETTE.red || PALETTE.orange).fg },
			gross_profit: { values: values.map(v => v * 0.65), color: PALETTE.green.fg },
			profit_after_commission: { values: values.map(v => v * 0.6), color: PALETTE.blue.fg },
			open_orders: { values: values.map((v, i) => (i + 1) * ((cards.open_sales_orders?.value || 0) + (cards.open_purchase_orders?.value || 0) || 1)), color: PALETTE.orange.fg },
			commission_earned: { values: values.map(v => v * 0.05), color: PALETTE.teal.fg },
		};
		Object.keys(sparkConfig).forEach(key => drawSpark(`na-spark-${key}`, sparkConfig[key].values, sparkConfig[key].color));
	}

	function drawSpark(id, values, color) {
		const el = document.getElementById(id);
		if (!el || !values.length) return;
		const w = 80, h = 30;
		const max = Math.max(...values, 1), min = Math.min(...values, 0);
		const range = max - min || 1;
		const step = values.length > 1 ? w / (values.length - 1) : w;
		const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / range) * h).toFixed(1)}`).join(" ");
		const area = `0,${h} ${pts} ${w},${h}`;
		el.innerHTML = `
			<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="none">
				<polygon points="${area}" fill="${color}" opacity="0.15"/>
				<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 3px 2px rgba(0,0,0,0.1));"/>
			</svg>`;
	}

	function animateValue(el, start, end, duration, type, currency) {
		let t0 = null;
		function step(t) {
			if (!t0) t0 = t;
			const p = Math.min((t - t0) / duration, 1);
			const eased = 1 - Math.pow(1 - p, 4); // Quartic ease out
			el.textContent = formatValue(start + (end - start) * eased, type, currency);
			if (p < 1) requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	}

	function formatValue(v, t, curr) {
		if (t === "currency") return `${curr}&nbsp;${formatCompact(v)}`;
		if (t === "percentage") return `${v.toFixed(1)}%`;
		return formatCompact(v);
	}

	function renderCharts() {
		const charts = state.data.charts || {};
		Object.keys(charts).forEach(key => {
			const containerId = `na-chart-${key}`;
			const cd = charts[key];
			const $c = $(`#${containerId}`);
			if (!$c.length) return;
			if (!cd || cd.error || !cd.labels || !cd.labels.length) { $c.html(emptyState()); return; }
			const type = cd.type || "bar";
			if (type === "bar" && cd.labels.length <= 8 && cd.datasets.length === 1) {
				renderProgressBars($c, cd, key);
				return;
			}
			if (key === "cash_flow_forecast") {
				console.log("Cash Flow Forecast", charts.cash_flow_forecast);
			}
			if (state.apexReady) renderApexChart(containerId, cd);
			else { $c.html('<div class="na-loading-text">Initializing Engine…</div>'); setTimeout(renderCharts, 400); }
		});
	}

	function renderProgressBars($c, cd, key) {
		const labels = cd.labels;
		const vals = cd.datasets[0].values;
		const max = Math.max(...vals) || 1;
		let html = '<div class="na-hbar-list">';
		labels.forEach((label, i) => {
			const val = vals[i] || 0;
			const pct = Math.max(2, (val / max) * 100);
			const color = CHART_COLORS[i % CHART_COLORS.length];
			const safeLabel = label.replace(/"/g, "&quot;");

			html += `
			<div class="na-hbar-row">
				<div class="na-hbar-track">
					<div class="na-hbar-fill" style="width:0%;background:${color}20" data-target="${pct}%"></div>
					<div class="na-hbar-content">
						<div class="na-hbar-label" title="${safeLabel}"><span class="na-hbar-rank">${i + 1}</span>${label}</div>
						<div class="na-hbar-value">${formatCompact(val)}</div>
					</div>
				</div>
			</div>`;
		});
		$c.html(html + "</div>");

		setTimeout(() => $c.find(".na-hbar-fill").each(function () { $(this).css("width", $(this).data("target")); }), 50);
	}

	function renderApexChart(containerId, cd) {
		const $wrap = $(`#${containerId}`); $wrap.empty();
		const type = cd.type || "bar";
		const labels = cd.labels, ds = cd.datasets || [];
		const dark = state.theme === "dark";
		let chartType = "bar";
		if (type === "area" || type === "line") chartType = "area";
		else if (type === "donut") chartType = "donut";

		const opts = { id: containerId.replace("na-chart-", ""), data: cd };
		if (opts.id === "inventory_accuracy") {
			const vals = opts.data.datasets?.[0]?.values || [];
			if (vals.length > 0) {
				const current = vals[vals.length - 1];
				const prev = vals.length > 1 ? vals[vals.length - 2] : null;
				$("#na-inv-acc-val").text(current + "%");
				if (prev !== null && prev > 0) {
					const delta = current - prev;
					const cls = delta > 0 ? "is-up" : delta < 0 ? "is-down" : "is-flat";
					const txt = delta > 0 ? "▲ +" + delta.toFixed(1) + "%" : delta < 0 ? "▼ " + delta.toFixed(1) + "%" : "• 0.0%";
					$("#na-inv-acc-trend").attr("class", "na-kpi-delta " + cls).text(txt);
				}
			} else {
				$("#na-inv-acc-val").text("0%");
				$("#na-inv-acc-trend").attr("class", "na-kpi-delta is-flat").text("• No Data");
			}
			return;
		}

		if (opts.id === "inventory_turnover") {
			const vals = opts.data.datasets?.[0]?.values || [];
			if (vals.length > 0) $("#na-inv-turn-val").text(vals[vals.length - 1].toFixed(2));
		}

		if (opts.id === "revenue_per_commission_dollar") {
			opts.data.type = "bar";
			chartType = "bar";
		}

		if (labels.length === 0 || ds.length === 0 || !ds[0].values || ds[0].values.length === 0) {
			$wrap.html('<div class="na-empty-state">No data available for selected period</div>');
			return;
		}

		window.rawChartData = window.rawChartData || {};
		window.rawChartData[opts.id] = { ds, labels };

		const safeSeries = type === "donut"
			? ds[0].values.map(v => Number(v) || 0)
			: ds.map(d => ({ name: d.name, data: d.values.map(v => Number(v) || 0) }));

		let allZero = true;
		if (type !== "donut") {
			allZero = safeSeries.every(s => s.data.every(v => v === 0));
		} else {
			allZero = safeSeries.every(v => v === 0);
		}

		const options = {
			series: safeSeries,
			chart: {
				type: chartType,
				height: (opts.id === "monthly_sales_revenue" || opts.id === "sales_commission_by_salesperson") ? 360 : ((opts.id === "revenue_by_company" || opts.id === "revenue_per_commission_dollar") ? 300 : 300),
				toolbar: { show: false }, background: "transparent",
				fontFamily: "inherit", parentHeightOffset: 0,
				animations: { enabled: true, easing: 'easeinout', speed: 400 },
				dropShadow: { enabled: chartType === 'area', color: '#000', top: 14, left: 0, blur: 6, opacity: dark ? 0.2 : 0.05 }
			},
			theme: { mode: dark ? "dark" : "light" },
			colors: CHART_COLORS,
			plotOptions: {
				bar: { borderRadius: 4, columnWidth: "50%", horizontal: opts.id === "revenue_per_commission_dollar" },
				pie: { donut: { size: "75%", labels: { show: true, total: { show: true, fontSize: "14px", fontWeight: 800, label: "Total" } } } },
			},
			dataLabels: { enabled: false },
			stroke: { curve: "smooth", width: chartType === "area" || chartType === "line" ? 3 : 0, dashArray: (opts.id === "monthly_sales_revenue" && ds.length > 1) ? [0, 6] : 0 },
			fill: {
				type: (opts.id === "monthly_sales_revenue" && ds.length > 1) ? ['gradient', 'solid'] : (chartType === "area" ? "gradient" : "solid"),
				opacity: (opts.id === "monthly_sales_revenue" && ds.length > 1) ? [0.5, 0.15] : (chartType === "area" ? 0.5 : 1),
				gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.05, stops: [0, 90, 100] }
			},

			xaxis: {
				categories: labels,
				axisBorder: { show: false }, axisTicks: { show: false },
				labels: { style: { colors: dark ? "#64748B" : "#94A3B8", fontSize: "11px", fontWeight: 600 } },
			},
			yaxis: {
				labels: { formatter: v => formatCompact(v), style: { colors: dark ? "#64748B" : "#94A3B8", fontSize: "11px", fontWeight: 600 } },
				...(allZero ? { min: 0, max: 10, tickAmount: 5 } : {})
			},
			grid: { borderColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", strokeDashArray: 4, padding: { top: -8, left: 8 } },
			legend: {
				show: ds.length > 1 || chartType === "donut" || chartType === "pie",
				position: opts.id === "sales_commission_by_salesperson" ? "top" : "bottom",
				itemMargin: { horizontal: 8, vertical: 4 },
				fontSize: "12px",
				fontWeight: 600,
				markers: { radius: 12 },
				formatter: (name) => name.length > 14 ? name.slice(0, 14) + '…' : name
			},
			tooltip: { theme: dark ? "dark" : "light", style: { fontSize: '12px' }, y: { formatter: v => formatNum(v) } },
		};
		if (type === "donut") options.labels = labels;

		if (state.charts[containerId]) { try { state.charts[containerId].destroy(); } catch (e) { } }

		let renderTarget = document.querySelector(`#${containerId}`);

		if (opts.id === "cash_flow_forecast") {
			const m = cd.metrics || { future_ar: 0, future_ap: 0, net_forecast: 0, overdue_ar: 0, overdue_ap: 0 };
			const mode = $("#na-cashflow-mode").val() || "future";
			const labelAR = mode === "future" ? "Future AR" : "Total AR Exposure";
			const labelAP = mode === "future" ? "Future AP" : "Total AP Exposure";
			const labelNet = mode === "future" ? "Net Forecast" : "Net Exposure";

			const metricsHTML = `
				<div style="display:flex; justify-content:space-between; margin-bottom:12px; padding:0 8px; border-bottom:1px solid var(--na-border); padding-bottom:12px;">
					<div><div style="font-size:11px; color:var(--na-text-2); font-weight:600; text-transform:uppercase;">${labelAR}</div><div style="font-size:14px; font-weight:700; color:#10B981;">${formatCompact(m.future_ar)}</div></div>
					<div><div style="font-size:11px; color:var(--na-text-2); font-weight:600; text-transform:uppercase;">${labelAP}</div><div style="font-size:14px; font-weight:700; color:#EF4444;">${formatCompact(m.future_ap)}</div></div>
					<div style="text-align:right;"><div style="font-size:11px; color:var(--na-text-2); font-weight:600; text-transform:uppercase;">${labelNet}</div><div style="font-size:14px; font-weight:700; color:var(--na-text-1);">${formatCompact(m.net_forecast)}</div></div>
				</div>
			`;

			if (allZero) {
				let banner = "";
				if (m.overdue_ar > 0 || m.overdue_ap > 0) {
					banner = `
					<div style="background:rgba(245,158,11,0.1); border-left:3px solid #f59e0b; padding:12px; border-radius:4px; margin-bottom:16px; font-size:12px; color:var(--na-text-1); line-height:1.4;">
						<strong>Outstanding balances exist</strong> but are already overdue and excluded from forecast calculations.
					</div>`;
				}
				$wrap.html(metricsHTML + banner + `<div class="na-empty-state" style="padding:24px 12px; margin-top:0;">No future receivables or payables found within the next 90 days.</div>`);
				return;
			}

			$wrap.html(metricsHTML + `<div class="na-apex-inner"></div>`);
			renderTarget = $wrap.find(".na-apex-inner")[0];
		}

		const chart = new ApexCharts(renderTarget, options);
		setTimeout(() => chart.render(), 0);
		state.charts[containerId] = chart;
	}

	function renderActions() {
		const a = state.data.actions || {};
		const currency = state.data.currency || "INR";

		renderLeaderboard("na-list-customers", a.top_customers || [], true, currency, "Customer");
		renderLeaderboard("na-list-items", a.top_items || [], true, currency, "Item");
		renderLeaderboard("na-list-suppliers", a.top_suppliers || [], true, currency, "Supplier");

		const alerts = a.stock_reorder_alerts || [];
		if (!alerts.length) { $("#na-list-reorder").html(emptyState()); }
		else {
			let html = '';
			alerts.slice(0, 5).forEach(r => {
				html += `<div class="na-list-row" onclick="frappe.set_route('item', '${r.item_code}')">
					<div>
						<div style="font-weight:700;font-size:13px">${r.item_code}</div>
						<div style="font-size:11px;color:var(--na-text-3)">${r.warehouse}</div>
					</div>
					<div style="text-align:right">
						<div style="font-weight:700;font-size:13px">${formatNum(r.current_qty)}</div>
						<div style="font-size:11px;font-weight:600;color:var(--na-tint-red)">Short ${formatNum(r.shortage_qty)}</div>
					</div>
				</div>`;
			});
			html += `<div class="na-view-all" onclick="naRouteToList('Item Reorder')">View All ↗</div>`;
			$("#na-list-reorder").html(html);
		}

		renderLiveCarts(a.live_carts || [], currency);
	}

	function renderLiveCarts(rows, currency) {
		if (!rows.length) { $("#na-list-live-carts").html(emptyState()); return; }
		let html = `<div class="na-table-wrap"><table class="na-table"><thead><tr>
			<th>User Session</th><th>Cart Size</th><th style="text-align:right">Value</th><th>Status</th><th style="text-align:right">Last Active</th>
		</tr></thead><tbody>`;
		rows.forEach(r => {
			const isCheckout = r.status.includes("Checkout");
			html += `<tr data-row>
				<td class="na-td-bold">
					<div style="display:flex;align-items:center;gap:8px;">
						<div class="na-activity-dot" style="background:${isCheckout ? '#10B981' : '#F59E0B'}"></div>
						${r.user}
					</div>
				</td>
				<td>${r.items} items</td>
				<td style="text-align:right; font-weight:700">${format_currency(r.value, currency)}</td>
				<td><span class="${isCheckout ? 'na-pill-info' : 'na-pill-warn'}">${r.status}</span></td>
				<td style="text-align:right; color:var(--na-text-3)">${r.time}</td>
			</tr>`;
		});
		$("#na-list-live-carts").html(html + "</tbody></table></div>");
	}

	function renderLeaderboard(id, rows, isCurrency, currency, routeType = null) {
		const $el = $(`#${id}`);
		if (!rows.length) { $el.html(emptyState()); return; }
		const max = Math.max(...rows.map(r => Number(r.value || 0))) || 1;
		let html = '<div class="na-hbar-list">';
		rows.forEach((r, i) => {
			const val = Number(r.value || 0);
			const pct = Math.max(2, (val / max) * 100);
			const color = CHART_COLORS[i % CHART_COLORS.length];
			const formatted = isCurrency ? format_currency(val, currency) : formatNum(val);

			let avatarHTML = "";
			if (r.image) {
				avatarHTML = `<img src="${r.image}" class="na-avatar" loading="lazy" onerror="this.style.display='none'">`;
			} else if (r.initials) {
				avatarHTML = `<div class="na-avatar-fallback" style="background:var(--na-tint-blue);color:#3b82f6;">${r.initials}</div>`;
			}

			let routeAttrs = "";
			let styleAttr = "";
			if (routeType) {
				routeAttrs = `data-route-doctype="${routeType}" data-route-name="${escapeHTML(r.label)}"`;
				styleAttr = `style="cursor:pointer;"`;
			}

			html += `<div class="na-hbar-row" ${routeAttrs} ${styleAttr}>
				<div class="na-hbar-track">
					<div class="na-hbar-fill" style="width:0%;background:${color}20" data-target="${pct}%"></div>
					<div class="na-hbar-content">
						<div class="na-hbar-label" title="${escapeHTML(r.label)}"><span class="na-hbar-rank">${i + 1}</span>${avatarHTML}<span>${escapeHTML(r.label)}</span></div>
						<div class="na-hbar-value">${formatted}</div>
					</div>
				</div>
			</div>`;
		});
		$el.html(html + "</div>");
		setTimeout(() => $el.find(".na-hbar-fill").each(function () { $(this).css("width", $(this).data("target")); }), 50);
	}

	function renderOverdue() {
		const rows = state.data?.actions?.overdue_invoices || [];
		if (!rows.length) { $("#na-list-overdue").html(emptyState()); return; }
		let html = '';
		rows.slice(0, 5).forEach(r => {
			const sev = r.days_overdue > 60 ? "color:var(--na-tint-red)" : "color:var(--na-tint-amber)";
			html += `<div class="na-list-row" onclick="frappe.set_route('sales-invoice','${r.name}')">
				<div>
					<div style="font-weight:700;font-size:13px">${escapeHTML(r.name)}</div>
					<div style="font-size:11px;color:var(--na-text-3);max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHTML(r.customer)}</div>
				</div>
				<div style="text-align:right">
					<div style="font-weight:700;font-size:13px">${formatCompact(r.outstanding)}</div>
					<div style="font-size:11px;font-weight:600;${sev}">${r.days_overdue}d overdue</div>
				</div>
			</div>`;
		});
		html += `<div class="na-view-all" onclick="naRouteToList('Sales Invoice', 'Overdue')">View All ↗</div>`;
		$("#na-list-overdue").html(html);
	}

	function renderOverdueBills() {
		const rows = state.data?.actions?.overdue_bills || [];
		if (!rows.length) { $("#na-list-overdue-bills").html(emptyState()); return; }
		let html = '';
		rows.slice(0, 5).forEach(r => {
			const sev = r.days_overdue > 60 ? "color:var(--na-tint-red)" : "color:var(--na-tint-amber)";
			html += `<div class="na-list-row" onclick="frappe.set_route('purchase-invoice','${r.name}')">
				<div>
					<div style="font-weight:700;font-size:13px">${escapeHTML(r.name)}</div>
					<div style="font-size:11px;color:var(--na-text-3);max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHTML(r.supplier)}</div>
				</div>
				<div style="text-align:right">
					<div style="font-weight:700;font-size:13px">${formatCompact(r.outstanding)}</div>
					<div style="font-size:11px;font-weight:600;${sev}">${r.days_overdue}d overdue</div>
				</div>
			</div>`;
		});
		html += `<div class="na-view-all" onclick="naRouteToList('Purchase Invoice', 'Overdue')">View All ↗</div>`;
		$("#na-list-overdue-bills").html(html);
	}

	function renderActivity() {
		const rows = state.data?.actions?.recent_activity || [];
		if (!rows.length) { $("#na-list-activity").html(emptyState()); return; }
		let html = '';
		rows.slice(0, 5).forEach(r => {
			let avatarHTML = "";
			if (r.image) {
				avatarHTML = `<img src="${r.image}" class="na-avatar" loading="lazy" onerror="this.style.display='none'">`;
			} else if (r.initials) {
				avatarHTML = `<div class="na-avatar-fallback" style="background:var(--na-tint-blue);color:#3b82f6;">${r.initials}</div>`;
			} else {
				avatarHTML = `<div class="na-avatar-fallback" style="background:var(--na-surface-2);color:var(--na-text-2);">
					${getIcon(r.doctype === "Sales Invoice" ? "circle-dollar-sign" : "truck")}
				</div>`;
			}

			html += `<div class="na-list-row" onclick="frappe.set_route('${r.doctype.toLowerCase().replace(/ /g, '-')}','${r.doc}')">
				<div style="display:flex;align-items:center;gap:12px">
					${avatarHTML}
					<div>
						<div style="font-weight:700;font-size:13px">${escapeHTML(r.doc)}</div>
						<div style="font-size:11px;color:var(--na-text-3)">${r.doctype} · ${escapeHTML(r.party) || ""} · ${comment_when(r.modified)}</div>
					</div>
				</div>
				<div style="font-weight:700;font-size:13px;flex-shrink:0;">${formatCompact(r.amount || 0)}</div>
			</div>`;
		});
		$("#na-list-activity").html(html);
	}

	function renderDeliverySummary() {
		const cards = state.data?.cards || {};
		const openSO = cards.open_sales_orders?.value || 0;
		const openPO = cards.open_purchase_orders?.value || 0;
		const total = openSO + openPO;
		const soPct = total ? (openSO / total) * 100 : 50;
		const poPct = total ? (openPO / total) * 100 : 50;

		$("#na-delivery-stats").html(`
		<div class="na-summary-grid">
			<div class="na-kpi-row" style="display:flex; gap:8px; margin-bottom: 20px;">
				<div class="na-kpi-card" style="flex:1; padding: 12px; background: var(--na-surface-2); border-radius: 8px;">
					<div style="font-size:11px; color:var(--na-text-3); font-weight:600; margin-bottom:4px;">Total Open</div>
					<div style="font-size:20px; font-weight:800; color:var(--na-text);">${formatNum(total)}</div>
				</div>
				<div class="na-kpi-card" style="flex:1; padding: 12px; background: var(--na-surface-2); border-radius: 8px;">
					<div style="font-size:11px; color:var(--na-text-3); font-weight:600; margin-bottom:4px;">Sales Orders</div>
					<div style="font-size:20px; font-weight:800; color:var(--na-text);">${formatNum(openSO)}</div>
				</div>
				<div class="na-kpi-card" style="flex:1; padding: 12px; background: var(--na-surface-2); border-radius: 8px;">
					<div style="font-size:11px; color:var(--na-text-3); font-weight:600; margin-bottom:4px;">Purchase Orders</div>
					<div style="font-size:20px; font-weight:800; color:var(--na-text);">${formatNum(openPO)}</div>
				</div>
			</div>
			<div class="na-summary-stack">
				<div class="na-summary-bar" style="height:8px; display:flex; border-radius:4px; overflow:hidden;">
					<div style="width:${soPct}%; background:#6366F1"></div>
					<div style="width:${poPct}%; background:#F59E0B"></div>
				</div>
				<div class="na-summary-legend" style="display:flex; justify-content:space-between; margin-top:8px; font-size:11px; font-weight:600; color:var(--na-text-3);">
					<span><i style="display:inline-block; width:8px; height:8px; background:#6366F1; border-radius:50%; margin-right:4px;"></i>Sales ${openSO}</span>
					<span><i style="display:inline-block; width:8px; height:8px; background:#F59E0B; border-radius:50%; margin-right:4px;"></i>Purchase ${openPO}</span>
				</div>
			</div>
		</div>`);
	}

	// ============================================================
	// MODAL
	// ============================================================
	function openChartModal(key) {
		const cd = state.data?.charts?.[key];
		if (!cd) return;
		$("#na-modal-title").text(cd.label || key);
		$("#na-modal-body").html('<div id="na-modal-chart" style="height:520px"></div>');
		$("#na-modal").show();
		setTimeout(() => {
			if (!state.apexReady) return;
			const ds = cd.datasets || [];
			const dark = state.theme === "dark";
			const opts = {
				series: cd.type === "donut" ? ds[0].values : ds.map(d => ({ name: d.name, data: d.values })),
				chart: { type: cd.type === "area" || cd.type === "line" ? "area" : cd.type === "donut" ? "donut" : "bar", height: 520, toolbar: { show: true }, background: "transparent" },
				theme: { mode: dark ? "dark" : "light" }, colors: CHART_COLORS, xaxis: { categories: cd.labels },
				stroke: { curve: "smooth", width: cd.type === "area" || cd.type === "line" ? 3 : 0 },
			};
			const c = new ApexCharts(document.querySelector("#na-modal-chart"), opts);
			c.render();
			$("#na-modal-csv").off("click").on("click", () => downloadChartCsv(key));
		}, 50);
	}
	function closeChartModal() { $("#na-modal").hide(); }

	function loadApexCharts() {
		if (window.ApexCharts) { state.apexReady = true; return; }
		const s = document.createElement("script");
		s.src = "https://cdn.jsdelivr.net/npm/apexcharts@3.45.2/dist/apexcharts.min.js";
		s.onload = () => { state.apexReady = true; if (state.data) renderCharts(); };
		document.head.appendChild(s);
	}

	// ============================================================
	// UTILS
	// ============================================================
	function emptyState() {
		return `<div class="na-empty-state">
			<span class="na-custom-tooltip"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg></span>
			<div>No data available</div></div>`;
	}
	function getCurrencySymbol(currency) {
		const symbols = { "INR": "₹", "USD": "$", "EUR": "€", "GBP": "£", "IDR": "Rp", "AED": "د.إ", "SAR": "ر.س" };
		return symbols[currency] || (currency + " ");
	}

	function formatValue(v, type, currency) {
		type = String(type || "").toLowerCase();
		if (type === "currency") {
			const sym = getCurrencySymbol(currency);
			return `${sym} ${formatNum(v)}`;
		}
		if (type === "percent" || type === "percentage") return `${Number(v || 0).toFixed(1)}%`;
		return formatNum(v);
	}
	function formatNum(v) { return Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }); }
	function formatCompact(v) {
		v = Number(v || 0); if (!isFinite(v)) return "0";
		const a = Math.abs(v);
		if (a >= 1e9) return (v / 1e9).toFixed(2) + " B";
		if (a >= 1e6) return (v / 1e6).toFixed(2) + " M";
		if (a >= 1e3) return (v / 1e3).toFixed(1) + " K";
		return v % 1 === 0 ? String(v) : v.toFixed(2);
	}
	function humanRange(a, b) {
		if (!a || !b) return "—";
		const da = new Date(a), db = new Date(b);
		const sy = da.getFullYear() === db.getFullYear() ? "" : ` '${String(da.getFullYear()).slice(2)}`;
		const fA = da.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + sy;
		const fB = db.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + ` '${String(db.getFullYear()).slice(2)}`;
		return `${fA} - ${fB}`;
	}

	function defaultFilters() { return { preset: "this_month", from_date: frappe.datetime.month_start(), to_date: frappe.datetime.nowdate() }; }
	function applyPreset(preset) {
		const today = new Date(); let from, to;
		switch (preset) {
			case "this_month": from = new Date(today.getFullYear(), today.getMonth(), 1); to = today; break;
			case "last_month": from = new Date(today.getFullYear(), today.getMonth() - 1, 1); to = new Date(today.getFullYear(), today.getMonth(), 0); break;
			case "this_quarter": from = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1); to = today; break;
			case "this_year": from = new Date(today.getFullYear(), 0, 1); to = today; break;
			case "ytd": from = new Date(today.getFullYear(), 0, 1); to = today; break;
			default: from = new Date(today.getFullYear(), today.getMonth(), 1); to = today;
		}
		state.filters.preset = preset; state.filters.from_date = dateKey(from); state.filters.to_date = dateKey(to);
	}
	function dateKey(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
	function saveFiltersToURL() {
		const p = new URLSearchParams();
		if (state.company) p.set("company", state.company);
		p.set("preset", state.filters.preset);
		if (state.filters.preset === "custom") {
			p.set("from_date", state.filters.from_date);
			p.set("to_date", state.filters.to_date);
		}
		window.history.replaceState({}, "", `${window.location.pathname}?${p.toString()}`);
	}
	function restoreFiltersFromURL() {
		const p = new URLSearchParams(window.location.search);
		if (p.get("company")) state.company = p.get("company");
		if (p.get("preset")) {
			state.filters.preset = p.get("preset");
			$("#na-preset").val(state.filters.preset);
			if (state.filters.preset === "custom") {
				if (p.get("from_date")) state.filters.from_date = p.get("from_date");
				if (p.get("to_date")) state.filters.to_date = p.get("to_date");
				$(".na-date-field").show();
				$("#na-from-date").val(state.filters.from_date);
				$("#na-to-date").val(state.filters.to_date);
			} else {
				$(".na-date-field").hide();
			}
		}
	}

	function getIcon(name) {
		const I = {
			"chart-line": '<path d="M3 3v18h18"/><path d="M18 9l-5 5-4-4-5 5"/>',
			"trending-up": '<path d="M22 7l-9 9-4-4-7 7"/><path d="M22 7h-6"/><path d="M22 7v6"/>',
			"package": '<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
			"shopping-cart": '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
			"shopping-bag": '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
			"truck": '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
			"percent": '<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
			"circle-dollar-sign": '<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/>',
			"award": '<circle cx="12" cy="8" r="6"/><path d="M15.5 13.5L17 22l-5-3-5 3 1.5-8.5"/>',
			"wallet": '<path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h16v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7"/><path d="M17 14h.01"/>',
			"grid": '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
			"info": '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
		};
		return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${I[name] || '<circle cx="12" cy="12" r="10"/>'}</svg>`;
	}

	// ============================================================
	// STYLES (Ultra Pro Vercel/Linear aesthetic)
	// ============================================================
	function openExportModal() {
		$("#na-export-modal").show();
		// setup listeners
		$("[name='na-export-scope']").off("change").on("change", function () {
			if ($(this).val() === "selected") {
				$("#na-export-sections").css("display", "flex");
			} else {
				$("#na-export-sections").hide();
			}
		});

		$("[name='na-export-format']").off("change").on("change", function () {
			if ($(this).val() === "png") {
				$("[name='na-export-scope'][value='current']").prop("checked", true).trigger("change");
				$("[name='na-export-scope'][value='selected']").prop("disabled", true);
				$("[name='na-export-type'][value='snapshot']").prop("checked", true).trigger("change");
				$("[name='na-export-type'][value='executive']").prop("disabled", true);
			} else {
				$("[name='na-export-scope'][value='selected']").prop("disabled", false);
				$("[name='na-export-type'][value='executive']").prop("disabled", false);
			}
		});

		$("#na-run-export").off("click").on("click", function () {
			const type = $("[name='na-export-type']:checked").val();
			const format = $("[name='na-export-format']:checked").val();
			const scope = $("[name='na-export-scope']:checked").val();
			let sections = [state.view];
			if (scope === "selected") {
				sections = $(".na-export-section-cb:checked").map(function () { return $(this).val(); }).get();
			}

			$("#na-export-modal").hide();
			runExport(type, format, sections);
		});
	}

	function runExport() {
		$("#na-export-modal").hide();

		// Inject print-only styles that hide Frappe chrome and show just the dashboard
		const printStyle = document.createElement("style");
		printStyle.id = "na-print-style";
		printStyle.textContent = `
			@media print {
				/* Hide all Frappe chrome and explicitly hide Frappe Form elements */
				body > *:not(.main-section) { display: none !important; }
				.navbar, .page-head, .layout-side-section, .sidebar-wrapper,
				.frappe-control, .page-container > .page-head,
				#na-export-modal, #na-modal, .na-footer,
				.na-modal, .page-head-content, .container,
				.form-tabs, .form-dashboard, .form-footer, .timeline, .new-timeline,
				.comment-box, .comment-list, .activity-section, .form-messages,
				.form-attachments, .form-links, .form-sidebar, .section-head.collapsible { display: none !important; }

				/* Hide any page wrapper that isn't our analytics dashboard */
				.page-wrapper:not(:has(.na-page)), .page-container:not(:has(.na-page)) { display: none !important; }

				/* Reset heights and overflows to allow multi-page printing */
				html, body { height: auto !important; overflow: visible !important; position: static !important; }
				
				.main-section, .layout-main-section-wrapper, .layout-main-section,
				.layout-main, .page-body, .page-wrapper:has(.na-page), .page-container:has(.na-page),
				.container.page-body { 
					display: block !important; margin: 0 !important; padding: 0 !important; 
					width: 100% !important; max-width: 100% !important; 
					height: auto !important; min-height: auto !important; 
					overflow: visible !important; position: static !important; 
				}

				/* Make the dashboard shell fill the page */
				.na-page, .na-shell { 
					visibility: visible !important; display: block !important; 
					width: 100% !important; margin: 0 !important; padding: 10px !important; 
					height: auto !important; overflow: visible !important; position: static !important; 
				}
				.na-page { background: #fff !important; background-image: none !important; }

				/* Force light theme for print */
				.na-page, .na-page * {
					--na-bg: #fff !important; --na-surface: #fff !important; --na-surface-2: #f8fafc !important;
					--na-border: #e2e8f0 !important; --na-text: #0f172a !important; --na-text-2: #334155 !important; --na-text-3: #64748b !important;
					color-adjust: exact !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
				}

				/* Prevent page breaks inside cards and panels */
				.na-kpi-card, .na-panel { break-inside: avoid; page-break-inside: avoid; box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
				.na-section { break-before: auto; }

				/* Hide interactive elements */
				.na-icon-btn, .na-route-btn, .na-panel-actions, .na-tabs-wrapper button,
				.na-filter-bar, #na-refresh, #na-theme-toggle, #na-export-btn { display: none !important; }

				/* Landscape A4 */
				@page { size: A4 landscape; margin: 10mm; }
			}
		`;
		document.head.appendChild(printStyle);

		// Clean up after print
		const cleanup = () => {
			document.getElementById("na-print-style")?.remove();
			window.removeEventListener("afterprint", cleanup);
		};
		window.addEventListener("afterprint", cleanup);

		// Trigger native print (same as Ctrl+P)
		setTimeout(() => window.print(), 100);
	}

	function injectStyles() {
		if ($("#na-style").length) return;
		$("head").append(`
<style id="na-style">
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

.na-page {
	--na-bg: #F8FAFC;
	--na-surface: #FFFFFF;
	--na-surface-alpha: rgba(255, 255, 255, 0.75);
	--na-surface-2: #F1F5F9;
	--na-border: #E2E8F0;
	--na-border-soft: #F1F5F9;
	--na-border-hover: #CBD5E1;
	--na-text: #0F172A;
	--na-text-2: #334155;
	--na-text-3: #64748B;
	--na-primary: #6366F1;
	--na-primary-hover: #4F46E5;
	--na-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
	--na-shadow-hover: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	
	--na-tint-blue:#EEF2FF; --na-tint-green:#ECFDF5; --na-tint-purple:#F5F3FF; --na-tint-orange:#FFF7ED;
	--na-tint-teal:#F0FDFA; --na-tint-amber:#FFFBEB; --na-tint-red:#FEF2F2; --na-tint-emerald:#ECFDF5; --na-tint-indigo:#EEF2FF;
	
	background: var(--na-bg);
	background-image: 
		radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.05) 0px, transparent 50%),
		radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.03) 0px, transparent 50%);
	background-attachment: fixed;
	font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
	color: var(--na-text);
	padding: 0 0 60px;
	-webkit-font-smoothing: antialiased;
}

.na-page[data-theme="dark"] {
	--na-bg: #0A0A0A;
	--na-surface: #121212;
	--na-surface-alpha: rgba(18, 18, 18, 0.75);
	--na-surface-2: #1A1A1A;
	--na-border: #262626;
	--na-border-soft: #1E1E1E;
	--na-border-hover: #404040;
	--na-text: #F8FAFC;
	--na-text-2: #CBD5E1;
	--na-text-3: #64748B;
	--na-primary: #818CF8;
	--na-primary-hover: #6366F1;
	--na-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
	--na-shadow-hover: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.4);

	--na-tint-blue:rgba(99,102,241,.15); --na-tint-green:rgba(16,185,129,.15); --na-tint-purple:rgba(139,92,246,.15);
	--na-tint-orange:rgba(249,115,22,.15); --na-tint-teal:rgba(20,184,166,.15); --na-tint-amber:rgba(245,158,11,.15);
	--na-tint-red:rgba(239,68,68,.15); --na-tint-emerald:rgba(5,150,105,.15); --na-tint-indigo:rgba(99,102,241,.15);
	
	background-image: 
		radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.08) 0px, transparent 50%),
		radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.05) 0px, transparent 50%);
}

.na-page * { box-sizing: border-box; transition: background-color 0.2s, border-color 0.2s; }
.na-shell { max-width: 1500px; margin: 0 auto; padding: 20px; }

/* ── Topbar (Glassmorphism) ─────────────────────────────────────────────── */
.na-topbar {
	position: sticky; top: 16px; z-index: 100;
	display:flex; align-items:center; justify-content:space-between; gap:16px;
	padding: 12px 16px; margin-bottom: 24px;
	background: var(--na-surface-alpha);
	backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
	border: 1px solid var(--na-border);
	border-radius: 16px; box-shadow: var(--na-shadow);
}
.na-brand { display:flex; align-items:center; gap:14px; }
.na-brand-dot {
	width:10px; height:10px; border-radius:50%; background:#10B981;
	box-shadow: 0 0 0 0 rgba(16,185,129,0.5);
	animation: na-pulse-green 2s infinite;
}
.na-brand-dot.is-loading { background:#F59E0B; animation: na-pulse-amber 1.5s infinite; }
.na-brand-dot.is-error   { background:#EF4444; animation: none; }
@keyframes na-pulse-green { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); } 70% { box-shadow: 0 0 0 8px rgba(16,185,129,0); } 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); } }
@keyframes na-pulse-amber { 0%,100%{opacity:1} 50%{opacity:.4} }
.na-brand-name { font-size:14.5px; font-weight:800; letter-spacing:-.02em; }
.na-brand-meta { font-size:11.5px; color: var(--na-text-3); font-weight:500; margin-top:2px; }

.na-topbar-right { display:flex; align-items:center; gap:8px; }
.na-search {
	position:relative; display:flex; align-items:center; gap:8px;
	background: var(--na-surface-2); border:1px solid transparent;
	border-radius:10px; padding: 0 12px; height:36px;
	color: var(--na-text-3); transition: all .2s;
}
.na-search:focus-within { border-color: var(--na-primary); background: var(--na-surface); box-shadow:0 0 0 3px rgba(99,102,241,.15); }
.na-search input { border:0; background:transparent; outline:0; font-size:13px; font-weight:500; color: var(--na-text); width: 240px; font-family:inherit; }

.na-icon-btn {
	width:36px; height:36px; border-radius:10px; border:1px solid var(--na-border);
	background: var(--na-surface); color: var(--na-text-2);
	display:flex; align-items:center; justify-content:center; cursor:pointer;
	font-family:inherit; transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
}
.na-icon-btn:hover { background: var(--na-surface-2); color: var(--na-text); transform: translateY(-1px); }
.na-icon-btn.na-mini { width: 28px; height: 28px; border-radius: 8px; }

/* ── Filter bar ─────────────────────────────────────────── */
.na-filter-bar {
	background: var(--na-surface);
	border-radius: 16px;
	padding: 12px 20px;
	display: flex;
	flex-direction: column;
	gap: 12px;
	box-shadow: var(--na-shadow);
	border: 1px solid var(--na-border);
}
.na-filter-group { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.na-field { position:relative; display:flex; align-items:center; }
.na-field-icon svg { position:absolute; left:12px; color: var(--na-text-3); pointer-events:none; }
.na-field-icon select { padding-left: 36px; padding-right: 32px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; background-size: 14px; }
.na-field select, .na-field input {
	border:1px solid var(--na-border); border-radius:10px; padding: 6px 12px; padding-left: 36px;
	font-size:13px; font-weight:600; color: var(--na-text); background: var(--na-surface-2);
	height:36px; min-width:150px; outline:none; font-family:inherit;
	appearance: none; -webkit-appearance: none; cursor: pointer;
}
.na-field select:focus, .na-field input:focus { border-color: var(--na-primary); box-shadow:0 0 0 3px rgba(99,102,241,.15); background: var(--na-surface); }
.na-btn-apply {
	background: var(--na-text); color: var(--na-surface); border:none; border-radius:10px;
			padding: 0 20px; height:36px; font-size:13px; font-weight:700; cursor:pointer;
	font-family:inherit; transition: transform .2s, background .2s;
}
.na-btn-apply:hover { transform: translateY(-1px); opacity: 0.9; }

.na-range-summary { margin-left:auto; font-size:12px; color: var(--na-text-3); font-weight:600; display:flex; gap:8px; align-items:center; }
.na-range-summary span { color: var(--na-text-2); background: var(--na-surface-2); padding: 4px 10px; border-radius: 6px; }

/* ── Tabs ───────────────────────────────────────────────── */
.na-tabs { display:flex; gap:6px; flex-wrap:wrap; margin-top: 12px; padding-top: 12px; border-top:1px solid var(--na-border-soft); }
.na-tab {
	display:flex; align-items:center; gap:8px; background: transparent; border:1px solid transparent;
	color: var(--na-text-2); font-size:13px; font-weight:600; font-family:inherit;
	padding: 8px 14px; border-radius:10px; cursor:pointer;
}
.na-tab svg { color: var(--na-text-3); }
.na-tab:hover { background: var(--na-surface-2); color: var(--na-text); }
.na-tab.is-active { background: var(--na-primary); color:#fff; }
.na-tab.is-active svg { color:#fff; }

/* ── Grid/Bento Layout ────────────────────────────────────── */
.na-section { margin-bottom: 40px; }
.na-bento { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; align-items: stretch; }
@media(max-width:1100px) { .na-bento-span-8, .na-bento-span-4 { grid-column: span 12; } }
@media(max-width:850px) { .na-bento-span-6 { grid-column: span 12; } }
.na-bento-span-3 { grid-column: span 3; }
.na-bento-span-4 { grid-column: span 4; }
.na-bento-span-6 { grid-column: span 6; }
.na-bento-span-8 { grid-column: span 8; }
.na-bento-span-12 { grid-column: span 12; }
.na-side-stack { display:flex; flex-direction:column; gap: 16px; height: 100%; }
.na-side-stack > * { flex: 1; min-height: 0; }

@media (max-width: 1200px) { .na-bento-span-3, .na-bento-span-4 { grid-column: span 6; } }
@media (max-width: 1024px) { .na-bento-span-3, .na-bento-span-4, .na-bento-span-6, .na-bento-span-8 { grid-column: span 12; } }
@media (max-width: 768px) { .na-tabs-wrapper { flex-direction: column; align-items: stretch !important; gap: 12px; } .na-tabs { overflow-x: auto; flex-wrap: nowrap !important; } }

/* ── Section title ──────────────────────────────────────── */
.na-section-title {
	font-size:12px; font-weight:800; color: var(--na-text-3); text-transform: uppercase;
	letter-spacing:.06em; margin: 32px 0 16px; display:flex; align-items:center; gap:12px;
}
.na-section-title em { font-style:normal; font-weight:500; text-transform:none; letter-spacing:0; font-size:12px; opacity:.7; }
.na-section-title::after { content:""; height:1px; background: var(--na-border); flex:1; }

/* ── KPI grid & Cards ────────────────────────────────── */
.na-kpi-grid {
	display:grid;
	grid-template-columns:repeat(6, minmax(170px, 1fr));
	gap:14px;
	margin:0 0 24px;
	align-items:stretch;
	overflow-x:auto;
	overflow-y:visible;
	padding-bottom:4px;
	scrollbar-width:thin;
}
.na-kpi-card {
	position:relative;
	min-width:0;
	min-height:166px;
	padding:16px 16px 12px;
	background:var(--na-surface);
	border:1px solid var(--na-border);
	border-radius:16px;
	display:flex;
	flex-direction:column;
	gap:10px;
	overflow:visible;
	box-shadow:0 8px 24px rgba(15,23,42,.06);
	transition:border-color .16s ease, box-shadow .16s ease;
	cursor:pointer;
}
.na-kpi-card:hover { box-shadow:0 8px 24px rgba(15,23,42,.06); border-color:var(--na-border); transform:none !important; z-index:auto; }
.na-kpi-card > * { position:relative; z-index:1; }
.na-kpi-topline { display:flex; align-items:center; gap:10px; min-width:0; }
.na-kpi-icon-wrap {
	width:32px; height:32px; flex:0 0 32px;
	border-radius:10px;
	display:flex; align-items:center; justify-content:center;
	background:var(--kpi-bg, var(--na-tint-indigo));
	color:var(--kpi-fg, #6366F1);
}
.na-kpi-icon-wrap svg { width:15px; height:15px; stroke-width:2.4; }
.na-kpi-title-wrap { min-width:0; flex:1; }
.na-kpi-label {
	display:block;
	font-size:12px;
	font-weight:750;
	line-height:1.25;
	color:var(--na-text-2);
	letter-spacing:-.01em;
	white-space:normal;
	overflow:visible;
	text-overflow:clip;
}
.na-kpi-info { flex:0 0 auto; color:var(--na-text-3); opacity:.8; display:inline-flex; }
.na-kpi-info svg { width:14px; height:14px; }
.na-kpi-main { display:flex; flex-direction:column; align-items:flex-start; justify-content:flex-start; gap:7px; min-width:0; }
.na-kpi-value {
	min-width:0;
	font-size:clamp(18px, 1.25vw, 23px);
	font-weight:850;
	letter-spacing:-.04em;
	color:var(--na-text);
	font-variant-numeric:tabular-nums;
	line-height:1.05;
	white-space:normal;
	overflow:visible;
	text-overflow:clip;
	overflow-wrap:anywhere;
	word-break:normal;
}
.na-kpi-delta {
	flex:0 0 auto;
	font-size:11px;
	font-weight:800;
	padding:3px 7px;
	border-radius:999px;
	white-space:nowrap;
	line-height:1;
}
.na-kpi-delta.is-up   { color:#059669; background:rgba(16,185,129,.12); }
.na-kpi-delta.is-down { color:#DC2626; background:rgba(239,68,68,.12); }
.na-kpi-delta.is-flat { color:var(--na-text-3); background:var(--na-surface-2); }
.na-kpi-parts { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:-2px; }
.na-kpi-parts button {
	pointer-events:auto;
	border:1px solid var(--na-border-soft);
	background:var(--na-surface-2);
	border-radius:10px;
	padding:7px 8px;
	display:flex;
	align-items:center;
	justify-content:space-between;
	gap:6px;
	font-family:inherit;
	cursor:pointer;
}
.na-kpi-parts span { color:var(--na-text-3); font-size:10px; font-weight:800; letter-spacing:.05em; text-transform:uppercase; }
.na-kpi-parts strong { color:var(--na-text); font-size:15px; line-height:1; font-variant-numeric:tabular-nums; }
.na-spark { width:100%; height:30px; margin-top:auto; pointer-events:none; }
.na-spark svg { width:100%; height:30px; display:block; }
.na-kpi-skeleton { background:var(--na-surface); border:1px solid var(--na-border); border-radius:16px; padding:20px; min-height:166px; }
.na-insight-chip {
	flex:0 0 auto;
	white-space:nowrap;
	background:var(--na-surface);
	border:1px solid var(--na-border);
	border-radius:999px;
	padding:4px 10px;
	font-size:11px;
	font-weight:650;
	color:var(--na-text-2);
	box-shadow:var(--na-shadow);
}


/* ── Panels ─────────────────────────────────────────────── */
.na-panel {
	background: var(--na-surface); border:1px solid var(--na-border); border-radius:16px;
	box-shadow: var(--na-shadow); overflow:hidden; display:flex; flex-direction:column; height: 100%;
}
.na-panel:hover { border-color: var(--na-border-hover); }
.na-panel-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding: 16px 20px; border-bottom:1px solid var(--na-border-soft); }
.na-panel-head h3 { font-size:14px; font-weight:800; color: var(--na-text); margin:0; letter-spacing:-.01em; }
.na-subtitle { display:block; font-size:11.5px; color: var(--na-text-3); font-weight:500; margin-top:4px; }
.na-panel-body { padding: 16px 20px; flex:1; }
.na-panel-actions { display:flex; align-items:center; gap:6px; }
.na-chart-wrap { flex: 1 1 auto; min-height: 120px; display: flex; flex-direction: column; justify-content: center; position: relative; padding: 12px 16px 16px; }
.na-empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 16px; font-size: 13px; color: var(--na-text-3); text-align: center; flex: 1 1 auto; height: 100%; border-radius: 8px; background: var(--na-surface-2); border: 1px dashed var(--na-border); margin: 16px; font-weight: 500; }

/* ── Dropdown Menu ────────────────────────────────────────── */
.na-dropdown { position: relative; display: inline-block; }
.na-dropdown-menu { display: none; position: absolute; right: 0; top: 100%; margin-top: 8px; background: var(--na-surface); border: 1px solid var(--na-border); border-radius: 8px; box-shadow: var(--na-shadow); padding: 6px; z-index: 100; min-width: 150px; }
.na-dropdown:hover .na-dropdown-menu, .na-dropdown-btn:focus + .na-dropdown-menu { display: block; }
.na-dropdown-menu button { display: block; width: 100%; text-align: left; padding: 8px 12px; background: transparent; border: none; font-size: 13px; font-weight: 500; color: var(--na-text); border-radius: 6px; cursor: pointer; transition: background 0.2s; }
.na-dropdown-menu button:hover { background: var(--na-surface-2); color: var(--na-text); }

/* ── List Panels ────────────────────────────────────────── */
.na-list-panel .na-panel-body { padding: 0; height: 320px; overflow-y: auto; display: flex; flex-direction: column; }
.na-list-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid var(--na-border-soft); cursor: pointer; transition: background 0.2s; min-height: 52px; }
.na-list-row:hover { background: var(--na-surface-2); }
.na-list-row:last-child { border-bottom: none; }
.na-view-all { display: block; width: 100%; text-align: center; padding: 12px; font-size: 12px; font-weight: 600; color: var(--na-primary); background: var(--na-surface); position: sticky; bottom: 0; border-top: 1px solid var(--na-border-soft); cursor: pointer; transition: background 0.2s; border-radius: 0 0 16px 16px; margin-top: auto; }
.na-view-all:hover { background: var(--na-surface-2); }

.na-route-btn {
	background: var(--na-surface-2); border:1px solid transparent; border-radius:8px;
	padding: 6px 12px; font-size:12px; font-weight:700; color: var(--na-text-2);
	cursor:pointer; font-family:inherit; transition: all .2s;
}
.na-route-btn:hover { background: var(--na-border); color: var(--na-text); transform: translateY(-1px); }

/* ── Horizontal bars ────────────────────────────────────── */
.na-hbar-list { padding: 4px 0; display:flex; flex-direction:column; gap:6px;}
.na-hbar-row { display:flex; align-items:center; position: relative; }
.na-hbar-track { flex:1; height:32px; background: var(--na-surface-2); border-radius:6px; position: relative; overflow: hidden; }
.na-hbar-fill { position: absolute; left: 0; top: 0; height:100%; border-radius:6px; transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
.na-hbar-content { position: absolute; left: 0; top: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; pointer-events: none; }
.na-hbar-label { font-size:13px; font-weight:600; color: var(--na-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display: flex; align-items: center; gap: 8px; }
.na-hbar-rank { font-size:11px; font-weight:800; color: var(--na-text-3); width: 16px; display: inline-block; }
.na-hbar-value { font-size:13px; font-weight:700; color: var(--na-text-2); }

/* ── Tooltip ─────────────────────────────────────── */
.na-body-tooltip {
	position: fixed; z-index: 999999; background: var(--na-surface); color: var(--na-text);
	text-align: center; border-radius: 6px; padding: 6px 10px; font-size: 11px; font-weight: 600;
	border: 1px solid var(--na-border-soft); box-shadow: 0 4px 12px rgba(0,0,0,0.15);
	pointer-events: none; white-space: normal; line-height: 1.4; max-width: 220px;
	opacity: 0; transform: translateY(4px); transition: opacity 0.2s, transform 0.2s;
}
.na-body-tooltip.is-visible { opacity: 1; transform: translateY(0); }

.na-skeleton { animation: naPulse 1.5s infinite; background: var(--na-border-soft); border-radius: 4px; }
.na-table { width:100%; border-collapse: collapse; font-size:13px; }
.na-table th {
	text-align:left; padding: 12px 16px; font-size:11px; font-weight:800;
	color: var(--na-text-3); background: var(--na-surface-2); text-transform: uppercase;
	letter-spacing:.05em; border-bottom:1px solid var(--na-border); white-space:nowrap;
}
.na-table td { padding: 12px 16px; border-bottom:1px solid var(--na-border-soft); color: var(--na-text-2); font-weight:500; }
.na-table tr:hover td { background: var(--na-surface-2); }
.na-td-bold { font-weight:700; color: var(--na-text); }

.na-pill-danger, .na-pill-warn, .na-pill-info { display:inline-block; padding: 4px 10px; border-radius:8px; font-size:11.5px; font-weight:800; }
.na-pill-danger { background: var(--na-tint-red);   color:#EF4444; }
.na-pill-warn   { background: var(--na-tint-amber); color:#F59E0B; }
.na-pill-info   { background: var(--na-tint-blue);  color:#6366F1; }

.na-btn-sm { background: var(--na-surface-2); border:1px solid var(--na-border); border-radius:8px; padding: 4px 12px; font-size:12px; font-weight:700; color: var(--na-text); cursor:pointer; }
.na-btn-sm:hover { background: var(--na-text); color: var(--na-surface); }

/* ── Activity feed ─────────────────────────────────────── */
.na-activity { display:flex; flex-direction:column; gap:6px; }
.na-activity-row { display:flex; align-items:center; gap:12px; padding: 12px; border-radius:12px; cursor:pointer; border: 1px solid transparent; }
.na-activity-row:hover { background: var(--na-surface-2); border-color: var(--na-border-soft); transform: translateX(2px); }
.na-activity-icon { width:32px; height:32px; border-radius:8px; background:var(--na-surface-2); display:flex; align-items:center; justify-content:center; color:var(--na-text-2); }
.na-activity-main { flex:1; min-width:0; }
.na-activity-title { font-size:13px; font-weight:700; color: var(--na-text); }
.na-activity-meta { font-size:11.5px; color: var(--na-text-3); font-weight:500; margin-top:2px; }
.na-activity-amount { font-size:14px; font-weight:800; color: var(--na-text); }

/* ── Order summary ─────────────────────────────────────── */
.na-summary-grid { display:grid; grid-template-columns: 1fr; gap:12px; }
.na-summary-item { display:flex; align-items:center; gap:16px; padding: 16px; background: var(--na-surface-2); border-radius:12px; border:1px solid var(--na-border-soft); }
.na-summary-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; }
.na-summary-val { font-size:26px; font-weight:900; color: var(--na-text); letter-spacing:-.03em; line-height:1; }
.na-summary-label { font-size:12px; color: var(--na-text-3); font-weight:600; margin-top:4px; }
.na-summary-stack { width:100%; display:flex; flex-direction:column; gap:8px; margin-top: 6px;}
.na-summary-bar { width:100%; height:8px; background: var(--na-border); border-radius:999px; overflow:hidden; }
.na-summary-bar-fill { height:100%; border-radius:999px; transition: width 1s cubic-bezier(0.16, 1, 0.3, 1); }
/* ── CSS Animations & Styles ─────────────────────────────── */
@keyframes na-spin { 100% { transform:rotate(360deg); } }

.na-export-option input { display:none; }
.na-export-option .na-export-box { flex:1; padding:12px; border:2px solid var(--na-border); border-radius:12px; cursor:pointer; display:flex; gap:12px; align-items:center; background:var(--na-surface-2); transition:all 0.2s; }
.na-export-option input:checked + .na-export-box { border-color:var(--na-primary); background:rgba(99,102,241,0.05); }
.na-export-option .na-export-box svg { color:var(--na-text-2); }
.na-export-option input:checked + .na-export-box svg { color:var(--na-primary); }

.na-modal { position:fixed; top:0; left:0; width:100vw; height:100vh; display:flex; align-items:center; justify-content:center; z-index:9999; }
.na-modal-bg { position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); }
.na-summary-legend { width:100%; display:flex; gap:16px; font-size:12px; font-weight:700; color: var(--na-text-2); }
.na-summary-legend i { display:inline-block; width:10px; height:10px; border-radius:50%; margin-right:6px; }

/* ── Empty / loading ───────────────────────────────────── */
.na-empty { min-height: 200px; display:flex; flex-direction:column; align-items:center; justify-content:center; color: var(--na-text-3); gap:12px; border:1px dashed var(--na-border); border-radius:12px; background: var(--na-surface-2); }
.na-empty p { font-size:13px; font-weight:600; margin:0; }
.na-loading-text { display:flex; align-items:center; justify-content:center; min-height:200px; color: var(--na-text-3); font-size:13px; font-weight:600; animation: na-pulse-amber 2s infinite; }
.na-shimmer { background: linear-gradient(110deg, var(--na-surface-2) 25%, var(--na-border-soft) 50%, var(--na-surface-2) 75%); background-size: 200% 100%; animation: na-shimmer 1.5s ease-in-out infinite; border-radius:12px; }
@keyframes na-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* ── Modal ─────────────────────────────────────────────── */
.na-modal { position: fixed; inset:0; z-index: 9999; }
.na-modal-bg { position:absolute; inset:0; background: rgba(15,23,42,.6); backdrop-filter: blur(4px); }
.na-modal-card {
	position:absolute; left:50%; top:50%; transform: translate(-50%,-50%);
	width: min(1100px, 92vw); max-height: 88vh; overflow:auto;
	background: var(--na-surface); border:1px solid var(--na-border); border-radius:20px;
	box-shadow: var(--na-shadow-hover);
}
.na-modal-head { display:flex; justify-content:space-between; align-items:center; padding: 18px 24px; border-bottom:1px solid var(--na-border-soft); }
.na-modal-head h3 { margin:0; font-size:16px; font-weight:800; color: var(--na-text); }
.na-modal-body { padding: 20px; }

/* ── Footer ────────────────────────────────────────────── */
.na-footer { margin-top: 32px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color: var(--na-text-3); font-weight:600; padding: 0 8px; }
.na-kbd kbd { background: var(--na-surface-2); border:1px solid var(--na-border); border-radius:6px; padding: 2px 6px; font-size:11px; font-weight:800; }

.na-avatar {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	object-fit: cover;
	flex-shrink: 0;
}
.na-avatar-fallback {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 10px;
	font-weight: 700;
	flex-shrink: 0;
}
</style>`);
	}
};