let recent_date_from, recent_date_to;
let sendout_date_from, sendout_date_to;
let reports_date_from, reports_date_to;
let types_date_from, types_date_to;
let should_print;
let pending_count, receive_count, release_count;
let mgensearch_selectize;
let pendingChart, receiveChart, sendoutChart, totalChart, typeChart;
let exportFlag = false;

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

    const currentYear = (new Date()).getFullYear();
    const startdate = new Date("1/1/" + currentYear);

    recent_date_from = moment(startdate.valueOf()).format('YYYY-MM-DD HH:mm:ss');
    recent_date_to = moment().format('YYYY-MM-DD HH:mm:ss');

    sendout_date_from = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    sendout_date_to = recent_date_to;

    reports_date_from = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss');
    reports_date_to = recent_date_to;

    types_date_from = reports_date_from;
    types_date_to = moment().endOf('month').format('YYYY-MM-DD HH:mm:ss');

    let options = '';
    for (let i = new Date().getFullYear() - 1; i > 2017; i--) {
        options += `<option value="` + i + `">` + i + `</option>`;
    }

    $('#reports_type_filter').selectize({
        onChange: function (value) {
            $('#reports_tbody').html('');
            $('.table-load-more-reports').show();
            getReports(0, 5);
        }
    });

    $('#year_filter').append(options);
    $('#year_filter').selectize({
        onChange: function (value) {
            $('#recent_doc_tbody').html('');
            $('#sendout_doc_tbody').html('');
            $('#reports_tbody').html('');

            pendingChart.destroy();
            receiveChart.destroy();
            sendoutChart.destroy();
            totalChart.destroy();
            typeChart.destroy();

            loadData();
        }
    });

    loadData();

    const $summary = $('#month_filter').selectize({
        onChange: function (value) {
            types_date_from = moment().month(value).startOf('month').format('YYYY-MM-DD HH:mm:ss');
            types_date_to = moment().month(value).endOf('month').format('YYYY-MM-DD HH:mm:ss');

            getTypeGraphData();
        }
    });

    const month = moment().format('MMMM');
    $summary[0].selectize.setValue(month);


    $('#load_more_btn').click(function () {
        getRecentDocuments($('#tblRecentDocs tr').length - 1, 5);
    });

    $('#load_more_sendout').click(function () {
        getSendOutDocuments($('.table-load-more-sendout').attr('id'), 5);
    });

    $('#load_more_reports').click(function () {
        getReports($('#reports_tbody tr').length, 5);
    });

    $('#recent_daterange').daterangepicker({
        startDate: startdate,
        endDate: moment(),
        timePicker: true,
        locale: {
            format: 'MM/DD/YYYY HH:mm:ss'
        },
        opens: 'right'
    }, function (start, end, label) {
        recent_date_from = start.format('YYYY-MM-DD HH:mm:ss');
        recent_date_to = end.format('YYYY-MM-DD HH:mm:ss');

        $('#recent_doc_tbody').html('');
        $('.table-load-more').show();
        getRecentDocuments(0, 5);
    });

    $('#sendout_daterange').daterangepicker({
        startDate: moment().startOf('day'),
        endDate: moment(),
        timePicker: true,
        locale: {
            format: 'MM/DD/YYYY HH:mm:ss'
        },
        opens: 'right'
    }, function (start, end, label) {
        sendout_date_from = start.format('YYYY-MM-DD HH:mm:ss');
        sendout_date_to = end.format('YYYY-MM-DD HH:mm:ss');

        $('.table-load-more-sendout').attr('id', 0);
        $('#sendout_doc_tbody').html('');
        $('.table-load-more-sendout').show();
        getSendOutDocuments(0, 5);
    });

    $('#reports_daterange').daterangepicker({
        startDate: moment().startOf('month'),
        endDate: moment(),
        timePicker: true,
        locale: {
            format: 'MM/DD/YYYY HH:mm:ss'
        },
        opens: 'right'
    }, function (start, end, label) {
        reports_date_from = start.format('YYYY-MM-DD HH:mm:ss');
        reports_date_to = end.format('YYYY-MM-DD HH:mm:ss');

        $('#reports_tbody').html('');
        $('.table-load-more-reports').show();
        getReports(0, 5);
    });

    $('#print_recent').click(function () {
        $('#loader_container_dashboard').removeClass('d-none');

        $('#tblContainerD').addClass('table table-data3');

        $('#recent_doc_tbody').html('');
        $('.table-load-more').show();
        getRecentDocuments(0, '');

        const startdate = moment(recent_date_from).format('DD/MM/YY');
        const enddate = moment(recent_date_to).format('DD/MM/YY');

        $('#printable_title').html('Recent Documents');
        $('#printable_date').text(startdate + " - " + enddate);
        $('#printed_by').html("Printed by: " + $('.department').text());
        $('#printed_date').html("Printed date: " + moment().format('MM/DD/YY HH:mm a'));
    });

    $('#print_sendout').click(function () {
        $('#loader_container_dashboard').removeClass('d-none');

        $('#tblContainerD').removeClass('table table-data3');

        $('.table-load-more-sendout').attr('id', 0);
        $('#sendout_doc_tbody').html('');
        $('.table-load-more-sendout').show();
        getSendOutDocuments(0, '');

        // const startdate = moment(sendout_date_from).format('MM/DD/YY');
        // const enddate = moment(sendout_date_to).format('MM/DD/YY');

        $('#printable_title').html('Send Out Report');
        $('#printable_date').hide();
        $('#printed_by').html("Printed by: " + $('.department').text());
        $('#printed_date').html('');
    });

    $('#print_reports').click(function () {

        $('#loader_container_dashboard').removeClass('d-none');

        $('#tblContainerD').removeClass('table table-data3');

        $('.table-load-more-reports').attr('id', 0);
        $('#reports_tbody').html('');
        $('.table-load-more-reports').show();
        getReports(0, '');

        const month_from = moment(reports_date_from).format('MM/DD/YYYY');
        const month_to = moment(reports_date_to).format('MM/DD/YYYY');
        // const year = moment(reports_date_from).format('YYYY');

        // let date = "";
        // if (month_from != month_to) {
        //     date = month_from + " - " + month_to;
        // } else {
        //     date = month_from;
        // }

        $('#printable_title').html('MONITORING TOOL');
        $('#printable_date').html(month_from + " - " + month_to);
        $('#printed_by').html("<br>Printed by: " + $('.department').text());
        $('#printed_date').html('');
    });

    if ($('.access-rights').attr('id') != '1') {
        $('#nav_all_docs').remove();
        $('#nav_all_docs_mobile').remove();
    }

    $('#export_reports').click(function () {
        exportFlag = true;
        $('#print_reports').click();
    });
})(jQuery);

function loadData() {
    getRecentDocuments(0, 5);
    getSendOutDocuments(0, 5);
    getReports(0, 5);

    getPendingGraphData();
    getReceiveGraphData();
    getReleaseGraphData();
    //getTypeGraphData();
}

function getRecentDocuments(offset, limit) {
    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    const param = '?year=' + year + '&department=' + $('.department').text() + "&offset=" + offset +
        "&limit=" + limit + "&date_from=" + recent_date_from + "&date_to=" + recent_date_to;

    fetch('/API/logs/get_log_history' + param, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            if (!data.length && $('#recent_doc_tbody tr').length < 1) {
                $('#recent_table_container').addClass('d-none');
                $('.table-load-more').addClass('d-none');
                $('#recent_no_see_container').removeClass('d-none');
                return;
            } else {
                $('#recent_table_container').removeClass('d-none');
                $('.table-load-more').removeClass('d-none');
                $('#recent_no_see_container').addClass('d-none');
            }

            if (limit) {
                should_print = false;
            } else {
                should_print = true;
            }


            if (data.length < 5) {
                $('.table-load-more').hide();
            }

            if (data.length) {
                populateRecentDocs(data);
            } else {
                if (offset) toastr.error("Nothing more to load.");
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function getSendOutDocuments(offset, limit) {
    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    const param = '?year=' + year + '&department=' + $('.department').text() + "&offset=" + offset +
        "&limit=" + limit + "&date_from=" + sendout_date_from + "&date_to=" + sendout_date_to;

    fetch('/API/document/get_sendout' + param, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            if (!data.length && $('#sendout_doc_tbody tr').length < 1) {
                $('#sendout_table_container').addClass('d-none');
                $('.table-load-more-sendout').addClass('d-none');
                $('#sendout_no_see_container').removeClass('d-none');
                return;
            } else {
                $('#sendout_table_container').removeClass('d-none');
                $('.table-load-more-sendout').removeClass('d-none');
                $('#sendout_no_see_container').addClass('d-none');
            }

            if (limit) {
                should_print = false;
            } else {
                should_print = true;
            }


            if (data.length < 5) {
                $('.table-load-more-sendout').hide();
            }

            if (data.length) {
                let offsetCtr = $('.table-load-more-sendout').attr('id');

                if (offsetCtr) {
                    $('.table-load-more-sendout').attr('id',
                        parseInt(offsetCtr) + data.length);
                } else {
                    $('.table-load-more-sendout').attr('id', data.length);
                }

                populateSendOutDocs(data);
            } else {
                hideSendOutInfo();
                if (offset) toastr.error("Nothing more to load.");
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function getReports(offset, limit) {
    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    const param = '?year=' + year + '&department=' + $('.department').text() + "&offset=" + offset +
        "&limit=" + limit + "&date_from=" + reports_date_from + "&date_to=" + reports_date_to +
        "&type=" + $('#reports_type_filter').val();

    fetch('/API/logs/get_reports' + param, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            if (!data.length && $('#reports_tbody tr').length < 1) {
                $('#reports_table_container').addClass('d-none');
                $('.table-load-more-reports').addClass('d-none');
                $('#reports_no_see_container').removeClass('d-none');
                return;
            } else {
                $('#reports_table_container').removeClass('d-none');
                $('.table-load-more-reports').removeClass('d-none');
                $('#reports_no_see_container').addClass('d-none');
            }

            if (limit) {
                should_print = false;
            } else {
                should_print = true;
            }


            if (data.length < 5) {
                $('.table-load-more-reports').hide();
            }

            if (data.length) {
                populateReports(data);
            } else {
                toastr.error("Nothing more to load.");
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function getPendingGraphData() {
    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    const param = '?year=' + year + '&department=' + $('.department').text();

    fetch('/API/document/get_pending_graph_data' + param, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            pending_count = data.pending_counts;

            populatePendingGraph();
        })
        .catch(err => {
            console.log(err);
        });
}

function getReceiveGraphData() {
    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    const param = '?year=' + year + '&department=' + $('.department').text();

    fetch('/API/document/get_receive_graph_data' + param, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            receive_count = data.receive_counts;
            calculateTotal();

            populateReceiveGraph();
        })
        .catch(err => {
            console.log(err);
        });
}

function getReleaseGraphData() {
    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    const param = '?year=' + year + '&department=' + $('.department').text();

    fetch('/API/document/get_release_graph_data' + param, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            release_count = data.release_counts;
            calculateTotal();

            populateReleaseGraph(release_count);
        })
        .catch(err => {
            console.log(err);
        });
}

function getTypeGraphData() {
    let year = $('#year_filter').val();

    if (!year) year = (new Date()).getFullYear();

    const param = '?year=' + year + '&department=' + $('.department').text() +
        "&date_from=" + types_date_from + "&date_to=" + types_date_to;;

    fetch('/API/document/get_types_count' + param, { method: 'GET' })
        .then(res => res.json())
        .then(data => {

            let types = [];
            let counts = [];

            if (data.status != 'error') {
                for (let i = 0; i < data.length; i++) {
                    types.push(data[i].type);
                    counts.push(data[i].count);
                }
            }

            populateTypeGraph(types, counts);
        })
        .catch(err => {
            console.log(err);
        });
}

function calculateTotal() {
    if (receive_count && release_count) {

        let total = [];

        for (let i = 0; i < receive_count.length; i++) {
            total.push(receive_count[i] + release_count[i]);
        }

        populateTotalGraph(total);
    }
}

function populateRecentDocs(data) {
    let table_data = $('#recent_doc_tbody').html();

    // if(!table_data) table_data = "";

    for (let i = 0; i < data.length; i++) {
        let receive_date = "", release_date = "";

        if (data[i].receive_date) {
            receive_date = (data[i].receive_date).replace("T", "<br>");
            receive_date = receive_date.replace(".000Z", "");
        }

        if (data[i].release_date) {
            release_date = (data[i].release_date).replace("T", "<br>");
            release_date = release_date.replace(".000Z", "");
        }

        table_data += `<tr>
                            <td>`+ data[i].barcode + `</td>
                            <td>` + data[i].release_from + `</td>`;;

        if (data[i].receive_by)
            table_data += `<td>` + data[i].receive_by + `</td>`;
        else
            table_data += `<td><span class='block-email'>Pending</span></td>`;

        if (receive_date)
            table_data += `<td>` + receive_date + `</td>`;
        else
            table_data += `<td><span class='block-email'>Pending</span></td>`;

        if (release_date)
            table_data += `<td>` + release_date + `</td>`;
        else
            table_data += `<td><span class='block-email'>Pending</span></td>`;


        table_data += `<td>` + data[i].remarks + `</td>
                        </tr>`
    }

    $('#recent_doc_tbody').html(table_data);

    if (should_print) {
        $('#tblContainerD').html($('#tblRecentDocs').html());

        printJS({
            printable: 'printable_div',
            type: 'html',
            honorColor: true,
            targetStyles: ['*']
        })

        $('#tblContainerD').html('');
        $('#recent_doc_tbody').html('');
        $('.table-load-more').show();
        getRecentDocuments(0, 5);

        $('#loader_container_dashboard').addClass('d-none');
    }
}

function populateSendOutDocs(data) {
    let table_data = $('#sendout_doc_tbody').html();
    let ctr = 1;

    for (let i = 0; i < data.length; i++) {
        const date = moment(data[i].created_at).format('MM/DD/YYYY');
        const time = moment(data[i].created_at).format('hh:mm a');

        const dept = `<td class="p-t-20 p-b-5 text-left"><b>` + data[i].release_to + `</b></td>
                        <td class="p-t-20 p-b-5 text-left">` + date + `</td>`;

        if (!table_data.includes(dept)) {
            ctr = 1;

            table_data += `<tr>` + dept + `</tr>`;
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

    $('#sendout_doc_tbody').html(table_data);
    hideSendOutInfo();

    if (should_print) {
        showSendOutInfo();
        $('#tblContainerD').html($('#tblSendOut').html());

        printJS({
            printable: 'printable_div',
            type: 'html',
            marginLeft: 0,
            marginRight: 0,
            honorColor: true,
            targetStyles: ['*']
        })

        $('.table-load-more-sendout').attr('id', 0);
        $('#tblContainerD').html('');
        $('#sendout_doc_tbody').html('');
        $('.table-load-more-sendout').show();
        getSendOutDocuments(0, 5);

        $('#loader_container_dashboard').addClass('d-none');
    }
}

function populateReports(data) {
    let table_data = $('#reports_tbody').html();
    let ctr = $('#reports_tbody tr').length;

    for (let i = 0; i < data.length; i++) {
        // const receive_date = moment(data[i].receive_date).format('YYYY-MM-DD');
        // const receive_time = moment(data[i].receive_date).format('HH:mm:ss');

        // // let release_date = '', release_time = '';
        // // if (data[i].release_date) {
        // const release_date = moment(data[i].release_date).format('YYYY-MM-DD');
        // const release_time = moment(data[i].release_date).format('HH:mm:ss');
        // // }

        let startarr = data[i].receive_date.split('T');
        let startdate = startarr[0] + " " + startarr[1].substring(0, 8);

        let endarr = data[i].release_date.split('T');
        let enddate = endarr[0] + " " + endarr[1].substring(0, 8);

        table_data += `<tr>
                            <td class='text-left'>` + (++ctr) + `. ` + data[i].document_no + `</td>
                            <td>` + data[i].name + `</td>
                            <td>
                                `+ startarr[0] + ` <br>` +
            startarr[1].substring(0, 8) + `
                            </td>`;

        table_data += `<td>` + endarr[0] + ` <br>` +
            endarr[1].substring(0, 8) + `
                         </td>`;

        // date_release = new Date(data[i].release_date);

        // const date_receive = new Date(data[i].receive_date);

        // let date_diff = Math.abs(date_release - date_receive) / 1000;

        // const days = Math.floor(date_diff / 86400);
        // date_diff -= days * 86400;

        // const hours = Math.floor(date_diff / 3600) % 24;
        // date_diff -= hours * 3600;

        // const minutes = Math.floor(date_diff / 60) % 60;
        // date_diff -= minutes * 60;

        // const secs = Math.floor(date_diff / 1) % 60;
        // date_diff -= secs * 60;

        table_data += `<td>`;

        let seconds = getDateDiff(startdate, enddate);

        let days = Math.floor(seconds / (3600 * 24));
        seconds -= days * 3600 * 24;
        let hours = Math.floor(seconds / 3600);
        seconds -= hours * 3600;
        let minutes = Math.floor(seconds / 60);
        seconds -= minutes * 60;

        if (days) table_data += "<div class='col-md-12'>" + days + " day(s) </div>";
        if (hours) table_data += "<div class='col-md-12'>" + hours + " hr(s) </div>";
        if (minutes) table_data += "<div class='col-md-12'>" + minutes + " min(s) </div>";
        if (seconds) table_data += "<div class='col-md-12'>" + seconds + " secs </div>";

        // if (days || hours || minutes) {
        //     if (days) table_data += "<div class='col-md-12'>" + days + " day(s) </div>";
        //     if (hours) table_data += "<div class='col-md-12'>" + hours + " hr(s) </div>";
        //     if (minutes) table_data += "<div class='col-md-12'>" + minutes + " min(s) </div>";
        // } else {
        //     table_data += "<div class='col-md-12'>few seconds</div>";
        // }

        if (data[i].priority == 'Regular') {
            table_data += `</td><td>2 days</td>`;
        } else {
            table_data += `</td><td>2 hrs</td>`;
        }

        table_data += `<td>` + data[i].remarks + `</td>]
                        </tr>`;
    }

    $('#reports_tbody').html(table_data);

    if (should_print) {
        $('#tblContainerD').html($('#tblReports').html());

        if (exportFlag) {
            exportFlag = false;
            exportToExcel();
        } else {
            printJS({
                printable: 'printable_div',
                type: 'html',
                marginLeft: 0,
                marginRight: 0,
                honorColor: true,
                targetStyles: ['*']
            })
        }

        $('.table-load-more-reports').attr('id', 0);
        $('#tblContainerD').html('');
        $('#reports_tbody').html('');
        $('.table-load-more-reports').show();
        getReports(0, 5);

        $('#loader_container_dashboard').addClass('d-none');
    }
}

function hideSendOutInfo() {
    $('#tblSendOut th:nth-child(4)').hide();
    $('#tblSendOut td:nth-child(4)').hide();

    $('#tblSendOut th:nth-child(5)').hide();
    $('#tblSendOut td:nth-child(5)').hide();

    $('#tblSendOut th:nth-child(6)').hide();
    $('#tblSendOut td:nth-child(6)').hide();
}

function showSendOutInfo() {
    $('#tblSendOut th:nth-child(4)').show();
    $('#tblSendOut td:nth-child(4)').show();

    $('#tblSendOut th:nth-child(5)').show();
    $('#tblSendOut td:nth-child(5)').show();

    $('#tblSendOut th:nth-child(6)').show();
    $('#tblSendOut td:nth-child(6)').show();
}

function exportToExcel() {
    excel = new ExcelGen({
        "src_id": "tblContainerD",
        "show_header": true,
        "file_name": "monitoring-tool.xlsx"
    });

    excel.generate();
}

function populatePendingGraph() {
    $('#pending_total').html(pending_count.reduce((a, b) => a + b, 0));

    let ctx = document.getElementById("pending_chart").getContext('2d');
    if (ctx) {
        ctx.height = 130;
        pendingChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'],
                type: 'line',
                datasets: [{
                    data: pending_count,
                    label: 'Pending',
                    backgroundColor: 'rgba(255,255,255,.1)',
                    borderColor: 'rgba(255,255,255,.55)',
                },]
            },
            options: {
                maintainAspectRatio: true,
                legend: {
                    display: false
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 10,
                        bottom: 0
                    }
                },
                responsive: true,
                scales: {
                    xAxes: [{
                        gridLines: {
                            color: 'transparent',
                            zeroLineColor: 'transparent'
                        },
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent'
                        }
                    }],
                    yAxes: [{
                        display: false,
                        ticks: {
                            display: false,
                        }
                    }]
                },
                title: {
                    display: false,
                },
                elements: {
                    line: {
                        borderWidth: 0
                    },
                    point: {
                        radius: 4,
                        hitRadius: 10,
                        hoverRadius: 4
                    }
                }
            }
        });
    }
}

function populateReceiveGraph() {
    const total = receive_count.reduce((a, b) => a + b, 0);
    $('#receive_total').html(total);

    let ctx = document.getElementById('receive_chart').getContext('2d');
    if (ctx) {
        ctx.height = 130;
        receiveChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'],
                type: 'line',
                datasets: [{
                    data: receive_count,
                    label: 'Received',
                    backgroundColor: 'rgba(255,255,255,.1)',
                    borderColor: 'rgba(255,255,255,.55)',
                },]
            },
            options: {
                maintainAspectRatio: true,
                legend: {
                    display: false
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 10,
                        bottom: 0
                    }
                },
                responsive: true,
                scales: {
                    xAxes: [{
                        gridLines: {
                            color: 'transparent',
                            zeroLineColor: 'transparent'
                        },
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent'
                        }
                    }],
                    yAxes: [{
                        display: false,
                        ticks: {
                            display: false,
                        }
                    }]
                },
                title: {
                    display: false,
                },
                elements: {
                    line: {
                        borderWidth: 0
                    },
                    point: {
                        radius: 4,
                        hitRadius: 10,
                        hoverRadius: 4
                    }
                }
            }
        });
    }
}

function populateReleaseGraph(data) {
    const total = data.reduce((a, b) => a + b, 0);
    $('#release_total').html(total);

    let ctx = document.getElementById("release_chart").getContext('2d');
    if (ctx) {
        ctx.height = 130;
        sendoutChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'],
                type: 'line',
                datasets: [{
                    data: data,
                    label: 'Sent Out',
                    backgroundColor: 'rgba(255,255,255,.1)',
                    borderColor: 'rgba(255,255,255,.55)',
                },]
            },
            options: {
                maintainAspectRatio: true,
                legend: {
                    display: false
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 10,
                        bottom: 0
                    }
                },
                responsive: true,
                scales: {
                    xAxes: [{
                        gridLines: {
                            color: 'transparent',
                            zeroLineColor: 'transparent'
                        },
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent'
                        }
                    }],
                    yAxes: [{
                        display: false,
                        ticks: {
                            display: false,
                        }
                    }]
                },
                title: {
                    display: false,
                },
                elements: {
                    line: {
                        borderWidth: 0
                    },
                    point: {
                        radius: 4,
                        hitRadius: 10,
                        hoverRadius: 4
                    }
                }
            }
        });
    }
}

function populateTotalGraph(total) {
    $('#total_total').html(total.reduce((a, b) => a + b, 0));

    let ctx = document.getElementById("total_chart").getContext('2d');
    if (ctx) {
        ctx.height = 115;
        totalChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'],
                type: 'line',
                datasets: [{
                    data: total,
                    label: 'Total',
                    backgroundColor: 'rgba(255,255,255,.1)',
                    borderColor: 'rgba(255,255,255,.55)',
                },]
            },
            options: {
                maintainAspectRatio: true,
                legend: {
                    display: false
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 10,
                        bottom: 0
                    }
                },
                responsive: true,
                scales: {
                    xAxes: [{
                        gridLines: {
                            color: 'transparent',
                            zeroLineColor: 'transparent'
                        },
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent'
                        }
                    }],
                    yAxes: [{
                        display: false,
                        ticks: {
                            display: false,
                        }
                    }]
                },
                title: {
                    display: false,
                },
                elements: {
                    line: {
                        borderWidth: 0
                    },
                    point: {
                        radius: 4,
                        hitRadius: 10,
                        hoverRadius: 4
                    }
                }
            }
        });
    }
}

function populateTypeGraph(types, counts) {

    let ctx = document.getElementById("type_chart").getContext('2d');

    if (ctx) {
        ctx.height = 300;
        typeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: types,
                datasets: [
                    {
                        label: "Count",
                        data: counts,
                        borderColor: "transparent",
                        borderWidth: "0",
                        backgroundColor: '#00b5e9'
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        display: true,
                        maxBarThickness: 30,
                        ticks: {
                            autoSkip: false
                        }
                    }],
                    yAxes: [{
                        display: true,
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }
}
