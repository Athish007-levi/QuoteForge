frappe.pages['procure_admin'].on_page_load = function(wrapper) {
	
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Procurement Admin',
		single_column: true
	});

	$(wrapper).find('.layout-main-section').html(`
		
		<div class="qf-admin">
			<stylse>
				.qf-admin {
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
				.qf-admin h1 { font-size: 20px; font-weight: 700; margin: 0; }
				.qf-admin h2 { font-size: 16px; font-weight: 700; margin: 0 0 10px 0; }
				.qf-admin h3 { font-size: 13px; font-weight: 700; margin: 14px 0 8px 0; color: var(--qf-muted); }
				.qf-eyebrow { font-size: 13px; color: var(--qf-muted); }
				.qf-header {
					display: flex; align-items: center; justify-content: space-between;
					border-bottom: 1px solid var(--qf-border); padding: 0 0 12px 0; margin-bottom: 16px;
				}
				.qf-user-pill { font-size: 13px; color: var(--qf-muted); }
				.qf-card { border: 1px solid var(--qf-border); padding: 16px; margin-bottom: 16px; }
				.qf-btn {
					font-size: 13px; padding: 7px 14px; border: 1px solid var(--qf-border);
					background: #fff; color: var(--qf-ink); cursor: pointer;
				}
				.qf-btn:hover { background: #f5f5f5; }
				.qf-btn-primary { background: var(--qf-accent); border-color: var(--qf-accent); color: #fff; }
				.qf-btn-danger { color: #b42318; }
				.qf-btn-row { display: flex; gap: 8px; flex-wrap: wrap; }
				.qf-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; }
				.qf-field { margin-bottom: 12px; }
				.qf-input, .qf-textarea {
					width: 100%; box-sizing: border-box; font-size: 14px; padding: 7px 9px;
					border: 1px solid var(--qf-border); background: #fff; color: var(--qf-ink); font-family: inherit;
				}
				.qf-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
				.qf-table th {
					text-align: left; font-size: 12px; color: var(--qf-muted); font-weight: 700;
					padding: 6px 8px; border-bottom: 1px solid var(--qf-border);
				}
				.qf-table td { padding: 7px 8px; border-bottom: 1px solid var(--qf-border); }
				.qf-table input.item_name, .qf-table input.qty, .qf-table input.description {
					width: 100%; box-sizing: border-box; font-size: 13.5px; padding: 6px 8px;
					border: 1px solid var(--qf-border); font-family: inherit;
				}
				.qf-divider { border: none; border-top: 1px solid var(--qf-border); margin: 16px 0; }
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
				.qf-award-box { border: 1px solid var(--qf-border); padding: 4px 0; }
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

                <h2>Pending Supplier Registrations</h2>

                <div id="pendingSuppliers">

                <div class="qf-empty">
            Loading suppliers...
            </div>

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

					<div class="qf-field">

    <label class="qf-label">RFQ Type</label>

    <select id="rfq_type" class="qf-input">

        <option value="Product">Product</option>

        <option value="Service">Service</option>

    </select>

</div>

<div id="productSection">

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
                <td>
                    <input type="text" class="item_name">
                </td>

                <td>
                    <input type="number" class="qty qty-input qf-input">
                </td>

                <td>
                    <input type="text" class="description">
                </td>

                <td>
                    <button
                        type="button"
                        class="qf-btn qf-btn-danger remove-item">
                        Remove
                    </button>
                </td>

            </tr>
        </tbody>

    </table>

    <br>

    <button
        type="button"
        class="qf-btn"
        id="addItem">
        + Add Item
    </button>

</div>

<div id="serviceSection" style="display:none;">

    <h3>Services Needed</h3>

    <table class="qf-table">

        <thead>

            <tr>

                <th>Service Name</th>

                <th>Description</th>

                <th></th>

            </tr>

        </thead>

        <tbody id="serviceBody">

        </tbody>

    </table>

    <br>

    <button
        type="button"
        class="qf-btn"
        id="addService">

        + Add Service

    </button>

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
	console.log("HTML Loaded");

$(wrapper).find("#rfq_type").on("change", function () {

    console.log("RFQ Type Changed");

    toggleRFQType(wrapper);

});

toggleRFQType(wrapper);

	load_rfqs(wrapper);
	setup_rfq_form(wrapper);
	setup_report_buttons(wrapper); 
	load_pending_suppliers(wrapper);
};

function setup_rfq_form(wrapper) {
	$(wrapper).find("#addItem").on("click", function() {
		var row = `
			<tr>
				<td><input type="text" class="item_name" required></td>
				<td><input type="number" class="qty qty-input" required></td>
				<td><input type="text" class="description"></td>
				<td><button type="button" class="qf-btn qf-btn-danger remove-item">Remove</button></td>
			</tr>
		`;

		$(wrapper).find("#itemsBody").append(row);

		toggleRFQType(wrapper);
	});

	$(wrapper).find("#addService").on("click", function () {

      let row = `
          <tr>
              <td>
                  <input type="text" class="service_name" required>
              </td>

              <td>
                  <input type="text" class="service_description">
              </td>

              <td>
                  <button
                      type="button"
                      class="qf-btn qf-btn-danger remove-item">
                      Remove
                  </button>
              </td>
          </tr>
      `;

      $(wrapper).find("#serviceBody").append(row);
     
	  toggleRFQType(wrapper);
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
        var services = [];

        let rfq_type = $(wrapper).find("#rfq_type").val();

        if (rfq_type === "Product") {

            $(wrapper).find("#itemsBody tr").each(function () {

                  items.push({
                      item_name: $(this).find(".item_name").val(),
                      qty: $(this).find(".qty").val(),
                      description: $(this).find(".description").val()
                  });

            });

        } else {

            $(wrapper).find("#serviceBody tr").each(function () {

                services.push({
                    service_name: $(this).find(".service_name").val(),
                    description: $(this).find(".service_description").val()
                 });

            });

        }
        
	
        console.log("Items:", items);
        console.log("Services:", services);
         

		frappe.call({
			method: "quoteforge.api.create_new_rfq",
			args: {
				title: $(wrapper).find("#rfq_title").val(),
                summary: $(wrapper).find("#rfq_summary").val(),
                closing_date: $(wrapper).find("#closing_date").val(),
                rfq_type: rfq_type,

                items: JSON.stringify(items),
                services: JSON.stringify(services)

				
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

	console.log("setup_report_buttons called");

    $(wrapper).find("#rfqStatusReport").on("click", function() {
        console.log("RFQ Status clicked");
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
					"<div class='qf-empty'>Error loading RFQs.</div>"
				);
				return;
			}

			let rfqs = r.message.rfqs;
			let rfqList = $(wrapper).find("#rfqList");

			if (!rfqs || rfqs.length === 0) {
				rfqList.html("<div class='qf-empty'>No RFQs found.</div>");
				return;
			}

			let html = "";

			rfqs.forEach(function(rfq){

				let statusClass =
					rfq.status=="Open"
					? "qf-pill-open"
					: "qf-pill-closed";

				html += `
				<div class="qf-rfq-card">

					<div class="qf-rfq-head">
						<h2>${rfq.title || rfq.name}</h2>
						<span class="qf-pill ${statusClass}">
							${rfq.status}
						</span>
					</div>

					<div class="qf-meta-grid">

						<div>
							<div class="qf-meta-label">RFQ ID</div>
							<div class="qf-meta-value">${rfq.name}</div>
						</div>

						<div>
							<div class="qf-meta-label">Closing Date</div>
							<div class="qf-meta-value">
								${rfq.closing__datetime || "N/A"}
							</div>
						</div>

					</div>

					<div class="qf-meta-label">RFQ Type</div>
					<p>${rfq.rfq_type}</p>

					<div class="qf-meta-label">Summary</div>
					<p>${rfq.summary || "-"}</p>
				`;

				

				if (rfq.rfq_type=="Product") {

					html += "<h3>Requested Items</h3>";

					if(rfq.rfq_items.length){

						html += `
						<table class="qf-table">

							<thead>
								<tr>
									<th>Item</th>
									<th>Qty</th>
									<th>Description</th>
								</tr>
							</thead>

							<tbody>
						`;

						rfq.rfq_items.forEach(function(item){

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

					}
					else{

						html += `
						<div class="qf-empty">
							No product items.
						</div>
						`;

					}

				}

				

				else{

					html += "<h3>Services Required</h3>";

					if(rfq.service_items.length){

						html += `
						<table class="qf-table">

							<thead>
								<tr>
									<th>Service</th>
									<th>Description</th>
								</tr>
							</thead>

							<tbody>
						`;

						rfq.service_items.forEach(function(service){

							html += `
								<tr>

									<td>${service.service_name}</td>

									<td>${service.description || "-"}</td>

								</tr>
							`;

						});

						html += `
							</tbody>
						</table>
						`;

					}
					else{

						html += `
						<div class="qf-empty">
							No services added.
						</div>
						`;

					}

				}

				

				if(rfq.status=="Open"){

					html += `
					<br>

					<button
						class="qf-btn qf-btn-danger close-rfq"
						data-rfq="${rfq.name}">
						Close RFQ
					</button>
					`;

				}
				else{

					html += `
					<p class="qf-eyebrow">
						This RFQ is closed.
					</p>
					`;

				}

				

				html += "<h3>Submitted Supplier Bids</h3>";

				if(rfq.bids.length){

					html += `
					<table class="qf-table">

						<thead>

							<tr>

								<th>Supplier</th>

								<th>Email</th>

								<th>Price</th>

								<th>Delivery</th>

								<th>Remarks</th>

							</tr>

						</thead>

						<tbody>
					`;

					rfq.bids.forEach(function(bid){

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

				}
				else{

					html += `
					<div class="qf-empty">
						No supplier bids.
					</div>
					`;

				}

				

				html += `
				<h3>Award Details</h3>

				<table class="qf-table">

					<tr>
						<td><strong>Status</strong></td>
						<td>${rfq.final_status || "Pending"}</td>
					</tr>

					<tr>
						<td><strong>Supplier</strong></td>
						<td>${rfq.awarded_supplier || "-"}</td>
					</tr>

					<tr>
						<td><strong>Value</strong></td>
						<td>${rfq.awarded_value || "-"}</td>
					</tr>

					<tr>
						<td><strong>Date</strong></td>
						<td>${rfq.award_date || "-"}</td>
					</tr>

				</table>

				</div>
				`;

			});

			rfqList.html(html);

			$(wrapper).find(".close-rfq").on("click",function(){

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

function load_pending_suppliers(wrapper){

    frappe.call({

        method: "quoteforge.api.get_pending_suppliers",

        callback: function(r){

            var suppliers = r.message.suppliers;

            var html = "";

            if(suppliers.length == 0){

                html = "<div class='qf-empty'>No pending supplier registrations.</div>";

            }
            else{

                suppliers.forEach(function(supplier){

                    html += `
                        <div class="qf-rfq-card">

                            <h3>${supplier.company_name}</h3>

                            <p><strong>Contact:</strong> ${supplier.contact_person}</p>

                            <p><strong>Email:</strong> ${supplier.email}</p>

                            <p><strong>Phone:</strong> ${supplier.phone}</p>

                            <p><strong>Address:</strong> ${supplier.address}</p>

                            <p><strong>GST:</strong> ${supplier.gst_number}</p>

                            <button
                                class="qf-btn qf-btn-primary approve-supplier"
                                data-name="${supplier.name}">
                                Approve
                            </button>

                            <button
                                class="qf-btn qf-btn-danger reject-supplier"
                                data-name="${supplier.name}">
                                Reject
                            </button>

                        </div>
                    `;

                });

            }

            $(wrapper).find("#pendingSuppliers").html(html);

            $(wrapper).find(".approve-supplier").off("click").on("click", function(){

                var supplier = $(this).data("name");

                approve_supplier(supplier, wrapper);

            });

            $(wrapper).find(".reject-supplier").off("click").on("click", function(){

                var supplier = $(this).data("name");

                reject_supplier(supplier, wrapper);

            });

        }

    });

}


function approve_supplier(name, wrapper){

    console.log("Button Clicked");
    console.log(name);

    frappe.call({

        method: "quoteforge.api.approve_supplier",

        args: {
            supplier: name
        },

        callback: function(r){

            console.log(r);

            if(!r.exc){

                frappe.msgprint({

                    title: "Supplier Approved",

                    message:
                        r.message.message +
                        "<br><br><b>Temporary Password:</b> " +
                        r.message.password,

                    indicator: "green"

                });

                load_pending_suppliers(wrapper);

            }

        }

    });

}

function reject_supplier(name){

    frappe.call({

        method: "quoteforge.api.reject_supplier",

        args:{
            supplier:name
        },

        callback:function(r){

            if(!r.exc){

                frappe.msgprint(r.message.message);

                load_pending_suppliers(cur_page.page);

            }

        }

    });

}

function toggleRFQType(wrapper) {

    let type = $(wrapper).find("#rfq_type").val();

    if (type === "Product") {

       
        $(wrapper).find("#productSection").show();
        $(wrapper).find("#serviceSection").hide();

        
        $(wrapper).find("#itemsBody .item_name").prop("required", true);
        $(wrapper).find("#itemsBody .qty").prop("required", true);

        
        $(wrapper).find("#serviceBody .service_name").prop("required", false);

    } else {

        
        $(wrapper).find("#productSection").hide();
        $(wrapper).find("#serviceSection").show();

        // Product fields not required
        $(wrapper).find("#itemsBody .item_name").prop("required", false);
        $(wrapper).find("#itemsBody .qty").prop("required", false);

       
        $(wrapper).find("#serviceBody .service_name").prop("required", true);

    }

}