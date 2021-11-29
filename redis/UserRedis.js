const fs = require("fs");
const path = require("path");
const redis = require('redis');
const redis_client = redis.createClient();
const SESSION_TABLE_KEY = "sessionTable";
const USER_TABLE_PREFIX = "user:";

let exported = {
    fetchBySessionId: function (sessionId) {
        return new Promise(function (resolve, reject) {
            redis_client.eval(fs.readFileSync(path.resolve(__dirname, './lua/fetchBySessionId.lua')), 3,
                SESSION_TABLE_KEY, USER_TABLE_PREFIX, sessionId, function (err, result) {
                    if (err) {
                        console.error(err);
                        reject("Redis down");
                    } else {
                        resolve(result);
                    }
                });
        });
    },
    isLogin: function (sessionId) {
        // update session table and insert user hash table
        return new Promise(function (resolve, reject) {
            redis_client.hexists(SESSION_TABLE_KEY, sessionId, function (err, results) {
                if (err) {
                    reject("Redis down");
                } else {
                    resolve(results === 1);
                }
            });
        });
    },
    login: function (userId, username, sessionId, csrfToken) {
        // update session table and insert user hash table
        return new Promise(function (resolve, reject) {
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
    logout: function (sessionId) {
        return new Promise(function (resolve, reject) {
            redis_client.eval(fs.readFileSync(path.resolve(__dirname, './lua/logout.lua')), 3, SESSION_TABLE_KEY,
                USER_TABLE_PREFIX, sessionId, function (err, result) {
                    if (err) {
                        console.error(err);
                        reject("Redis down");
                    } else {
                        resolve(result);
                    }
                });
        });
    },
    refreshLogin: function (sessionId) {
        return new Promise(function (resolve, reject) {
            redis_client.eval(fs.readFileSync(path.resolve(__dirname, './lua/refreshLogin.lua')), 1, sessionId, function (err, result) {
                if (err) {
                    console.error(err);
                    reject("Redis down");
                } else {
                    resolve(result);
                }
            });
        });
    },
    bindSocketId: function (sessionId, socketId) {
        return new Promise(function (resolve, reject) {
            redis_client.eval(fs.readFileSync(path.resolve(__dirname, './lua/bindSocketID.lua')), 4, SESSION_TABLE_KEY,
                USER_TABLE_PREFIX, sessionId, socketId, function (err, result) {
                    if (err) {
                        console.error(err);
                        reject("Redis down");
                    } else {
                        resolve(result);
                    }
                });
        });
    },
    fetchSocketId: function (userId) {
        return new Promise(function (resolve, reject) {
            redis_client.hget(USER_TABLE_PREFIX + userId, "socketId", function (err, results) {
                if (err) {
                    reject("Redis down");
                } else {
                    resolve(results);
                }
            });
        });
    },
    fetchUserByUserId: function (userId) {
        return new Promise(function (resolve, reject) {
            redis_client.hgetall(USER_TABLE_PREFIX + userId, function (err, result) {
                if (err) {
                    console.error(err);
                    reject("Redis down");
                } else {
                    for (const [key, value] of Object.entries(result)) {
                        if(key === "userId" || key === "roomId") {
                            result[key] = Number(value);
                        }
                    }

                    resolve(result);
                }
            });
        });
    }
};

module.exports = exported
