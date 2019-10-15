let document_selectize, type_selectize, docno_selectize, general_selectize, year_selectize;
let mtype_selectize, mpriority_selectize, mbcode_receive_selectize;
let mdept_selectize, mbcode_release_selectize, mbcode_position_selectize;
let date_from;
let refreshFlag = true;

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

    $('input, textarea').on('keypress', function (event) {
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (key == '\'' || key == '"') {
            event.preventDefault();
            return false;
        }
    });

    const filter = (window.location.search.substring(1)).split("=")[1];
    if (filter) {
        $('#general_filter').append('<option value="' + filter + '">' + filter + '</option>')
    }

    selectizeFilter(filter);
    selectizeModal();

    $('#modal_add').click(function () {
        $('#modal_add').prop('disabled', true);

        if (!$('#modal_name').val() || !$('#modal_docno').val() || !$('#modal_priority').val() ||
            !$('#modal_type').val() || !$('#modal_description').val()) {

            const text_error = "<div class='input-error'>"
                + "<span class='error-text'>"
                + "Please fill all required fields (*)"
                + "</span>"
                + "</div>"

            $('#error_container').html(text_error);


            $('#modal_add').prop('disabled', false);
            return;
        } else {
            $('#error_container').html('');
        }

        const date = new Date();
        const barcode = date.getFullYear() + "-" + getTwoDigitFormat(date.getMonth() + 1) + "" +
            getTwoDigitFormat(date.getDate()) + "" + getTwoDigitFormat(date.getHours()) + "" +
            getTwoDigitFormat(date.getMinutes()) + "" + getTwoDigitFormat(date.getSeconds());

        let year = $('#year_filter').val();

        if (!year) year = (new Date()).getFullYear();

        const body = {
            year: year,
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
        $('#modal_add_release').prop('disabled', true);

        if (!$('#modal_dept').val() || !$('#modal_release_barcode').val() ||
            !$('#modal_release_remarks').val()) {
            const text_error = "<div class='input-error'>"
                + "<span class='error-text'>"
                + "Please fill all required fields (*)"
                + "</span>"
                + "</div>"

            $('#release_error_container').html(text_error);
            $('#modal_add_release').prop('disabled', false);
            return;
        } else {
            $('#release_error_container').html('');
        }
        // getPrintableSentout();
        updateDocReleaseLog();
    });

    $('#modal_add_receive').mousedown(function () {
        if (!$('#modal_receive_barcode').val()) {
            const text_error = "<div class='input-error'>"
                + "<span class='error-text'>"
                + "Please fill all required fields (*)"
                + "</span>"
                + "</div>"

            $('#receive_error_container').html(text_error);

            $('#modal_receive_barcode-selectized').focus();
            return;
        } else {
            $('#receive_error_container').html('');
        }

        updateDocReceiveLog($('#modal_receive_barcode').val());
    });

    $('#modal_document').on('shown.bs.modal', function () {
        year_selectize.setValue('');
        $('#modal_add').prop('disabled', false);
    });

    $('#modal_release').on('shown.bs.modal', function () {
        mbcode_release_selectize.clearOptions();
        $('.modal-title').text('Release Document To');

        let year = $('#year_filter').val();

        if (!year) year = (new Date()).getFullYear();

        const param = '?year=' + year + '&id=' + $('.department').attr('id') + '&department=' + $('.department').text();

        const releaseRoute = '/API/document/get_releasable_bcodes' + param + '&name=' + $('.name').attr('id');
        loadFilter(mbcode_release_selectize, releaseRoute);

        mdept_selectize.removeOption($('.department').text());
    });

    $('#modal_receive').on('shown.bs.modal', function () {
        mbcode_receive_selectize.clearOptions();
        $('.modal-title').text('Receive Document');

        let year = $('#year_filter').val();
        if (!year) year = (new Date()).getFullYear();

        const param = '?year=' + year + '&id=' + $('.department').attr('id') + '&department=' + $('.department').text();

        const receiveRoute = '/API/document/get_receivable_bcodes' + param;
        loadFilter(mbcode_receive_selectize, receiveRoute);

        $('#modal_receive_barcode-selectized').focus();
    });

    $('#modal_print_sendout').on('shown.bs.modal', function () {
        $('#modal_printed_by').html("Printed by: " + $('.department').text());
        $('#printout_header').show();
        $('#modal_sendout_header').show();
        $('#modal_sendout_tbody').html('');
        $('#modal_no_sendout_container').removeClass('d-none');
        date_from = moment().format('YYYY-MM-DD HH:mm:ss');

        // getSendOutDocuments();
        const deptRoute = '/API/user/get_departments';
        loadFilter(mdept_selectize, deptRoute);
    });

    $('input[type=checkbox]').change(function () {
        if (this.checked) {
            $('#printout_header').show();
            $('#modal_sendout_header').show();
        } else {
            $('#printout_header').hide();
            $('#modal_sendout_header').hide();
        }
    });

    $('#modal_sendout_add').click(function () {
        $('#modal_release').modal('show');
    });

    $('#modal_receive').on('hidden.bs.modal', function () {
        $(this)
            .find("input")
            .val('')
            .end();

        mbcode_receive_selectize.setValue("");
    });

    $('#modal_release').on('hidden.bs.modal', function () {
        $(this)
            .find("input")
            .val('')
            .end();

        mdept_selectize.setValue("");
        mbcode_release_selectize.setValue("");

        $('#modal_release_remarks').val("");
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
        mpriority_selectize.setValue('Regular');
    });

    $('#modal_receive_barcode-selectized').focus(function () {
        $('#modal_receive_doc_info').show();
    });

    $('#modal_receive_barcode-selectized').focusout(function () {
        $('#modal_receive_doc_info').hide();
    });

    $('#modal_release_barcode-selectized').focus(function () {
        $('#modal_release_doc_info').show();
    });

    $('#modal_release_barcode-selectized').focusout(function () {
        $('#modal_release_doc_info').hide();
    });

    // $("#modalTblSendOut").on("click", "tr", function () {
    //     for (let i = $(this).attr('class'); i >= 0; i--) {
    //         $('tr.' + i).remove();
    //     }

    //     $('#printout_header').hide();
    //     $('#modal_sendout_header').hide();
    // });

    $('#modal_preview').click(function () {
        print_sendout();
    });

    $('#modal_preview_bcode').click(function () {
        printBarcode();
    });

    $('#modal_bcode_margin').change(function () {
        mbcode_position_selectize.trigger('change');
    });

    if ($('.access-rights').attr('id') != '1') {
        $('#nav_all_docs').remove();
        $('#nav_all_docs_mobile').remove();
    }
})(jQuery);

function selectizeFilter(filter) {
    let $year, $documents, $type, $docno, $general;

    let options = '';
    for (let i = new Date().getFullYear() - 1; i > 2017; i--) {
        options += `<option value="` + i + `">` + i + `</option>`;
    }

    $('#year_filter').append(options);
    $year = $('#year_filter').selectize({
        onChange: function (value) {
            getDocCount();
        }
    });

    $documents = $('#document_filter').selectize({
        valueField: 'barcode',
        labelField: 'barcode',
        searchField: ['barcode'],
        onChange: function (value) {
            getDocCount();

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

    year_selectize = $year[0].selectize;
    document_selectize = $documents[0].selectize;
    type_selectize = $type[0].selectize;
    docno_selectize = $docno[0].selectize;
    general_selectize = $general[0].selectize;

    if (filter) general_selectize.setValue(filter);
}

function selectizeModal() {
    let $mtype, $mpriority, $mdept, $mbcodeReceive, $mbcodeRelease, $mbcodePos;

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

    if ($('.access-rights').attr('id') == '1') {
        $mdept = $('#modal_dept').selectize({
            maxItems: 20,
            valueField: 'department',
            labelField: 'department',
            searchField: ['department']
        });
    } else {
        $mdept = $('#modal_dept').selectize({
            valueField: 'department',
            labelField: 'department',
            searchField: ['department']
        });
    }

    $mbcodeReceive = $('#modal_receive_barcode').selectize({
        // create: true,
        maxOptions: 1,
        maxItems: 100,
        valueField: 'barcode',
        labelField: 'barcode',
        searchField: ['barcode'],
        onChange: function (value) {

            $('#receive_error_container').html("");

            if ($('#modal_receive_barcode').val() && $('#modal_receive_barcode').val() != "") {
                const barcode = $('#modal_receive_barcode').val()[$('#modal_receive_barcode').val().length - 1];
                checkDocForReceive(barcode);
            } else {
                $('#modal_receive_name').val("");
                $('#modal_receive_desc').val("");
            }
        }
    });

    $('#modal_release_doc_info').hide();
    $mbcodeRelease = $('#modal_release_barcode').selectize({
        // create: true,
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

    $mbcodePos = $('#modal_bcode_pos').selectize({
        create: false,
        onChange: function (value) {
            let margin = $('#modal_bcode_margin').val();
            if (!margin) margin = 0;

            switch ($('#modal_bcode_pos').val()) {
                case 'top':
                    $('.barcode').css({ 'position': 'absolute', 'top': margin, 'bottom': '' });
                    break;
                case 'bottom':
                    $('.barcode').css({ 'position': 'absolute', 'top': '', 'bottom': margin });
                    break;
            }

        }
    });

    $('#modal_bcode_align').selectize({
        create: false,
        onChange: function (value) {
            switch (value) {
                case 'left':
                    $('.barcode').css({ 'position': 'absolute', 'left': '0', 'right': '', 'width': '' });
                    break;
                case 'right':
                    $('.barcode').css({ 'position': 'absolute', 'left': '', 'right': '0', 'width': '' });
                    break;
                case 'center':
                    $('.barcode').css({ 'position': 'absolute', 'left': '', 'right': '', 'width': '100%' });
                    break;
            }
        }
    });

    mtype_selectize = $mtype[0].selectize;
    mpriority_selectize = $mpriority[0].selectize;
    mdept_selectize = $mdept[0].selectize;
    mbcode_receive_selectize = $mbcodeReceive[0].selectize;
    mbcode_release_selectize = $mbcodeRelease[0].selectize;
    mbcode_position_selectize = $mbcodePos[0].selectize;

    document_selectize.trigger('change');
}

function refreshSelectize() {
    document_selectize.clearOptions();
    type_selectize.clearOptions();
    docno_selectize.clearOptions();

    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    const param = '?year=' + year + '&barcode=' + $('#document_filter').val() +
        '&type=' + $('#type_filter').val() + '&docno=' + $('#docno_filter').val() +
        '&department=' + $('.department').text() + '&user_id=' + $('.department').attr('id');

    const bcodeRoute = '/API/document/get_barcodes' + param;
    loadFilter(document_selectize, bcodeRoute);

    const typeRoute = '/API/document/get_types' + param;
    loadFilter(type_selectize, typeRoute);

    const docnoRoute = '/API/document/get_docno' + param;
    loadFilter(docno_selectize, docnoRoute);
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

                refreshFlag = true;
                document_selectize.trigger("change");

                const barcodes = [];
                barcodes.push(body.barcode);

                const log = {
                    year: body.year,
                    barcodes: barcodes,
                    from: "Origin",
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

function trackDocument(id, status) {
    $('.modal-title').html('Document Tracking');

    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    const param = '?year=' + year + '&id=' + id;

    fetch('/API/logs/get_logs' + param, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            populate_tracking(data, status);
        })
        .catch(err => {
            console.log(err);
        });
}

function checkDocForReceive(barcode) {
    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    const param = '?year=' + year + '&barcode=' + barcode;

    fetch('/API/document/check_document' + param, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            if (data.status != "error" && data.length > 0) {
                $('#modal_receive_name').val(data[0].name);
                $('#modal_receive_desc').val(data[0].description);
            } else {
                const text_error = "<div class='input-error'>"
                    + "<span class='error-text'>"
                    + barcode + " barcode does not exist"
                    + "</span>"
                    + "</div>"

                $('#receive_error_container').html(text_error);

                $('#modal_receive_name').val("");
                $('#modal_receive_desc').val("");
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function checkDocForRelease(barcode) {
    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    const param = '?year=' + year + '&barcode=' + barcode;

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
    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    let param = '?year=' + year;

    if (!$('#general_filter').val()) {
        param += '&barcode=' + $('#document_filter').val() +
            '&type=' + $('#type_filter').val() + '&docno=' + $('#docno_filter').val() +
            '&offset=' + offset + '&limit=' + 5 + '&department=' + $('.department').text() +
            '&user_id=' + $('.department').attr('id');
    } else {
        param += '&general=' + $('#general_filter').val().toLowerCase() + '&type=' + $('#type_filter').val() +
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

            if (refreshFlag) {
                refreshSelectize();
                refreshFlag = false;
            }
        })
        .catch(err => {
            console.log(err);
        });

}

function getPrintableSentout() {
    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    const body = {
        year: year,
        barcodes: $('#modal_release_barcode').val()
    };

    fetch('/API/document/get_release_sendout', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(data => {
            // populate_sendout(data);
            updateDocReleaseLog();
        })
        .catch(err => {
            console.log(err);
        });
}

function getSendOutDocuments() {
    const year = (new Date()).getFullYear();
    const date_to = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');

    const param = '?year=' + year + '&department=' + $('.department').text() +
        '&limit=0&date_from=' + date_from + '&date_to=' + date_to +
        '&name=' + $('.name').attr('id');

    fetch('/API/document/get_sendout' + param, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            if (!data.length) {
                $('#modalTblSendOut').addClass('d-none');
                $('#modal_no_sendout_container').removeClass('d-none');
                return;
            } else {
                $('#modalTblSendOut').removeClass('d-none');
                $('#modal_no_sendout_container').addClass('d-none');
            }

            if (data.length) {
                populateModalSendout(data);
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function getDocCount() {
    $('#loader_container').show();

    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    let param = '?year=' + year;

    if (!$('#general_filter').val()) {
        param += '&barcode=' + $('#document_filter').val() +
            '&type=' + $('#type_filter').val() + '&docno=' + $('#docno_filter').val() +
            '&department=' + $('.department').text() + '&user_id=' + $('.department').attr('id');
    } else {
        param += '&general=' + $('#general_filter').val() + '&type=' + $('#type_filter').val() +
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
    console.log(data);
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

function receiveDocument(barcodes) {
    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    const body = {
        year: year,
        barcodes: barcodes
    };

    fetch('/API/document/receive', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(data => {
            if (data.status == 'success') {
                toastr.success("Documents received.");
                $('#modal_receive').modal('hide');

                refreshFlag = true;
                document_selectize.trigger("change");
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function cancelRelease(document_id, did, uid) {
    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    const param = '?year=' + year + '&document_id=' + document_id +
        '&department=' + $('.department').text() + '&did=' + did + "&uid=" + uid;

    toastr.options.timeOut = 0;
    toastr.options.extendedTimeOut = 0;
    toastr.options.positionClass = "toast-top-center";
    toastr.warning('<div class="text-center"><label>Are you sure you want to cancel release?</label>'
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
                    fetch('/API/logs/delete' + param, { method: 'GET' })
                        .then(res => res.json())
                        .then(data => {
                            if (data.status == 'success') {
                                toastr.success("Release cancelled.");
                                $('#modal_track').modal('hide');
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
function endDocument(id) {
    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    const param = '?year=' + year + "&id=" + id + "&user_id=" + $('.department').attr('id')
        + "&status=Cycle End";

    toastr.options.timeOut = 0;
    toastr.options.extendedTimeOut = 0;
    toastr.options.positionClass = "toast-top-center";
    toastr.warning('<div class="text-center"><label>Are you sure you want to CYCLE END this item?</label>'
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
                                toastr.success("Document cycle ended.");
                                $('#modal_receive').modal('hide');
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

function recycleDocument(id) {
    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    const param = '?year=' + year + "&id=" + id + "&user_id=" + $('.department').attr('id')
        + "&status=Received";

    toastr.options.timeOut = 0;
    toastr.options.extendedTimeOut = 0;
    toastr.options.positionClass = "toast-top-center";
    toastr.warning('<div class="text-center"><label>Are you sure you want to RECYCLE this item?</label>'
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
                                toastr.success("Document recycled.");
                                $('#modal_receive').modal('hide');
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

function updateDocReceiveLog(barcodes) {
    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    const body = {
        year: year,
        barcodes: barcodes,
        receive_by: $('.name').attr('id'),
        department: $('.department').text()
    };

    fetch('/API/logs/update_receive', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(data => {
            if (data.status == 'success') {
                receiveDocument($('#modal_receive_barcode').val());
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function updateDocReleaseLog() {
    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    const body = {
        year: year,
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
                // print_sendout();

                // if (!date_from) date_from = moment().format('YYYY-MM-DD HH:mm:ss');

                getSendOutDocuments();

                $('#modal_add_release').prop('disabled', false);
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function deleteDocument(id) {
    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    let param = '?year=' + year + '&id=' + id;

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

function openReceiveModal(barcode) {
    $('#modal_receive').modal('show');

    mbcode_receive_selectize.setValue(barcode);
}

function openReleaseModal(barcode) {
    $('#modal_print_sendout').modal('show');

    // mbcode_release_selectize.setValue(barcode);
}

function insertLogs(body) {
    if (!body) {
        let departments = $('#modal_dept').val();

        let year = $('#year_filter').val();

        if (!year) year = (new Date()).getFullYear();

        body = {
            year: year,
            from: $('.department').text(),
            barcodes: $('#modal_release_barcode').val(),
            remarks: $('#modal_release_remarks').val(),
            triggerReceive: false,
            updateLocation: false
        };

        if (typeof $('#modal_dept').val() == 'string') {
            body['department'] = $('#modal_dept').val();
            body['updateLocation'] = true;
            fetchLogInsert(body);
        } else {
            for (let i = 0; i < departments.length; i++) {
                body['department'] = departments[i];

                if (i == departments.length - 1) {
                    body['updateLocation'] = true;
                }

                fetchLogInsert(body);
            }
        }
    } else {
        body['triggerReceive'] = true;
        fetchLogInsert(body)
    }
}

function fetchLogInsert(body) {
    fetch('/API/logs/insert', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(data => {
            if (data.status == 'success') {
                if (body.triggerReceive)
                    updateDocReceiveLog(body.barcodes);
                else if (body.updateLocation) {
                    if (typeof $('#modal_dept').val() != 'string' && $('#modal_dept').val().length > 1) {
                        body['department'] = "Many";
                    }

                    updateDocLocation(body);
                }
            }
        })
        .catch(err => {
            console.log(err);
        });
}
// function updateLogs() {
//     const body = {
//         receive_by: "Mark Vincent Opo",
//         department: "IT Office"
//     };

//     fetch('/API/logs/update', {
//         method: 'POST',
//         body: JSON.stringify(body),
//         headers: { 'Content-Type': 'application/json' }
//     })
//         .then(res => res.json())
//         .then(data => {
//             if (data.status == 'success') {
//                 updateDocLocation(body);
//             }
//         })
//         .catch(err => {
//             console.log(err);
//         });
// }

function populate_table(data) {
    let due_documents = [];
    let table_data = '';
    for (let i = 0; i < data.length; i++) {
        table_data += "<tr id='" + data[i].barcode + "' class='tr-shadow'>"
            + "<td> "
            + "<button class='btn btn-outline-success' onclick='trackDocument(" + data[i].id + "," + JSON.stringify(data[i].status) + " )'> Track </button>";

        if (data[i].status != "Cycle End") {
            if (data[i].created_by == $(".department").attr('id')) {
                table_data += "<button class='btn btn-outline-success ml-1' onclick='editBarcodeSetting(" + JSON.stringify(data[i].barcode) + ")'>"
                    + '<i class="zmdi zmdi-print"></i>'
                    + " </button>";
            }
        }
        // if ((!data[i].location || data[i].location == $(".department").text()) && data[i].status != "Cycle End") {
        //     if (data[i].status == 'Received' || !data[i].location)
        //         table_data += "<button class='btn btn-outline-success m-l-5' onclick='openReleaseModal(" + JSON.stringify(data[i].barcode) + ")'> Release </button>";
        //     else if (data[i].status == 'Pending' && data[i].location)
        //         table_data += "<button class='btn btn-outline-success m-l-5' onclick='openReceiveModal(" + JSON.stringify(data[i].barcode) + ")'> Receive </button>";
        // }

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
            priority_duration = 48;
            table_data += "<td><button id='priority_view' class='btn btn-primary mnw-116'>" + data[i].priority + "</button></td>";
        } else if (data[i].priority == "Urgent") {
            priority_duration = 2;
            table_data += "<td><button id='priority_view' class='btn btn-danger mnw-116'>" + data[i].priority + "</button></td>";
        }

        if (data[i].location == $(".department").text() && data[i].status == "Received") {
            let now = new Date();
            const lapse_date = new Date(data[i].lapse_at);

            const hours_diff = Math.abs(now - lapse_date) / 36e5;

            if (hours_diff > priority_duration) {
                if (data[i].status != "Cycle End") {
                    due_documents.push(data[i].barcode);
                }
            }

            let date_diff = Math.abs(now - lapse_date) / 1000;

            const days = Math.floor(date_diff / 86400);
            date_diff -= days * 86400;

            const hours = Math.floor(date_diff / 3600) % 24;
            date_diff -= hours * 3600;

            const minutes = Math.floor(date_diff / 60) % 60;
            date_diff -= minutes * 60;

            let remaining_time = "";

            if (days || hours || minutes) {
                if (days) remaining_time += days + " day(s)<br>";
                if (hours) remaining_time += hours + " hr(s)<br>";
                if (minutes) remaining_time += minutes + " min(s)";
            } else {
                remaining_time = 'Few seconds ago'
            }

            table_data += "<td name = 'duration'>" + remaining_time + "</td>";
        } else {
            table_data += "<td name = 'duration'>N/A</td>";
        }


        table_data += "<td >" + data[i].remarks + "</td>"
            + "<td>"
            + "<div class='table-data-feature'>"

        if (data[i].status != "Cycle End") {
            // if (data[i].created_by == $(".department").attr('id')) {
            //     table_data += "<button class='item' data-toggle='tooltip' data-placement='top' title='Print' onclick='editBarcodeSetting(" + JSON.stringify(data[i].barcode) + ")'>"
            //         + '<i class="zmdi zmdi-print"></i>'
            //         + " </button>"
            //         // + "<button class='item' data-toggle='tooltip' data-placement='top' title='Delete' onclick='deleteDocument(" + data[i].id + ")'>"
            //         // + "<i class='zmdi zmdi-delete'></i>"
            //         // + " </button>";
            // }

            if ((data[i].location == $(".department").text() && data[i].status == "Received") || data[i].location == '') {
                table_data += "<button class='item' data-toggle='tooltip' data-placement='top' title='Cycle End' onclick='endDocument(" + data[i].id + ")'>"
                    + "<i class='zmdi zmdi-refresh-sync-off'></i>"
                    + " </button>";
            }
        } else if ($('.department').attr('id') == data[i].updated_by) {
            table_data += "<button class='item' data-toggle='tooltip' data-placement='top' title='Recycle' onclick='recycleDocument(" + data[i].id + ")'>"
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

// function populate_table(data) {
//     let due_documents = [];
//     let table_data = '';
//     for (let i = 0; i < data.length; i++) {
//         table_data += "<tr id='" + data[i].barcode + "' class='tr-shadow'>"
//             + "<td> "
//             + "<button class='btn btn-outline-success' onclick='trackDocument(" + data[i].id + "," + JSON.stringify(data[i].status) + " )'> Track </button>";

//         // if ((!data[i].location || data[i].location == $(".department").text()) && data[i].status != "Cycle End") {
//         //     if (data[i].status == 'Received' || !data[i].location)
//         //         table_data += "<button class='btn btn-outline-success m-l-5' onclick='openReleaseModal(" + JSON.stringify(data[i].barcode) + ")'> Release </button>";
//         //     else if (data[i].status == 'Pending' && data[i].location)
//         //         table_data += "<button class='btn btn-outline-success m-l-5' onclick='openReceiveModal(" + JSON.stringify(data[i].barcode) + ")'> Receive </button>";
//         // }

//         table_data += "</td>"
//             + "<td>"
//             + "<span class='btn btn-link' onclick='editDocument(" + JSON.stringify(data[i]) + ")'>" + data[i].barcode + "</span>"
//             + "</td>"
//             + "<td>" + data[i].document_no + "</td>"
//             + "<td>" + data[i].name + "</td>"
//             + "<td>" + data[i].description + "</td>"
//             + "<td>" + data[i].type + "</td>";

//         let priority_duration = 0;

//         if (data[i].priority == "Regular") {
//             priority_duration = 240;
//             table_data += "<td><button id='priority_view' class='btn btn-primary mnw-116'>" + data[i].priority + "</button></td>";
//         } else if (data[i].priority == "Urgent") {
//             priority_duration = 120;
//             table_data += "<td><button id='priority_view' class='btn btn-danger mnw-116'>" + data[i].priority + "</button></td>";
//         }

//         let now = new Date();
//         const created_date = new Date(data[i].created_at);

//         const hours_diff = Math.abs(now - created_date) / 36e5;

//         if (hours_diff > priority_duration && data[i].location == $(".department").text()) {
//             if (data[i].status != "Cycle End") {
//                 due_documents.push(data[i].barcode);
//             } else {
//                 now = new Date(data[i].updated_at);
//             }
//         }

//         let date_diff = Math.abs(now - created_date) / 1000;

//         const days = Math.floor(date_diff / 86400);
//         date_diff -= days * 86400;

//         const hours = Math.floor(date_diff / 3600) % 24;
//         date_diff -= hours * 3600;

//         const minutes = Math.floor(date_diff / 60) % 60;
//         date_diff -= minutes * 60;

//         let remaining_time = "";
//         if (minutes) remaining_time = minutes + " min(s)";
//         if (hours) remaining_time = hours + " hr(s)<br>" + remaining_time;
//         if (days) remaining_time = days + " day(s)<br>" + remaining_time;

//         table_data += "<td name = 'duration'>" + remaining_time + "</td>";

//         table_data += "<td >" + data[i].remarks + "</td>"
//             + "<td>"
//             + "<div class='table-data-feature'>"

//         if (data[i].status != "Cycle End") {
//             if (data[i].created_by == $(".department").attr('id')) {
//                 table_data += "<button class='item' data-toggle='tooltip' data-placement='top' title='Print' onclick='editBarcodeSetting(" + JSON.stringify(data[i].barcode) + ")'>"
//                     + '<i class="zmdi zmdi-print"></i>'
//                     + " </button>"
//                     // + "<button class='item' data-toggle='tooltip' data-placement='top' title='Delete' onclick='deleteDocument(" + data[i].id + ")'>"
//                     // + "<i class='zmdi zmdi-delete'></i>"
//                     + " </button>";
//             }

//             if (data[i].location == $(".department").text() && data[i].status == "Received") {
//                 table_data += "<button class='item' data-toggle='tooltip' data-placement='top' title='Cycle End' onclick='endDocument(" + data[i].id + ")'>"
//                     + "<i class='zmdi zmdi-refresh-sync-off'></i>"
//                     + " </button>";
//             }
//         } else if ($('.department').attr('id') == data[i].updated_by) {
//             table_data += "<button class='item' data-toggle='tooltip' data-placement='top' title='Recycle' onclick='recycleDocument(" + data[i].id + ")'>"
//                 + "<i class='zmdi zmdi-refresh-sync-alert'></i>"
//                 + " </button>";
//         }

//         table_data += "</div>"
//             + " </td>"
//             + " </tr>"
//             + "<tr class='spacer'></tr>";
//     }

//     $('#table_data').html(table_data);

//     for (let i = 0; i < due_documents.length; i++) {
//         const id = "tr#" + due_documents[i];
//         $(id).addClass("background-due");
//         // $(id + ' td').addClass("text-white");
//     }


//     $('#loader_container').hide();
// }

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

function populate_tracking(data, status) {
    let table_data = '';
    for (let i = 0; i < data.length; i++) {
        table_data += "<tr class='tr-shadow'>"
            + "<td class='desc'>" + data[i].release_to + "</td>";

        if (data[i].receive_by)
            table_data += "<td>" + data[i].receive_by + "</td>";
        else table_data += "<td><span class='block-email'>Pending</span></td>";

        if (data[i].receive_date) {
            const dateTime = (data[i].receive_date).split('T');

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

        if (data[i].receive_date && data[i].release_date) {
            const date_release = new Date(data[i].release_date);
            const date_receive = new Date(data[i].receive_date);

            let date_diff = Math.abs(date_release - date_receive) / 1000;

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
            + "<td>" + data[i].remarks + "</td>";

        if (i == data.length - 1) {
            if (status == 'Cycle End') {
                table_data += `<td></td></tr>
                            <tr class='spacer'></tr>
                            <tr class="tr-shadow">
                                <td style='color: red; font-weight: bold;'>CYCLE END</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>`;
            } else if (!data[i].receive_by && status != "Origin" && data[i - 1].release_by == $('.name').attr("id")) {
                table_data += `<td>
                                <span onClick="cancelRelease(` + data[i].document_id + `,` + data[i].id + `,` + data[i - 1].id + `)">x</span>
                            </td>
                            </tr>
                            <tr class='spacer'></tr>`;
            } else {
                table_data += `<td></td></tr>
                            <tr class='spacer'></tr>`;
            }
        } else {
            table_data += `<td></td></tr>
                            <tr class='spacer'></tr>`;
        }
    }

    $('#track_data').html(table_data);
    $('#modal_track').modal('show');
}

function populate_sendout(data) {

    let table_data = `  <tr>
                            <td class="p-l-10 p-t-20 p-b-5 text-left">` + $('#modal_dept').val() + `</td>
                        </tr>`;

    for (let i = 0; i < data.length; i++) {
        const release_date = moment(data[i].release_date).format('MM/DD/YY hh:mm a');

        table_data += `<tr>
                            <td class="p-l-20 text-left">` + (i + 1) + `. ` + data[i].barcode + `</td>
                            <td>` + data[i].name + `</td>
                            <td>` + data[i].type + `</td>
                            <td>` + release_date + `</td>
                            <td class="border-bottom"></td>
                            <td class="border-bottom"></td>
                        </tr>`;
    }

    $('#sendout_doc_tbody').html(table_data);
}

function populateModalSendout(data) {
    let table_data = "";
    let ctr = 1;

    for (let i = 0; i < data.length; i++) {
        const date = moment(data[i].created_at).format('MM/DD/YYYY');
        const time = moment(data[i].created_at).format('hh:mm a');

        if (!table_data.includes(data[i].release_to)) {
            ctr = 1;

            table_data += `<tr>
                            <td class="p-t-20 p-b-5 text-left"><b>` + data[i].release_to + `</b></td>
                            <td class="p-t-20 p-b-5 text-left">` + date + `</td>
                        </tr>`;
        }

        table_data += `<tr>
                            <td class="p-l-20 text-left">` + (ctr++) + `. ` + data[i].barcode + `</td>
                            <td>` + data[i].name + `</td>
                            <td>` + data[i].type + `</td>
                            <td>` + time + `</td>
                            <td class="border-bottom"></td>
                            <td class="border-bottom"></td>
                        </tr>`;
    }

    $('#modal_sendout_tbody').html(table_data);
}

// function populateModalSendout(data) {
//     data = data.reverse();

//     let table_data = "";
//     let ctr = 1, groupClass = 0;

//     for (let i = 0; i < data.length; i++) {
//         const date = moment(data[i].release_date).format('MM/DD/YY hh:mm a');

//         if (!table_data.includes(data[i].release_to)) {
//             groupClass += 1;
//             ctr = 1;

//             table_data += `  <tr class='` + groupClass + `'>
//                             <td class="p-l-10 p-t-20 p-b-5 text-left"><b>` + data[i].release_to + `</b></td>
//                             <td class="p-t-20 p-b-5 text-left"><b>` + date + `</b></td>
//                         </tr>`;
//         }

//         table_data += `<tr class='` + groupClass + `'>
//                             <td class="p-l-20 text-left">` + (ctr++) + `. ` + data[i].barcode + `</td>
//                             <td>` + data[i].name + `</td>
//                             <td>` + data[i].type + `</td>
//                             <td class="align-bottom">____________</td>
//                             <td class="align-bottom">____________</td>
//                         </tr>`;
//     }

//     $('#modal_sendout_tbody').html(table_data);
// }

function print_sendout() {
    $('#printed_by').html("Printed By: " + $('.department').text());
    printJS({
        printable: 'modal_printable',
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

function getThreeDigitFormat(num) {
    if (num < 10) num = "00" + num;
    else if (num < 100) num = "0" + num

    return num;
}

function getDateDiff(startdate, enddate) {
    const mstart = moment(startdate);
    const mend = moment(enddate);

    let totalHoursDiff = 0;
    let totalMinsDiff = 0;
    let totalSecsDiff = 0;
    const mend_day = mend.format('D');

    for (let i = mstart.format('D'); i <= mend_day; i++) {
        const mstart_hour = mstart.format('H');
        const mend_hour = mend.format('H');

        if (i != mend_day) {
            if (mstart_hour < 17) {
                totalHoursDiff = totalHoursDiff + (17 - mstart_hour);
            }
        } else {

        }

        mstart_hour.add(1, 'days');
    }
}

function editBarcodeSetting(code) {
    JsBarcode(".barcode", code, {
        format: "CODE128A",
        lineColor: "#000",
        width: 1,
        height: 50,
        marginBottom: 10,
        marginTop: 15,
        displayValue: true,
        textPosition: "top",
        fontSize: 15
    });

    const $barcode = $('#barcode_container').html();

    $('#modal_bcode_container').html($barcode);

    $('.barcode').css({ 'position': 'absolute', 'top': '0', 'right': '0' });

    $('#modal_print_bcode').modal('show');
}

function printBarcode() {
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
        + "<div>" + $barcode + "</div>"
        + "</body>"
        + "</html>"
    );
    pwa.document.close();
}