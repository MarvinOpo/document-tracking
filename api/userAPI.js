const mysql = require('mysql');
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    timezone: 'local',
    database: 'document_tracking'
});

exports.insert_user = function (user) {
    return new Promise(function (resolve, reject) {
        let sql = "INSERT INTO users(username, password, fname, mname, lname, designation, department) "
            + "values(?, '123', ?, ?, ?, ?, ?)";

        let dept = user.getDepartment();
        let designation = user.getDesignation();

        if (!designation) designation = 'nd';
        if (!dept) dept = 'nd';

        const values = [user.getUsername(), user.getFname(), user.getMinit(), user.getLname(), designation, dept];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("Insert failed"));

            resolve();
        });
    })
}

exports.get_users = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT id, username, fname, mname as mi, lname, designation, department 
                    FROM users WHERE username IS NOT NULL `;

        let values = [];

        if (param.name) {
            sql += `AND (
                INSTR(fname, '`+ param.name + `') OR
                INSTR(lname, '`+ param.name + `')) `
        }

        if(param.designation){
            sql += `AND designation = ? `
            values.push(param.designation);
        }

        if(param.department){
            sql += `AND department = ? `
            values.push(param.department);
        }

        sql += "ORDER BY fname "

        if (param.limit) {
            sql += " LIMIT ? OFFSET ?";
            values.push(parseInt(param.limit));
            values.push(parseInt(param.offset));
        }

        conn.query(sql, values, function (err, result) {
            console.log(err);
            if (err) reject(new Error("GET document failed"));

            resolve(result);
        });
    });
}

exports.update_user = function (user) {
    return new Promise(function (resolve, reject) {
        let sql = `UPDATE users SET fname = ?, mname = ?, lname = ?, 
                    designation = ?, department = ? WHERE id = ? `;

        const values = [user.getFname(), user.getMinit(), user.getLname(), 
                user.getDesignation(), user.getDepartment(), user.getId()]

        conn.query(sql, values, function (err, result) {
            console.log(err);
            if (err) reject(new Error("Get departments failed"));

            resolve();
        });
    })
}

exports.delete_user = function (id) {
    return new Promise(function (resolve, reject) {
        let sql = `DELETE FROM users WHERE id = ? `;

        const values = [id];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("Delete user failed"));

            resolve();
        });
    })
}

exports.reset_password = function (id) {
    return new Promise(function (resolve, reject) {
        let sql = `UPDATE users SET password=MD5('123') WHERE id = ? `;

        const values = [id];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("Delete user failed"));

            resolve();
        });
    })
}

exports.get_departments = function () {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT DISTINCT department FROM users 
                    WHERE department <> 'nd' ORDER BY department`;

        conn.query(sql, function (err, result) {
            if (err) reject(new Error("Get departments failed"));

            resolve(result);
        });
    })
}

exports.get_count = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT count(id) AS count FROM users WHERE id IS NOT NULL `;

        let values = [];

        if (param.name) {
            sql += `AND (
                INSTR(fname, '`+ param.name + `') OR
                INSTR(lname, '`+ param.name + `')) `
        }

        if(param.designation){
            sql += `AND designation = ? `
            values.push(param.designation);
        }

        if(param.department){
            sql += `AND department = ? `
            values.push(param.department);
        }

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("Get count failed"));

            resolve(result);
        });
    })
}
