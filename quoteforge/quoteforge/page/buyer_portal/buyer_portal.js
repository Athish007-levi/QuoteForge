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
				.qf-buyer h1 { font-size: 24px; font-weight: 700; margin: 0 0 2px 0; letter-spacing: -0.02em; }
				.qf-buyer h2 { font-size: 17px; font-weight: 700; margin: 0 0 8px 0; }
				.qf-buyer h3 { font-size: 14px; font-weight: 700; margin: 16px 0 10px 0; color: var(--qf-muted); text-transform: uppercase; letter-spacing: 0.04em; }
				.qf-eyebrow { font-size: 13px; color: var(--qf-muted); font-weight: 600; }
				.qf-header {
					display: flex; align-items: center; justify-content: space-between;
					background: var(--qf-surface); border: 1px solid var(--qf-border);
					border-radius: 10px; padding: 18px 22px; margin-bottom: 8px;
				}
				.qf-user-pill {
					font-size: 13px; background: var(--qf-bg); border: 1px solid var(--qf-border);
					padding: 6px 12px; border-radius: 999px; color: var(--qf-ink);
				}
				.qf-intro { font-size: 14px; color: #334155; margin: 14px 0 20px 0; line-height: 1.5; }
				.qf-btn {
					font-size: 13px; font-weight: 600; padding: 8px 14px; border-radius: 7px;
					border: 1px solid var(--qf-border); background: var(--qf-surface); color: var(--qf-ink);
					cursor: pointer; transition: all 0.12s ease;
				}
				.qf-btn:hover { border-color: #c7ccd4; background: #fafbfc; }
				.qf-btn-primary { background: var(--qf-accent); border-color: var(--qf-accent); color: #fff; }
				.qf-btn-primary:hover { background: var(--qf-accent-dark); border-color: var(--qf-accent-dark); }
				.qf-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
				.qf-table th {
					text-align: left; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.04em;
					color: var(--qf-muted); font-weight: 700; padding: 8px 10px; border-bottom: 2px solid var(--qf-border);
				}
				.qf-table td { padding: 9px 10px; border-bottom: 1px solid var(--qf-border); vertical-align: middle; }
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
				.qf-sealed-box {
					background: #f8fafc; border: 1px dashed var(--qf-border); border-radius: 8px; padding: 16px 18px;
				}
				.qf-award-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 4px 0; margin-top: 10px; }
				.qf-award-box .qf-table td { border-bottom: 1px solid #fde68a; }
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
						<div class="qf-meta-label">Summary</div>
						<p class="qf-summary">${rfq.summary || "No summary provided."}</p>
				`;

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