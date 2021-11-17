local roomPrefix = KEYS[1]

local roomKeys = redis.call("keys", roomPrefix .. "*")
local ret = {}

for i = 1, #roomKeys, 1
do
    local roomKey = roomKeys[i]
    local roomInfo = redis.call("hgetall", roomKey)
    table.insert(ret, roomInfo)
end
return ret

