import frappe

def get_context(context):
    context.title = "Buyer Evaluation Portal"

    # Clean permission check that throws a direct error instead of crashing on DocType 'Page'
    user_roles = frappe.get_roles(frappe.session.user)
    if "Buyer" not in user_roles and "System Manager" not in user_roles:
        frappe.throw("Access Denied: You must be a Buyer to view this page.", frappe.PermissionError)

    # Fetch all RFQs
    rfqs = frappe.get_all(
        "RFQ",
        fields=["name", "title", "status", "closing__datetime", "summary"],
        ignore_permissions=True
    )

    # Attach bids (our permission query hooked into hooks.py auto-hides open bids from Buyers!)
    for rfq in rfqs:
        rfq["bids"] = frappe.get_all(
            "Supplier Bid",
            filters={"rfq": rfq["name"]},
            fields=["name", "supplier_name", "contact_email", "total_quoted_price", "delivery_days", "remarks"]
        )

    context.rfqs = rfqs
    return context