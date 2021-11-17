let connections = require("./connection");
let redis = connections.redis_client;

let exported = {
    login: function (id, data){
        data = JSON.parse(data);
        redis.hset("SESSION", data.session, id, function (err,result){
            if (err) {throw err;}
        });
        redis.hset(id, "csrf", data.csrf, function (err,result){
            if (err) {throw err;}
        });
        redis.hset(id, "username", data.username, function (err,result){
            if (err) {throw err;}
        });
        redis.hset(id, "session", data.session, function (err,result){
            if (err) {throw err;}
        });
    },

    logout: function (session){
        redis.hget("SESSION", session, function (err,result){
            if(err){throw err;}
            console.log(result);
            redis.del(result, function (err, result2){
                if(err){throw err;}
            });
        });
        redis.hdel("SESSION", session, function (err, result3){
            if(err){throw err;}
        });
    }
}

module.exports = exported;
