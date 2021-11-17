local roomPrefix = KEYS[1]
local playerPrefix = KEYS[2]
local userId = KEYS[3]
local username = KEYS[4]
local roomId = KEYS[5]

local playerStatus = redis.call("hget", playerPrefix .. roomId, userId .. ":" .. username)
local roomOwner = redis.call("hget", roomPrefix .. roomId, "roomOwner")
if playerStatus == nil or roomOwner == nil then
    return -1
end

local start_i = -1
local end_j = 1;
local substr = "";
start_i, end_j, substr = string.find(roomOwner, ":")
local roomOwnerId = tonumber(string.sub(roomOwner, 1, start_i - 1))
if tonumber(userId) == roomOwnerId then
    return 1
end

start_i, end_j, substr = string.find(playerStatus, ":")
local playerPos = tonumber(string.sub(playerStatus, 1, start_i - 1))
local playerReady = tonumber(string.sub(playerStatus, start_i + 1, -1))
if playerReady == 0 then
    playerReady = 1
else
    playerReady = 0
end

redis.call("hset", playerPrefix .. roomId, userId .. ":" .. username, playerPos .. ":" .. playerReady)
return playerReady


