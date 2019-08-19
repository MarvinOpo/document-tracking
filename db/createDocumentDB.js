const mysql = require('mysql');
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234'
});

conn.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
  conn.query("CREATE DATABASE document_tracking", function (err, result) {
    if (err) throw err;
    console.log("Database created");

  });
});