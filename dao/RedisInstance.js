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
            UserRedis.logout(keys[1]);
        } else if (keys[0] === "AnswerEX") {
            let roomId = Number(keys[1]);
            let roomInfo = await RoomRedis.fetchRoomBasicInfo(roomId);
            if (Object.keys(roomInfo).length === 0) {
                return;
            }
            let playerId = Number(keys[2]);
            let playerName = keys[3];
            let playerIndex = Number(keys[4]);
            let playerAnswer = keys[5];
            if (playerIndex + 1 === 8) {
                //TODO: game over
                // Send game result to front end.
                try {
                    await RoomRedis.gameOver(roomId);
                } catch (e) {
                    console.error(e);
                }
                socketIO.to(roomId.toString()).emit("gameOver", JSON.stringify({
                    word: "OVER",
                }));
            } else {
                // Next round
                socketIO.to(roomId.toString()).emit("answer", JSON.stringify({
                    word: playerAnswer,
                }));
                let result = await RoomService.setNextRound(roomId, playerIndex + 1);
                if (result === null) {
                    //TODO: game over
                    // Send game result to front end.
                    try {
                        await RoomRedis.gameOver(roomId);
                    } catch (e) {
                        console.error(e);
                    }
                    socketIO.to(roomId.toString()).emit("gameOver", JSON.stringify({
                        word: "OVER",
                    }));
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

module.exports = {redis_client, redis_client_init}
