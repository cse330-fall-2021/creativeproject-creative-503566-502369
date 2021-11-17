login_sql = require("../js/login_sql");
encrypt = require("../tool/encryption");
redis_store = require("../js/redis_store");
res_handler = require("../tool/ResHandler");

let exported = {
    login: async function (req, res) {
        const user = req.body.username;
        const pwd = req.body.password;
        const session = req.session;

        if (!user) {
            res.json({code: -1, message: 'Username cannot be empty'});
        } else if (!pwd) {
            res.json({code: -1, message: 'Password cannot be empty'});
        } else {
            let row = await login_sql.validate_user(user);
            let info = row[0];

            if (row.length == 0) {
                res_handler.fail(res,"Username not exist");
            }
            else if (!encrypt.compare(pwd, info.password)) {
                res_handler.fail(res,"Password does not match.");
            } else {
                //mysql store
                login_sql.login(info.username, req.sessionID);
                // redis store
                let id = info.id;
                session.userId = info.id;
                session.csrf = encrypt.randomBase64();
                let data = {
                    'csrf': session.csrf,
                    'username': info.username,
                    'session': req.sessionID,
                    'id': id
                };
                data = JSON.stringify(data);
                redis_store.login(id, data);
                const response = {
                    "user": user,
                    "pwd": pwd,
                    "session": req.sessionID,
                    'Mess': "Login success!"
                };
                res_handler.success(res,response);
            }
            // 输出 JSON 格式
            // console.log(response);
            // res.end(JSON.stringify(response));
        }
    },

    signup: function (req, res) {
        const user = req.body.username;
        const pwd = req.body.password;
        const session = req.sessionID;

        if (!user) {
            res.json({code: -1, message: 'Username cannot be empty'});
        } else if (!pwd) {
            res.json({code: -1, message: 'Password cannot be empty'});
        } else {
            login_sql.user_exist(user, function (result) {
                if (result) {
                    let hashedPwd = encrypt.hash(pwd);
                    login_sql.register(user, hashedPwd);
                    // 输出 JSON 格式
                    const response = {
                        "user": user,
                        "pwd": pwd,
                        "session": session
                    };
                    console.log(response);
                    // res.end(JSON.stringify(response));
                    res_handler.success(res,response);
                } else {
                    res_handler.fail(res,"Username already exist");
                }
            });
        }
    },

    logout: function (req, res) {
        console.log(req.sessionID);
        login_sql.logout(req.sessionID);
        redis_store.logout(req.sessionID);
        req.session.destroy();
        res_handler.success(res);
    }

}

module.exports = exported;