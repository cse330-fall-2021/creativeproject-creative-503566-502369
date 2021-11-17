const express = require('express');
const app = express();
const bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let session = require('express-session');
const urlencodedParser = bodyParser.urlencoded({extended: false});
let jsonParser = bodyParser.json();
let login_handler = require("./handler/login_handler");

let connections = require("./js/connection");
// connections.redis_client_init();

cookieParser = require('cookie-parser');
session = require('express-session');
app.use(cookieParser());
app.use(session({
    secret: 'qppqppqpppqpqppqpqp', // just a long random string
    resave: false,
    saveUninitialized: true
}));

app.get('/login.html', function (req, res) {
    res.sendFile( __dirname + "/" + "login.html" );
})

app.use(function (req, res ,next) {
    next();
})

app.post('/login', jsonParser, function (req, res) {
    login_handler.login(req, res).then();
})

app.post('/signup', jsonParser, function (req, res) {
    login_handler.signup(req, res);
})

app.post('/logout', jsonParser, function (req, res) {
    login_handler.logout(req, res);
})


const server = app.listen(8888, function () {

    const host = server.address().address;
    const port = server.address().port;

    console.log("访问地址为 http://%s:%s", host, port)

});