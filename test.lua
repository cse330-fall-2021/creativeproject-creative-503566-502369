if redis.call("EXISTS",KEYS[1]) == 1 then
     return redis.call("INCRBY",KEYS[1],ARGV[1])
   else
     return redis.call("SET", KEYS[1], ARGV[1])
   end