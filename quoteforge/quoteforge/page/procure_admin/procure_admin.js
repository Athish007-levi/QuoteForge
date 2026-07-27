frappe.pages['procure_admin'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Procurement Admin',
		single_column: true
	});

	$(wrapper).find('.layout-main-section').html(`
		<div>
			<h1>QuoteForge</h1>
			<p><strong>Procurement Admin Dashboard</strong></p>
			<p>Logged in as: <strong>${frappe.session.user}</strong></p>
			<hr>
			<h2>Create New RFQ</h2>
			<form id="createRFQForm">
				<p>
					<label>RFQ Title *</label><br>
					<input type="text" id="rfq_title" required>
				</p>
				<p>
					<label>Summary *</label><br>
					<textarea id="rfq_summary" rows="3" required></textarea>
				</p>
				<p>
					<label>Closing Date *</label><br>
					<input type="datetime-local" id="closing_date" required>
				</p>
				<h3>Items Needed</h3>
				<table border="1" cellpadding="8" cellspacing="0">
					<thead>
						<tr>
							<th>Item Name</th>
							<th>Quantity</th>
							<th>Description</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody id="itemsBody">
						<tr>
							<td><input type="text" class="item_name" required></td>
							<td><input type="number" class="qty" required></td>
							<td><input type="text" class="description"></td>
							<td><button type="button" class="remove-item">Remove</button></td>
						</tr>
					</tbody>
				</table>
				<br>
				<button type="button" id="addItem">Add Item</button>
				<br><br>
				<button type="submit">Create RFQ</button>
			</form>
			<hr>
			<h2>Existing RFQs</h2>
			<div id="rfqList">
				<p>Loading RFQs...</p>
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
				<td><button type="button" class="remove-item">Remove</button></td>
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

function load_rfqs(wrapper) {
	frappe.call({
		method: "quoteforge.api.get_procurement_data",
		callback: function(r) {
			if (r.exc) {
				$(wrapper).find("#rfqList").html(
					"<p>Error loading RFQs. Check the browser console.</p>"
				);
				return;
			}

			var rfqs = r.message.rfqs;
			var rfqList = $(wrapper).find("#rfqList");

			if (!rfqs || rfqs.length === 0) {
				rfqList.html("<p>No RFQs have been created yet.</p>");
				return;
			}

			var html = "";

			rfqs.forEach(function(rfq) {
				html += `
					<hr>
					<h2>${rfq.title || rfq.name}</h2>
					<p><strong>RFQ ID:</strong> ${rfq.name}</p>
					<p><strong>Status:</strong> ${rfq.status}</p>
					<p><strong>Closing Date:</strong> ${rfq.closing__datetime || "N/A"}</p>
					<p><strong>Summary:</strong> ${rfq.summary || "No summary provided."}</p>
					<h3>Requested Items</h3>
				`;

				if (rfq.rfq_items && rfq.rfq_items.length > 0) {
					html += `
						<table border="1" cellpadding="8" cellspacing="0">
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
					html += "<p>No items have been added to this RFQ.</p>";
				}

				if (rfq.status === "Open") {
					html += `
						<br>
						<button class="close-rfq" data-rfq="${rfq.name}">
							Close RFQ
						</button>
					`;
				} else {
					html += "<p><strong>This RFQ is closed.</strong></p>";
				}

				html += "<h3>Submitted Supplier Bids</h3>";

				if (rfq.bids && rfq.bids.length > 0) {
					html += `
						<table border="1" cellpadding="8" cellspacing="0">
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
					html += "<p>No supplier bids have been submitted.</p>";
				}
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