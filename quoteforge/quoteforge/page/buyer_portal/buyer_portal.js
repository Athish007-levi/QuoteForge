frappe.pages['buyer_portal'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Buyer Evaluation Portal',
		single_column: true
	});

	$(wrapper).find('.layout-main-section').html(`
		<div>
			<table width="100%" cellpadding="15" cellspacing="0" border="0">
				<tr>
					<td width="70%">
						<h1>QuoteForge</h1>
						<p><strong>Buyer Evaluation Portal</strong></p>
					</td>
					<td width="30%" align="right">
						<p>
							Logged in as:
							<strong>${frappe.session.user}</strong>
						</p>
					</td>
				</tr>
			</table>
			<hr>
			<h2>RFQ Evaluation</h2>
			<p>
				Review supplier quotations and evaluate bids submitted
				for your procurement requests.
			</p>
			<br>
			<div id="rfqList">
				<p>Loading RFQs...</p>
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
					<p>Unable to load RFQ evaluation data.</p>
				`);
				return;
			}

			var rfqs = r.message.rfqs;
			var rfqList = $(wrapper).find("#rfqList");

			if (!rfqs || rfqs.length === 0) {
				rfqList.html(`
					<table width="100%" border="1" cellpadding="20" cellspacing="0">
						<tr>
							<td align="center">
								<h3>No RFQs Available</h3>
								<p>
									There are currently no RFQs available
									for evaluation.
								</p>
							</td>
						</tr>
					</table>
				`);
				return;
			}

			var html = "";

			rfqs.forEach(function(rfq) {
				html += `
					<table width="100%" border="1" cellpadding="12" cellspacing="0">
						<tr>
							<td colspan="2">
								<h2>${rfq.title || rfq.name}</h2>
							</td>
						</tr>
						<tr>
							<td width="25%">
								<strong>RFQ ID</strong>
							</td>
							<td>${rfq.name}</td>
						</tr>
						<tr>
							<td>
								<strong>Closing Date</strong>
							</td>
							<td>${rfq.closing__datetime || "Not specified"}</td>
						</tr>
						<tr>
							<td>
								<strong>Status</strong>
							</td>
							<td>
								<strong>${rfq.status}</strong>
							</td>
						</tr>
						<tr>
							<td>
								<strong>Summary</strong>
							</td>
							<td>${rfq.summary || "No summary provided."}</td>
						</tr>
					</table>
					<br>
				`;

				if (rfq.status === "Open") {
					html += `
						<table width="100%" border="1" cellpadding="15" cellspacing="0">
							<tr>
								<td>
									<h3>Sealed Bidding</h3>
									<p>Supplier bids are currently sealed.</p>
									<p>
										Bid pricing and supplier details
										will become available after this RFQ
										is closed.
									</p>
								</td>
							</tr>
						</table>
					`;
				} else {
					html += `
						<h3>Submitted Bids</h3>
					`;

					if (!rfq.bids || rfq.bids.length === 0) {
						html += `
							<table width="100%" border="1" cellpadding="15" cellspacing="0">
								<tr>
									<td align="center">
										<p>
											No bids have been received
											for this RFQ.
										</p>
									</td>
								</tr>
							</table>
						`;
					} else {
						html += `
							<table width="100%" border="1" cellpadding="10" cellspacing="0">
								<thead>
									<tr>
										<th align="left">Supplier Name</th>
										<th align="left">Contact Email</th>
										<th align="left">Quoted Price</th>
										<th align="left">Delivery Days</th>
										<th align="left">Remarks</th>
										<th align="left">Action</th>
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
												? "<strong>Award Completed</strong>"
												: `
													<button
														class="award-supplier"
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
						<br>
						<table width="100%" border="1" cellpadding="10" cellspacing="0">
							<tr>
								<td>
									<strong>Award Status</strong>
								</td>
								<td>
									Awarded
								</td>
							</tr>
							<tr>
								<td>
									<strong>Awarded Supplier</strong>
								</td>
								<td>
									${rfq.awarded_supplier || "-"}
								</td>
							</tr>
							<tr>
								<td>
									<strong>Awarded Value</strong>
								</td>
								<td>
									${rfq.awarded_value || "-"}
								</td>
							</tr>
						</table>
					`;
				}

				html += `
					<br>
					<hr>
					<br>
				`;
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