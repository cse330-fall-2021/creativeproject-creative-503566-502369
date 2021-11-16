local userTablePrefix = KEYS[1]
local roomPrefix = KEYS[2]
local playerPrefix = KEYS[3]
local seatPrefix = KEYS[4]
local roomId = KEYS[5]
local roomName = KEYS[6]
local roomPassword = KEYS[7]
local roomOwnerId = KEYS[8]
local roomOwnerName = KEYS[9]

local exists = redis.call("exists", userTablePrefix .. roomOwnerId)
if exists == 1 then
    redis.call("hset", userTablePrefix .. roomOwnerId, "roomId", tonumber(roomId))
    redis.call("hset", playerPrefix .. roomId, roomOwnerId .. ":" .. roomOwnerName, 1) --- 1 stands for ready.
    redis.call("hmset", roomPrefix .. roomId..":"..roomName, "roomName", roomName, "roomPassword", roomPassword,
     "roomId", roomId, "roomOwnerId", roomOwnerId)
    redis.call("hmset", seatPrefix .. roomId, "0", roomOwnerId .. ":" .. roomOwnerName, "1", "", "2", "", "3", "",
     "4", "", "5", "", "6", "", "7", "")
    return 1
else
    return 0
end
