frappe.pages['procure_admin'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Procurement Admin',
		single_column: true
	});

	$(wrapper).find('.layout-main-section').html(`
		<div class="qf-admin">
			<style>
				.qf-admin {
					--qf-ink: #1c2b3a;
					--qf-muted: #64748b;
					--qf-bg: #f5f6f8;
					--qf-surface: #ffffff;
					--qf-border: #dde1e7;
					--qf-accent: #d97706;
					--qf-accent-dark: #b45309;
					--qf-open: #0f766e;
					--qf-open-bg: #ecfdf5;
					--qf-closed: #6b7280;
					--qf-closed-bg: #f1f5f9;
					--qf-awarded: #1d4ed8;
					--qf-awarded-bg: #eff6ff;
					font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
					color: var(--qf-ink);
					background: var(--qf-bg);
					padding: 24px;
					border-radius: 12px;
				}
				.qf-admin h1 { font-size: 24px; font-weight: 700; margin: 0 0 2px 0; letter-spacing: -0.02em; }
				.qf-admin h2 { font-size: 17px; font-weight: 700; margin: 0 0 14px 0; }
				.qf-admin h3 { font-size: 14px; font-weight: 700; margin: 18px 0 10px 0; color: var(--qf-muted); text-transform: uppercase; letter-spacing: 0.04em; }
				.qf-eyebrow { font-size: 13px; color: var(--qf-muted); font-weight: 600; }
				.qf-header {
					display: flex; align-items: center; justify-content: space-between;
					background: var(--qf-surface); border: 1px solid var(--qf-border);
					border-radius: 10px; padding: 18px 22px; margin-bottom: 20px;
				}
				.qf-user-pill {
					font-size: 13px; background: var(--qf-bg); border: 1px solid var(--qf-border);
					padding: 6px 12px; border-radius: 999px; color: var(--qf-ink);
				}
				.qf-card {
					background: var(--qf-surface); border: 1px solid var(--qf-border);
					border-radius: 10px; padding: 22px; margin-bottom: 20px;
					box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
				}
				.qf-btn {
					font-size: 13px; font-weight: 600; padding: 9px 16px; border-radius: 7px;
					border: 1px solid var(--qf-border); background: var(--qf-surface); color: var(--qf-ink);
					cursor: pointer; transition: all 0.12s ease;
				}
				.qf-btn:hover { border-color: #c7ccd4; background: #fafbfc; }
				.qf-btn-primary { background: var(--qf-accent); border-color: var(--qf-accent); color: #fff; }
				.qf-btn-primary:hover { background: var(--qf-accent-dark); border-color: var(--qf-accent-dark); }
				.qf-btn-danger { color: #b42318; }
				.qf-btn-danger:hover { border-color: #fda29b; background: #fef3f2; }
				.qf-btn-row { display: flex; gap: 10px; flex-wrap: wrap; }
				.qf-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--qf-ink); }
				.qf-field { margin-bottom: 16px; }
				.qf-input, .qf-textarea {
					width: 100%; box-sizing: border-box; font-size: 14px; padding: 9px 11px;
					border: 1px solid var(--qf-border); border-radius: 7px; background: #fff; color: var(--qf-ink);
					font-family: inherit;
				}
				.qf-input:focus, .qf-textarea:focus { outline: 2px solid var(--qf-accent); outline-offset: 1px; border-color: var(--qf-accent); }
				.qf-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
				.qf-table th {
					text-align: left; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.04em;
					color: var(--qf-muted); font-weight: 700; padding: 8px 10px; border-bottom: 2px solid var(--qf-border);
				}
				.qf-table td { padding: 9px 10px; border-bottom: 1px solid var(--qf-border); vertical-align: middle; }
				.qf-table input.item_name, .qf-table input.qty, .qf-table input.description {
					width: 100%; box-sizing: border-box; font-size: 13.5px; padding: 7px 9px;
					border: 1px solid var(--qf-border); border-radius: 6px; font-family: inherit;
				}
				.qf-divider { border: none; border-top: 1px solid var(--qf-border); margin: 20px 0; }
				.qf-rfq-card {
					background: var(--qf-surface); border: 1px solid var(--qf-border); border-left: 4px solid var(--qf-accent);
					border-radius: 10px; padding: 20px 22px; margin-bottom: 18px;
				}
				.qf-rfq-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
				.qf-pill {
					display: inline-block; font-size: 11.5px; font-weight: 700; text-transform: uppercase;
					letter-spacing: 0.03em; padding: 4px 10px; border-radius: 999px;
				}
				.qf-pill-open { background: var(--qf-open-bg); color: var(--qf-open); }
				.qf-pill-closed { background: var(--qf-closed-bg); color: var(--qf-closed); }
				.qf-pill-awarded { background: var(--qf-awarded-bg); color: var(--qf-awarded); }
				.qf-meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px 24px; margin: 14px 0; }
				.qf-meta-label { font-size: 11.5px; color: var(--qf-muted); text-transform: uppercase; letter-spacing: 0.03em; font-weight: 700; margin-bottom: 2px; }
				.qf-meta-value { font-size: 14px; }
				.qf-summary { font-size: 14px; color: #334155; line-height: 1.5; margin: 4px 0 6px 0; }
				.qf-empty { text-align: center; color: var(--qf-muted); padding: 28px; border: 1px dashed var(--qf-border); border-radius: 10px; font-size: 14px; }
				.qf-award-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 4px 0; }
				.qf-award-box .qf-table td { border-bottom: 1px solid #fde68a; }
			</style>

			<div class="qf-header">
				<div>
					<h1>QuoteForge</h1>
					<span class="qf-eyebrow">Procurement Admin Dashboard</span>
				</div>
				<div class="qf-user-pill">Logged in as <strong>${frappe.session.user}</strong></div>
			</div>

			<div class="qf-card">
				<h2>Reports</h2>
				<div class="qf-btn-row">
					<button class="qf-btn" id="rfqStatusReport">RFQ Status Report</button>
					<button class="qf-btn" id="rfqBidSummaryReport">RFQ Bid Summary Report</button>
					<button class="qf-btn" id="supplierBidReport">Supplier Bid Report</button>
				</div>
			</div>

			<div class="qf-card">
				<h2>Create New RFQ</h2>
				<form id="createRFQForm">
					<div class="qf-field">
						<label class="qf-label">RFQ Title *</label>
						<input type="text" id="rfq_title" class="qf-input" required>
					</div>
					<div class="qf-field">
						<label class="qf-label">Summary *</label>
						<textarea id="rfq_summary" class="qf-textarea" rows="3" required></textarea>
					</div>
					<div class="qf-field">
						<label class="qf-label">Closing Date *</label>
						<input type="datetime-local" id="closing_date" class="qf-input" required>
					</div>

					<h3>Items Needed</h3>
					<table class="qf-table">
						<thead>
							<tr>
								<th>Item Name</th>
								<th>Quantity</th>
								<th>Description</th>
								<th></th>
							</tr>
						</thead>
						<tbody id="itemsBody">
							<tr>
								<td><input type="text" class="item_name" required></td>
								<td><input type="number" class="qty" required></td>
								<td><input type="text" class="description"></td>
								<td><button type="button" class="qf-btn qf-btn-danger remove-item">Remove</button></td>
							</tr>
						</tbody>
					</table>
					<br>
					<div class="qf-btn-row">
						<button type="button" class="qf-btn" id="addItem">+ Add Item</button>
					</div>
					<br>
					<button type="submit" class="qf-btn qf-btn-primary">Create RFQ</button>
				</form>
			</div>

			<div class="qf-card">
				<h2>Existing RFQs</h2>
				<div id="rfqList">
					<p class="qf-eyebrow">Loading RFQs...</p>
				</div>
			</div>
		</div>
	`);

	load_rfqs(wrapper);
	setup_rfq_form(wrapper);
};

function setup_rfq_form(wrapper) {
	$(wrapper).find("#addItem").on("click", function() {
		var row = `
			<tr>
				<td><input type="text" class="item_name" required></td>
				<td><input type="number" class="qty" required></td>
				<td><input type="text" class="description"></td>
				<td><button type="button" class="qf-btn qf-btn-danger remove-item">Remove</button></td>
			</tr>
		`;

		$(wrapper).find("#itemsBody").append(row);
	});

	$(wrapper).on("click", ".remove-item", function() {
		var rows = $(wrapper).find("#itemsBody tr");

		if (rows.length > 1) {
			$(this).closest("tr").remove();
		} else {
			frappe.msgprint("At least one item is required.");
		}
	});

	$(wrapper).find("#createRFQForm").on("submit", function(e) {
		e.preventDefault();

		var items = [];

		$(wrapper).find("#itemsBody tr").each(function() {
			items.push({
				item_name: $(this).find(".item_name").val(),
				qty: $(this).find(".qty").val(),
				description: $(this).find(".description").val()
			});
		});

		frappe.call({
			method: "quoteforge.api.create_new_rfq",
			args: {
				title: $(wrapper).find("#rfq_title").val(),
				summary: $(wrapper).find("#rfq_summary").val(),
				closing_date: $(wrapper).find("#closing_date").val(),
				items: JSON.stringify(items)
			},
			callback: function(r) {
				if (!r.exc) {
					frappe.msgprint("RFQ created successfully!");
					location.reload();
				}
			}
		});
	});
}

function setup_report_buttons(wrapper) {

	$(wrapper).find("#rfqStatusReport").on("click", function() {

		frappe.set_route("query-report", "RFQ Status Report");

	});

	$(wrapper).find("#rfqBidSummaryReport").on("click", function() {

		frappe.set_route("query-report", "RFQ Bid Summary Report");

	});

	$(wrapper).find("#supplierBidReport").on("click", function() {

		frappe.set_route("query-report", "Supplier Bid Report");

	});

}

function load_rfqs(wrapper) {
	frappe.call({
		method: "quoteforge.api.get_procurement_data",
		callback: function(r) {
			if (r.exc) {
				$(wrapper).find("#rfqList").html(
					"<div class=\"qf-empty\">Error loading RFQs. Check the browser console.</div>"
				);
				return;
			}

			var rfqs = r.message.rfqs;
			var rfqList = $(wrapper).find("#rfqList");

			if (!rfqs || rfqs.length === 0) {
				rfqList.html("<div class=\"qf-empty\">No RFQs have been created yet.</div>");
				return;
			}

			var html = "";

			rfqs.forEach(function(rfq) {
				var statusClass = rfq.status === "Open" ? "qf-pill-open" : "qf-pill-closed";

				html += `
					<div class="qf-rfq-card">
						<div class="qf-rfq-head">
							<h2>${rfq.title || rfq.name}</h2>
							<span class="qf-pill ${statusClass}">${rfq.status}</span>
						</div>
						<div class="qf-meta-grid">
							<div>
								<div class="qf-meta-label">RFQ ID</div>
								<div class="qf-meta-value">${rfq.name}</div>
							</div>
							<div>
								<div class="qf-meta-label">Closing Date</div>
								<div class="qf-meta-value">${rfq.closing__datetime || "N/A"}</div>
							</div>
						</div>
						<div class="qf-meta-label">Summary</div>
						<p class="qf-summary">${rfq.summary || "No summary provided."}</p>
						<h3>Requested Items</h3>
				`;

				if (rfq.rfq_items && rfq.rfq_items.length > 0) {
					html += `
						<table class="qf-table">
							<thead>
								<tr>
									<th>Item Name</th>
									<th>Quantity</th>
									<th>Description</th>
								</tr>
							</thead>
							<tbody>
					`;

					rfq.rfq_items.forEach(function(item) {
						html += `
							<tr>
								<td>${item.item_name}</td>
								<td>${item.qty}</td>
								<td>${item.description || "-"}</td>
							</tr>
						`;
					});

					html += `
							</tbody>
						</table>
					`;
				} else {
					html += "<div class=\"qf-empty\">No items have been added to this RFQ.</div>";
				}

				if (rfq.status === "Open") {
					html += `
						<br>
						<button class="qf-btn qf-btn-danger close-rfq" data-rfq="${rfq.name}">
							Close RFQ
						</button>
					`;
				} else {
					html += "<p class=\"qf-eyebrow\">This RFQ is closed.</p>";
				}

				html += "<h3>Submitted Supplier Bids</h3>";

				if (rfq.bids && rfq.bids.length > 0) {
					html += `
						<table class="qf-table">
							<thead>
								<tr>
									<th>Supplier Name</th>
									<th>Email</th>
									<th>Quoted Price</th>
									<th>Delivery Days</th>
									<th>Remarks</th>
								</tr>
							</thead>
							<tbody>
					`;

					rfq.bids.forEach(function(bid) {
						html += `
							<tr>
								<td>${bid.supplier_name}</td>
								<td>${bid.contact_email}</td>
								<td>${bid.total_quoted_price}</td>
								<td>${bid.delivery_days}</td>
								<td>${bid.remarks || "-"}</td>
							</tr>
						`;
					});

					html += `
							</tbody>
						</table>
					`;
				} else {
					html += "<div class=\"qf-empty\">No supplier bids have been submitted.</div>";
				}

				html += `
					<h3>Award Details</h3>
					<div class="qf-award-box">
						<table class="qf-table">
							<tr>
								<td><strong>Final Status</strong></td>
								<td>${rfq.final_status || "Pending"}</td>
							</tr>
							<tr>
								<td><strong>Awarded Supplier</strong></td>
								<td>${rfq.awarded_supplier || "-"}</td>
							</tr>
							<tr>
								<td><strong>Awarded Value</strong></td>
								<td>${rfq.awarded_value || "-"}</td>
							</tr>
							<tr>
								<td><strong>Award Date</strong></td>
								<td>${rfq.award_date || "-"}</td>
							</tr>
						</table>
					</div>
				</div>
				`;

			});

			rfqList.html(html);

			$(wrapper).find(".close-rfq").on("click", function() {
				close_rfq($(this).data("rfq"));
			});
		}
	});
}

function close_rfq(rfqName) {
	if (!confirm("Are you sure you want to close this RFQ?")) {
		return;
	}

	frappe.call({
		method: "quoteforge.api.close_rfq",
		args: {
			rfq: rfqName
		},
		callback: function(r) {
			if (!r.exc) {
				frappe.msgprint("RFQ closed successfully!");
				location.reload();
			}
		}
	});
}