const year = '2020';

const mysql = require('mysql');
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'document_tracking'
});

conn.connect(function (err) {
    if (err) {
        return console.error('error: ' + err.message);
    }

    let userTbl = `create table if not exists users(
                            id int primary key auto_increment,
                            username varchar(50) not null,
                            password varchar(255) not null,
                            fname varchar(50) not null,
                            mname varchar(10) not null,
                            lname varchar(50) not null,
                            designation varchar(50) not null,
                            department varchar(100) not null,
                            access_right varchar(10) not null
                        )`;

    conn.query(userTbl, function (err, results, fields) {
        if (err) throw err;

        console.log("User Table created");

        createAccessRightsTbl();
    });
});

function createAccessRightsTbl() {
    let rytsTbl = `create table if not exists access_rights(
        id int primary key auto_increment,
        description varchar(50) not null,
        all_documents tinyint(1) default 0
    )`;

    conn.query(rytsTbl, function (err, results, fields) {
        if (err) throw err;

        console.log("Access_Rights Table created");

        createDocumentTbl();
    });
}

function createDocumentTbl() {

    let docTbl = `create table if not exists documents_` + year + `(
                                id int primary key auto_increment,
                                document_no varchar(50) not null,
                                barcode varchar(50) not null,
                                name varchar(255) not null,
                                description varchar(255) not null,
                                remarks varchar(255) not null,
                                type varchar(50) not null,
                                priority varchar(20) not null,
                                created_by varchar(25) not null,
                                updated_by varchar(25) not null,
                                location varchar(100),
                                status varchar(25) not null default 'Pending',
                                lapse_at datetime,
                                created_at datetime,
                                updated_at datetime
                            )`;

    conn.query(docTbl, function (err, results, fields) {
        if (err) throw err;

        console.log("Document_" + year + " Table created");

        createLogsTbl();
    });
}

function createLogsTbl() {

    let logsTbl = `create table if not exists logs_` + year + `(
        id int primary key auto_increment,
        document_id varchar(25) not null,
        release_from varchar(100) not null,
        release_to varchar(100) not null,
        receive_by varchar(100),
        receive_date datetime,
        release_by varchar(100),
        release_date datetime,
        remarks varchar(255),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`;

    conn.query(logsTbl, function (err, results, fields) {
        if (err) throw err;

        console.log("Logs_" + year + " Table created");
    });

    conn.end(function (err) {
        if (err) throw err;
    });
}