local sessionTableKey = KEYS[1]
local userTablePrefix = KEYS[2]
local sessionId = KEYS[3]

local userId = redis.call("hget", sessionTableKey, sessionId)

if userId then
    local userInfo = redis.call("hgetall", userTablePrefix .. userId)
    if next(userInfo) then
        return userInfo
    else
        return nil
    end
else
    return nil
end
