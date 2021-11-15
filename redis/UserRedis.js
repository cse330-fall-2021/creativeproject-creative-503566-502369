let connections = require("../dao/connections.js")
const fs = require("fs");
const path = require("path");
const redis_client = connections.getRedisClient();
const SESSION_TABLE_KEY = "sessionTable";
const USER_TABLE_PREFIX = "user:";

let exported = {
    login: function (userId, username, sessionId, csrfToken) {
        // update session table and insert user hash table
        return new Promise(function (resolve, reject) {
            let a = path.resolve(__dirname, './lua/login.lua');
            redis_client.eval(fs.readFileSync(path.resolve(__dirname, './lua/login.lua')), 4, SESSION_TABLE_KEY, USER_TABLE_PREFIX, userId,
                sessionId, username, csrfToken, function (err, result) {
                    if (err) {
                        console.error(err);
                        reject("Redis down");
                    } else {
                        resolve(result);
                    }
                });
        });
    },
};

module.exports = exported
