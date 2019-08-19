let document_selectize, type_selectize, docno_selectize, general_selectize;

(function ($) {
    selectizeFilter();
})(jQuery);

function selectizeFilter() {
    let $documents, $type, $docno, $general;

    $documents = $('#document_filter').selectize({
        valueField: 'barcode',
        labelField: 'barcode',
        searchField: ['barcode'],
        onChange: function (value) {
            refreshSelectize();
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
        }
    });

    $general = $('#general_filter').selectize({
        create: true,
        onChange: function (value) {
            document_selectize.setValue("");
            type_selectize.setValue("");
            docno_selectize.setValue("");

            // getDocCount();
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

    const param = 'barcode=' + $('#document_filter').val() +
        '&type=' + $('#type_filter').val() + '&docno=' + $('#docno_filter').val();

    const bcodeRoute = '/API/all_document/get_barcodes?' + param;
    loadFilter(document_selectize, bcodeRoute);

    const typeRoute = '/API/all_document/get_types?' + param;
    loadFilter(type_selectize, typeRoute);

    const docnoRoute = '/API/all_document/get_docno?' + param;
    loadFilter(docno_selectize, docnoRoute);

    // getDocCount();
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
    let param = "";
    if (!$('#general_filter').val()) {
        param = '?barcode=' + $('#document_filter').val() +
            '&type=' + $('#type_filter').val() + '&docno=' + $('#docno_filter').val() +
            '&department=' + $('.department').text() + '&user_id=' + $('.department').attr('id');
    } else {
        param = '?general=' + $('#general_filter').val() +
            '&department=' + $('.department').text() +
            '&user_id=' + $('.department').attr('id');
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