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
        let sql = "SELECT * FROM users WHERE username = ? AND password = ?";

        const values = [username, password];

        conn.query(sql, values, function (err, result) {
            
            if (err) reject(new Error("Get user failed"));

            if (result.length > 0) resolve(result);
            else reject(new Error("Get user failed"));
        });
    });
}