login_sql = require("../js/login_sql");
encrypt = require("../tool/encryption");

let exported = {
    login: async function (req,res){
        const user = req.body.username;
        const pwd = req.body.password;
        const session = req.sessionID;

        if(!user){
            res.json({ code: -1, message: 'Username cannot be empty' });
        }
        else if(!pwd){
            res.json({ code: -1, message: 'Password cannot be empty' });
        }
        else{
            // 输出 JSON 格式
            const response = {
                "user": user,
                "pwd": pwd,
                "session": session
            };
            console.log(response);
            res.end(JSON.stringify(response));}
    },

    signup: function (req,res){
        const user = req.body.username;
        const pwd = req.body.password;
        const session = req.sessionID;

        if(!user){
            res.json({ code: -1, message: 'Username cannot be empty' });
        }
        else if(!pwd){
            res.json({ code: -1, message: 'Password cannot be empty' });
        }
        else{
            let hashedPwd = encrypt.hash(pwd);
            login_sql.register(user,hashedPwd);
            // 输出 JSON 格式
            const response = {
                "user": user,
                "pwd": pwd,
                "session": session
            };
            console.log(response);
            res.end(JSON.stringify(response));
        }
    }
}

module.exports = exported;