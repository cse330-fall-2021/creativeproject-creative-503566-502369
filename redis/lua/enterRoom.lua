local userTablePrefix = KEYS[1]
local roomPrefix = KEYS[2]
local playerPrefix = KEYS[3]
local seatPrefix = KEYS[4]
local roomId = KEYS[5]
local roomPassword = KEYS[6]
local userId = KEYS[7]
local roomName = KEYS[8]
local username = KEYS[9]

local exists = redis.call("exists", userTablePrefix .. userId)
if exists == 1 then
    local roomExists = redis.call("hexists", roomPrefix .. roomId .. ":" .. roomName, "roomPassword")
    if roomExists == 0 then
        return -2 --- room does not exist.
    end
    local seats = redis.call("hgetall", seatPrefix .. roomId)
--     return seats[4]
    local i = 1
    while( i <= 16 )
    do
       if seats[i+1] == "" then
           redis.call("hset", seatPrefix .. roomId, tostring(math.floor(i / 2)), userId .. ":" .. username)
           break
       end
       i=i+2
    end
    if i > 16 then
        return -3 --- room is full
    end
    local roomTruePassword = redis.call("hget", roomPrefix .. roomId .. ":" .. roomName, "roomPassword")
    if roomPassword ~= roomTruePassword then
        return -1 --- incorrect password
    end
    redis.call("hset", userTablePrefix .. userId, "roomId", tonumber(roomId))
    redis.call("hset", playerPrefix .. roomId, userId .. ":" .. username, 0) --- 1 stands for ready.
    return 1
else
    return 0 --- need login
end
