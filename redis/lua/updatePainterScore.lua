local scorePrefix = KEYS[1]
local answerCountPrefix = KEYS[2]
local roomId = KEYS[3]
local userId = KEYS[4]
local answerKey = KEYS[5]

local count = tonumber(redis.call("scard", answerCountPrefix .. answerKey))
local score = 1
if count then
    if count == 1 then
        score = 3
    elseif count == 2 then
        score = 2
    else
        score = 1
    end
end
redis.call("hincrby", scorePrefix .. roomId, userId, score)
redis.call("del", answerCountPrefix .. answerKey)
return score
