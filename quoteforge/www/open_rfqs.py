import frappe

def get_context(context):

    # Redirect guests to supplier login
    if frappe.session.user == "Guest":
        frappe.local.flags.redirect_location = "/supplier_login"
        raise frappe.Redirect

    # Get logged-in user's roles
    roles = frappe.get_roles(frappe.session.user)

    # Allow only Supplier, Procurement Admin and System Manager
    if (
        "Supplier" not in roles
        and "Procurement Admin" not in roles
        and "System Manager" not in roles
    ):
        frappe.throw("You are not authorized to access this page.")

    context.title = "Open Quotation Requests"

    rfqs = frappe.get_all(
        "RFQ",
        filters={"status": "Open"},
        fields=["name", "title", "closing__datetime", "summary"],
    )

    for rfq in rfqs:
        rfq["rfq_items"] = frappe.get_all(
            "RFQ Item",
            filters={"parent": rfq["name"]},
            fields=["item_name", "qty", "description"],
        )

    context.rfqs = rfqs

    return context