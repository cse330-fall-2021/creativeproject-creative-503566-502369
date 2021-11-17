local roomPrefix = KEYS[1]
local playerPrefix = KEYS[2]
local userId = KEYS[3]
local username = KEYS[4]
local roomId = KEYS[5]
local targetSeatIndex = KEYS[6]

local allPlayers = redis.call("hgetall", playerPrefix .. roomId)
local roomOwner = redis.call("hget", roomPrefix .. roomId, "roomOwner")
if #allPlayers == 0 or roomOwner == nil then
    return -1
end

local i = 1
local playerKey = ""
local playerVal = ""
local start_i = 1
local end_j = 1;
local substr = ""
while(i < #allPlayers)
do
    playerKey = allPlayers[i]
    playerVal = allPlayers[i+1]
    start_i, end_j, substr = string.find(playerVal, ":")
    local playerPos = tonumber(string.sub(playerVal, 1, start_i - 1))
    local playerReady = tonumber(string.sub(playerVal, start_i + 1, -1))
    if playerPos == tonumber(targetSeatIndex) then
        return -2
    end
    i = i + 2
end
local isOwner = 0
local start_i = -1
local end_j = 1;
local substr = "";
start_i, end_j, substr = string.find(roomOwner, ":")
local roomOwnerId = tonumber(string.sub(roomOwner, 1, start_i - 1))
if tonumber(userId) == roomOwnerId then
    isOwner = 1
end

redis.call("hset", playerPrefix .. roomId, userId .. ":" .. username, targetSeatIndex .. ":" .. isOwner)
return 1
