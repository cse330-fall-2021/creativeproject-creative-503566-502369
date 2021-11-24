local playerPrefix = KEYS[1]
local answerCountPrefix = KEYS[2]
local answerEx = KEYS[3]
local roomId = KEYS[4]
local answerKey = KEYS[5]
local newExpireTime = ARGV[1]

local remaining = 0
local count = tonumber(redis.call("scard", answerCountPrefix .. answerKey))
local playerNum = tonumber(redis.call("hlen", playerPrefix .. roomId))
if not count then
    count = 0
end
remaining = playerNum - 1 - count
if remaining == 0 then
    redis.call("expire", answerEx .. roomId .. ":" .. answerKey, newExpireTime)
end
return answerEx .. roomId .. ":" .. answerKey
