import frappe
import json

@frappe.whitelist(allow_guest=True)
def submit_supplier_bid(rfq, supplier_name, email, price, delivery_days, remarks=None):
    # Verify open
    rfq_status = frappe.db.get_value("RFQ", rfq, "status")

    if rfq_status != "Open":
        frappe.throw("This RFQ is no longer open for bidding.")

    # Supplier bid
    bid = frappe.get_doc({
        "doctype": "Supplier Bid",
        "rfq": rfq,
        "supplier_name": supplier_name,
        "contact_email": email,
        "total_quoted_price": price,
        "delivery_days": delivery_days,
        "remarks": remarks
    })

    bid.insert(ignore_permissions=True)
    frappe.db.commit()

    return {
        "status": "success",
        "message": "Quotation submitted successfully!"
    }

@frappe.whitelist()
def create_new_rfq(title, summary, closing_date, items):
    user_roles = frappe.get_roles(frappe.session.user)

    if "Procurement Admin" not in user_roles and "System Manager" not in user_roles:
        frappe.throw("Permission Denied: Only Procurement Admins can create RFQs.")

    items = json.loads(items)

    new_rfq = frappe.get_doc({
        "doctype": "RFQ",
        "title": title,
        "summary": summary,
        "closing__datetime": closing_date,
        "status": "Open"
    })

    for item in items:
        new_rfq.append("items_needed", {
            "item_name": item.get("item_name"),
            "qty": item.get("qty"),
            "description": item.get("description")
        })

    new_rfq.insert(ignore_permissions=True)
    frappe.db.commit()

    return {
        "status": "success",
        "name": new_rfq.name
    }

@frappe.whitelist()
def close_rfq(rfq):
    user_roles = frappe.get_roles(frappe.session.user)

    if "Procurement Admin" not in user_roles and "System Manager" not in user_roles:
        frappe.throw("Permission Denied.")

    doc = frappe.get_doc("RFQ", rfq)

    doc.status = "Closed"
    doc.save(ignore_permissions=True)

    frappe.db.commit()

    return {
        "status": "success",
        "message": "RFQ closed successfully."
    }


@frappe.whitelist()
def get_procurement_data():
    roles = frappe.get_roles(frappe.session.user)

    if "Procurement Admin" not in roles and "System Manager" not in roles:
        frappe.throw("Permission Denied")

    rfqs = frappe.get_all(
        "RFQ",
        fields=["name", "status", "creation"],
        order_by="creation desc",
        ignore_permissions=True
    )

    for rfq in rfqs:
        doc = frappe.get_doc("RFQ", rfq["name"])

        rfq["title"] = getattr(doc, "title", None) or doc.name

        rfq["summary"] = (
            getattr(doc, "summary", None)
            or getattr(doc, "description", "No summary provided.")
        )

        rfq["closing__datetime"] = str(
            getattr(doc, "closing__datetime", None)
            or getattr(doc, "closing_datetime", None)
            or getattr(doc, "closing_date", "N/A")
        )

        rfq["rfq_items"] = []

        for item in doc.items_needed:
            rfq["rfq_items"].append({
                "item_name": item.item_name,
                "qty": item.qty,
                "description": item.description
            })

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

    return {
        "rfqs": rfqs
    }


@frappe.whitelist()
def get_buyer_evaluation_data():
    user_roles = frappe.get_roles(frappe.session.user)

    if "Buyer" not in user_roles and "System Manager" not in user_roles:
        frappe.throw("Access Denied: You must be a Buyer to view this page.", frappe.PermissionError)

    rfqs = frappe.get_all(
        "RFQ",
        fields=["name", "title", "status", "closing__datetime", "summary"],
        ignore_permissions=True
    )

    for rfq in rfqs:
        rfq["bids"] = frappe.get_all(
            "Supplier Bid",
            filters={"rfq": rfq["name"]},
            fields=[
                "name",
                "supplier_name",
                "contact_email",
                "total_quoted_price",
                "delivery_days",
                "remarks"
            ]
        )

    return {
        "rfqs": rfqs
    }

def redirect_after_login(login_manager):
    roles = frappe.get_roles(frappe.session.user)

    if "Procurement Admin" in roles:
        frappe.local.response["home_page"] = "/app/procure_admin"

    elif "Buyer" in roles:
        frappe.local.response["home_page"] = "/app/buyer_portal"