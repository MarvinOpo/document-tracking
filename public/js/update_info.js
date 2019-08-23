(function ($) {
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-center",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "2000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };

    $('#department').selectize();

    $('#update_btn').click(function () {
        if (!$('#new_password').val() || !$('#confirm_password').val() ||
            !$('#designation').val() || !$('#department').val()) {

            const text_error = "<div class='input-error'>"
                + "<span class='error-text'>"
                + "Please fill all required fields (*)"
                + "</span>"
                + "</div>"

            $('#error_container').html(text_error);

            return;
        }

        if ($('#new_password').val() != $('#confirm_password').val()) {

            const text_error = "<div class='input-error'>"
                + "<span class='error-text'>"
                + "Password does not match"
                + "</span>"
                + "</div>"

            $('#error_container').html(text_error);

            return;
        }

        update_info();
    });
})(jQuery);

function update_info() {
    const body = {
        password: $('#new_password').val(),
        designation: $('#designation').val(),
        department: $('#department').val()
    };

    fetch('/update_info', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(data => {
            console.log(status);
            if (data.status == "success") {
                window.location.href = "http://172.16.2.30:3000/dashboard"
            } else {
                const text_error = "<div class='input-error'>"
                    + "<span class='error-text'>"
                    + "Something went wrong.<br>Please try again."
                    + "</span>"
                    + "</div>"

                $('#error_container').html(text_error);
            }
        })
        .catch(err => {
            console.log(err);
        });
}