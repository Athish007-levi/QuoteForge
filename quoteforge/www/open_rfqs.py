import frappe

def get_context(context):

    if frappe.session.user == "Guest":
        frappe.local.flags.redirect_location = "/supplier_login"
        raise frappe.Redirect

    roles = frappe.get_roles(frappe.session.user)

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
        fields=["name", "title", "closing__datetime", "summary", "rfq_type"],
    )

    for rfq in rfqs:
        if rfq["rfq_type"] == "Product":
            rfq["rfq_items"] = frappe.get_all(
                "RFQ Item",
                filters={"parent": rfq["name"]},
                fields=["item_name", "qty", "description"],
            )
            rfq["service_items"] = []
        else:
            rfq["service_items"] = frappe.get_all(
                "RFQ Service",
                filters={"parent": rfq["name"]},
                fields=["service_name", "description"],
            )
            rfq["rfq_items"] = []

    context.rfqs = rfqs

    return context