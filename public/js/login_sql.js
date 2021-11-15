let connections = require("./connection")
let mysql = connections.mysql_client


let exported = {
    register: function (user,pwd){
        let sql = "INSERT INTO users (username, password, login_status, create_time, last_update_time) VALUES (?,?,?,?,?)";
        let create_time = new Date();
        mysql.query(sql, [user, pwd, 0, create_time, create_time], function (err, result) {
            if (err) {
                throw err;
            } else {
                console.log("Register Success!");
            }
        });
    }
}

module.exports = exported