const mysql = require('mysql');
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    timezone: 'utc',
    database: 'document_tracking'
});

exports.insert_log = function (log, body) {
    return new Promise(function (resolve, reject) {
        let sql = `INSERT INTO logs_` + body.year + `(document_id, release_from, release_to, remarks) `;

        let values = [];

        sql += `values`;

        let valuesSql = '';
        for (let i = 0; i < body.barcodes.length; i++) {
            if (body.barcodes[i].includes(body.year + '-')) {
                if (valuesSql) valuesSql += ', ';

                valuesSql += `((SELECT id from documents_` + body.year + ` WHERE barcode = ?),?,?,?) `
                values.push(body.barcodes[i]);
                values.push(body.from);
                values.push(log.getReleaseTo());
                values.push(log.getRemarks());

            }

        }

        sql += valuesSql;

        conn.query(sql, values, function (err, result) {
            console.log(err);
            if (err) reject(new Error(`Insert failed`));

            if (body.barcodes.length && body.mix) {
                sql = `INSERT INTO logs_` + (body.year - 1) + `(document_id, release_from, release_to, remarks) `;

                values = [];

                sql += `values`;

                valuesSql = '';

                for (let i = 0; i < body.barcodes.length; i++) {
                    if (body.barcodes[i].includes((body.year - 1) + '-')) {
                        if (valuesSql) valuesSql += ',';

                        valuesSql += `((SELECT id from documents_` + (body.year - 1) + ` WHERE barcode = ?),?,?,?) `
                        values.push(body.barcodes[i]);
                        values.push(body.from);
                        values.push(log.getReleaseTo());
                        values.push(log.getRemarks());

                    }

                }

                sql += valuesSql;
                conn.query(sql, values, function (err, result) {
                    console.log(err);
                    if (err) reject(new Error(`Insert failed`));
                    resolve();
                });

            } else {
                resolve();
            }
        });
    });
}

exports.get_logs = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT * FROM logs_` + param.year + ` WHERE document_id = ? ORDER BY id`;

        const values = [param.id];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error(`GET logs failed`));

            resolve(result);
        });
    });
}

exports.get_log_history = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT l.*, d.barcode FROM logs_` + param.year + ` l
                        RIGHT JOIN documents_`+ param.year + ` d
                        ON l.document_id = d.id
                    WHERE l.release_to = ?
                        AND l.created_at >= ?
	                    AND l.created_at <= ?
                    ORDER BY l.id desc `;

        const values = [param.department, param.date_from, param.date_to];

        if (param.limit) {
            sql += `LIMIT ? OFFSET ?`
            values.push(parseInt(param.limit));
            values.push(parseInt(param.offset));
        }

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error(`GET logs failed`));

            resolve(result);
        });
    });
}

exports.get_reports = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT l.receive_date, l.release_date, l.remarks,
                         d.document_no, d.name, d.priority
                    FROM logs_` + param.year + ` l, documents_` + param.year + ` d
                    WHERE release_to = ? AND d.id = l.document_id AND
                          (l.receive_date >= ? AND l.receive_date <= ?)
                           AND release_date IS NOT NULL `;

        const values = [param.department, param.date_from, param.date_to];

        if (param.type) {
            sql += '&& type = ? '
            values.push(param.type);
        }

        sql += `ORDER BY l.id desc `;

        if (param.limit) {
            sql += `LIMIT ? OFFSET ?`
            values.push(parseInt(param.limit));
            values.push(parseInt(param.offset));
        }

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error(`GET reports failed`));

            resolve(result);
        });
    });
}

exports.update_receive = function (body) {
    return new Promise(function (resolve, reject) {
        let sql = `UPDATE logs_` + body.year + ` 
                    SET receive_by = ?, receive_date = NOW() 
                    WHERE release_to = ? 
                        AND receive_by IS NULL 
                        AND document_id IN (
                            SELECT id from documents_` + body.year + ` 
                            WHERE barcode IN (?)
                        ) `;

        const values = [body.receive_by, body.department, body.barcodes];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error(`Update receive logs failed`));

            if (body.mix) {
                sql = `UPDATE logs_` + (body.year - 1) + ` 
                        SET receive_by = ?, receive_date = NOW() 
                        WHERE release_to = ? 
                            AND receive_by IS NULL 
                            AND document_id IN (
                                SELECT id from documents_` + (body.year - 1) + ` 
                                WHERE barcode IN (?)
                            ) `

                conn.query(sql, values, function (err, result) {
                    if (err) reject(new Error(`Update release logs failed`));
                    resolve(result);
                });
            } else {
                resolve(result);
            }
        });
    });
}

exports.update_release = function (body) {
    return new Promise(function (resolve, reject) {
        let sql = `UPDATE logs_` + body.year + ` 
                    SET release_by = ?, release_date = NOW() 
                    WHERE release_date IS NULL 
                        AND document_id IN (
                            SELECT id from documents_` + body.year + ` 
                            WHERE barcode IN (?)
                        ) `

        const values = [body.release_by, body.barcodes];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error(`Update release logs failed`));

            if (body.mix) {
                sql = `UPDATE logs_` + (body.year - 1) + ` 
                        SET release_by = ?, release_date = NOW() 
                        WHERE release_date IS NULL 
                            AND document_id IN (
                                SELECT id from documents_` + (body.year - 1) + ` 
                                WHERE barcode IN (?)
                            ) `

                conn.query(sql, values, function (err, result) {
                    if (err) reject(new Error(`Update release logs failed`));
                    resolve(result);
                });
            } else {
                resolve(result);
            }
        });
    });
}

exports.delete = function (param) {
    return new Promise(function (resolve, reject) {
        if (param.did != 'skip') {
            let sql = `DELETE FROM logs_` + param.year + ` WHERE id = ? `

            let values = [param.did];

            conn.query(sql, values, function (err, result) {
                if (err) reject(new Error(`Delete logs failed`));

                if (result) {
                    sql = `UPDATE logs_` + param.year + ` SET release_by = null, `
                        + `release_date = null WHERE id = ? `

                    values = [param.uid];

                    conn.query(sql, values, function (err, result) {
                        if (err) reject(new Error(`Delete logs failed`));

                        if (result) {
                            sql = `UPDATE documents_` + param.year + ` SET location = ?, `
                                + `status = 'RECEIVED' WHERE id = ? `

                            values = [param.department, param.document_id];

                            conn.query(sql, values, function (err, result) {
                                if (err) reject(new Error(`Delete logs failed`));

                                resolve();
                            });
                        }
                    });
                }
            });
        } else {
            sql = `UPDATE logs_` + param.year + ` SET release_by = null, `
                + `release_date = null WHERE id = ? `

            values = [param.uid];

            conn.query(sql, values, function (err, result) {
                if (err) reject(new Error(`Delete logs failed`));

                if (result) {
                    sql = `UPDATE documents_` + param.year + ` SET location = ?, `
                        + `status = 'Received' WHERE id = ? `

                    values = [param.department, param.document_id];

                    conn.query(sql, values, function (err, result) {
                        if (err) reject(new Error(`Delete logs failed`));

                        resolve();
                    });
                }
            });
        }
    });
}