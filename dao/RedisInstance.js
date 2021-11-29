const redis = require('redis');
const redis_client = redis.createClient();
const UserRedis = require("../redis/UserRedis.js");
const RoomRedis = require("../redis/RoomRedis.js");
const RoomService = require("../services/RoomService.js");
redis_client.config('set', 'notify-keyspace-events', 'KEA');
redis_client.subscribe('__keyevent@0__:expired');

function redis_client_init(socketIO) {
    // TODO: Remove sessionTable, userTable, rooms
    redis_client.on('connect', function () {
        console.log('Redis Connected!'); // Connected!
    });
    redis_client.on('message', async function (channel, key) {
        console.log(channel + " " + key);
        let keys = key.split(':');
        if (keys[0] === "sessionExpire") {
            await RoomService.exitRoom(keys[1], null);
            await UserRedis.logout(keys[1]);
        } else if (keys[0] === "answerEX") {
            let roomId = Number(keys[1]);
            let roomInfo = await RoomRedis.fetchRoomBasicInfo(roomId);
            if (Object.keys(roomInfo).length === 0) {
                return;
            }
            let playerId = Number(keys[2]);
            let playerName = keys[3];
            let playerIndex = Number(keys[4]);
            let playerAnswer = keys[5];
            await RoomRedis.updatePainterScore(roomId, playerId, playerId + ":" + playerName + ":" + playerIndex
                + ":" + playerAnswer)
            if (playerIndex + 1 === 8) {
                try {
                    // Send game result to front end.
                    let scores = await RoomRedis.gameOver(roomId);
                    let players = await RoomRedis.queryPlayers(roomId);
                    scores = parseScores(scores, players);
                    socketIO.to(roomId.toString()).emit("gameOver", JSON.stringify({
                        scores: scores,
                    }));
                } catch (e) {
                    console.error(e);
                }
            } else {
                // Next round
                socketIO.to(roomId.toString()).emit("answer", JSON.stringify({
                    word: playerAnswer,
                }));
                let result = await RoomService.setNextRound(roomId, playerIndex + 1);
                if (result === null) {
                    try {
                        // Send game result to front end.
                        let scores = await RoomRedis.gameOver(roomId);
                        let players = await RoomRedis.queryPlayers(roomId);
                        scores = parseScores(scores, players);
                        socketIO.to(roomId.toString()).emit("gameOver", JSON.stringify({
                            scores: scores,
                        }));
                    } catch (e) {
                        console.error(e);
                    }
                } else {
                    let targetPlayerSocketId = await UserRedis.fetchSocketId(result.playerId);
                    socketIO.to(roomId.toString()).emit("drawWord", JSON.stringify({
                        word: "",
                    }));
                    socketIO.to(targetPlayerSocketId).emit("drawWord", JSON.stringify({
                        word: result.drawWord,
                    }));
                }
            }
        }
    });
}

function parseScores(scores, players) {
    let ret = {};
    for (let [key, val] of Object.entries(players)) {
        ret[val.userId] = {
            userId: val.userId,
            username: val.username,
            score: 0,
        }
    }
    for (let i = 0; i < scores.length; i += 2) {
        ret[Number(scores[i])].score = Number(scores[i + 1]);
    }
    return ret;
}

module.exports = {redis_client, redis_client_init}
