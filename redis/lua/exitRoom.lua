local userTablePrefix = KEYS[1]
local roomPrefix = KEYS[2]
local playerPrefix = KEYS[3]
local seatPrefix = KEYS[4]
local roomId = KEYS[5]
local userId = KEYS[6]
local username = KEYS[7]

if tonumber(roomId) == -1 then
    return 0
end

--- Update user info
redis.call("hdel", userTablePrefix .. userId, "roomId")

local roomKeys = redis.call("keys", roomPrefix .. roomId .. "*")
local num = #roomKeys
local roomKey = ""
local roomInfo = nil
if num ~= 0 then
    roomKey = roomKeys[1]
    roomInfo = redis.call("hgetall", roomKey)
else
    redis.call("del", playerPrefix .. roomId)
    redis.call("del", seatPrefix .. roomId)
    redis.call("hdel", userTablePrefix .. userId, "roomId")
    return 1
end

local isOwner = false
for i = 1, #roomInfo, 2
do
    if roomInfo[i] == "roomOwnerId" then
        if tonumber(userId) == tonumber(roomInfo[i+1]) then
            isOwner = true
        end
        break
    end
end

--- Remove from player list
redis.call("hdel", playerPrefix .. roomId, userId .. ":" ..username)
local allPlayers = redis.call("hgetall", playerPrefix .. roomId)
--- Delete room if room has no one in it
if #allPlayers == 0 then
    redis.call("del", playerPrefix .. roomId)
    redis.call("del", seatPrefix .. roomId)
    redis.call("del", roomKey)
    return 1 .. "not exists"
end


--- Remove from seat list and update new room owner if the user is room owner
local seats = redis.call("hgetall", seatPrefix .. roomId)
local i = 1
while( i <= 16 )
do
   if seats[i+1] == userId .. ":" .. username then
       redis.call("hset", seatPrefix .. roomId, seats[i], "")
   end
   i=i+2
end

local ret = ""
if isOwner then
    local i = 1
    local start_i = 1;
    local end_j = 1;
    local substr = "";
    while( i <= 16 )
    do
       if seats[i+1] ~= "" and seats[i+1] ~= userId .. ":" .. username then
             local split_string = {}
             local newOwner = seats[i+1]
             start_i, end_j, substr = string.find(newOwner, ":")
             local newOwnerId = string.sub(newOwner, 1, start_i - 1)
             redis.call("hset", roomKey, "roomOwnerId", tonumber(newOwnerId))
             redis.call("hset", playerPrefix .. roomId, newOwner, 1)
             ret = ret .. "newOwner: " .. newOwner .. " newOwnerId:" .. newOwnerId
             break;
       end
       i=i+2
    end

end

redis.call("hdel", playerPrefix .. roomId, userId .. ":" ..username)
return ret






