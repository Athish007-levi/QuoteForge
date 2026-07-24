import frappe

def get_context(context):
    context.no_cache = 1
    context.title = "Procurement Admin Dashboard"

    # Guest check
    if frappe.session.user == "Guest":
        frappe.redirect_to_message(
            "Login Required",
            "Please log in to access the Procurement Admin Portal.<br><br><a href='/login?redirect=/procurement_admin' class='btn btn-primary btn-sm'>Log In Here</a>"
        )
        return context

    # Role check
    user_roles = frappe.get_roles(frappe.session.user)
    if "Procurement Admin" not in user_roles and "System Manager" not in user_roles:
        context.access_denied = True
        return context

    # Fetch RFQs
    rfqs = frappe.get_all(
        "RFQ",
        fields=["name", "status", "creation"],
        order_by="creation desc",
        ignore_permissions=True
    )

    for rfq in rfqs:
        doc = frappe.get_doc("RFQ", rfq["name"])

        # RFQ details
        rfq["title"] = getattr(doc, "title", None) or doc.name
        rfq["summary"] = getattr(doc, "summary", None) or getattr(doc, "description", "No summary provided.")
        rfq["closing__datetime"] = str(
            getattr(doc, "closing__datetime", None) or
            getattr(doc, "closing_datetime", None) or
            getattr(doc, "closing_date", "N/A")
        )

        # RFQ items
        rfq["rfq_items"] = []

        for item in doc.items_needed:
            rfq["rfq_items"].append({
                "item_name": item.item_name,
                "qty": item.qty,
                "description": item.description
            })

        # Supplier bids
        rfq["bids"] = frappe.get_all(
            "Supplier Bid",
            filters={"rfq": doc.name},
            fields=[
                "name",
                "supplier_name",
                "contact_email",
                "total_quoted_price",
                "delivery_days",
                "remarks"
            ],
            ignore_permissions=True
        )

    context.rfqs = rfqs
    return context