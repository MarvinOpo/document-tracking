const mysql = require('mysql');
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    timezone: 'utc',
    database: 'document_tracking'
});

exports.get_user = function (username, password) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT * FROM users WHERE username = ? AND password = MD5(?)";

        const values = [username, password];

        conn.query(sql, values, function (err, result) {

            if (err) reject(new Error("Get user failed"));

            if (result.length > 0) resolve(result);
            else reject(new Error("Get user failed"));
        });
    });
}

exports.update_user = function (body, id) {
    return new Promise(function (resolve, reject) {
        let sql = `UPDATE users SET password = MD5(?), designation = ?, department = ?
                WHERE id = ?`;

        const values = [body.password, body.designation, body.department, id];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("Get user failed"));

            resolve();
        });
    });
}

exports.update_pass = function (body, id) {
    return new Promise(function (resolve, reject) {
        let sql = `UPDATE users SET password = MD5(?) 
                    WHERE id = ? and password = MD5(?) `;

        const values = [body.new_pass, id, body.old_pass];

        conn.query(sql, values, function (err, result) {
            if (err || result.affectedRows == 0) reject(new Error("Get user failed"));

            resolve();
        });
    });
}