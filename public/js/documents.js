let document_selectize, type_selectize, docno_selectize, general_selectize;
let mtype_selectize, mpriority_selectize, mbcode_recieve_selectize;
let mdept_selectize, mbcode_release_selectize;

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

    const filter = (window.location.search.substring(1)).split("=")[1];
    if (filter) {
        $('#general_filter').append('<option value="' + filter + '">' + filter + '</option>')
    }

    selectizeFilter(filter);
    selectizeModal();

    $('#modal_add').click(function () {
        if (!$('#modal_name').val() || !$('#modal_docno').val() || !$('#modal_priority').val() ||
            !$('#modal_type').val() || !$('#modal_description').val()) {

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

        const date = new Date();
        const barcode = date.getFullYear() + "-" + getTwoDigitFormat(date.getMonth() + 1) + "" +
            getTwoDigitFormat(date.getDate()) + "" + getTwoDigitFormat(date.getHours()) + "" +
            getTwoDigitFormat(date.getMinutes()) + "" + getTwoDigitFormat(date.getSeconds());

        const body = {
            document_no: $('#modal_docno').val(),
            barcode: barcode,
            name: $('#modal_name').val(),
            type: $('#modal_type').val(),
            priority: $('#modal_priority').val(),
            description: $('#modal_description').val(),
            remarks: $('#modal_remarks').val(),
            type: $('#modal_type').val(),
            create_by: $(".department").attr("id"),
            update_by: $(".department").attr("id"),
            location: $(".department").val(),
        };

        if ($('#modal_add').text() == 'Add') {
            insertDocument(body);
        } else {
            body['id'] = $('.modal-title').attr('id');
            updateDocument(body);
        }
    });

    $('#modal_add_release').mousedown(function () {
        if (!$('#modal_dept').val() || !$('#modal_release_barcode').val() ||
            !$('#modal_release_remarks').val()) {
            const text_error = "<div class='input-error'>"
                + "<span class='error-text'>"
                + "Please fill all required fields (*)"
                + "</span>"
                + "</div>"

            $('#release_error_container').html(text_error);

            return;
        } else {
            $('#release_error_container').html('');
        }

        getPrintableSentout();
    });

    $('#modal_add_recieve').mousedown(function () {
        if (!$('#modal_recieve_barcode').val()) {
            const text_error = "<div class='input-error'>"
                + "<span class='error-text'>"
                + "Please fill all required fields (*)"
                + "</span>"
                + "</div>"

            $('#recieve_error_container').html(text_error);

            $('#modal_recieve_barcode-selectized').focus();
            return;
        } else {
            $('#recieve_error_container').html('');
        }

        updateDocRecieveLog($('#modal_recieve_barcode').val());
    });

    $('#modal_recieve').on('shown.bs.modal', function () {
        $('#modal_recieve_barcode-selectized').focus();
    });

    $('#modal_recieve').on('hidden.bs.modal', function () {
        $(this)
            .find("input")
            .val('')
            .end();

        mbcode_recieve_selectize.setValue("");
        refreshModalSelectize();
    });

    $('#modal_release').on('hidden.bs.modal', function () {
        $(this)
            .find("input")
            .val('')
            .end();

        mdept_selectize.setValue("");
        mbcode_release_selectize.setValue("");

        $('#modal_release_remarks').val("");
        refreshModalSelectize();
    });

    $('#modal_document').on('hidden.bs.modal', function (e) {
        $(this)
            .find("input")
            .val('')
            .end();

        $('#modal_description').val('');
        $('#modal_remarks').val('');

        $('#error_container').html('');
        $('#modal_add').text('Add');
        $('#modal_add').show();
        $('.modal-title').text('Add Document');

        mtype_selectize.setValue('');
        mpriority_selectize.setValue('');
        refreshModalSelectize();
    });

    $('#modal_recieve_barcode-selectized').focus(function () {
        $('#modal_recieve_doc_info').show();
    });

    $('#modal_recieve_barcode-selectized').focusout(function () {
        $('#modal_recieve_doc_info').hide();
    });

    $('#modal_release_barcode-selectized').focus(function () {
        $('#modal_release_doc_info').show();
    });

    $('#modal_release_barcode-selectized').focusout(function () {
        $('#modal_release_doc_info').hide();
    });

    const adm_access = 'ADMINISTRATIVE OFFICE, MEDICAL CHIEF CENTER';

    if (!adm_access.includes($('.department').text())) {
        $('#nav_all_docs').remove();
        $('#nav_all_docs_mobile').remove();
    }
})(jQuery);

function selectizeFilter(filter) {
    let $documents, $type, $docno, $general;

    $documents = $('#document_filter').selectize({
        valueField: 'barcode',
        labelField: 'barcode',
        searchField: ['barcode'],
        onChange: function (value) {
            refreshSelectize();

            if (value) {
                general_selectize.setValue('');
            }
        }
    });

    $type = $('#type_filter').selectize({
        valueField: 'type',
        labelField: 'type',
        searchField: ['type'],
        onChange: function (value) {
            document_selectize.trigger("change");
        }
    });

    $docno = $('#docno_filter').selectize({
        valueField: 'document_no',
        labelField: 'document_no',
        searchField: ['document_no'],
        onChange: function (value) {
            document_selectize.trigger("change");

            if (value) {
                general_selectize.setValue('');
            }
        }
    });

    $general = $('#general_filter').selectize({
        create: true,
        onChange: function (value) {
            if (value) {
                document_selectize.setValue("");
                docno_selectize.setValue("");
            }

            getDocCount();
        }
    });

    document_selectize = $documents[0].selectize;
    type_selectize = $type[0].selectize;
    docno_selectize = $docno[0].selectize;
    general_selectize = $general[0].selectize;

    if (filter) general_selectize.setValue(filter);
}

function selectizeModal() {
    let $mtype, $mpriority, $mdept, $mbcodeRecieve, $mbcodeRelease;

    $mtype = $('#modal_type').selectize({
        onChange: function (value) {
            if (value) {
                let abbr = '';

                switch (value) {
                    case 'Purchase Order': abbr = 'PO'; break;
                    case 'Purchase Request': abbr = 'PR'; break;
                    case 'Cheque':
                    case 'PHIC Cheque':
                        abbr = 'CN';
                        break;
                    case 'Bill Number':
                    case 'Application Bill':
                        abbr = 'BN';
                        break;
                    case 'Petty Cash Voucher':
                    case 'Disbursement Voucher':
                        abbr = 'VO';
                        break;
                }

                if (!abbr) {
                    $('#modal_docno').val('N/A');
                    return;
                }

                if (!($('#modal_docno').val()).toUpperCase().includes(abbr)) {
                    $('#modal_docno').val(abbr);
                    $('#modal_docno').focus();
                }
            } else {
                $('#modal_docno').val('');
            }
        }
    });

    $mpriority = $('#modal_priority').selectize();

    $mdept = $('#modal_dept').selectize({
        valueField: 'department',
        labelField: 'department',
        searchField: ['department']
    });

    $mbcodeRecieve = $('#modal_recieve_barcode').selectize({
        create: true,
        maxOptions: 1,
        maxItems: 100,
        valueField: 'barcode',
        labelField: 'barcode',
        searchField: ['barcode'],
        onChange: function (value) {

            $('#recieve_error_container').html("");

            if ($('#modal_recieve_barcode').val() && $('#modal_recieve_barcode').val() != "") {
                const barcode = $('#modal_recieve_barcode').val()[$('#modal_recieve_barcode').val().length - 1];
                checkDocForRecieve(barcode);
            } else {
                $('#modal_recieve_name').val("");
                $('#modal_recieve_desc').val("");
            }
        }
    });

    $('#modal_release_doc_info').hide();
    $mbcodeRelease = $('#modal_release_barcode').selectize({
        create: true,
        maxOptions: 1,
        maxItems: 100,
        valueField: 'barcode',
        labelField: 'barcode',
        searchField: ['barcode'],
        onChange: function (value) {
            $('#release_error_container').html("");

            if ($('#modal_release_barcode').val() && $('#modal_release_barcode').val() != "") {
                const barcode = $('#modal_release_barcode').val()[$('#modal_release_barcode').val().length - 1];
                checkDocForRelease(barcode);
            } else {
                $('#modal_release_name').val("");
                $('#modal_release_desc').val("");
            }
        }
    });

    mtype_selectize = $mtype[0].selectize;
    mpriority_selectize = $mpriority[0].selectize;
    mdept_selectize = $mdept[0].selectize;
    mbcode_recieve_selectize = $mbcodeRecieve[0].selectize;
    mbcode_release_selectize = $mbcodeRelease[0].selectize;

    refreshModalSelectize();
    document_selectize.trigger('change');

    const deptRoute = '/API/user/get_departments';
    loadFilter(mdept_selectize, deptRoute);
}

function refreshSelectize() {
    document_selectize.clearOptions();
    type_selectize.clearOptions();
    docno_selectize.clearOptions();

    const param = 'barcode=' + $('#document_filter').val() +
        '&type=' + $('#type_filter').val() + '&docno=' + $('#docno_filter').val() +
        '&department=' + $('.department').text() + '&user_id=' + $('.department').attr('id');

    const bcodeRoute = '/API/document/get_barcodes?' + param;
    loadFilter(document_selectize, bcodeRoute);

    const typeRoute = '/API/document/get_types?' + param;
    loadFilter(type_selectize, typeRoute);

    const docnoRoute = '/API/document/get_docno?' + param;
    loadFilter(docno_selectize, docnoRoute);

    getDocCount();
}

function refreshModalSelectize() {
    mbcode_recieve_selectize.clearOptions();
    mbcode_release_selectize.clearOptions();

    const param = 'id=' + $('.department').attr('id') + '&department=' + $('.department').text();

    const recieveRoute = '/API/document/get_recievable_bcodes?' + param;
    loadFilter(mbcode_recieve_selectize, recieveRoute);

    const releaseRoute = '/API/document/get_releasable_bcodes?' + param;
    loadFilter(mbcode_release_selectize, releaseRoute);

}

function insertDocument(body) {
    fetch('/API/document/insert', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(data => {
            if (data.status == "success") {
                toastr.success("Successfully saved.");
                $('#modal_document').modal('hide');
                document_selectize.trigger("change");

                const barcodes = [];
                barcodes.push(body.barcode);

                const log = {
                    barcodes: barcodes,
                    department: $('.department').text(),
                    remarks: "Origin"
                }

                insertLogs(log);
            } else {
                toastr.error("An error has occured.");
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function trackDocument(id) {
    const param = '?id=' + id;

    fetch('/API/logs/get_logs' + param, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            populate_tracking(data);
        })
        .catch(err => {
            console.log(err);
        });
}

function checkDocForRecieve(barcode) {
    const param = '?barcode=' + barcode;

    fetch('/API/document/check_document' + param, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            if (data.status != "error" && data.length > 0) {
                $('#modal_recieve_name').val(data[0].name);
                $('#modal_recieve_desc').val(data[0].description);
            } else {
                const text_error = "<div class='input-error'>"
                    + "<span class='error-text'>"
                    + barcode + " barcode does not exist"
                    + "</span>"
                    + "</div>"

                $('#recieve_error_container').html(text_error);

                $('#modal_recieve_name').val("");
                $('#modal_recieve_desc').val("");
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function checkDocForRelease(barcode) {
    const param = '?barcode=' + barcode;

    fetch('/API/document/check_document' + param, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            if (data.status != "error" && data.length > 0) {
                $('#modal_release_name').val(data[0].name);
                $('#modal_release_desc').val(data[0].description);
            } else {
                const text_error = "<div class='input-error'>"
                    + "<span class='error-text'>"
                    + barcode + " barcode does not exist"
                    + "</span>"
                    + "</div>"

                $('#release_error_container').html(text_error);

                $('#modal_release_name').val("");
                $('#modal_release_desc').val("");
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function getDocuments(offset) {
    let param = "";
    if (!$('#general_filter').val()) {
        param = '?barcode=' + $('#document_filter').val() +
            '&type=' + $('#type_filter').val() + '&docno=' + $('#docno_filter').val() +
            '&offset=' + offset + '&limit=' + 5 + '&department=' + $('.department').text() +
            '&user_id=' + $('.department').attr('id');
    } else {
        param = '?general=' + $('#general_filter').val() + '&type=' + $('#type_filter').val() +
            '&offset=' + offset + '&limit=' + 5 + '&department=' + $('.department').text() +
            '&user_id=' + $('.department').attr('id');
    }

    fetch('/API/document/get_documents' + param, { method: 'GET' })
        .then(res => res.json())
        .then(data => {

            if (data.length) {
                $('#document_container').removeClass('d-none');
                $('#pager_parent_container').removeClass('d-none');
                $('#no_document_container').addClass('d-none');
            } else {
                $('#document_container').addClass('d-none');
                $('#pager_parent_container').addClass('d-none');
                $('#no_document_container').removeClass('d-none');
            }

            populate_table(data);
        })
        .catch(err => {
            console.log(err);
        });

}

function getPrintableSentout() {
    const body = {
        barcodes: $('#modal_release_barcode').val()
    };

    fetch('/API/document/get_release_sendout', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(data => {
            populate_sendout(data);
            updateDocReleaseLog();
        })
        .catch(err => {
            console.log(err);
        });
}

function getDocCount() {
    $('#loader_container').show();

    let param = "";
    if (!$('#general_filter').val()) {
        param = '?barcode=' + $('#document_filter').val() +
            '&type=' + $('#type_filter').val() + '&docno=' + $('#docno_filter').val() +
            '&department=' + $('.department').text() + '&user_id=' + $('.department').attr('id');
    } else {
        param = '?general=' + $('#general_filter').val() + '&type=' + $('#type_filter').val() +
            '&department=' + $('.department').text() + '&user_id=' + $('.department').attr('id');
    }

    fetch('/API/document/get_count' + param, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            populate_pager(data[0].count);
        })
        .catch(err => {
            console.log(err);
        });
}

function editDocument(data) {
    $('.modal-title').text('Edit Document');
    $('#modal_document').modal('show');

    if (data.created_by != $('.department').attr('id')) {
        $('#modal_add').hide();
    }

    $('#modal_add').text('Update');
    $('.modal-title').attr('id', data.id);

    $('#modal_name').val(data.name);
    $('#modal_docno').val(data.document_no);

    mtype_selectize.setValue(data.type);
    mpriority_selectize.setValue(data.priority);

    $('#modal_description').val(data.description);
    $('#modal_remarks').val(data.remarks);
}

function updateDocument(body) {
    fetch('/API/document/update', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data.status == "success") {
                toastr.success("Successfully saved.");
                $('#modal_document').modal('hide');
                document_selectize.trigger("change");
            } else {
                toastr.error("An error has occured.");
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function recieveDocument(barcodes) {
    const body = {
        barcodes: barcodes
    };

    console.log(body);

    fetch('/API/document/recieve', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(data => {
            if (data.status == 'success') {
                toastr.success("Documents recieved.");
                $('#modal_recieve').modal('hide');
                document_selectize.trigger("change");
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function endDocument(id) {
    const param = "?id=" + id + "&user_id=" + $('.department').attr('id');

    toastr.options.timeOut = 0;
    toastr.options.extendedTimeOut = 0;
    toastr.options.positionClass = "toast-top-center";
    toastr.warning('<div class="text-center"><label>Are you sure you want to cycle end this item?</label>'
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
                    fetch('/API/document/end_cycle' + param, { method: 'GET' })
                        .then(res => res.json())
                        .then(data => {
                            if (data.status == 'success') {
                                toastr.success("Documents cycle end.");
                                $('#modal_recieve').modal('hide');
                                document_selectize.trigger("change");
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

function updateDocRecieveLog(barcodes) {
    const body = {
        barcodes: barcodes,
        recieve_by: $('.name').attr('id'),
        department: $('.department').text()
    };

    fetch('/API/logs/update_recieve', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(data => {
            if (data.status == 'success') {
                recieveDocument($('#modal_recieve_barcode').val());
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function updateDocReleaseLog() {
    const body = {
        release_by: $('.name').attr('id'),
        barcodes: $('#modal_release_barcode').val()
    };

    fetch('/API/logs/update_release', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(data => {
            if (data.status == 'success') {
                insertLogs("");
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function updateDocLocation(body) {
    fetch('/API/document/update_location', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(data => {
            if (data.status == 'success') {
                toastr.success("Documents released.");
                $('#modal_release').modal('hide');
                document_selectize.trigger("change");

                print_sendout();
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function deleteDocument(id) {
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
                    fetch('/API/document/delete' + param, { method: 'GET' })
                        .then(res => res.json())
                        .then(data => {
                            if (data.status == "success") {
                                toastr.success("Successfully deleted.");
                                document_selectize.trigger("change");
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

function openRecieveModal(barcode) {
    $('#modal_recieve').modal('show');

    mbcode_recieve_selectize.setValue(barcode);
}

function openReleaseModal(barcode) {
    $('#modal_release').modal('show');

    mbcode_release_selectize.setValue(barcode);
}

function insertLogs(body) {
    let triggerRecieve = false;

    if (!body) {
        body = {
            barcodes: $('#modal_release_barcode').val(),
            department: $('#modal_dept').val(),
            remarks: $('#modal_release_remarks').val()
        };
    } else {
        triggerRecieve = true;
    }

    fetch('/API/logs/insert', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(data => {
            if (data.status == 'success') {
                if (triggerRecieve)
                    updateDocRecieveLog(body.barcodes);
                else
                    updateDocLocation(body);
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function updateLogs() {
    const body = {
        recieve_by: "Mark Vincent Opo",
        department: "IT Office"
    };

    fetch('/API/logs/update', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(data => {
            if (data.status == 'success') {
                updateDocLocation(body);
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function populate_table(data) {
    let due_documents = [];
    let table_data = '';
    for (let i = 0; i < data.length; i++) {
        table_data += "<tr id='" + data[i].barcode + "' class='tr-shadow'>"
            + "<td> "
            + "<button class='btn btn-outline-success' onclick='trackDocument(" + data[i].id + ")'> Track </button>";

        if ((!data[i].location || data[i].location == $(".department").text()) && data[i].status != "Cycle End") {
            if (data[i].status == 'Recieved' || !data[i].location)
                table_data += "<button class='btn btn-outline-success m-l-5' onclick='openReleaseModal(" + JSON.stringify(data[i].barcode) + ")'> Release </button>";
            else if (data[i].status == 'Pending' && data[i].location)
                table_data += "<button class='btn btn-outline-success m-l-5' onclick='openRecieveModal(" + JSON.stringify(data[i].barcode) + ")'> Recieve </button>";
        }

        table_data += "</td>"
            + "<td>"
            + "<span class='btn btn-link' onclick='editDocument(" + JSON.stringify(data[i]) + ")'>" + data[i].barcode + "</span>"
            + "</td>"
            + "<td>" + data[i].document_no + "</td>"
            + "<td>" + data[i].name + "</td>"
            + "<td>" + data[i].description + "</td>"
            + "<td>" + data[i].type + "</td>";

        let priority_duration = 0;

        if (data[i].priority == "Regular") {
            priority_duration = 10;
            table_data += "<td><button id='priority_view' class='btn btn-primary mnw-116'>" + data[i].priority + "</button></td>";
        } else if (data[i].priority == "Urgent") {
            priority_duration = 5;
            table_data += "<td><button id='priority_view' class='btn btn-danger mnw-116'>" + data[i].priority + "</button></td>";
        }

        let now = new Date();
        const created_date = new Date(data[i].created_at);

        const hours_diff = Math.abs(now - created_date) / 36e5;

        if (hours_diff > priority_duration && data[i].location == $(".department").text()) {
            if (data[i].status != "Cycle End") {
                due_documents.push(data[i].barcode);
            } else {
                now = new Date(data[i].updated_at);
            }
        }

        let date_diff = Math.abs(now - created_date) / 1000;

        const days = Math.floor(date_diff / 86400);
        date_diff -= days * 86400;

        const hours = Math.floor(date_diff / 3600) % 24;
        date_diff -= hours * 3600;

        const minutes = Math.floor(date_diff / 60) % 60;
        date_diff -= minutes * 60;

        let remaining_time = "";
        if (minutes) remaining_time = minutes + " min(s)";
        if (hours) remaining_time = hours + " hr(s)<br>" + remaining_time;
        if (days) remaining_time = days + " day(s)<br>" + remaining_time;

        table_data += "<td name = 'duration'>" + remaining_time + "</td>";

        table_data += "<td >" + data[i].remarks + "</td>"
            + "<td>"
            + "<div class='table-data-feature'>"

        if (data[i].status != "Cycle End") {
            if (data[i].created_by == $(".department").attr('id')) {
                table_data += "<button class='item' data-toggle='tooltip' data-placement='top' title='Print' onclick='printBarcode(" + JSON.stringify(data[i].barcode) + ")'>"
                    + '<i class="zmdi zmdi-print"></i>'
                    + " </button>"
                    // + "<button class='item' data-toggle='tooltip' data-placement='top' title='Delete' onclick='deleteDocument(" + data[i].id + ")'>"
                    // + "<i class='zmdi zmdi-delete'></i>"
                    + " </button>";
            }

            if (data[i].location == $(".department").text()) {
                table_data += "<button class='item' data-toggle='tooltip' data-placement='top' title='Cycle End' onclick='endDocument(" + data[i].id + ")'>"
                    + "<i class='zmdi zmdi-refresh-sync-off'></i>"
                    + " </button>";
            }
        } else if ($('.department').attr('id') == data[i].updated_by) {
            table_data += "<button class='item' data-toggle='tooltip' data-placement='top' title='Recycle' onclick='endDocument(" + data[i].id + ")'>"
                + "<i class='zmdi zmdi-refresh-sync-alert'></i>"
                + " </button>";
        }

        table_data += "</div>"
            + " </td>"
            + " </tr>"
            + "<tr class='spacer'></tr>";
    }

    $('#table_data').html(table_data);

    for (let i = 0; i < due_documents.length; i++) {
        const id = "tr#" + due_documents[i];
        $(id).addClass("background-due");
        // $(id + ' td').addClass("text-white");
    }


    $('#loader_container').hide();
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

        onPageClick: function (pageNumber) {
            getDocuments((pageNumber - 1) * 5);
        }
    });

    const offset = (page - 1) * 5;

    if (!isNaN(offset) && numItems > offset) {
        getDocuments(offset);
    } else {
        getDocuments(0);
    }
}

function populate_tracking(data) {
    let table_data = '';
    for (let i = 0; i < data.length; i++) {
        table_data += "<tr class='tr-shadow'>"
            + "<td class='desc'>" + data[i].release_to + "</td>";

        if (data[i].recieve_by)
            table_data += "<td>" + data[i].recieve_by + "</td>";
        else table_data += "<td><span class='block-email'>Pending</span></td>";

        if (data[i].recieve_date) {
            const dateTime = (data[i].recieve_date).split('T');

            table_data += "<td><div class='row'><div class='col-md-12'>" + dateTime[0]
                + "</div><div class='col-md-12'>" + dateTime[1].substring(0, 8)
                + "</div></div></td>";

        } else table_data += "<td><span class='block-email'>Pending</span></td>";

        if (data[i].release_by)
            table_data += "<td>" + data[i].release_by + "</td>";
        else table_data += "<td><span class='block-email'>Pending</span></td>";

        if (data[i].release_date) {
            const dateTime = (data[i].release_date).split('T');

            table_data += "<td><div class='row'><div class='col-md-12'>" + dateTime[0]
                + "</div><div class='col-md-12'>" + dateTime[1].substring(0, 8)
                + "</div></div></td>";

        } else table_data += "<td><span class='block-email'>Pending</span></td>";

        table_data += "<td name = 'duration'><div class='row'>";

        if (data[i].recieve_date && data[i].release_date) {
            const date_release = new Date(data[i].release_date);
            const date_recieve = new Date(data[i].recieve_date);

            let date_diff = Math.abs(date_release - date_recieve) / 1000;

            const days = Math.floor(date_diff / 86400);
            date_diff -= days * 86400;

            const hours = Math.floor(date_diff / 3600) % 24;
            date_diff -= hours * 3600;

            const minutes = Math.floor(date_diff / 60) % 60;
            date_diff -= minutes * 60;

            if (days) table_data += "<div class='col-md-12'>" + days + " day(s) </div>";
            if (hours) table_data += "<div class='col-md-12'>" + hours + " hr(s) </div>";

            table_data += "<div class='col-md-12'>" + minutes + " min(s) </div>";
        }
        else table_data += "<span class='block-email'>Pending</span>";

        table_data += "</div></td>"
            + "<td>" + data[i].remarks + "</td>"
            + " </tr>"
            + "<tr class='spacer'></tr>";
    }

    $('#track_data').html(table_data);
    $('#modal_track').modal('show');
}

function populate_sendout(data) {

    const date = moment().format('MM/DD/YY hh:mm a');

    let table_data = `  <tr>
                            <td class="p-l-10 p-t-20 p-b-5 text-left">` + $('#modal_dept').val() + `</td>
                            <td class="p-t-20 p-b-5 text-left">` + date + `</td>
                        </tr>`;

    for (let i = 0; i < data.length; i++) {
        table_data += `<tr>
                            <td class="p-l-20 text-left">` + (i + 1) + `. ` + data[i].barcode + `</td>
                            <td>` + data[i].name + `</td>
                            <td>` + data[i].type + `</td>
                            <td class="align-bottom">____________</td>
                            <td class="align-bottom">____________</td>
                        </tr>`;
    }

    $('#sendout_doc_tbody').html(table_data);
}

function print_sendout() {
    printJS({
        printable: 'printable_div',
        type: 'html',
        honorColor: true,
        targetStyles: ['*']
    })
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

function getTwoDigitFormat(num) {
    if (num < 10) num = "0" + num;

    return num;
}

function printBarcode(code) {
    JsBarcode("#barcode", code, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 30,
        marginBottom: 10,
        displayValue: true
    });

    const $barcode = $('#barcode_container').html();

    const Pagelink = "about:blank";
    let pwa = window.open(Pagelink, "_new");
    pwa.document.open();
    pwa.document.write(
        "<html>"
        + "<head>"

        + "<style>"
        + ".footer {"
        + "position: absolute;"
        + "bottom: 0;"
        + "width: 100%;"
        + "text-align: center;"
        + "}"
        + "@media print {"
        + "@page { margin: 0; }"
        + "body { margin: 1cm; }"
        + "}\n\n"

        + "</style>"

        + "<script>"

        + "function step1(){\n"
        + "setTimeout('step2()', 10);"
        + "}\n\n"

        + "function step2(){"
        + "window.print();"
        + "window.close();"
        + "}\n"

        + "</script>"

        + "</head>"
        + "<body onload='step1()'>"
        + "<div class='footer'>" + $barcode + "</div>"
        + "</body>"
        + "</html>"
    );
    pwa.document.close();
}