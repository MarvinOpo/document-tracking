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

    // $('#login_btn').click(function () {
    //     if (!$('#username').val() || !$('#password').val()) {

    //         toastr.error("Please enter username and password");

    //         return;
    //     }
 
    //     checkUser();
    // });
})(jQuery);

function checkUser() {
    const body = {
        username: $('#username').val(),
        password: $('#password').val()
    }

    fetch('http://172.16.2.31:3000/login', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(data => {
            if(!data.status){
                login(data[0]);
            }else {
                toastr.error("Invalid Credentials");
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function login(data){
    fetch('/login', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(data => {
             if(data.status == "success"){
                window.location.href = "http://172.16.2.30:3000/dashboard"
             }
        })
        .catch(err => {
            console.log(err);
        });
}