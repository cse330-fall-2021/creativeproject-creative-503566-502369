const redis = require('redis');
const redis_client = redis.createClient();
const UserRedis = require("../redis/UserRedis.js");
redis_client.config('set', 'notify-keyspace-events', 'KEA');
redis_client.subscribe('__keyevent@0__:expired');

function redis_client_init() {
    // TODO: Remove sessionTable, userTable, rooms
    redis_client.on('connect', function () {
        console.log('Redis Connected!'); // Connected!
    });
    redis_client.on('message', function (channel, key) {
        console.log(channel + " " + key);
        let keys = key.split(':');
        if (keys[0] === "sessionExpire") {
            UserRedis.logout(keys[1]);
        }
    });
}

const mysql = require('mysql');

const mysql_client = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    database: "CSE503S_final",
    user: "yiwei_z",
    password: "hehe13"
});

module.exports = {redis_client, mysql_client, redis_client_init}
