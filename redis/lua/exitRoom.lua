local userTablePrefix = KEYS[1]
local roomPrefix = KEYS[2]
local playerPrefix = KEYS[3]
local seatPrefix = KEYS[4]
local scorePrefix = KEYS[5]
local roomId = KEYS[6]
local userId = KEYS[7]
local username = KEYS[8]

if tonumber(roomId) == -1 then
    return 0
end

--- Update user info
redis.call("hdel", userTablePrefix .. userId, "roomId", "socketId")
redis.call("del", scorePrefix .. roomId);

local roomInfo = redis.call("hgetall", roomPrefix .. roomId)
if roomInfo == nil then
    redis.call("del", playerPrefix .. roomId)
    redis.call("hdel", userTablePrefix .. userId, "roomId")
    return 1
end

local isOwner = false
for i = 1, #roomInfo, 2
do
    if roomInfo[i] == "roomOwner" then
        local start_i = -1
        local end_j = 1;
        local substr = "";
        local roomOwnerVal = roomInfo[i+1]
        start_i, end_j, substr = string.find(roomOwnerVal, ":")
        local roomOwnerId = tonumber(string.sub(roomOwnerVal, 1, start_i - 1))
        if tonumber(userId) == roomOwnerId then
            isOwner = true
            break
        end
    end
end

--- Remove from player list
redis.call("hdel", playerPrefix .. roomId, userId .. ":" ..username)
local allPlayers = redis.call("hgetall", playerPrefix .. roomId)
--- Delete room if room has no one in it
if #allPlayers == 0 then
    redis.call("del", playerPrefix .. roomId)
    redis.call("del", seatPrefix .. roomId)
    redis.call("del", roomPrefix .. roomId)
    return 1
end

if isOwner then
    local pos = 0
    while( pos < 8 )
    do
        local i = 1
        local flag = false
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
            if playerPos == tonumber(pos) then
                redis.call("hset", roomPrefix .. roomId, "roomOwner", playerKey)
                redis.call("hset", playerPrefix .. roomId, playerKey, playerPos .. ":" .. 1)
                flag = true
                break
            end
            i = i + 2
        end
        if flag then
            break
        end
        pos = pos + 1
    end
end
redis.call("hdel", playerPrefix .. roomId, userId .. ":" ..username)
return 1






