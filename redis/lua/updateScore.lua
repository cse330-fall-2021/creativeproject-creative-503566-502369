local scorePrefix = KEYS[1]
local answerCountPrefix = KEYS[2]
local roomId = KEYS[3]
local userId = KEYS[4]
local answerKey = KEYS[5]

local isMember = redis.call("sismember", answerCountPrefix .. answerKey, userId)
if isMember == 1 then
    return -1 --- Already answered
end
local count = tonumber(redis.call("scard", answerCountPrefix .. answerKey))
if not count then
    count = 0
end
local score = 0
if count == 0 then
    score = 3
elseif count == 1 then
    score = 2
else
    score = 1
end
redis.call("sadd", answerCountPrefix .. answerKey, userId)
redis.call("expire", answerCountPrefix .. answerKey, 120)
redis.call("hincrby", scorePrefix .. roomId, userId, score)
return score



