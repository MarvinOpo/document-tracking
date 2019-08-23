let recent_date_from, recent_date_to;
let sendout_date_from, sendout_date_to;
let should_print;
let pending_count, recieve_count, release_count;
let mgensearch_selectize;

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

    recent_date_from = moment(startdate.valueOf()).format('YYYY-MM-DD hh:mm:ss');
    recent_date_to = moment().format('YYYY-MM-DD hh:mm:ss');

    sendout_date_from = recent_date_from;
    sendout_date_to = recent_date_to;

    getRecentDocuments(0, 5);
    getSendOutDocuments(0, 5);

    getPendingGraphData();
    getRecieveGraphData();
    getReleaseGraphData();

    $('#load_more_btn').click(function () {
        getRecentDocuments($('#tblRecentDocs tr').length - 1, 5);
    });

    $('#load_more_sendout').click(function () {
        getSendOutDocuments($('.table-load-more-sendout').attr('id'), 5);
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
        startDate: startdate,
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

    $('#print_recent').click(function () {
        $('#tblContainer').addClass('table table-data3');

        $('#recent_doc_tbody').html('');
        $('.table-load-more').show();
        getRecentDocuments(0, '');

        const startdate = moment(recent_date_from).format('DD/MM/YY');
        const enddate = moment(recent_date_to).format('DD/MM/YY');

        $('#printable_title').html('Recent Documents');
        $('#printable_date').text(startdate + " - " + enddate);
        $('#printed_by').html("Printed by: " + $('.name').attr('id'));
        $('#printed_date').html("Printed date: " + moment().format('MM/DD/YY HH:mm a'));
    });

    $('#print_sendout').click(function () {
        $('#tblContainer').removeClass('table table-data3');

        $('.table-load-more-sendout').attr('id', 0);
        $('#sendout_doc_tbody').html('');
        $('.table-load-more-sendout').show();
        getSendOutDocuments(0, '');

        const startdate = moment(sendout_date_from).format('MM/DD/YY');
        const enddate = moment(sendout_date_to).format('MM/DD/YY');

        $('#printable_title').html('Send Out Report');
        $('#printable_date').text(startdate + " - " + enddate);
        $('#printed_by').html("Printed by: " + $('.name').attr('id'));
        $('#printed_date').html("Printed date: " + moment().format('MM/DD/YY HH:mm a'));
    });

    const adm_access = 'Administrative Office, Medical Chief Center';

    if(!adm_access.includes($('.department').text()) ){
        $('#nav_all_docs').remove();
        $('#nav_all_docs_mobile').remove();
    }

})(jQuery);
function getRecentDocuments(offset, limit) {

    const param = '?department=' + $('.department').text() + "&offset=" + offset +
        "&limit=" + limit + "&date_from=" + recent_date_from + "&date_to=" + recent_date_to;

    fetch('/API/logs/get_log_history' + param, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            if(!data.length && $('#tblRecentDocs tr').length < 1) {
                $('#recent_table_container').addClass('d-none');
                $('.table-load-more').addClass('d-none');
                $('#recent_no_see_container').removeClass('d-none');
                return;
            }else{
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
                toastr.error("Nothing more to load.");
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function getSendOutDocuments(offset, limit) {
    const param = '?department=' + $('.department').text() + "&offset=" + offset +
        "&limit=" + limit + "&date_from=" + sendout_date_from + "&date_to=" + sendout_date_to;

    fetch('/API/document/get_sendout' + param, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            if(!data.length && $('#tblSendOut tr').length < 1) {
                $('#sendout_table_container').addClass('d-none');
                $('.table-load-more-sendout').addClass('d-none');
                $('#sendout_no_see_container').removeClass('d-none');
                return;
            }else{
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
                toastr.error("Nothing more to load.");
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function getPendingGraphData() {
    const param = '?department=' + $('.department').text();

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

function getRecieveGraphData() {
    const param = '?department=' + $('.department').text();

    fetch('/API/document/get_recieve_graph_data' + param, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            recieve_count = data.recieve_counts;
            calculateTotal();

            populateRecieveGraph();
        })
        .catch(err => {
            console.log(err);
        });
}

function getReleaseGraphData() {
    const param = '?department=' + $('.department').text();

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

function calculateTotal() {
    if (recieve_count && release_count) {

        let total = [];

        for (let i = 0; i < recieve_count.length; i++) {
            total.push(recieve_count[i] + release_count[i]);
        }

        populateTotalGraph(total);
    }
}

function populateRecentDocs(data) {
    let table_data = $('#recent_doc_tbody').html();

    // if(!table_data) table_data = "";

    for (let i = 0; i < data.length; i++) {
        let recieve_date = "", release_date = "";

        if (data[i].recieve_date) {
            recieve_date = (data[i].recieve_date).replace("T", "<br>");
            recieve_date = recieve_date.replace(".000Z", "");
        }

        if (data[i].release_date) {
            release_date = (data[i].release_date).replace("T", "<br>");
            release_date = release_date.replace(".000Z", "");
        }

        table_data += `<tr>
                            <td>`+ data[i].barcode + `</td>`;

        if (data[i].recieve_by)
            table_data += `<td>` + data[i].recieve_by + `</td>`;
        else
            table_data += `<td><span class='block-email'>Pending</span></td>`;

        if (recieve_date)
            table_data += `<td>` + recieve_date + `</td>`;
        else
            table_data += `<td><span class='block-email'>Pending</span></td>`;

        if (release_date)
            table_data += `<td>` + release_date + `</td>`;
        else
            table_data += `<td><span class='block-email'>Pending</span></td>`;

        if (data[i].release_to)
            table_data += `<td>` + data[i].release_to + `</td>`;
        else
            table_data += `<td><span class='block-email'>Pending</span></td>`;


        table_data += `<td>` + data[i].remarks + `</td>
                        </tr>`
    }

    $('#recent_doc_tbody').html(table_data);

    if (should_print) {
        $('#tblContainer').html($('#tblRecentDocs').html());

        printJS({
            printable: 'printable_div',
            type: 'html',
            honorColor: true,
            targetStyles: ['*']
        })

        $('#recent_doc_tbody').html('');
        $('.table-load-more').show();
        getRecentDocuments(0, 5);
    }
}

function populateSendOutDocs(data) {
    let table_data = $('#sendout_doc_tbody').html();
    let release_date = "";

    let ctr = $('#tblSendOut tr').length - 1;

    for (let i = 0; i < data.length; i++) {
        if (data[i].release_date) {
            release_date = (data[i].release_date).replace("T", " ");
            release_date = release_date.replace(".000Z", "");
        }

        // if (i == 0) {
        //     table_data += `<tr>
        //                     <td class="p-l-10 p-t-20 p-b-5 text-left">` + data[i].release_to + `</td>
        //                    </tr>`;
        // }

        if (table_data.includes(data[i].release_to)) {
            table_data += `<tr>
                            <td class="p-l-20 text-left">` + (ctr++) + ". " + data[i].barcode + `</td>
                            <td>` + data[i].name + `</td>
                            <td>` + data[i].type + `</td>
                            <td>` + moment(data[i].release_date).format('MM/DD/YY HH:mm') + `</td>
                            <td class="align-bottom">_________________________</td>
                           </tr>`;
        } else {
            ctr = 1;

            table_data += `<tr>
                            <td  class="p-l-10 p-t-20 p-b-5 text-left">` + data[i].release_to + `</td>
                           </tr>
                           
                           <tr>
                            <td class="p-l-20 text-left">` + (ctr++) + ". " + data[i].barcode + `</td>
                            <td>` + data[i].name + `</td>
                            <td>` + data[i].type + `</td>
                            <td>` + moment(data[i].release_date).format('MM/DD/YY HH:mm') + `</td>
                            <td class="align-bottom">_________________________</td>
                           </tr>`;
        }
    }

    $('#sendout_doc_tbody').html(table_data);
    hideSendOutInfo();

    if (should_print) {
        showSendOutInfo();
        $('#tblContainer').html($('#tblSendOut').html());

        printJS({
            printable: 'printable_div',
            type: 'html',
            honorColor: true,
            targetStyles: ['*']
        })

        $('.table-load-more-sendout').attr('id', 0);
        $('#sendout_doc_tbody').html('');
        $('.table-load-more-sendout').show();
        getSendOutDocuments(0, 5);
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

function populatePendingGraph() {
    $('#pending_total').html(pending_count.reduce((a, b) => a + b, 0));

    let ctx = document.getElementById("pending_chart").getContext('2d');
    if (ctx) {
        ctx.height = 130;
        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'],
                type: 'line',
                datasets: [{
                    data: pending_count,
                    label: 'Dataset',
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

function populateRecieveGraph() {
    const total = recieve_count.reduce((a, b) => a + b, 0);
    $('#recieve_total').html(total);

    let ctx = document.getElementById('recieve_chart').getContext('2d');
    if (ctx) {
        ctx.height = 130;
        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'],
                type: 'line',
                datasets: [{
                    data: recieve_count,
                    label: 'Dataset',
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
        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'],
                type: 'line',
                datasets: [{
                    data: data,
                    label: 'Dataset',
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
        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'],
                type: 'line',
                datasets: [{
                    data: total,
                    label: 'Dataset',
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
