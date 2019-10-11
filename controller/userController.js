const User = require('../model/User');
const userAPI = require('../api/userAPI');

exports.insert = async function (req, res) {
    let user = new User();
    user.setFname(req.body.fname);
    user.setLname(req.body.lname);
    user.setMinit(req.body.minit);
    user.setUsername(req.body.username);
    user.setDesignation(req.body.designation);
    user.setDepartment(req.body.department);
    user.setRights(req.body.rights);

    let result = {};
    try {
        await userAPI.insert_user(user);
        result['status'] = 'success';
        res.send(result);
    } catch (err) {
        result['status'] = 'error';
        res.send(result);
    }
}

exports.get_departments = async function (req, res) {
    try {
        const departments = await userAPI.get_departments();
        res.send(departments);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
}

exports.get_users = async function (req, res) {
    try {
        const users = await userAPI.get_users(req.query);
        res.send(users);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
}

exports.update = async function (req, res) {
    let user = new User();
    user.setId(req.body.id);
    user.setFname(req.body.fname);
    user.setMinit(req.body.minit);
    user.setLname(req.body.lname);
    user.setDesignation(req.body.designation);
    user.setDepartment(req.body.department);
    user.setRights(req.body.rights);

    let result = {};
    try {
        await userAPI.update_user(user);
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
        await userAPI.delete_user(req.query.id);
        result['status'] = 'success';
        res.send(result);
    } catch (err) {
        result['status'] = 'error';
        res.send(result);
    }
}

exports.reset_password = async function (req, res) {
    let result = {};
    try {
        await userAPI.reset_password(req.query.id);
        result['status'] = 'success';
        res.send(result);
    } catch (err) {
        result['status'] = 'error';
        res.send(result);
    }
}

exports.get_count = async function (req, res) {
    try {
        const count = await userAPI.get_count(req.query);
        res.send(count);
    } catch (err) {
        let result = {};
        result['status'] = 'error';
        res.send(result);
    }
}
