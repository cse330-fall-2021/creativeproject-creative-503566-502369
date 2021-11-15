let connections = require("./connections.js")
let mysql = connections.mysql_client

let exported = {
    fetchByUsername: function (username) {
        let sql = "SELECT * FROM users WHERE username = ?";
        return new Promise(function (resolve, reject) {
            mysql.query(sql, [username], function (err, rows, fields) {
                if (err) {
                    console.error(err);
                    reject("Mysql down.");
                } else {
                    resolve(rows);
                }
            });
        });
    },
    register: function (username, hashedPassword) {
        let sql = "INSERT INTO users (username, password, login_status, create_time, last_update_time) VALUES (?,?,?,?,?)";
        let create_time = new Date();
        return new Promise(function (resolve, reject) {
            mysql.query(sql, [username, hashedPassword, 0, create_time, create_time], function (err, rows, fields) {
                if (err) {
                    console.error(err);
                    reject("Mysql down.");
                } else {
                    resolve(true);
                }
            });
        });
    },
    login: function (userId, sessionId) {
        let sql = "UPDATE users SET login_status = 1, current_session_id = ? WHERE id = ?";
        return new Promise(function (resolve, reject) {
            mysql.query(sql, [sessionId, userId], function (err, rows, fields) {
                if (err) {
                    console.error(err);
                    reject("Mysql down.");
                } else {
                    resolve(true);
                }
            });
        });
    },
};

module.exports = exported
