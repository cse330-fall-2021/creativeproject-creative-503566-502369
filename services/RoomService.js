const UserDao = require("../dao/UserDao.js");
const UserRedis = require("../redis/UserRedis.js");
const RetHandler = require("../tools/RetHandler.js");
const FormatChecker = require("../tools/FormatChecker.js");
const Encryption = require("../tools/Encryption.js");
const RoomRedis = require("../redis/RoomRedis.js");
const DrawWordsDao = require("../dao/DrawWordsDao.js");

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
            if (roomOwner === null) {
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
    createRoom: async function (req, res, socketIO) {
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
                // TODO: bind socket to user
                return RetHandler.success(newRoomId);
            } else {
                return RetHandler.fail(-1, "Please login first.");
            }
        } catch (e) {
            return RetHandler.fail(-2, e.message);
        }
    },
    needPassword: async function (req, res, roomId) {
        try {
            let needPassword = await RoomRedis.needPassword(roomId);
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
    enterRoom: async function (req, res, socketIO) {
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
            await this.exitRoom(sessionId, socketIO);
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
            } else if (enterRoom === -4) {
                return RetHandler.fail(4, "Game has started.");
            } else {
                // TODO: bind socket to user
                let skts = socketIO.sockets.sockets;
                skts.forEach((tempSocket) => {
                    if (tempSocket.id === userInfo.socketId) {
                        tempSocket.join(roomId.toString());
                    }
                });
                socketIO.to(roomId.toString()).emit("refreshSeat", JSON.stringify({
                    roomId: roomId,
                }));
                return RetHandler.success(roomId);
            }
        } catch (e) {
            return RetHandler.fail(-2, e.message);
        }
    },
    exitRoom: async function (sessionId, socketIO) {
        let userInfo = await fetchBySessionId(sessionId);
        if (!userInfo) {
            return RetHandler.fail(-1, "Please login first.");
        }
        let userId = userInfo.userId;
        let username = userInfo.username;
        let userRoomId = userInfo.roomId === undefined ? -1 : userInfo.roomId;
        try {
            let exitRoom = await RoomRedis.exitRoom(userId, username, userRoomId);
            if (socketIO !== null) {
                socketIO.to(userRoomId.toString()).emit("refreshSeat", JSON.stringify({
                    roomId: userRoomId,
                }));
            }
            return RetHandler.success(exitRoom);
        } catch (e) {
            return RetHandler.fail(-2, e);
        }
    },
    changeSeat: async function (req, res, socketIO) {
        let sessionId = req.sessionID;
        let targetSeatIndex = req.body.targetSeatIndex;
        let userInfo = await fetchBySessionId(sessionId);
        if (!userInfo) {
            return RetHandler.fail(-1, "Please login first.");
        }
        let userId = userInfo.userId;
        let username = userInfo.username;
        let userRoomId = userInfo.roomId;
        if (userRoomId === undefined) {
            return RetHandler.fail(3, "You are not in this room.");
        }
        try {
            let changeSeat = await RoomRedis.changeSeat(userId, username, userRoomId, targetSeatIndex);
            if (changeSeat === 1) {
                socketIO.to(userRoomId.toString()).emit("refreshSeat", JSON.stringify({
                    roomId: userRoomId,
                }));
                return RetHandler.success(changeSeat);
            } else if (changeSeat === -1) {
                return RetHandler.fail(1, "Room does not exist.");
            } else if (changeSeat === -2) {
                return RetHandler.fail(2, "Seat change failure.");
            } else if (changeSeat === -3) {
                return RetHandler.fail(3, "Game has started.");
            } else {
                return RetHandler.fail(-1, "Unknown error.");
            }
        } catch (e) {
            return RetHandler.fail(-2, e);
        }
    },
    ready: async function (req, res, socketIO) {
        let sessionId = req.sessionID;
        let userInfo = await fetchBySessionId(sessionId);
        if (!userInfo) {
            return RetHandler.fail(-1, "Please login first.");
        }
        let userId = userInfo.userId;
        let username = userInfo.username;
        let userRoomId = userInfo.roomId;
        if (userRoomId === undefined) {
            return RetHandler.fail(3, "You are not in a room.");
        }
        try {
            let ready = await RoomRedis.ready(userId, username, userRoomId);
            if (ready === 1 || ready === 0) {
                socketIO.to(userRoomId.toString()).emit("refreshSeat", JSON.stringify({
                    roomId: userRoomId,
                }));
                return RetHandler.success(ready);
            } else if (ready === -1) {
                return RetHandler.fail(1, "Room does not exist.");
            } else if (ready === -2) {
                return RetHandler.fail(2, "Game has started.");
            } else {
                return RetHandler.fail(-1, "Unknown error.");
            }
        } catch (e) {
            return RetHandler.fail(-2, e);
        }
    },
    isReady: async function (req, res) {
        let sessionId = req.sessionID;
        let userInfo = await fetchBySessionId(sessionId);
        if (!userInfo) {
            return RetHandler.fail(-1, "Please login first.");
        }
        let userId = userInfo.userId;
        let username = userInfo.username;
        let userRoomId = userInfo.roomId;
        if (userRoomId === undefined) {
            return RetHandler.fail(3, "You are not in a room.");
        }
        try {
            let isReady = await RoomRedis.isReady(userId, username, userRoomId);
            if (isReady === null || isReady === undefined || isReady === "" || !isReady) {
                return RetHandler.fail(1, "You are not in a room.");
            }
            let split = isReady.split(":");
            let ready = Number(split[1]);
            return RetHandler.success(ready === 1);
        } catch (e) {
            return RetHandler.fail(-2, e);
        }
    },
    play: async function (req, res, socketIO) {
        let sessionId = req.sessionID;
        let userInfo = await fetchBySessionId(sessionId);
        if (!userInfo) {
            return RetHandler.fail(-1, "Please login first.");
        }
        let userId = userInfo.userId;
        let username = userInfo.username;
        let userRoomId = userInfo.roomId;
        if (userRoomId === undefined) {
            return RetHandler.fail(3, "You are not in a room.");
        }
        try {
            let play = await RoomRedis.play(userId, username, userRoomId);
            if (play === 1) {
                let result = await this.setNextRound(userRoomId, 0);
                let targetPlayerSocketId = await UserRedis.fetchSocketId(result.playerId);
                socketIO.to(userRoomId.toString()).emit("gameStart", JSON.stringify({
                    roomId: userRoomId,
                }));
                socketIO.to(userRoomId.toString()).emit("drawWord", JSON.stringify({
                    word: "",
                }));
                socketIO.to(targetPlayerSocketId).emit("drawWord", JSON.stringify({
                    word: result.drawWord,
                }));
                return RetHandler.success(true);
            } else if (play === -1) {
                return RetHandler.fail(1, "Room does not exist.");
            } else if (play === -2) {
                return RetHandler.fail(2, "You are not the room owner.");
            } else if (play === -3) {
                return RetHandler.fail(3, "One or more players has not readied yet.");
            } else if (play === -4) {
                return RetHandler.fail(4, "Game can be started when there are at least 2 players.");
            } else if (play === -5) {
                return RetHandler.fail(5, "Game has started.");
            } else {
                return RetHandler.fail(-1, "Unknown error.");
            }
        } catch (e) {
            return RetHandler.fail(-2, e);
        }
    },
    bindRoom: async function (req, res, socketIO) {
        let sessionId = req.sessionID;
        let userInfo = await fetchBySessionId(sessionId);
        if (!userInfo) {
            return RetHandler.fail(-1, "Please login first.");
        }
        let userRoomId = userInfo.roomId;
        let socketId = userInfo.socketId;
        if (userRoomId === undefined || socketId === undefined) {
            return RetHandler.fail(3, "You are not in a room.");
        }
        let skts = socketIO.sockets.sockets;
        skts.forEach((tempSocket) => {
            if (tempSocket.id === socketId) {
                tempSocket.join(userRoomId.toString());
            }
        });
        return RetHandler.success(true);
    },
    getDrawWord: async function (req, res, roomId) {
        let sessionId = req.sessionID;
        let userInfo = await fetchBySessionId(sessionId);
        if (!userInfo) {
            return RetHandler.fail(-1, "Please login first.");
        }
        let userId = Number(userInfo.userId);
        let roomInfo = null;
        try {
            roomInfo = await RoomRedis.fetchRoomBasicInfo(Number(roomId));
        } catch (e) {
            return RetHandler.fail(-2, e);
        }
        let ret = "";
        let answer = roomInfo.answer;
        if (answer) {
            let splitAnswer = answer.split(":");
            let drawPlayerId = Number(splitAnswer[0]);
            if (drawPlayerId === userId) {
                ret = splitAnswer[3];
            }
        }
        return RetHandler.success(ret);
    },
    getGameState: async function (req, res, roomId) {
        let sessionId = req.sessionID;
        let userInfo = await fetchBySessionId(sessionId);
        if (!userInfo) {
            return RetHandler.fail(-1, "Please login first.");
        }
        let userId = Number(userInfo.userId);
        let roomInfo = null;
        let expire = -2;
        try {
            roomInfo = await RoomRedis.fetchRoomBasicInfo(Number(roomId));
        } catch (e) {
            return RetHandler.fail(-2, e);
        }
        let ret = {};
        let answer = roomInfo.answer;
        let start = Number(roomInfo.start);
        if (answer && start) {
            try {
                expire = await RoomRedis.getAnswerExpire(roomId, answer);
            } catch (e) {
                return RetHandler.fail(-2, e);
            }
            let splitAnswer = answer.split(":");
            let drawPlayerId = Number(splitAnswer[0]);
            if (drawPlayerId === userId) {
                ret.drawWord = splitAnswer[3];
            } else {
                ret.drawWord = "";
            }
            ret.start = 1;
            ret.countDown = Number(expire);
        } else {
            ret = {
                start: 0,
            }
        }
        return RetHandler.success(ret);
    },
    setNextRound: async function (roomId, roundIndex) {
        let targetPlayerId = -1;
        let targetPlayerName = "";
        let targetPlayerIndex = -1;
        let drawWord = "";
        try {
            // Random choose a word from database
            drawWord = await DrawWordsDao.fetchWord();
            drawWord = drawWord[0].draw_word;
            // Choose first player and send the word.
            let players = await RoomRedis.queryPlayersInfo(roomId);
            for (let i = roundIndex; i < 8; i++) {
                let flag = false;
                for (let [key, val] of Object.entries(players)) {
                    let keySplit = key.split(":");
                    let valSplit = val.split(":");
                    let playerId = Number(keySplit[0]);
                    let playerName = keySplit[1];
                    let playerIndex = Number(valSplit[0]);
                    if (playerIndex === i) {
                        flag = true;
                        targetPlayerId = playerId;
                        targetPlayerName = playerName;
                        targetPlayerIndex = playerIndex;
                        break;
                    }
                }
                if (flag) {
                    break;
                }
            }
            if (targetPlayerId === -1) {
                // All player have drawn. Game end.
                return null;
            }
            // Set room current answer.
            let setAnswer = await RoomRedis.setAnswer(roomId, targetPlayerId, targetPlayerName,
                targetPlayerIndex, drawWord);
            // Set expire key
            let setAnswerExpire = await RoomRedis.setAnswerExpire(roomId, targetPlayerId, targetPlayerName,
                targetPlayerIndex, drawWord);
        } catch (e) {
            console.error(e);
            return null;
        }
        return {
            playerId: targetPlayerId,
            playerName: targetPlayerName,
            playerIndex: targetPlayerIndex,
            drawWord: drawWord,
        };
    },
};

module.exports = exported
