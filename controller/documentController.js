const Document = require('../model/Document');
const docAPI = require('../api/documentAPI');

exports.insert = async function (req, res) {
    let document = new Document();
    document.setDocNo(req.body.document_no);
    document.setBarcode(req.body.barcode);
    document.setName(req.body.name);
    document.setType(req.body.type);
    document.setPriority(req.body.priority);
    document.setDescription(req.body.description);
    document.setRemarks(req.body.remarks);
    document.setCreateBy(req.body.create_by);
    document.setUpdateBy(req.body.update_by);
    document.setLocation(req.body.location);

    let result = {};
    try {
        await docAPI.insert_document(document);
        result['status'] = 'success';
        res.send(result);
    } catch (err) {
        result['status'] = 'error';
        res.send(result);
    }
}

exports.get_documents = async function (req, res) {
    try {
        const documents = await docAPI.get_documents(req.query);
        res.send(documents);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
};

exports.get_all_documents = async function (req, res) {
    try {
        const documents = await docAPI.get_all_documents(req.query);
        res.send(documents);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
};

exports.get_pending_documents = async function (req, res) {
    try {
        const pending = await docAPI.get_pending_documents(req.query);
        res.send(pending);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
};

exports.get_count = async function (req, res) {
    try {
        const count = await docAPI.get_count(req.query);
        res.send(count);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
};

exports.get_all_count = async function (req, res) {
    try {
        const count = await docAPI.get_all_count(req.query);
        res.send(count);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
};

exports.get_pending_count = async function (req, res) {
    try {
        const count = await docAPI.get_pending_count(req.query);
        res.send(count);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
};

exports.check_document = async function (req, res) {
    try {
        const document = await docAPI.check_document(req.query.barcode);
        res.send(document);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
};

exports.get_docno = async function (req, res) {
    try {
        const filters = await docAPI.get_docno(req.query);
        res.send(filters);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
};

exports.get_all_docno = async function (req, res) {
    try {
        const filters = await docAPI.get_all_docno(req.query);
        res.send(filters);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
};

exports.get_barcodes = async function (req, res) {
    try {
        const barcodes = await docAPI.get_barcodes(req.query);
        res.send(barcodes);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
};

exports.get_all_barcodes = async function (req, res) {
    try {
        const barcodes = await docAPI.get_all_barcodes(req.query);
        res.send(barcodes);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
};

exports.get_sendout = async function (req, res) {
    try {
        const sendouts = await docAPI.get_sendout(req.query);
        res.send(sendouts);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
};

exports.get_release_sendout = async function (req, res) {
    try {
        const sendouts = await docAPI.get_release_sendout(req.body.barcodes);
        res.send(sendouts);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
};

exports.get_types = async function (req, res) {
    try {
        const types = await docAPI.get_types(req.query);
        res.send(types);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
};

exports.get_all_types = async function (req, res) {
    try {
        const types = await docAPI.get_all_types(req.query);
        res.send(types);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
};

exports.get_pending_graph_data = async function (req, res) {
    try {
        const reports = await docAPI.get_pending_graph_data(req.query.department);
        res.send(reports);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
};

exports.get_recieve_graph_data = async function (req, res) {
    try {
        const reports = await docAPI.get_recieve_graph_data(req.query.department);
        res.send(reports);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
};

exports.get_release_graph_data = async function (req, res) {
    try {
        const reports = await docAPI.get_release_graph_data(req.query.department);
        res.send(reports);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
};

exports.get_recievable_bcodes = async function (req, res) {
    try {
        const bcodes = await docAPI.get_recievable_bcodes(req.query.id, req.query.department);
        res.send(bcodes);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
};

exports.get_releasable_bcodes = async function (req, res) {
    try {
        const bcodes = await docAPI.get_releasable_bcodes(req.query.id, req.query.department);
        res.send(bcodes);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
};

exports.update = async function (req, res) {
    let document = new Document();
    document.setId(req.body.id);
    document.setDocNo(req.body.document_no);
    document.setName(req.body.name);
    document.setType(req.body.type);
    document.setPriority(req.body.priority);
    document.setDescription(req.body.description);
    document.setRemarks(req.body.remarks);
    document.setUpdateBy(req.body.update_by);

    let result = {};
    try {
        await docAPI.update_document(document);
        result['status'] = 'success';
        res.send(result);
    } catch (err) {
        result['status'] = 'error';
        res.send(result);
    }
}

exports.recieve = async function (req, res) {
    let result = {};

    try {
        await docAPI.recieve_document(req.body.barcodes);
        result['status'] = 'success';
        res.send(result);
    } catch (err) {
        result['status'] = 'error';
        res.send(result);
    }
}

exports.end_cycle = async function (req, res) {
    let result = {};

    try {
        await docAPI.end_cycle_document(req.query);
        result['status'] = 'success';
        res.send(result);
    } catch (err) {
        result['status'] = 'error';
        res.send(result);
    }
}

exports.update_location = async function (req, res) {
    let result = {};
    try {
        await docAPI.update_location(req.body.barcodes, req.body.department);
        result['status'] = 'success';
        res.send(result);
    } catch (err) {
        result['status'] = 'error';
        res.send(result);
    }
}

exports.delete = async function (req, res) {

    let result = {};
    try {
        await docAPI.delete_document(req.query.id);
        result['status'] = 'success';
        res.send(result);
    } catch (err) {
        result['status'] = 'error';
        res.send(result);
    }
}