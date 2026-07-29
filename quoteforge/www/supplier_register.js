frappe.ready(function () {

    $("#supplierRegisterForm").on("submit", function (e) {

        e.preventDefault();

        var company_name = $("#company_name").val();
        var contact_person = $("#contact_person").val();
        var email = $("#email").val();
        var phone = $("#phone").val();
        var address = $("#address").val();
        var gst_number = $("#gst_number").val();
        var business_profile = $("#business_profile").val();

        frappe.call({
            method: "quoteforge.api.register_supplier",
            args: {
                company_name: company_name,
                contact_person: contact_person,
                email: email,
                phone: phone,
                address: address,
                gst_number: gst_number,
                business_profile: business_profile
            },
            callback: function (r) {

                if (r.message.status == "success") {
                    frappe.msgprint(r.message.message);
                    $("#supplierRegisterForm")[0].reset();
                }

            }
        });

    });

});