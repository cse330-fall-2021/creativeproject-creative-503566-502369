local sessionId = KEYS[1]
local expirePeriod = 60 * 60 * 24

local exists = redis.call("exists", "sessionExpire:" .. sessionId)
if exists == 1 then
    redis.call("setex", "sessionExpire:" .. sessionId, expirePeriod, expirePeriod)
end

