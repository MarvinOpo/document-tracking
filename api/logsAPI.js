const mysql = require('mysql');
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    timezone: 'utc',
    database: 'document_tracking'
});

exports.insert_log = function (log, barcodes) {
    return new Promise(function (resolve, reject) {
        let sql = "INSERT INTO logs(document_id, release_to, remarks) ";

        let values = [];

        sql += "values";
        for (let i = 0; i < barcodes.length; i++) {
            sql += "((SELECT id from documents WHERE barcode = ?),?,?) "
            values.push(barcodes[i]);
            values.push(log.getReleaseTo());
            values.push(log.getRemarks());

            if (i < barcodes.length - 1) sql += ",";

        }

        conn.query(sql, values, function (err, result) {
            console.log(err);
            if (err) reject(new Error("Insert failed"));

            resolve();
        });
    });
}

exports.get_logs = function (id) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT * FROM logs WHERE document_id = ? ORDER BY id";

        const values = [id];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET logs failed"));

            resolve(result);
        });
    });
}

exports.get_log_history = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT l.*, d.barcode, 
                    (SELECT release_to 
                        FROM logs rl 
                        WHERE rl.id > l.id AND  rl.document_id = l.document_id
                        limit 1) AS release_to 
                    FROM logs l, documents d
                    WHERE release_to = ? && d.id = l.document_id &&
                          (l.recieve_date >= ? && l.release_date <= ? ||
                            (l.recieve_date IS NULL && l.release_date IS NULL))
                    ORDER BY id desc `;

        const values = [param.department, param.date_from, param.date_to];

        if(param.limit){
            sql += `LIMIT ? OFFSET ?`
            values.push(parseInt(param.limit));
            values.push(parseInt(param.offset));
        }

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET logs failed"));

            resolve(result);
        });
    });
}

exports.update_recieve = function (body) {
    return new Promise(function (resolve, reject) {
        let sql = "UPDATE logs SET recieve_by = ?, recieve_date = NOW() "
            + "WHERE release_to = ? AND recieve_by IS NULL AND document_id IN (SELECT id from documents WHERE barcode IN (?)) ";

        const values = [body.recieve_by, body.department, body.barcodes];

        conn.query(sql, values, function (err, result) {
            console.log(err);
            if (err) reject(new Error("Update recieve logs failed"));

            resolve(result);
        });
    });
}

exports.update_release = function (body) {
    return new Promise(function (resolve, reject) {
        let sql = "UPDATE logs SET release_by = ?, release_date = NOW() "
            + "WHERE release_date IS NULL AND document_id IN (SELECT id from documents WHERE barcode IN (?)) "

        const values = [body.release_by, body.barcodes];

        conn.query(sql, values, function (err, result) {
            console.log(result);
            if (err) reject(new Error("Update release logs failed"));

            resolve(result);
        });
    });
}