local sessionTableKey = KEYS[1]
local userTablePrefix = KEYS[2]
local userId = KEYS[3]
local sessionId = KEYS[4]
local username = ARGV[1]
local csrfToken = ARGV[2]
local expirePeriod = 60 * 60 * 24

redis.call("hset", sessionTableKey, sessionId, tonumber(userId))
redis.call("del", userTablePrefix ..userId)
redis.call("hmset", userTablePrefix .. userId, "username", username, "sessionId", sessionId, "csrfToken", csrfToken, "userId", userId)
redis.call("setex", "sessionExpire:" .. sessionId, expirePeriod, expirePeriod)
