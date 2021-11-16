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

--- Remove from seat list and update new room owner if the user is room owner
local seats = redis.call("hgetall", seatPrefix .. roomId)
local i = 1
local nobody = true
while( i <= 16 )
do
   if seats[i+1] == userId .. ":" ..username then
       redis.call("hset", seatPrefix .. roomId, seats[i], "")
   end
   if isOwner then
       if seats[i+1] ~= "" then
          local newOwner = seats[i+1]
          local split_string = {}
          for word in string.gmatch(newOwner, '([^:]+)') do
              table.insert(split_string, word);
          end
          local newOwnerId = split_string[1]
          redis.call("hset", roomKey, "roomOwnerId", newOwnerId)
          redis.call("hset", playerPrefix .. roomId, newOwner, 1)
          nobody = false
       end
   end
   i=i+2
end

--- Update user info
redis.call("hdel", userTablePrefix .. userId, "roomId")

--- Delete room if room has no one in it
if nobody then
    redis.call("del", playerPrefix .. roomId)
    redis.call("del", seatPrefix .. roomId)
    redis.call("del", roomKey)
end
return 1






