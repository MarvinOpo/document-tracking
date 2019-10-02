let dept_selectize;
let mdept_selectize;

(function ($) {
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-bottom-right",
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

    $('#loader_container').hide();

    $('.js-acc-btn').html("Administrator");

    $('.name').html("Administrator");

    $('.list-unstyled.navbar__list').html(
        `<li>
            <a href="admin_access">
                <i class="fas fa-user"></i> Manage Users
            </a>
        </li>`
    );

    selectizeFilter();
    selectizeModal();

    getUserCount();

    $('#modal_add').click(function () {
        if (!$('#modal_fname').val() || !$('#modal_lname').val() || !$('#modal_minit').val() ||
            !$('#modal_designation').val() || !$('#modal_department').val()) {

            const text_error = "<div class='input-error'>"
                + "<span class='error-text'>"
                + "Please fill all required fields (*)"
                + "</span>"
                + "</div>"

            $('#error_container').html(text_error);

            return;
        } else {
            $('#error_container').html('');
        }

        const fname = $('#modal_fname').val().toUpperCase().trim();
        const lname = $('#modal_lname').val().toUpperCase().trim();

        const body = {
            username: fname.substring(0, 2) + lname,
            fname: fname,
            minit: $('#modal_minit').val().toUpperCase().trim(),
            lname: lname,
            designation: $('#modal_designation').val().toUpperCase().trim(),
            department: $('#modal_department').val().toUpperCase().trim()
        };

        if ($('#modal_add').text() == 'Add') {
            insertUser(body);
        } else {
            body['id'] = $('.modal-title').attr('id');
            updateUser(body);
        }
    });

    $('#modal_user').on('hidden.bs.modal', function () {
        $(this)
            .find("input")
            .val('')
            .end();

        mdept_selectize.setValue("");

        refreshModalSelectize();

        $('#modal_add').text('Add');
        $('.modal-title').text('Add User');
    });

})(jQuery);

function selectizeFilter() {
    let $name, $designation, $department;

    $name = $('#name_filter').selectize({
        create: true,
        onChange: function (value) {
            getUserCount(0);
        }
    });
    $designation = $('#designation_filter').selectize({
        onChange: function (value) {
            getUserCount(0);
        }
    });
    $department = $('#department_filter').selectize({
        valueField: 'department',
        labelField: 'department',
        searchField: ['department'],
        onChange: function (value) {
            getUserCount(0);
        }
    });

    dept_selectize = $department[0].selectize;

    refreshSelectize();
}

function selectizeModal() {
    let $mdepartment;

    $mdepartment = $('#modal_department').selectize({
        create: true,
        valueField: 'department',
        labelField: 'department',
        searchField: ['department']
    });

    mdept_selectize = $mdepartment[0].selectize;

    refreshModalSelectize();
}

function refreshSelectize() {
    dept_selectize.clearOptions();

    const deptRoute = '/API/user/get_departments';
    loadFilter(dept_selectize, deptRoute);
}

function refreshModalSelectize() {
    mdept_selectize.clearOptions();

    const deptRoute = '/API/user/get_departments';
    loadFilter(mdept_selectize, deptRoute);
}

function insertUser(body) {
    fetch('/API/user/insert', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(data => {
            if (data.status == "success") {
                toastr.success("Successfully saved.");
                $('#modal_user').modal('hide');
                dept_selectize.trigger("change");
            } else {
                toastr.error("An error has occured.");
            }
        })
        .catch(err => {
            console.log(err);
        });
}
function getUserCount() {
    const param = '?name=' + $('#name_filter').val() + '&designation=' + $('#designation_filter').val()
        + '&department=' + $('#department_filter').val();

    fetch('/API/user/get_count' + param, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            populate_pager(data[0].count);
        })
        .catch(err => {
            console.log(err);
        });
}

function getUsers(offset) {
    const param = '?name=' + $('#name_filter').val() + '&designation=' + $('#designation_filter').val()
        + '&department=' + $('#department_filter').val() + '&limit=5&offset=' + offset;
    fetch('/API/user/get_users' + param, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            populate_table(data);
        })
        .catch(err => {
            console.log(err);
        });
}

function editUser(data) {
    $('.modal-title').text('Edit User');
    $('#modal_user').modal('show');

    $('#modal_add').text('Update');
    $('.modal-title').attr('id', data.id);

    $('#modal_fname').val(data.fname);
    $('#modal_lname').val(data.lname);
    $('#modal_minit').val(data.mi);

    mdept_selectize.setValue(data.department);

    if (data.designation.toUpperCase() != 'ND') {
        $('#modal_designation').val(data.designation);
    }
}

function updateUser(body) {
    fetch('/API/user/update', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(data => {
            if (data.status == "success") {
                toastr.success("Successfully saved.");
                $('#modal_user').modal('hide');
                dept_selectize.trigger("change");
            } else {
                toastr.error("An error has occured.");
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function deleteUser(id) {
    const param = '?id=' + id;

    toastr.options.timeOut = 0;
    toastr.options.extendedTimeOut = 0;
    toastr.options.positionClass = "toast-top-center";
    toastr.warning('<div class="text-center"><label>Are you sure you want to delete this item?</label>'
        + '<button type="button" id="okBtn" class="btn btn-danger" value="yes">Yes</button>'
        + '<button type="button" id="surpriseBtn" class="btn btn-secondary" style="margin: 0 8px 0 8px" value="no">No</button></div>',
        "",
        {
            allowHtml: true,
            onclick: function (toast) {
                toastr.options.timeOut = 2000;
                toastr.options.extendedTimeOut = 1000;
                toastr.options.positionClass = "toast-bottom-right";
                value = toast.target.value
                if (value == 'yes') {
                    fetch('/API/user/delete' + param, { method: 'GET' })
                        .then(res => res.json())
                        .then(data => {
                            if (data.status == "success") {
                                toastr.success("Successfully deleted.");
                                dept_selectize.trigger("change");
                            } else {
                                toastr.error("An error has occured.");
                            }
                        })
                        .catch(err => {
                            console.log(err);
                        });
                }

                toastr.remove();
            }

        });
}

function resetPassword(id) {
    const param = '?id=' + id;

    toastr.options.timeOut = 0;
    toastr.options.extendedTimeOut = 0;
    toastr.options.positionClass = "toast-top-center";
    toastr.warning('<div class="text-center"><label>Are you sure you want to reset password?</label>'
        + '<button type="button" id="okBtn" class="btn btn-danger" value="yes">Yes</button>'
        + '<button type="button" id="surpriseBtn" class="btn btn-secondary" style="margin: 0 8px 0 8px" value="no">No</button></div>',
        "",
        {
            allowHtml: true,
            onclick: function (toast) {
                toastr.options.timeOut = 2000;
                toastr.options.extendedTimeOut = 1000;
                toastr.options.positionClass = "toast-bottom-right";
                value = toast.target.value
                if (value == 'yes') {
                    fetch('/API/user/reset_password' + param, { method: 'GET' })
                        .then(res => res.json())
                        .then(data => {
                            if (data.status == "success") {
                                toastr.success("Successfully reset password.");
                                dept_selectize.trigger("change");
                            } else {
                                toastr.error("An error has occured.");
                            }
                        })
                        .catch(err => {
                            console.log(err);
                        });
                }

                toastr.remove();
            }

        });
}

function populate_pager(numItems) {
    let page = ($('.current:not(.prev)').html());

    if (page > Math.ceil(numItems / 5)) page = 1;

    $(".pager_container").html('');

    var perPage = 5;

    $(".pager_container").pagination({
        items: numItems,
        itemsOnPage: perPage,
        cssStyle: "light-theme",
        currentPage: page,

        onPageClick: function (pageNumber, event) {
            event.preventDefault();
            getUsers((pageNumber - 1) * 5);
        }
    });

    const offset = (page - 1) * 5;

    if (!isNaN(offset) && numItems > offset) {
        getUsers(offset);
    } else {
        getUsers(0);
    }
}

function populate_table(data) {
    let table_data = '';
    for (let i = 0; i < data.length; i++) {
        table_data += `<tr class= 'tr-shadow'>
                            <td class="text-uppercase">` + data[i].username + `</td>
                            <td>` + data[i].fname + ' ' + data[i].mi + ' ' + data[i].lname + `</td>
                            <td>` + data[i].designation + `</td>
                            <td>` + data[i].department + `</td>
                            <td>
                                <div class='table-data-feature'>
                                    <button class='item' data-toggle='tooltip' data-placement='top' title='Edit' onclick='editUser(` + JSON.stringify(data[i]) + `)'>
                                        <i class="zmdi zmdi-edit"></i>
                                    </button>
                                    <button class='item' data-toggle='tooltip' data-placement='top' title='Delete' onclick='deleteUser(` + data[i].id + `)'>
                                        <i class='zmdi zmdi-delete'></i>
                                    </button>
                                    <button class='item' data-toggle='tooltip' data-placement='top' title='Reset' onclick='resetPassword(` + data[i].id + `)'>
                                        <i class='zmdi zmdi-lock'></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr class='spacer'></tr>`;
    }

    $('#user_data').html(table_data);
}

function loadFilter(selectize, route) {
    selectize.load(function (callback) {
        fetch(route, { method: 'GET' })
            .then(res => res.json())
            .then(data => {
                callback(data);
            })
            .catch(err => {
                console.log(err);
            });
    });
}
