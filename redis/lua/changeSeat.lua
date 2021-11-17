local playerPrefix = KEYS[1]
local userId = KEYS[2]
local username = KEYS[3]
local roomId = KEYS[4]
local targetSeatIndex = KEYS[5]

local allPlayers = redis.call("hgetall", playerPrefix .. roomId)
if #allPlayers == 0 then
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
    local playerReady = tonumber(string.sub(playerVal, start_i, -1))
    if playerPos == tonumber(targetSeatIndex) then
        return -2
    end
    i = i + 2
end
redis.call("hset", playerPrefix .. roomId, userId .. ":" .. username, targetSeatIndex .. ":" .. 0)
return 1
