const Logs = require('../model/Logs');
const logAPI = require('../api/logsAPI');

exports.insert = async function (req, res) {
    let log = new Logs();
    log.setReleaseTo(req.body.department);
    log.setRemarks(req.body.remarks);

    let result = {};
    try {
        await logAPI.insert_log(log, req.body);
        result['status'] = 'success';
        res.send(result);
    } catch (err) {
        result['status'] = 'error';
        res.send(result);
    }
}

exports.update_receive = async function (req, res) {
    let result = {};

    try {
        await logAPI.update_receive(req.body);
        result['status'] = 'success';
        res.send(result);
    } catch (err) {
        result['status'] = 'error';
        res.send(result);
    }
}

exports.update_release = async function (req, res) {
    let result = {};
    try {
        await logAPI.update_release(req.body);
        result['status'] = 'success';
        res.send(result);
    } catch (err) {
        result['status'] = 'error';
        res.send(result);
    }
}

exports.get_logs = async function (req, res) {
    try {
        const logs = await logAPI.get_logs(req.query);
        res.send(logs);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
}

exports.get_log_history = async function (req, res) {
    try {
        const logs = await logAPI.get_log_history(req.query);
        res.send(logs);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
}

exports.get_reports = async function (req, res) {
    try {
        const reports = await logAPI.get_reports(req.query);
        res.send(reports);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
}

exports.delete = async function (req, res) {
    
    let result = {};
    try {
        await logAPI.delete(req.query);
        result['status'] = 'success';
        res.send(result);
    } catch (err) {
        result['status'] = 'error';
        res.send(result);
    }
}
