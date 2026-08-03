frappe.pages['buyer_portal'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Buyer Evaluation Portal',
		single_column: true
	});

	$(wrapper).find('.layout-main-section').html(`
		<div class="qf-buyer">
			<style>
				.qf-buyer {
					--qf-ink: #222;
					--qf-muted: #666;
					--qf-bg: #ffffff;
					--qf-surface: #ffffff;
					--qf-border: #ccc;
					--qf-accent: #b45309;
					--qf-open: #2f7a4f;
					--qf-closed: #666;
					--qf-awarded: #1d4ed8;
					font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
					color: var(--qf-ink);
					background: var(--qf-bg);
					padding: 16px;
				}
				.qf-buyer h1 { font-size: 20px; font-weight: 700; margin: 0; }
				.qf-buyer h2 { font-size: 16px; font-weight: 700; margin: 0 0 6px 0; }
				.qf-buyer h3 { font-size: 13px; font-weight: 700; margin: 12px 0 8px 0; color: var(--qf-muted); }
				.qf-eyebrow { font-size: 13px; color: var(--qf-muted); }
				.qf-header {
					display: flex; align-items: center; justify-content: space-between;
					border-bottom: 1px solid var(--qf-border); padding: 0 0 12px 0; margin-bottom: 8px;
				}
				.qf-user-pill { font-size: 13px; color: var(--qf-muted); }
				.qf-intro { font-size: 14px; margin: 10px 0 16px 0; }
				.qf-btn {
					font-size: 13px; padding: 6px 12px; border: 1px solid var(--qf-border);
					background: #fff; color: var(--qf-ink); cursor: pointer;
				}
				.qf-btn:hover { background: #f5f5f5; }
				.qf-btn-primary { background: var(--qf-accent); border-color: var(--qf-accent); color: #fff; }
				.qf-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
				.qf-table th {
					text-align: left; font-size: 12px; color: var(--qf-muted); font-weight: 700;
					padding: 6px 8px; border-bottom: 1px solid var(--qf-border);
				}
				.qf-table td { padding: 7px 8px; border-bottom: 1px solid var(--qf-border); }
				.qf-rfq-card { border: 1px solid var(--qf-border); padding: 16px; margin-bottom: 14px; }
				.qf-rfq-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
				.qf-pill { font-size: 12px; font-weight: 700; }
				.qf-pill-open { color: var(--qf-open); }
				.qf-pill-closed { color: var(--qf-closed); }
				.qf-pill-awarded { color: var(--qf-awarded); }
				.qf-meta-grid { display: flex; gap: 24px; margin: 10px 0; flex-wrap: wrap; }
				.qf-meta-label { font-size: 12px; color: var(--qf-muted); font-weight: 700; }
				.qf-meta-value { font-size: 14px; }
				.qf-summary { font-size: 14px; margin: 4px 0 6px 0; }
				.qf-empty { text-align: center; color: var(--qf-muted); padding: 20px; border: 1px dashed var(--qf-border); font-size: 14px; }
				.qf-sealed-box { border: 1px dashed var(--qf-border); padding: 12px 14px; }
				.qf-award-box { border: 1px solid var(--qf-border); padding: 4px 0; margin-top: 8px; }
			</style>

			<div class="qf-header">
				<div>
					<h1>QuoteForge</h1>
					<span class="qf-eyebrow">Buyer Evaluation Portal</span>
				</div>
				<div class="qf-user-pill">Logged in as <strong>${frappe.session.user}</strong></div>
			</div>

			<p class="qf-intro">Review supplier quotations and evaluate bids submitted for your procurement requests.</p>

			<div id="rfqList">
				<p class="qf-eyebrow">Loading RFQs...</p>
			</div>
		</div>
	`);

	load_buyer_rfqs(wrapper);
};

function load_buyer_rfqs(wrapper) {
	frappe.call({
		method: "quoteforge.api.get_buyer_evaluation_data",
		callback: function(r) {
			if (r.exc) {
				$(wrapper).find("#rfqList").html(`
					<div class="qf-empty">Unable to load RFQ evaluation data.</div>
				`);
				return;
			}

			var rfqs = r.message.rfqs;
			var rfqList = $(wrapper).find("#rfqList");

			if (!rfqs || rfqs.length === 0) {
				rfqList.html(`
					<div class="qf-empty">
						<h3 style="margin-top:0;">No RFQs Available</h3>
						<p style="margin:0;">There are currently no RFQs available for evaluation.</p>
					</div>
				`);
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
								<div class="qf-meta-value">${rfq.closing__datetime || "Not specified"}</div>
							</div>
						</div>
						<div class="qf-meta-label">RFQ Type</div>
						<p class="qf-summary">${rfq.rfq_type}</p>
						<div class="qf-meta-label">Summary</div>
						<p class="qf-summary">${rfq.summary || "No summary provided."}</p>
				`;

				

				if (rfq.rfq_type === "Product") {

					html += "<h3>Requested Items</h3>";

					if (rfq.rfq_items && rfq.rfq_items.length) {
						html += `
							<table class="qf-table">
								<thead>
									<tr><th>Item</th><th>Qty</th><th>Description</th></tr>
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
						html += `</tbody></table>`;
					} else {
						html += `<div class="qf-empty">No product items.</div>`;
					}

				} else {

					html += "<h3>Services Required</h3>";

					if (rfq.service_items && rfq.service_items.length) {
						html += `
							<table class="qf-table">
								<thead>
									<tr><th>Service</th><th>Description</th></tr>
								</thead>
								<tbody>
						`;
						rfq.service_items.forEach(function(service) {
							html += `
								<tr>
									<td>${service.service_name}</td>
									<td>${service.description || "-"}</td>
								</tr>
							`;
						});
						html += `</tbody></table>`;
					} else {
						html += `<div class="qf-empty">No services added.</div>`;
					}
				}

			
				if (rfq.status === "Open") {
					html += `
						<div class="qf-sealed-box">
							<h3 style="margin-top:0;">Sealed Bidding</h3>
							<p style="margin:0 0 6px 0;">Supplier bids are currently sealed.</p>
							<p style="margin:0;">Bid pricing and supplier details will become available after this RFQ is closed.</p>
						</div>
					`;
				} else {
					html += `<h3>Submitted Bids</h3>`;

					if (!rfq.bids || rfq.bids.length === 0) {
						html += `
							<div class="qf-empty">No bids have been received for this RFQ.</div>
						`;
					} else {
						html += `
							<table class="qf-table">
								<thead>
									<tr>
										<th>Supplier Name</th>
										<th>Contact Email</th>
										<th>Quoted Price</th>
										<th>Delivery Days</th>
										<th>Remarks</th>
										<th></th>
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
									<td>
										${
											rfq.final_status === "Awarded"
												? "<span class=\"qf-pill qf-pill-awarded\">Award Completed</span>"
												: `
													<button
														class="qf-btn qf-btn-primary award-supplier"
														data-rfq="${rfq.name}"
														data-bid="${bid.name}">
														Select Award
													</button>
												`
										}
									</td>
								</tr>
							`;
						});

						html += `
								</tbody>
							</table>
						`;
					}
				}

				if (rfq.final_status === "Awarded") {
					html += `
						<div class="qf-award-box">
							<table class="qf-table">
								<tr>
									<td><strong>Award Status</strong></td>
									<td>Awarded</td>
								</tr>
								<tr>
									<td><strong>Awarded Supplier</strong></td>
									<td>${rfq.awarded_supplier || "-"}</td>
								</tr>
								<tr>
									<td><strong>Awarded Value</strong></td>
									<td>${rfq.awarded_value || "-"}</td>
								</tr>
							</table>
						</div>
					`;
				}

				html += `</div>`;
			});

			rfqList.html(html);

			$(wrapper).find(".award-supplier").on("click", function() {
				var rfq = $(this).data("rfq");
				var bid = $(this).data("bid");

				award_supplier(rfq, bid);
			});
		}
	});
}

function award_supplier(rfq, supplier_bid) {
	if (!confirm("Are you sure you want to award this supplier?")) {
		return;
	}

	frappe.call({
		method: "quoteforge.api.award_supplier",
		args: {
			rfq: rfq,
			supplier_bid: supplier_bid
		},
		callback: function(r) {
			if (!r.exc) {
				alert("Supplier awarded successfully!");
				location.reload();
			}
		}
	});
}