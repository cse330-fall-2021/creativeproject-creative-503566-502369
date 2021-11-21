let connections = require("./connections.js")
let mysql = connections.mysql_client

let exported = {
    fetchWord: function () {
        let sql = "SELECT * FROM draw_words ORDER BY RAND() LIMIT 1";
        return new Promise(function (resolve, reject) {
            mysql.query(sql, [], function (err, rows, fields) {
                if (err) {
                    console.error(err);
                    reject("Mysql down.");
                } else {
                    resolve(rows);
                }
            });
        });
    },
};

module.exports = exported
