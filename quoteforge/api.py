import frappe

@frappe.whitelist(allow_guest=True)
def submit_supplier_bid(rfq, supplier_name, email, price, delivery_days, remarks=None):
    #Verify open
    rfq_status = frappe.db.get_value("RFQ", rfq, "status")
    if rfq_status != "Open":
        frappe.throw("This RFQ is no longer open for bidding.")

    #Supplier Bid
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

    return {"status": "success", "message": "Quotation submitted successfully!"}



@frappe.whitelist()
def create_new_rfq(title, summary, closing_date):
    user_roles = frappe.get_roles(frappe.session.user)
    if "Procurement Admin" not in user_roles and "System Manager" not in user_roles:
        frappe.throw("Permission Denied: Only Procurement Admins can create RFQs.")

    new_rfq = frappe.get_doc({
        "doctype": "RFQ",
        "title": title,
        "summary": summary,
        "closing__datetime": closing_date,
        "status": "Open"
    })
    
    new_rfq.insert(ignore_permissions=True)
    frappe.db.commit()

    return {"status": "success", "name": new_rfq.name}


    import frappe

def get_custom_home_page(user):
    # Get all roles assigned to the logged-in user
    roles = frappe.get_roles(user)

    # 1. Procurement Admin Redirect
    if "Procurement Admin" in roles:
        return "procurement_admin"

    # 2. Buyer Redirect
    if "Buyer" in roles:
        return "buyer_portal"  # Replace with your actual Buyer page route name

    # 3. Fallback for all other logged-in users or System Managers
    if "System Manager" in roles:
        return "app"  # Sends System Managers to Desk

    # Default Public Page
    return "open_rfqs"

