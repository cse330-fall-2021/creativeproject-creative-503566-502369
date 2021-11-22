local roomPrefix = KEYS[1]
local playerPrefix = KEYS[2]
local roomId = KEYS[3]

local allPlayers = redis.call("hgetall", playerPrefix .. roomId)
local roomOwner = redis.call("hget", roomPrefix .. roomId, "roomOwner")
redis.call("hset", roomPrefix .. roomId, "start", 0)
redis.call("hdel", roomPrefix .. roomId, "answer")

local i = 1
local playerKey = ""
local playerVal = ""
local start_i = 1;
local end_j = 1;
local substr = "";
while(i < #allPlayers)
do
    playerKey = allPlayers[i]
    playerVal = allPlayers[i+1]
    start_i, end_j, substr = string.find(playerVal, ":")
    local playerPos = tonumber(string.sub(playerVal, 1, start_i - 1))
    if playerKey ~= roomOwner then
        redis.call("hset", playerPrefix .. roomId, playerKey, playerPos .. ":0")
    end
    i = i + 2
end

