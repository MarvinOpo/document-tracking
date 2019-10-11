const mysql = require('mysql');
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    timezone: 'local',
    database: 'document_tracking'
});

exports.insert_document = function (document, year) {
    return new Promise(function (resolve, reject) {
        let sql = "INSERT INTO documents_" + year + "(document_no, barcode, name, description, remarks, type, priority, created_by, updated_by, created_at, updated_at, location, status) "
            + "values(?,?,?,?,?,?,?,?,?,NOW(),NOW(),?,'Pending')";

        const values = [document.getDocNo(), document.getBarcode(), document.getName(), document.getDescription(),
        document.getRemarks(), document.getType(), document.getPriority(), document.getCreateBy(), document.getUpdateBy(),
        document.getLocation()];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("Insert failed"));

            resolve();
        });
    });
}

exports.get_documents = function (param) {
    return new Promise(function (resolve, reject) {
        // let sql = "SELECT d.* FROM documents d WHERE (location = ? OR "
        //    + "(SELECT u.department from users u WHERE id = d.created_by) = ? OR "
        //    + "(SELECT count(*) from logs WHERE release_to = ? "
        //    + "AND document_id = d.id) > 0) ";

        // let sql = "SELECT d.* FROM documents d WHERE (location = ? AND status = 'Received') AND ( "
        //    + "(SELECT u.department from users u WHERE id = d.created_by) = ? OR "
        //    + "(SELECT count(*) from logs WHERE release_to = ? "
        //    + "AND document_id = d.id) > 0) ";

        let sql = "";
        let values = [];
        if (param.general == 'pending') {
            sql = `SELECT d.*
                    FROM logs_` + param.year + ` l RIGHT JOIN documents_` + param.year + ` d 
                        ON l.document_id = d.id
                        AND d.location <> 'Many' 
                        AND d.status <> 'Cycle End'
                    WHERE release_to = ?
                        AND (receive_by IS NOT NULL 
                                AND release_date IS NULL) `;

            values = [param.department];

            if (param.type) {
                sql += "AND d.type = ? "
                values[values.length] = param.type;
            }
        } else {
            sql = "SELECT d.* from documents_" + param.year + " d "
                + "WHERE ((created_by = ? OR (location = ? "
                + "AND (status = 'Received' OR status = 'Cycle End'))) OR "
                + "(SELECT count(*) from logs_" + param.year + " WHERE release_to = ? "
                + "AND document_id = d.id AND (receive_by IS NOT NULL OR release_date IS NOT NULL)) > 0) "

            values = [param.user_id, param.department, param.department];

            if (param.general) {
                sql += `AND (
                INSTR(d.document_no, '`+ param.general + `') OR
                INSTR(d.barcode, '`+ param.general + `') OR
                INSTR(d.name, '`+ param.general + `') OR
                INSTR(d.description, '`+ param.general + `') OR
                INSTR(d.remarks, '`+ param.general + `') OR
                INSTR(d.priority, '`+ param.general + `') OR
                INSTR(d.type, '`+ param.general + `')) `;


                if (param.type) {
                    sql += "AND d.type = ? "
                    values[values.length] = param.type;
                }
            } else {

                if (param.barcode) {
                    sql += "AND barcode = ? "
                    values[values.length] = param.barcode;

                }

                if (param.type) {
                    sql += "AND type = ? "
                    values[values.length] = param.type;
                }

                if (param.docno) {
                    sql += "AND document_no = ? "
                    values[values.length] = param.docno;
                }
            }
        }

        sql += "ORDER BY id DESC "

        if (param.limit) {
            sql += " LIMIT ? OFFSET ?";
            values[values.length] = parseInt(param.limit);
            values[values.length] = parseInt(param.offset);
        }

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET document failed"));

            resolve(result);
        });
    });
}

exports.get_all_documents = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT d.* from documents_" + param.year + " d WHERE barcode IS NOT NULL "
        let values = [];

        if (param.general) {
            sql += `AND (
                INSTR(d.document_no, '`+ param.general + `') OR
                INSTR(d.barcode, '`+ param.general + `') OR
                INSTR(d.name, '`+ param.general + `') OR
                INSTR(d.description, '`+ param.general + `') OR
                INSTR(d.remarks, '`+ param.general + `') OR
                INSTR(d.priority, '`+ param.general + `') OR
                INSTR(d.type, '`+ param.general + `')) `;


            if (param.type) {
                sql += "AND d.type = ? "
                values[values.length] = param.type;
            }
        } else {

            if (param.barcode) {
                sql += "AND barcode = ? "
                values[values.length] = param.barcode;

            }

            if (param.type) {
                sql += "AND type = ? "
                values[values.length] = param.type;
            }

            if (param.docno) {
                sql += "AND document_no = ? "
                values[values.length] = param.docno;
            }
        }


        sql += "ORDER BY id DESC "

        if (param.limit) {
            sql += " LIMIT ? OFFSET ?";
            values[values.length] = parseInt(param.limit);
            values[values.length] = parseInt(param.offset);
        }

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET all document failed"));

            resolve(result);
        });
    });
}

exports.get_pending_documents = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT d.*
                    FROM logs l RIGHT JOIN documents d 
                        ON l.document_id = d.id 
                        AND d.status <> 'Cycle End'
                    WHERE release_to = ?
                        AND (receive_by IS NOT NULL 
                                AND release_date IS NULL) `

        let values = [param.department];

        if (param.general) {
            sql += `AND (
                INSTR(d.document_no, '`+ param.general + `') OR
                INSTR(d.barcode, '`+ param.general + `') OR
                INSTR(d.name, '`+ param.general + `') OR
                INSTR(d.description, '`+ param.general + `') OR
                INSTR(d.remarks, '`+ param.general + `') OR
                INSTR(d.priority, '`+ param.general + `') OR
                INSTR(d.type, '`+ param.general + `')) `;

            if (param.type) {
                sql += "AND d.type = ? "
                values[values.length] = param.type;
            }
        }

        sql += "ORDER BY d.ID DESC "

        if (param.limit) {
            sql += " LIMIT ? OFFSET ?";

            values.push(param.limit);
            values.push(param.offset);
        }

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET pending documents failed"));

            resolve(result);
        });
    });
}

exports.get_sendout = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT l.release_to, l.document_id, d.barcode, d.name, d.type, l.created_at 
                    FROM logs_` + param.year + ` l 
                    RIGHT JOIN documents_` + param.year + ` d
                            ON l.document_id = d.id
                    WHERE l.release_from = ?
                            AND l.created_at >= ?
                            AND l.created_at <= ?
                    ORDER BY l.release_to, l.created_at `

        let values = [param.department, param.date_from, param.date_to];

        if (parseInt(param.limit)) {
            sql += `LIMIT ? OFFSET ?`
            values.push(parseInt(param.limit));
            values.push(parseInt(param.offset));
        }

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET sendout failed"));

            resolve(result);
        });
    });
}

// exports.get_sendout = function (param) {
//     return new Promise(function (resolve, reject) {
//         let sql = `SELECT d.barcode, d.name, d.type, l.release_date, 
//                         (SELECT release_to 
//                             FROM logs_` + param.year + ` rl 
//                             WHERE rl.id > l.id AND rl.document_id = l.document_id 
//                             limit 1) AS release_to 
//                     FROM documents_` + param.year + ` d, logs_` + param.year + ` l
//                     WHERE d.id = l.document_id AND l.release_date IS NOT NULL AND
//                          l.release_date >= ? AND l.release_date <= ? AND l.release_to = ?
//                     ORDER BY release_to, release_date desc `

//         let values = [param.date_from, param.date_to, param.department];

//         if (parseInt(param.limit)) {
//             sql += `LIMIT ? OFFSET ?`
//             values.push(parseInt(param.limit));
//             values.push(parseInt(param.offset));
//         }

//         conn.query(sql, values, function (err, result) {
//             if (err) reject(new Error("GET sendout failed"));

//             resolve(result);
//         });
//     });
// }

// exports.get_sendout = function (param) {
//     return new Promise(function (resolve, reject) {
//         let sql = `SELECT d.barcode, d.name, d.type, l.release_date, 
//                         (SELECT release_to 
//                             FROM logs_` + param.year + ` rl 
//                             WHERE rl.id > l.id AND rl.document_id = l.document_id 
//                             limit 1) AS release_to 
//                     FROM documents_` + param.year + ` d, logs_` + param.year + ` l
//                     WHERE d.id = l.document_id AND l.release_date IS NOT NULL AND
//                          l.release_date >= ? AND l.release_date <= ? AND l.release_to = ?
//                     ORDER BY release_date desc `

//         let values = [param.date_from, param.date_to, param.department];

//         if (parseInt(param.limit)) {
//             sql += `LIMIT ? OFFSET ?`
//             values.push(parseInt(param.limit));
//             values.push(parseInt(param.offset));
//         }

//         conn.query(sql, values, function (err, result) {
//             if (err) reject(new Error("GET sendout failed"));

//             resolve(result);
//         });
//     });
// }

exports.get_release_sendout = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT d.barcode, d.name, d.type
        FROM documents_` + param.year + ` d
        WHERE d.barcode IN (?) `

        let values = [param.barcodes];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET sendout failed"));

            resolve(result);
        });
    });
}

exports.get_count = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT count(DISTINCT l.document_id) as count
                    FROM logs_` + param.year + ` l 
                    INNER JOIN documents_` + param.year + ` d
                        ON d.id = l.document_id `;

        let values = [];

        if (param.general) {
            sql += `AND (
                INSTR(d.document_no, '`+ param.general + `') OR
                INSTR(d.barcode, '`+ param.general + `') OR
                INSTR(d.name, '`+ param.general + `') OR
                INSTR(d.description, '`+ param.general + `') OR
                INSTR(d.remarks, '`+ param.general + `') OR
                INSTR(d.priority, '`+ param.general + `') OR
                INSTR(d.type, '`+ param.general + `')) `;


            if (param.type) {
                sql += "AND d.type = ? ";
                values.push(param.type);
            }
        } else {
            if (param.barcode) {
                sql += "AND barcode = ? ";
                values.push(param.barcode);

            }

            if (param.type) {
                sql += "AND type = ? ";
                values.push(param.type);
            }

            if (param.docno) {
                sql += "AND document_no = ? ";
                values.push(param.docno);
            }
        }

        sql += `WHERE l.release_to = ?
                AND l.receive_by IS NOT NULL `;
        
        values.push(param.department);

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET count document failed"));

            resolve(result);
        });
    });
}

exports.get_all_count = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT count(id) AS count from documents_" + param.year + " d WHERE barcode IS NOT NULL "
        let values = [];

        if (param.general) {
            sql += `AND (
                INSTR(d.document_no, '`+ param.general + `') OR
                INSTR(d.barcode, '`+ param.general + `') OR
                INSTR(d.name, '`+ param.general + `') OR
                INSTR(d.description, '`+ param.general + `') OR
                INSTR(d.remarks, '`+ param.general + `') OR
                INSTR(d.priority, '`+ param.general + `') OR
                INSTR(d.type, '`+ param.general + `')) `;


            if (param.type) {
                sql += "AND d.type = ? "
                values[values.length] = param.type;
            }
        } else {
            if (param.barcode) {
                sql += "AND barcode = ? "
                values[values.length] = param.barcode;

            }

            if (param.type) {
                sql += "AND type = ? "
                values[values.length] = param.type;
            }

            if (param.docno) {
                sql += "AND document_no = ? "
                values[values.length] = param.docno;
            }
        }

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET count all document failed"));

            resolve(result);
        });
    });
}

exports.get_pending_count = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT COUNT(*) AS count
                    FROM logs l RIGHT JOIN documents d 
                        ON l.document_id = d.id 
                        AND d.location <> 'Many'
                        AND d.status <> 'Cycle End'
                    WHERE release_to = ?
                        AND (receive_by IS NOT NULL 
                                AND release_date IS NULL) `;

        let values = [param.department];

        if (param.general) {
            sql += `AND (
                INSTR(d.document_no, '`+ param.general + `') OR
                INSTR(d.barcode, '`+ param.general + `') OR
                INSTR(d.name, '`+ param.general + `') OR
                INSTR(d.description, '`+ param.general + `') OR
                INSTR(d.remarks, '`+ param.general + `') OR
                INSTR(d.priority, '`+ param.general + `') OR
                INSTR(d.type, '`+ param.general + `')) `;

            if (param.type) {
                sql += "AND d.type = ? "
                values[values.length] = param.type;
            }
        }

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET pending document count failed"));

            resolve(result);
        });
    });
}

exports.check_document = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT name, description from documents_" + param.year + " "
            + "WHERE barcode = ?"

        const values = [param.barcode];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET document failed"));

            resolve(result);
        });
    });
}

exports.get_docno = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT d.document_no from documents_" + param.year + " d "
            + "WHERE d.document_no != '' AND d.document_no != 'n/a' AND ((created_by = ? OR (location = ? "
            + "AND status = 'Received')) OR "
            + "(SELECT count(*) from logs_" + param.year + " WHERE release_to = ? "
            + "AND document_id = d.id AND receive_by IS NOT NULL) > 0) "

        let values = [param.user_id, param.department, param.department];

        if (param.barcode) {
            sql += "AND barcode = ? "
            values[values.length] = param.barcode;

        }

        if (param.type) {
            sql += "AND type = ? "
            values[values.length] = param.type;
        }

        sql += "ORDER BY ID "

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET filters document failed"));

            resolve(result);
        });
    });
}

exports.get_all_docno = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT d.document_no from documents_` + param.year + ` d WHERE d.document_no <> '' 
                    AND d.document_no <> 'n/a' `

        let values = [];

        if (param.barcode) {
            sql += "AND barcode = ? "
            values.push(param.barcode);

        }

        if (param.type) {
            sql += "AND type = ? "
            values.push(param.type);
        }

        sql += "ORDER BY ID "

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET filters document failed"));

            resolve(result);
        });
    });
}

exports.get_barcodes = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT d.barcode from documents_" + param.year + " d "
            + "WHERE ((created_by = ? OR (location = ? "
            + "AND status = 'Received')) OR "
            + "(SELECT count(*) from logs_" + param.year + " WHERE release_to = ? "
            + "AND document_id = d.id AND receive_by IS NOT NULL) > 0) "

        let values = [param.user_id, param.department, param.department];

        if (param.type) {
            sql += "AND type = ? "
            values[values.length] = param.type;
        }

        if (param.docno) {
            sql += "AND document_no = ? "
            values[values.length] = param.docno;
        }

        sql += "ORDER BY ID "

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET document barcodes failed"));

            resolve(result);
        });
    });
}

exports.get_all_barcodes = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT barcode from documents_" + param.year + " WHERE barcode IS NOT NULL "
        let values = [];

        if (param.type) {
            sql += "AND type = ? "
            values.push(param.type);
        }

        if (param.docno) {
            sql += "AND document_no = ? "
            values.push(param.docno);

        }

        sql += "ORDER BY ID "

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET all document barcodes failed"));

            resolve(result);
        });
    });
}

exports.get_types = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT d.type from documents_" + param.year + " d "
            + "WHERE ((created_by = ? OR (location = ? "
            + "AND status = 'Received')) OR "
            + "(SELECT count(*) from logs_" + param.year + " WHERE release_to = ? "
            + "AND document_id = d.id AND receive_by IS NOT NULL) > 0) "

        let values = [param.user_id, param.department, param.department];

        if (param.barcode) {
            sql += "AND barcode = ? "
            values[values.length] = param.barcode;

        }

        if (param.docno) {
            sql += "AND document_no = ? "
            values[values.length] = param.docno;
        }

        sql += "ORDER BY ID "

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET document types failed"));

            resolve(result);
        });
    });
}

exports.get_all_types = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT type from documents_" + param.year + " WHERE type IS NOT NULL "

        let values = [];

        if (param.barcode) {
            sql += "AND barcode = ? "
            values.push(param.barcode);

        }

        if (param.docno) {
            sql += "AND document_no = ? "
            values.push(param.docno);
        }

        sql += "ORDER BY ID "
        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET all document types failed"));

            resolve(result);
        });
    });
}

exports.get_pending_graph_data = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT MONTHNAME(receive_date) AS month, COUNT(*) AS count
                    FROM logs_` + param.year + ` l 
                    RIGHT JOIN documents_` + param.year + ` d 
                        ON l.document_id = d.id 
                        AND d.location <> 'Many' 
                        AND d.status <> 'Cycle End'
                    WHERE release_to = ? && (receive_by IS NOT NULL AND release_date IS NULL)
                    GROUP BY month
                    ORDER BY receive_date `

        const values = [param.department];
        let pnd_arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET pending document failed"));

            if(!result.length) {
                let data = {
                    pending_counts: pnd_arr
                };

                resolve(data);
                return
            }

            for (let i = 0; i < result.length; i++) {
                switch (result[i].month) {
                    case "January":
                        pnd_arr.splice(0, 1, result[i].count);
                        break;
                    case "February":
                        pnd_arr.splice(1, 1, result[i].count);
                        break;
                    case "March":
                        pnd_arr.splice(2, 1, result[i].count);
                        break;
                    case "April":
                        pnd_arr.splice(3, 1, result[i].count);
                        break;
                    case "May":
                        pnd_arr.splice(4, 1, result[i].count);
                        break;
                    case "June":
                        pnd_arr.splice(5, 1, result[i].count);
                        break;
                    case "July":
                        pnd_arr.splice(6, 1, result[i].count);
                        break;
                    case "August":
                        pnd_arr.splice(7, 1, result[i].count);
                        break;
                    case "September":
                        pnd_arr.splice(8, 1, result[i].count);
                        break;
                    case "October":
                        pnd_arr.splice(9, 1, result[i].count);
                        break;
                    case "November":
                        pnd_arr.splice(10, 1, result[i].count);
                        break;
                    case "December":
                        pnd_arr.splice(11, 1, result[i].count);
                        break;
                }

                if (i == result.length - 1) {
                    let data = {
                        pending_counts: pnd_arr
                    };

                    resolve(data);
                    return
                }

            }

            reject(new Error("No contents"));

        });
    });
}

exports.get_receive_graph_data = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT MONTHNAME(receive_date) AS month,
                COUNT(*) AS count
                FROM logs_` + param.year + `
                WHERE release_to = ? AND receive_by IS NOT NULL
                GROUP BY month
                ORDER BY receive_date`

        const values = [param.department];
        let rcv_arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET document types failed"));

            if(!result.length) {
                let data = {
                    receive_counts: rcv_arr
                };

                resolve(data);
                return
            }

            for (let i = 0; i < result.length; i++) {
                switch (result[i].month) {
                    case "January":
                        rcv_arr.splice(0, 1, result[i].count);
                        break;
                    case "February":
                        rcv_arr.splice(1, 1, result[i].count);
                        break;
                    case "March":
                        rcv_arr.splice(2, 1, result[i].count);
                        break;
                    case "April":
                        rcv_arr.splice(3, 1, result[i].count);
                        break;
                    case "May":
                        rcv_arr.splice(4, 1, result[i].count);
                        break;
                    case "June":
                        rcv_arr.splice(5, 1, result[i].count);
                        break;
                    case "July":
                        rcv_arr.splice(6, 1, result[i].count);
                        break;
                    case "August":
                        rcv_arr.splice(7, 1, result[i].count);
                        break;
                    case "September":
                        rcv_arr.splice(8, 1, result[i].count);
                        break;
                    case "October":
                        rcv_arr.splice(9, 1, result[i].count);
                        break;
                    case "November":
                        rcv_arr.splice(10, 1, result[i].count);
                        break;
                    case "December":
                        rcv_arr.splice(11, 1, result[i].count);
                        break;
                }

                if (i == result.length - 1) {
                    let data = {
                        receive_counts: rcv_arr
                    };

                    resolve(data);
                    return
                }

            }

            reject(new Error("No contents"));
        });
    });
}

exports.get_release_graph_data = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT MONTHNAME(release_date) AS month, COUNT(*) AS count
                FROM logs_` + param.year + `
                WHERE release_to = ? AND release_date IS NOT NULL
                GROUP BY month
                ORDER BY release_date`

        const values = [param.department];
        let rls_arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET document types failed"));

            if(!result.length) {
                let data = {
                    release_counts: rls_arr
                };

                resolve(data);
                return
            }

            for (let i = 0; i < result.length; i++) {
                switch (result[i].month) {
                    case "January":
                        rls_arr.splice(0, 1, result[i].count);
                        break;
                    case "February":
                        rls_arr.splice(1, 1, result[i].count);
                        break;
                    case "March":
                        rls_arr.splice(2, 1, result[i].count);
                        break;
                    case "April":
                        rls_arr.splice(3, 1, result[i].count);
                        break;
                    case "May":
                        rls_arr.splice(4, 1, result[i].count);
                        break;
                    case "June":
                        rls_arr.splice(5, 1, result[i].count);
                        break;
                    case "July":
                        rls_arr.splice(6, 1, result[i].count);
                        break;
                    case "August":
                        rls_arr.splice(7, 1, result[i].count);
                        break;
                    case "September":
                        rls_arr.splice(8, 1, result[i].count);
                        break;
                    case "October":
                        rls_arr.splice(9, 1, result[i].count);
                        break;
                    case "November":
                        rls_arr.splice(10, 1, result[i].count);
                        break;
                    case "December":
                        rls_arr.splice(11, 1, result[i].count);
                        break;
                }

                if (i == result.length - 1) {
                    let data = {
                        release_counts: rls_arr
                    };

                    resolve(data);
                    return
                }

            }

            reject(new Error("No contents"));
        });
    });
}

exports.get_receivable_bcodes = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT d.barcode FROM documents_`+ param.year +` d 
                    RIGHT JOIN logs_`+ param.year +` l
                            ON l.document_id = d.id 
                            AND l.release_to = ?
                            AND l.receive_date IS NULL
                    WHERE d.barcode IS NOT NULL `

        const values = [param.department];

        conn.query(sql, values, function (err, result) {
            console.log(err);
            if (err) reject(new Error("GET receivable barcodes failed"));

            resolve(result);
        });
    })
}

exports.get_releasable_bcodes = function (param) {
    return new Promise(function (resolve, reject) {
        // let sql = "SELECT barcode FROM documents_" + param.year + " "
        //     + "WHERE (location = ? AND status = 'Received') OR "
        //     + "(location = '' AND created_by = ?) ";

        let sql = `SELECT d.barcode FROM documents_`+ param.year +` d 
                    RIGHT JOIN logs_`+ param.year +` l
                            ON l.document_id = d.id 
                            AND l.release_to = ?
                            AND l.receive_date IS NOT NULL
                            AND l.release_date IS NULL
                    WHERE d.barcode IS NOT NULL`

        const values = [param.department];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET releasable barcodes failed"));

            resolve(result);
        });
    })
}

exports.update_document = function (document, year) {
    return new Promise(function (resolve, reject) {
        let sql = "UPDATE documents_" + year + " SET document_no = ?, name = ?, description = ?, remarks = ?, type = ?, priority = ?,  updated_by = ?, updated_at = NOW() "
            + "WHERE id = ?";

        const values = [document.getDocNo(), document.getName(), document.getDescription(), document.getRemarks(),
        document.getType(), document.getPriority(), document.getUpdateBy(), document.getId()];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("Update failed"));

            resolve();
        });
    })
}

exports.receive_document = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = "UPDATE documents_" + param.year + " SET status = 'Received', lapse_at = NOW() "
            + "WHERE barcode IN (?)";

        const values = [param.barcodes];

        conn.query(sql, values, function (err, result) {
            if (err || result.affectedRows == 0) reject(new Error("Receive failed"));

            resolve();
        });
    })
}

exports.end_cycle_document = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = "UPDATE documents_" + param.year + " SET updated_by = ?, updated_at = NOW(), "
            + "status = ? WHERE id = ? ";

        const values = [param.user_id, param.status, param.id];

        conn.query(sql, values, function (err, result) {
            if (err || result.affectedRows == 0) reject(new Error("Cycle failed"));

            resolve();
        });
    })
}

exports.update_location = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = "UPDATE documents_" + param.year + " SET location = ?, status = 'Pending' "
            + "WHERE barcode IN (?)";

        const values = [param.department, param.barcodes];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("Update location failed"));

            resolve();
        });
    })
}

exports.delete_document = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = "DELETE FROM documents_" + param.year + " WHERE id = ?";

        const values = [parseInt(param.id)];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("Delete failed"));

            resolve();
        });
    })
}

// const mssql = require('mssql');
// mssql.connect({
//     user: 'mvopo',
//     password: '1234',
//     server: 'localhost',
//     port: 57315,
//     database: 'AMPS_VICENTE_SOTTO'
// }, function (err) {
//     const request = new mssql.Request();

//     const sql = `SELECT PIN, FirstName, MiddleInitial, LastName, Position
//             FROM [AMPS_VICENTE_SOTTO].[dbo].[Employees] WHERE LastDateEmployed is null`;

//     request.query(sql, function (err, result) {
//         if (err) return;

//         for(let i = 0; i < result.recordset.length; i++){
//             const employee = result.recordset[i];
//             const fname = employee.FirstName;
//             const minit = employee.MiddleInitial + ".";
//             const lname = employee.LastName;
//             let designation = employee.Position;
//             // const username = fname.split(/\s/)[0].substring(0,2) + lname;
//             const username = employee.PIN;

//             if(!designation) designation = 'nd';

//             let sql = "INSERT INTO users(username, password, fname, mname, lname, designation, department) "
//                     + "values(?, '123', ?, ?, ?, ?, 'nd')";

//             // let sql = `UPDATE users SET designation = ? WHERE username = ?`

//             const values = [username, fname, minit, lname, designation];

//             conn.query(sql, values, function (err, result) {
//                 console.log(result.insertId);
//                 if (err) console.log(err);
//             });
//         }
//     });
// });