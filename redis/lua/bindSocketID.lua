local sessionTableKey = KEYS[1]
local userTablePrefix = KEYS[2]
local sessionId = KEYS[3]
local socketId = KEYS[4]

local userId = redis.call("hget", sessionTableKey, sessionId)

if userId then
    local exist = redis.call("exists", userTablePrefix .. userId)
    if exist == 1 then
        redis.call("hset", userTablePrefix .. userId, "socketId", socketId)
        return 1
    else
        return 0
    end
else
    return 0
end
