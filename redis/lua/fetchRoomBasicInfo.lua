local roomPrefix = KEYS[1]
local roomId = KEYS[2]

local roomKeys = redis.call("keys", roomPrefix .. roomId .. "*")
local num = #roomKeys

if num ~= 0 then
    local roomKey = roomKeys[1]
    return redis.call("hgetall", roomKey)
else
    return nil
end
