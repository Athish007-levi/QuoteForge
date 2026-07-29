import frappe
import json
from frappe.auth import LoginManager

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
        fields=[
            "name",
            "status",
            "creation",
            "final_status",
            "awarded_supplier",
            "awarded_value",
            "award_date"
        ],
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
        frappe.throw(
            "Access Denied: You must be a Buyer to view this page.",
            frappe.PermissionError
        )

    rfqs = frappe.get_all(
        "RFQ",
        fields=[
            "name",
            "title",
            "status",
            "closing__datetime",
            "summary",
            "final_status",
            "awarded_supplier",
            "awarded_value",
            "award_date"
        ],
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
            ],
            ignore_permissions=True
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


@frappe.whitelist()
def award_supplier(rfq, supplier_bid):
    if frappe.session.user == "Guest":
        frappe.throw("Login required.")

    user_roles = frappe.get_roles(frappe.session.user)

    if "Buyer" not in user_roles and "System Manager" not in user_roles:
        frappe.throw("Only Buyers can award a supplier.")

    rfq_doc = frappe.get_doc("RFQ", rfq)

    if rfq_doc.status != "Closed":
        frappe.throw("Supplier can only be awarded after the RFQ is closed.")
    bid = frappe.get_doc("Supplier Bid", supplier_bid)

    if bid.rfq != rfq:
        frappe.throw("This supplier bid does not belong to this RFQ.")

    if rfq_doc.final_status == "Awarded":
        frappe.throw("An award has already been made for this RFQ.")

    rfq_doc.awarded_supplier = bid.supplier_name
    rfq_doc.awarded_value = bid.total_quoted_price
    rfq_doc.award_date = frappe.utils.now_datetime()
    rfq_doc.final_status = "Awarded"

    rfq_doc.save(ignore_permissions=True)

    frappe.db.commit()

    return {
        "status": "success",
        "message": "Supplier awarded successfully."
    }



   # Supplier Register Function Call frm supplier_register
@frappe.whitelist(allow_guest=True)
def register_supplier(
    company_name,
    contact_person,
    email,
    phone,
    address,
    gst_number,
    business_profile
):

    if frappe.db.exists("Supplier Profile", {"email": email}):
        frappe.throw("Email already registered.")

    if gst_number:
        if frappe.db.exists("Supplier Profile", {"gst_number": gst_number}):
            frappe.throw("GST Number already registered.")

    supplier = frappe.get_doc({
        "doctype": "Supplier Profile",
        "company_name": company_name,
        "contact_person": contact_person,
        "email": email,
        "phone": phone,
        "address": address,
        "gst_number": gst_number,
        "business_profile": business_profile,
        "status": "Pending"
    })

    supplier.insert(ignore_permissions=True)

    frappe.db.commit()

    return {
        "status": "success",
        "message": "Registration submitted successfully."
    }


# geting procuremnt admin pending supplier approvals
    
@frappe.whitelist()
def get_pending_suppliers():

    roles = frappe.get_roles(frappe.session.user)

    if "Procurement Admin" not in roles and "System Manager" not in roles:
        frappe.throw("Permission Denied")

    suppliers = frappe.get_all(
        "Supplier Profile",
        filters={
            "status": "Pending"
        },
        fields=[
            "name",
            "company_name",
            "contact_person",
            "gst_number",
            "email",
            "phone",
            "address"
        ],
        ignore_permissions=True
    )

    return {
        "suppliers": suppliers
    }    

@frappe.whitelist()
def approve_supplier(supplier):

    roles = frappe.get_roles(frappe.session.user)

    if "Procurement Admin" not in roles and "System Manager" not in roles:
        frappe.throw("Permission Denied")

    supplier_doc = frappe.get_doc("Supplier Profile", supplier)

    email_name = supplier_doc.email.split("@")[0]
    temporary_password = email_name + "@123"
    
    if supplier_doc.status == "Approved":
        frappe.throw("Supplier already approved.")

    if frappe.db.exists("User", supplier_doc.email):
        user = frappe.get_doc("User", supplier_doc.email)
    else:
        user = frappe.get_doc({
            "doctype": "User",
            "email": supplier_doc.email,
            "first_name": supplier_doc.contact_person,
            "enabled": 1,
            "send_welcome_email": 0
        })

        user.new_password = temporary_password

        user.insert(ignore_permissions=True)
        user.add_roles("Supplier")

    supplier_doc.user = user.name
    supplier_doc.status = "Approved"

    supplier_doc.save(ignore_permissions=True)

    frappe.db.commit()

    return {
        "status": "success",
        "message": "Supplier approved successfully.",
        "password":  temporary_password
    }

@frappe.whitelist()
def reject_supplier(supplier):

    roles = frappe.get_roles(frappe.session.user)

    if "Procurement Admin" not in roles and "System Manager" not in roles:
        frappe.throw("Permission Denied")

    supplier_doc = frappe.get_doc("Supplier Profile", supplier)

    supplier_doc.status = "Rejected"

    supplier_doc.save(ignore_permissions=True)

    frappe.db.commit()

    return {
        "status": "success",
        "message": "Supplier rejected successfully."
    }

@frappe.whitelist(allow_guest=True)
def login_supplier(email, password):

    supplier = frappe.db.get_value(
        "Supplier Profile",
        {"email": email},
        ["name", "status"],
        as_dict=True
    )

    if not supplier:
        frappe.throw("Supplier is not registered.")

    if supplier.status == "Pending":
        frappe.throw("Your registration is pending approval.")

    if supplier.status == "Rejected":
        frappe.throw("Your registration has been rejected.")

    login_manager = LoginManager()

    login_manager.authenticate(email, password)

    login_manager.post_login()

    return {
        "status": "success"
    }
