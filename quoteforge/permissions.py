import frappe

def get_supplier_bid_permission_query(user):
    if not user:
        user = frappe.session.user

    roles = frappe.get_roles(user)

    # Procurement Admin & System Manager see all bids
    if "Procurement Admin" in roles or "System Manager" in roles:
        return ""

    # Buyers see bids for closed RFQs
    if "Buyer" in roles:
        return "`tabSupplier Bid`.rfq in (SELECT name FROM `tabRFQ` WHERE status = 'Closed')"

    return "1=0"