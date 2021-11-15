const express = require('express');
const app = express();
const bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let session = require('express-session');
const urlencodedParser = bodyParser.urlencoded({extended: false});
let login_handler = require("./handler/login_handler");

cookieParser = require('cookie-parser');
session = require('express-session');
app.use(cookieParser());
app.use(session({
    secret: 'qppqppqpppqpqppqpqp', // just a long random string
    resave: false,
    saveUninitialized: true
}));

app.post('/login', urlencodedParser, function (req, res) {
    login_handler.login(req, res).then();
})

app.post('/signup', urlencodedParser, function (req, res) {
    login_handler.signup(req, res);
})


var server = app.listen(8888, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("访问地址为 http://%s:%s", host, port)

})