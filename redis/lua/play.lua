local roomPrefix = KEYS[1]
local playerPrefix = KEYS[2]
local userId = KEYS[3]
local username = KEYS[4]
local roomId = KEYS[5]

local allPlayers = redis.call("hgetall", playerPrefix .. roomId)
local roomOwner = redis.call("hget", roomPrefix .. roomId, "roomOwner")
local gameStart = tonumber(redis.call("hget", roomPrefix .. roomId, "start"))
if gameStart == 1 then
    return -5
end
if #allPlayers == 0 or roomOwner == nil then
    return -1
end
if #allPlayers <= 2 then
    return -4
end

local start_i = -1
local end_j = 1;
local substr = "";
start_i, end_j, substr = string.find(roomOwner, ":")
local roomOwnerId = tonumber(string.sub(roomOwner, 1, start_i - 1))
if tonumber(userId) ~= roomOwnerId then
    return -2
end

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
    local playerReady = tonumber(string.sub(playerVal, start_i + 1, -1))
    if playerReady ~= 1 then
        return -3
    end
    i = i + 2
end

--- Game start
redis.call("hset", roomPrefix .. roomId, "start", 1)
return 1
