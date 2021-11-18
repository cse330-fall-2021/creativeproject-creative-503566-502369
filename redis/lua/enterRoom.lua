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
    local gameStart = tonumber(redis.call("hget", roomPrefix .. roomId, "start"))
    if gameStart == 1 then
        return -4
    end
    local roomExists = redis.call("hexists", roomPrefix .. roomId, "roomPassword")
    if roomExists == 0 then
        return -2 --- room does not exist.
    end
    local roomTruePassword = redis.call("hget", roomPrefix .. roomId, "roomPassword")
    if roomPassword ~= roomTruePassword then
        return -1 --- incorrect password
    end
    local players = redis.call("hgetall", playerPrefix .. roomId)
    if #players >= 16 then
        return -3 --- room is full
    end
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
       while(i < #players)
       do
          playerKey = players[i]
          playerVal = players[i+1]
          start_i, end_j, substr = string.find(playerVal, ":")
          local playerPos = tonumber(string.sub(playerVal, 1, start_i - 1))
          local playerReady = tonumber(string.sub(playerVal, start_i + 1, -1))
          if playerPos == tonumber(pos) then
             flag = true
          end
          i = i + 2
       end
       if not flag then
          redis.call("hset", userTablePrefix .. userId, "roomId", tonumber(roomId))
          redis.call("hset", playerPrefix .. roomId, userId .. ":" .. username, pos .. ":" .. 0) --- 0 stands for unready.
          return 1
       end
       pos = pos + 1
    end
    if pos >= 8 then
        return -3 --- room is full
    end
else
    return 0 --- need login
end
