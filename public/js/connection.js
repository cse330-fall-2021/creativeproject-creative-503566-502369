// const redis = require('redis');
// const redis_client = redis.createClient();

// function redis_client_init() {
//     redis_client.on('connect', function () {
//         console.log('Redis Connected!'); // Connected!
//     });
// }
const mysql = require('mysql');
const redis = require('redis');

const redis_client = redis.createClient({
    host: 'localhost',
    port: '6379'
});

const mysql_client = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    database: "creative",
    user: "root",
    password: "root"
});

function redis_client_init() {
    redis_client.on('connect', function (err) {
        if(err) throw err;
        else{
            console.log('Redis Connected!');
        } // Connected!
    });
}

// function mysql_client_init(){
//     mysql_client.connect(function(err) {
//         if (err) throw err;
//         console.log("Mariadb Connected!");
//     });
// }

// module.exports = {redis_client, mysql_client, redis_client_init}
module.exports = {mysql_client,redis_client_init,redis_client}