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
                            department varchar(100) not null
                        )`;

    conn.query(userTbl, function (err, results, fields) {
        if (err) throw err;

        console.log("User Table created");

        createDocumentTbl();
    });
});

function createDocumentTbl() {
    let docTbl = `create table if not exists documents(
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
                                created_at datetime,
                                updated_at datetime,
                                location varchar(100),
                                status varchar(25) not null default 'Pending'
                            )`;

    conn.query(docTbl, function (err, results, fields) {
        if (err) throw err;

        console.log("Document Table created");

        createLogsTbl();
    });
}

function createLogsTbl() {
    let logsTbl = `create table if not exists logs(
        id int primary key auto_increment,
        document_id varchar(25) not null,
        release_to varchar(100) not null,
        recieve_by varchar(100),
        recieve_date datetime,
        release_by varchar(100),
        release_date datetime,
        remarks varchar(255)
    )`;

    conn.query(logsTbl, function (err, results, fields) {
        if (err) throw err;

        console.log("Logs Table created");
    });

    conn.end(function (err) {
        if (err) throw err;
    });
}