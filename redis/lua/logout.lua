local sessionTableKey = KEYS[1]
local userTablePrefix = KEYS[2]
local sessionId = KEYS[3]

local userId = redis.call("hget", sessionTableKey, sessionId)
if userId then
    redis.call("del", userTablePrefix .. userId)
end
redis.call("hdel", sessionTableKey, sessionId)
return true
