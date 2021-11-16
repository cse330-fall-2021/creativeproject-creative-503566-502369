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
    queryRooms: async function (req, res) {
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
    createRoom: async function (req, res) {
        let roomName = req.body.roomName;
        let roomPassword = req.body.roomPassword;
        let sessionId = req.sessionID;
        let userInfo = await fetchBySessionId(sessionId);
        if (!userInfo) {
            return RetHandler.fail(-1, "Please login first.");
        }
        // TODO: Exit room first
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
        try {
            let enterRoom = Number(await RoomRedis.enterRoom(roomId, roomPassword, userInfo.userId, roomName, userInfo.username));
            console.log(enterRoom);
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
    exitRoom: async function (req, res) {

    },
};

module.exports = exported
