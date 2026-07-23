import frappe

def get_context(context):
    context.title = "Open Quotation Requests"
    
    # Updated to match your exact column names: 'closing__datetime' and 'summary'
    rfqs = frappe.get_all(
        "RFQ",
        filters={"status": "Open"},
        fields=["name", "title", "closing__datetime", "summary"],
        ignore_permissions=True
    )

    for rfq in rfqs:
        rfq["rfq_items"] = frappe.get_all(
            "RFQ Item",
            filters={"parent": rfq["name"]},
            fields=["item_name", "qty", "description"],
            ignore_permissions=True
        )

    context.rfqs = rfqs
    return context