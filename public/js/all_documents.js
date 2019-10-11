let document_selectize, type_selectize, docno_selectize, general_selectize;

(function ($) {
    selectizeFilter();
})(jQuery);

function selectizeFilter() {
    let $documents, $type, $docno, $general;

    let options = '';
    for (let i = new Date().getFullYear() - 1; i > 2017; i--) {
        options += `<option value="` + i + `">` + i + `</option>`;
    }

    $('#year_filter').append(options);
    $('#year_filter').selectize({
        onChange: function (value) {
            refreshSelectize();
        }
    });
    
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

    refreshSelectize();
}

function refreshSelectize() {
    document_selectize.clearOptions();
    type_selectize.clearOptions();
    docno_selectize.clearOptions();

    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    const param = '?year=' + year + '&barcode=' + $('#document_filter').val() +
        '&type=' + $('#type_filter').val() + '&docno=' + $('#docno_filter').val();

    const bcodeRoute = '/API/all_document/get_barcodes' + param;
    loadFilter(document_selectize, bcodeRoute);

    const typeRoute = '/API/all_document/get_types' + param;
    loadFilter(type_selectize, typeRoute);

    const docnoRoute = '/API/all_document/get_docno' + param;
    loadFilter(docno_selectize, docnoRoute);

    getDocCount();
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

function getDocCount() {
    $('#loader_container').show();

    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    const param = '?year=' + year + '&barcode=' + $('#document_filter').val() +
        '&type=' + $('#type_filter').val() + '&docno=' + $('#docno_filter').val() +
        '&general=' + $('#general_filter').val();

    fetch('/API/all_document/get_count' + param, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            populate_pager(data[0].count);
        })
        .catch(err => {
            console.log(err);
        });
}

function getDocuments(offset) {
    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    const param = '?year=' + year + '&barcode=' + $('#document_filter').val() +
        '&type=' + $('#type_filter').val() + '&docno=' + $('#docno_filter').val() +
        '&general=' + $('#general_filter').val() + '&offset=' + offset + '&limit=5';

    fetch('/API/all_document/get_documents' + param, { method: 'GET' })
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

function editDocument(data) {
    $('.modal-title').text('Edit Document');
    $('#modal_document').modal('show');

    if (data.created_by != $('.department').attr('id')) {
        $('#modal_add').hide();
    }

    $('#modal_name').val(data.name);
    $('#modal_docno').val(data.document_no);

    $('#modal_type').val(data.type);
    $('#modal_priority').val(data.priority);

    $('#modal_description').val(data.description);
    $('#modal_remarks').val(data.remarks);
}

function trackDocument(id, status) {
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

function populate_table(data) {
    let due_documents = [];
    let table_data = '';
    for (let i = 0; i < data.length; i++) {
        table_data += "<tr id='" + data[i].barcode + "' class='tr-shadow'>"
            + "<td> "
            + "<button class='btn btn-outline-success' onclick='trackDocument(" + data[i].id + "," + JSON.stringify(data[i].status) + " )'> Track </button>";

        table_data += "</td>"
            + "<td>"
            + "<span class='btn btn-link' onclick='editDocument(" + JSON.stringify(data[i]) + ")'>" + data[i].barcode + "</span>"
            + "</td>"
            + "<td>" + data[i].document_no + "</td>"
            + "<td>" + data[i].name + "</td>"
            + "<td>" + data[i].description + "</td>"
            + "<td>" + data[i].type + "</td>";

        // let priority_duration = 0;

        if (data[i].priority == "Regular") {
            // priority_duration = 48;
            table_data += "<td><button id='priority_view' class='btn btn-primary mnw-116'>" + data[i].priority + "</button></td>";
        } else if (data[i].priority == "Urgent") {
            // priority_duration = 2;
            table_data += "<td><button id='priority_view' class='btn btn-danger mnw-116'>" + data[i].priority + "</button></td>";
        }

        // if (data[i].location == $(".department").text() && data[i].status == "Received") {
        //     let now = new Date();
        //     const lapse_date = new Date(data[i].lapse_at);

        //     const hours_diff = Math.abs(now - lapse_date) / 36e5;

        //     if (hours_diff > priority_duration) {
        //         if (data[i].status != "Cycle End") {
        //             due_documents.push(data[i].barcode);
        //         }
        //     }

        //     let date_diff = Math.abs(now - lapse_date) / 1000;

        //     const days = Math.floor(date_diff / 86400);
        //     date_diff -= days * 86400;

        //     const hours = Math.floor(date_diff / 3600) % 24;
        //     date_diff -= hours * 3600;

        //     const minutes = Math.floor(date_diff / 60) % 60;
        //     date_diff -= minutes * 60;

        //     let remaining_time = "";
        //     if (minutes) remaining_time = minutes + " min(s)";
        //     if (hours) remaining_time = hours + " hr(s)<br>" + remaining_time;
        //     if (days) remaining_time = days + " day(s)<br>" + remaining_time;

        //     table_data += "<td name = 'duration'>" + remaining_time + "</td>";
        // } else {
            table_data += "<td class='d-none' name='duration'>N/A</td>";
        // }


        table_data += "<td >" + data[i].remarks + "</td>"
            + "<td>"
            + "<div class='table-data-feature'>";

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
//             + "<button class='btn btn-outline-success' onclick='trackDocument(" + data[i].id + "," + JSON.stringify(data[i].status) + ")'> Track </button>";

//         table_data += "</td>"
//             + "<td>"
//             + "<span class='btn btn-link'>" + data[i].barcode + "</span>"
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

//         if (hours_diff > priority_duration) {
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
//             + "<div class='table-data-feature'></div>"
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