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
            redis_client.keys(ROOM_PREFIX + "*", function (err, rooms) {
                if (err) {
                    console.error(err);
                    reject("Redis down");
                } else {
                    let ret = [];
                    for (let i = 0; i < rooms.length; i++) {
                        let roomSplit = rooms[i].split(":");
                        let roomId = Number(roomSplit[1]);
                        let roomName = roomSplit[2];
                        ret.push({
                            "roomId": roomId,
                            "roomName": roomName,
                        });
                    }
                    resolve(ret);
                }
            })
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
};

module.exports = exported
