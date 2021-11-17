const fs = require("fs");
const path = require("path");
const redis = require('redis');
const redis_client = redis.createClient();
const USER_TABLE_PREFIX = "user:";
const ROOM_PREFIX = "room:";
const PLAYERS_PREFIX = "players:";
const SEATS_PREFIX = "seats:";

let exported = {
    queryRooms: function () {
        return new Promise(function (resolve, reject) {
            redis_client.eval(fs.readFileSync(path.resolve(__dirname, './lua/queryRooms.lua')), 1, ROOM_PREFIX,
                function (err, result) {
                    if (err) {
                        console.error(err);
                        reject("Redis down");
                    } else {
                        let ret = [];
                        for (let i = 0; i < result.length; i++) {
                            let oneRoom = result[i];
                            let oneRet = {};
                            for (let j = 0; j < oneRoom.length; j += 2) {
                                if (oneRoom[j] === "roomId") {
                                    oneRet[oneRoom[j]] = Number(oneRoom[j + 1]);
                                } else {
                                    oneRet[oneRoom[j]] = oneRoom[j + 1];
                                }
                            }
                            ret.push(oneRet);
                        }
                        resolve(ret);
                    }
                });
        });
    },
    queryPlayers: function (roomId) {
        return new Promise(function (resolve, reject) {
            redis_client.hgetall(PLAYERS_PREFIX + roomId, function (err, result) {
                if (err) {
                    console.error(err);
                    reject("Redis down");
                } else {
                    let ret = {};
                    for (let key in result) {
                        let keySplit = key.split(":");
                        let userId = Number(keySplit[0]);
                        let username = keySplit[1];
                        let ready = Number(result[key]);
                        ret[userId] = {
                            "userId": userId,
                            "username": username,
                            "ready": ready
                        }
                    }
                    resolve(ret);
                }
            })
        });
    },
    fetchRoomOwner: function (roomId) {
        return new Promise(function (resolve, reject) {
            redis_client.hget(ROOM_PREFIX + roomId, "roomOwner", function (err, result) {
                if (err) {
                    console.error(err);
                    reject("Redis down");
                } else {
                    resolve(result);
                }
            })
        });
    },
    queryPlayersInfo: function (roomId) {
        return new Promise(function (resolve, reject) {
            redis_client.hgetall(PLAYERS_PREFIX + roomId, function (err, result) {
                if (err) {
                    console.error(err);
                    reject("Redis down");
                } else {
                    resolve(result);
                }
            })
        });
    },
    getNewRoomId: function () {
        return new Promise(function (resolve, reject) {
            redis_client.incr("roomIdCount", function (err, result) {
                if (err) {
                    console.error(err);
                    reject("Redis down");
                } else {
                    resolve(result);
                }
            })
        });
    },
    createAndEnterRoom: function (roomId, roomName, roomPassword, roomOwnerId, roomOwnerName) {
        return new Promise(function (resolve, reject) {
            redis_client.eval(fs.readFileSync(path.resolve(__dirname, './lua/createRoom.lua')), 9,
                USER_TABLE_PREFIX, ROOM_PREFIX, PLAYERS_PREFIX, SEATS_PREFIX, roomId, roomName, roomPassword, roomOwnerId,
                roomOwnerName, function (err, result) {
                    if (err) {
                        console.error(err);
                        reject("Redis down");
                    } else {
                        resolve(result);
                    }
                });
        });
    },
    needPassword: function (roomKey) {
        return new Promise(function (resolve, reject) {
            redis_client.hget(ROOM_PREFIX + roomKey, "roomPassword", function (err, result) {
                if (err) {
                    console.error(err);
                    reject("Redis down");
                } else {
                    resolve(result !== null && result !== "");
                }
            })
        });
    },
    fetchRoomBasicInfo: function (roomId) {
        return new Promise(function (resolve, reject) {
            redis_client.eval(fs.readFileSync(path.resolve(__dirname, './lua/fetchRoomBasicInfo.lua')), 2,
                ROOM_PREFIX, roomId, function (err, result) {
                    if (err) {
                        console.error(err);
                        reject("Redis down");
                    } else {
                        let ret = {};
                        if (result !== null) {
                            for (let i = 0; i < result.length; i += 2) {
                                let key = result[i];
                                let value = result[i + 1];
                                if (key !== "roomPassword") {
                                    ret[key] = value;
                                }
                            }
                        }
                        resolve(ret);
                    }
                });
        });
    },
    enterRoom: function (roomId, roomPassword, userId, roomName, username) {
        return new Promise(function (resolve, reject) {
            redis_client.eval(fs.readFileSync(path.resolve(__dirname, './lua/enterRoom.lua')), 9,
                USER_TABLE_PREFIX, ROOM_PREFIX, PLAYERS_PREFIX, SEATS_PREFIX, roomId, roomPassword, userId, roomName, username,
                function (err, result) {
                    if (err) {
                        console.error(err);
                        reject("Redis down");
                    } else {
                        resolve(result);
                    }
                });
        });
    },
    exitRoom: function (userId, username, userRoomId) {
        return new Promise(function (resolve, reject) {
            redis_client.eval(fs.readFileSync(path.resolve(__dirname, './lua/exitRoom.lua')), 7,
                USER_TABLE_PREFIX, ROOM_PREFIX, PLAYERS_PREFIX, SEATS_PREFIX, userRoomId, userId, username,
                function (err, result) {
                    if (err) {
                        console.error(err);
                        reject("Redis down");
                    } else {
                        resolve(result);
                    }
                });
        });
    },
    changeSeat: function (userId, username, userRoomId, targetSeatIndex) {
        return new Promise(function (resolve, reject) {
            redis_client.eval(fs.readFileSync(path.resolve(__dirname, './lua/changeSeat.lua')), 5,
                PLAYERS_PREFIX, userId, username, userRoomId, targetSeatIndex,
                function (err, result) {
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
