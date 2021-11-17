const UserDao = require("../dao/UserDao.js");
const UserRedis = require("../redis/UserRedis.js");
const RetHandler = require("../tools/RetHandler.js");
const FormatChecker = require("../tools/FormatChecker.js");
const Encryption = require("../tools/Encryption.js");
const RoomRedis = require("../redis/RoomRedis.js");

async function fetchBySessionId(sessionId) {
    let ret = null;
    let userInfoArray = null;
    let userInfo = {};
    try {
        userInfoArray = await UserRedis.fetchBySessionId(sessionId);
        if (!userInfoArray) {
            return null;
        }
        for (let i = 0; i < userInfoArray.length; i += 2) {
            userInfo[userInfoArray[i]] = userInfoArray[i + 1];
        }
    } catch (e) {
        console.error(e);
    }
    return userInfo;
}

let exported = {
    queryRooms: async function () {
        try {
            let rooms = await RoomRedis.queryRooms();
            return RetHandler.success(rooms);
        } catch (e) {
            return RetHandler.fail(-2, e.message);
        }
    },
    queryPlayers: async function (req, res, roomId) {
        try {
            let players = await RoomRedis.queryPlayers(roomId);
            return RetHandler.success(players);
        } catch (e) {
            return RetHandler.fail(-2, e.message);
        }
    },
    querySeats: async function (req, res, roomId) {
        try {
            let seats = [];
            let players = await RoomRedis.queryPlayersInfo(roomId);
            let tempUserSeat = -1;
            for (let i = 0; i < 8; i++) {
                let oneSeat = {
                    userId: -1,
                    username: "",
                    userReady: false,
                    userSeat: -1
                };
                let flag = true;
                for (let [key, val] of Object.entries(players)) {
                    let splitVal = val.split(":");
                    tempUserSeat = Number(splitVal[0]);
                    if (tempUserSeat === i) {
                        let splitKey = key.split(":");
                        oneSeat.userId = Number(splitKey[0]);
                        oneSeat.username = splitKey[1];
                        oneSeat.userReady = Number(splitVal[1]) === 1;
                        oneSeat.userSeat = i;
                        seats.push(oneSeat);
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    seats.push(oneSeat);
                }
            }
            return RetHandler.success(seats);
        } catch (e) {
            return RetHandler.fail(-2, e.message);
        }
    },
    fetchOwner: async function (roomId) {
        try {
            let roomOwner = await RoomRedis.fetchRoomOwner(roomId);
            if(roomOwner === null) {
                return RetHandler.fail(1, "Room does not exist.");
            }
            let splitRoomOwner = roomOwner.split(":");
            return RetHandler.success({
                ownerId: Number(splitRoomOwner[0]),
                ownerName: splitRoomOwner[1],
            });
        } catch (e) {
            return RetHandler.fail(-2, e.message);
        }
    },
    createRoom: async function (req, res) {
        let roomName = req.body.roomName;
        let roomPassword = req.body.roomPassword;
        let sessionId = req.sessionID;
        let userInfo = await fetchBySessionId(sessionId);
        if (!userInfo) {
            return RetHandler.fail(-1, "Please login first.");
        }
        try {
            let newRoomId = await RoomRedis.getNewRoomId();
            let createRoom = await RoomRedis.createAndEnterRoom(newRoomId, roomName, roomPassword, userInfo.userId,
                userInfo.username);
            if (createRoom === 1) {
                return RetHandler.success(newRoomId);
            } else {
                return RetHandler.fail(-1, "Please login first.");
            }
        } catch (e) {
            return RetHandler.fail(-2, e.message);
        }
    },
    needPassword: async function (req, res, roomKey) {
        try {
            let needPassword = await RoomRedis.needPassword(roomKey);
            return RetHandler.success(needPassword);
        } catch (e) {
            return RetHandler.fail(-2, e.message);
        }
    },
    fetchRoomBasicInfo: async function (req, res, roomId) {
        try {
            let roomInfo = await RoomRedis.fetchRoomBasicInfo(roomId);
            if (Object.keys(roomInfo).length === 0) {
                return RetHandler.fail(1, "Room does not exist.");
            }
            return RetHandler.success(roomInfo);
        } catch (e) {
            return RetHandler.fail(-2, e.message);
        }
    },
    enterRoom: async function (req, res) {
        let roomId = req.body.roomId;
        let roomName = req.body.roomName;
        let roomPassword = req.body.roomPassword;
        let sessionId = req.sessionID;
        let userInfo = await fetchBySessionId(sessionId);
        if (!userInfo) {
            return RetHandler.fail(-1, "Please login first.");
        }
        if (Number(userInfo.roomId) === Number(roomId)) {
            return RetHandler.success(roomId);
        } else {
            await this.exitRoom(sessionId);
        }
        try {
            let enterRoom = Number(await RoomRedis.enterRoom(roomId, roomPassword, userInfo.userId, roomName, userInfo.username));
            if (enterRoom === 0) {
                return RetHandler.fail(-1, "Please login first.");
            } else if (enterRoom === -1) {
                return RetHandler.fail(1, "Incorrect password.");
            } else if (enterRoom === -2) {
                return RetHandler.fail(2, "Room does not exist.");
            } else if (enterRoom === -3) {
                return RetHandler.fail(3, "Room is full.");
            } else {
                return RetHandler.success(roomId);
            }
        } catch (e) {
            return RetHandler.fail(-2, e.message);
        }
    },
    exitRoom: async function (sessionId) {
        let userInfo = await fetchBySessionId(sessionId);
        if (!userInfo) {
            return RetHandler.fail(-1, "Please login first.");
        }
        let userId = userInfo.userId;
        let username = userInfo.username;
        let userRoomId = userInfo.roomId === undefined ? -1 : userInfo.roomId;
        try {
            let exitRoom = await RoomRedis.exitRoom(userId, username, userRoomId);
            return RetHandler.success(exitRoom);
        } catch (e) {
            return RetHandler.fail(-2, e);
        }
    },
    changeSeat: async function (req, res) {
        let sessionId = req.sessionID;
        let targetSeatIndex = req.body.targetSeatIndex;
        let userInfo = await fetchBySessionId(sessionId);
        if (!userInfo) {
            return RetHandler.fail(-1, "Please login first.");
        }
        let userId = userInfo.userId;
        let username = userInfo.username;
        let userRoomId = userInfo.roomId;
        if(userRoomId === undefined) {
            return RetHandler.fail(3, "You are not in this room.");
        }
        try {
            let changeSeat = await RoomRedis.changeSeat(userId, username, userRoomId, targetSeatIndex);
            if(changeSeat === 1) {
                return RetHandler.success(changeSeat);
            } else if(changeSeat === -1) {
                return RetHandler.fail(1, "Room does not exist.");
            } else if(changeSeat === -2) {
                return RetHandler.fail(2, "Seat change failure.");
            } else {
                return RetHandler.fail(-1, "Unknown error.");
            }
        } catch (e) {
            return RetHandler.fail(-2, e);
        }
    },
};

module.exports = exported
