const mysql = require('mysql');
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    timezone: 'local',
    database: 'document_tracking'
});

exports.insert_document = function (document) {
    return new Promise(function (resolve, reject) {
        let sql = "INSERT INTO documents(document_no, barcode, name, description, remarks, type, priority, created_by, updated_by, created_at, updated_at, location, status) "
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

        // let sql = "SELECT d.* FROM documents d WHERE (location = ? AND status = 'Recieved') AND ( "
        //    + "(SELECT u.department from users u WHERE id = d.created_by) = ? OR "
        //    + "(SELECT count(*) from logs WHERE release_to = ? "
        //    + "AND document_id = d.id) > 0) ";

        let sql = "";
        let values = [];
        if (param.general == 'pending') {
            sql = `SELECT d.*
                    FROM logs l RIGHT JOIN documents d 
                        ON l.document_id = d.id 
                        AND d.status <> 'Cycle End'
                    WHERE release_to = ?
                        AND (recieve_by IS NOT NULL 
                                AND release_date IS NULL) `;

            values = [param.department];

            if (param.type) {
                sql += "AND d.type = ? "
                values[values.length] = param.type;
            }
        } else {
            sql = "SELECT d.* from documents d "
                + "WHERE ((created_by = ? OR (location = ? "
                + "AND (status = 'Recieved' OR status = 'Cycle End'))) OR "
                + "(SELECT count(*) from logs WHERE release_to = ? "
                + "AND document_id = d.id AND (recieve_by IS NOT NULL OR release_date IS NOT NULL)) > 0) "

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

        sql += "ORDER BY priority DESC, id DESC "

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
        let sql = "SELECT d.* from documents d WHERE barcode IS NOT NULL "
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
                        AND (recieve_by IS NOT NULL 
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
            console.log(err);
            if (err) reject(new Error("GET pending documents failed"));

            resolve(result);
        });
    });
}

exports.get_sendout = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT d.barcode, d.name, d.type, l.release_date, 
                        (SELECT release_to 
                            FROM logs rl 
                            WHERE rl.id > l.id AND rl.document_id = l.document_id 
                            limit 1) AS release_to 
                    FROM documents d, logs l
                    WHERE d.id = l.document_id AND l.release_date IS NOT NULL AND
                         l.release_date >= ? AND l.release_date <= ? AND l.release_to = ?
                    ORDER BY release_to, release_date desc `

        let values = [param.date_from, param.date_to, param.department];

        if (param.limit) {
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

exports.get_release_sendout = function (barcodes) {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT d.barcode, d.name, d.type
        FROM document_tracking.documents d
        WHERE d.barcode IN (?) `

        let values = [barcodes];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET sendout failed"));

            resolve(result);
        });
    });
}

exports.get_count = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT count(*) AS count from documents d "
            + "WHERE ((created_by = ? OR (location = ? "
            + "AND status = 'Recieved')) OR "
            + "(SELECT count(*) from logs WHERE release_to = ? "
            + "AND document_id = d.id AND (recieve_by IS NOT NULL OR release_date IS NOT NULL)) > 0) "

        let values = [param.user_id, param.department, param.department];

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
            if (err) reject(new Error("GET count document failed"));

            resolve(result);
        });
    });
}

exports.get_all_count = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT count(id) AS count from documents d WHERE barcode IS NOT NULL "
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
                        AND d.status <> 'Cycle End'
                    WHERE release_to = ?
                        AND (recieve_by IS NOT NULL 
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

exports.check_document = function (barcode) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT name, description from documents "
            + "WHERE barcode = ?"

        const values = [barcode];

        conn.query(sql, values, function (err, result) {
            console.log(err);
            if (err) reject(new Error("GET document failed"));

            resolve(result);
        });
    });
}

exports.get_docno = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT d.document_no from documents d "
            + "WHERE d.document_no != '' AND d.document_no != 'n/a' AND ((created_by = ? OR (location = ? "
            + "AND status = 'Recieved')) OR "
            + "(SELECT count(*) from logs WHERE release_to = ? "
            + "AND document_id = d.id AND recieve_by IS NOT NULL) > 0) "

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
        let sql = `SELECT d.document_no from documents d WHERE d.document_no <> '' 
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
        let sql = "SELECT d.barcode from documents d "
            + "WHERE ((created_by = ? OR (location = ? "
            + "AND status = 'Recieved')) OR "
            + "(SELECT count(*) from logs WHERE release_to = ? "
            + "AND document_id = d.id AND recieve_by IS NOT NULL) > 0) "

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
        let sql = "SELECT barcode from documents WHERE barcode IS NOT NULL "
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
        let sql = "SELECT d.type from documents d "
            + "WHERE ((created_by = ? OR (location = ? "
            + "AND status = 'Recieved')) OR "
            + "(SELECT count(*) from logs WHERE release_to = ? "
            + "AND document_id = d.id AND recieve_by IS NOT NULL) > 0) "

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
        let sql = "SELECT type from documents WHERE type IS NOT NULL "

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

exports.get_pending_graph_data = function (department) {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT MONTHNAME(recieve_date) AS month, COUNT(*) AS count
                    FROM document_tracking.logs l 
                    RIGHT JOIN document_tracking.documents d 
                        ON l.document_id = d.id AND d.status <> 'Cycle End'
                    WHERE release_to = ? && (recieve_by IS NOT NULL AND release_date IS NULL)
                    GROUP BY month
                    ORDER BY recieve_date `

        const values = [department];
        let pnd_arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET pending document failed"));

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

exports.get_recieve_graph_data = function (department) {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT MONTHNAME(recieve_date) AS month,
                COUNT(*) AS count
                FROM logs
                WHERE release_to = ? AND recieve_by IS NOT NULL
                GROUP BY month
                ORDER BY recieve_date`

        const values = [department];
        let rcv_arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET document types failed"));

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
                        recieve_counts: rcv_arr
                    };

                    resolve(data);
                    return
                }

            }

            reject(new Error("No contents"));
        });
    });
}

exports.get_release_graph_data = function (department) {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT MONTHNAME(release_date) AS month, COUNT(*) AS count
                FROM logs
                WHERE release_to = ? AND release_date IS NOT NULL
                GROUP BY month
                ORDER BY release_date`

        const values = [department];
        let rls_arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET document types failed"));

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

exports.get_recievable_bcodes = function (id, department) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT barcode FROM documents "
            + "WHERE location = ? AND status = 'Pending' AND location <> '' ";

        const values = [department];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET recievable barcodes failed"));

            resolve(result);
        });
    })
}

exports.get_releasable_bcodes = function (id, department) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT barcode FROM documents "
            + "WHERE (location = ? AND status = 'Recieved') OR "
            + "(location = '' AND created_by = ?) ";

        const values = [department, id];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("GET releasable barcodes failed"));

            resolve(result);
        });
    })
}

exports.update_document = function (document) {
    return new Promise(function (resolve, reject) {
        let sql = "UPDATE documents SET document_no = ?, name = ?, description = ?, remarks = ?, type = ?, priority = ?,  updated_by = ?, updated_at = NOW() "
            + "WHERE id = ?";

        const values = [document.getDocNo(), document.getName(), document.getDescription(), document.getRemarks(),
        document.getType(), document.getPriority(), document.getUpdateBy(), document.getId()];

        conn.query(sql, values, function (err, result) {
            if (err) reject(new Error("Update failed"));

            resolve();
        });
    })
}

exports.recieve_document = function (barcode) {
    return new Promise(function (resolve, reject) {
        let sql = "UPDATE documents SET status = 'Recieved' "
            + "WHERE barcode IN (?)";

        const values = [barcode];

        conn.query(sql, values, function (err, result) {
            if (err || result.affectedRows == 0) reject(new Error("Recieve failed"));

            resolve();
        });
    })
}

exports.end_cycle_document = function (param) {
    return new Promise(function (resolve, reject) {
        let sql = "UPDATE documents SET updated_by = ?, updated_at = NOW(), "
            + "status = 'Cycle End' WHERE id = ? ";

        const values = [param.user_id, param.id];

        conn.query(sql, values, function (err, result) {
            console.log(err);
            if (err || result.affectedRows == 0) reject(new Error("Recieve failed"));

            resolve();
        });
    })
}

exports.update_location = function (barcodes, location) {
    return new Promise(function (resolve, reject) {
        let sql = "UPDATE documents SET location = ?, status = 'Pending' "
            + "WHERE barcode IN (?)";

        const values = [location, barcodes];

        conn.query(sql, values, function (err, result) {
            console.log(err);
            if (err) reject(new Error("Update location failed"));

            resolve();
        });
    })
}

exports.delete_document = function (id) {
    return new Promise(function (resolve, reject) {
        let sql = "DELETE FROM documents WHERE id = ?";

        const values = [parseInt(id)];

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