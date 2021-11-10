let express = require('express');
const redis = require('redis');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({extended: false});
const fs = require("fs");

let app = express();
const redis_client = redis.createClient();

function redis_client_init() {
    redis_client.on('connect', function () {
        console.log('Redis Connected!'); // Connected!
    });
}

redis_client_init();

app.get('/', async function (req, res) {
    redis_client.eval(fs.readFileSync('./test.lua'), 1, "a", 2, function (err, res) {
        console.log(res);
    });
    redis_client.hset("ab", "username", "nba");
    redis_client.hset("ab", "password", 1);
    redis_client.hset("ab", "sessionId", 2);
    redis_client.hset("ab", "abcasd", "nbaaaaaa");
    let a = await new Promise(function (resolve, reject) {
        redis_client.hget("ab", "sessionId", function (err, results) {
            console.log(results);
            resolve(results);
        })
    });
    res.send(a);
});

let server = app.listen(8081, function () {
    let host = server.address().address
    let port = server.address().port
    console.log("Serve on http://%s:%s", host, port)
});