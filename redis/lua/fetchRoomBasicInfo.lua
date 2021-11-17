local roomPrefix = KEYS[1]
local roomId = KEYS[2]

return redis.call("hgetall", roomPrefix .. roomId)

-- local roomKeys = redis.call("keys", roomPrefix .. roomId .. "*")
-- local num = #roomKeys
--
-- if num ~= 0 then
--     local roomKey = roomKeys[1]
--     return redis.call("hgetall", roomPrefix .. roomId)
-- else
--     return nil
-- end
