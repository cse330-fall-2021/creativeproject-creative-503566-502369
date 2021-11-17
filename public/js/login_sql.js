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
                console.log(user," Register Success!");
            }
        });
    },

    user_exist: function (user, callback){
        let ret = true;
        let sql = "SELECT * FROM users WHERE username = ?";
        mysql.query(sql, [user], function (err,result){
            if (err) {
                throw err;
            }
            else {
                if (result.length > 0) {
                    ret = false;
                }
                callback(ret);
            }
        });
    },

    validate_user: function (user) {
        let sql = "SELECT * FROM users WHERE username = ?";
        return new Promise(function (resolve,reject){
            mysql.query(sql, [user], function (err,result){
                if (err) {
                    throw err;
                    reject('sql error');
                }
                else{
                    resolve(result);
                }
            });
        });
    },

    login: function (user, session){
        let sql = "UPDATE users SET login_status = 1, current_session_id = ? WHERE username = ?";
        mysql.query(sql, [session, user], function (err){
            if(err) {
                throw err;
            }
        });
    },

    logout: function (session){
        let sql = "UPDATE users SET login_status = 0 WHERE current_session_id = ?";
        mysql.query(sql, [session], function (err, result){
            if (err){
                throw  err;
            }
        });
    }

}

module.exports = exported