const mysql = require('mysql');

const mysql_client = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    database: "draw_guess",
    user: "yiwei_z",
    password: "hehe13"
});

module.exports = {mysql_client}
