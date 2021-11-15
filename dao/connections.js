const redis = require('redis');
const redis_client = redis.createClient();

function redis_client_init() {
    redis_client.on('connect', function () {
        console.log('Redis Connected!'); // Connected!
    });
}
function getRedisClient() {
    return redis.createClient();
}

const mysql = require('mysql');

const mysql_client = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    database: "CSE503S_final",
    user: "yiwei_z",
    password: "hehe13"
});

module.exports = {redis_client, mysql_client, redis_client_init, getRedisClient}
