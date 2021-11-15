let express = require('express');
const redis = require('redis');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({extended: false});
const fs = require("fs");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const UserRedis = require("./redis/UserRedis.js");

let app = express();

// Init redis
const connections = require("./dao/connections.js");
connections.redis_client_init();

// Middlewares
// app.use(express.static('dist'))
app.use(bodyParser.json());
app.use(cookieParser());
// Add headers before the routes are defined
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(sessions({
    secret: "thisismysecrctekeyasdsdgwefq324saf121d",
    saveUninitialized: true,
    cookie: {
        secure: false
    },
    resave: false,
}));

app.use(function (req, res, next) {
    try {
        let sessionId = req.sessionID;
        UserRedis.refreshLogin(sessionId);
    }catch (e) {
        console.error(e);
    }
    next();
})

const LoginService = require("./services/LoginService.js");
const ResHandler = require("./tools/ResHandler.js");

let roomList = [
    {
        id: 1,
        name: "room123456789012345678901234567890", // 17 characters
        playerNum: 1,
    },
    {
        id: 2,
        name: "room2",
        playerNum: 2,
    },
    {
        id: 3,
        name: "room3",
        playerNum: 3,
    },
    {
        id: 4,
        name: "room4",
        playerNum: 4,
    },
    {
        id: 5,
        name: "room5",
        playerNum: 5
    },
    {
        id: 6,
        name: "room6",
        playerNum: 6
    },
    {
        id: 7,
        name: "room7",
        playerNum: 7
    },
    {
        id: 8,
        name: "room8",
        playerNum: 8
    }
];

app.post("/register", jsonParser, async function (req, res) {
    let ret = await LoginService.register(req, res).then();
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.post("/login", jsonParser, async function (req, res) {
    let ret = await LoginService.login(req, res).then();
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.get("/is-login", jsonParser, async function (req, res) {
    let ret = await LoginService.isLogin(req, res).then();
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.post("/logout", jsonParser, async function (req, res) {
    let ret = await LoginService.logout(req, res).then();
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.get('/events', (req, res) => {
    res.send(events);
});

app.get('/events/:id', (req, res) => {
    const id = Number(req.params.id);
    const event = events.find(event => event.id === id);
    res.send(event);
});

app.get("/roomList", function (req, res) {
    res.json(JSON.stringify(roomList));
});

app.get("/room/:id", function (req, res) {
    res.json(JSON.stringify({
        id: 100,
        userList: ["admin1", "admin2", "admin3"],
    }));
});

app.get("/seats/:id", function (req, res) {
    res.json(JSON.stringify(
        [{
            userId: 1
        },
            {
                userId: 2,
                isReady: true
            },
            {
                userId: -1
            },
            {
                userId: 4
            },
            {
                userId: 5
            },
            {
                userId: 6
            },
            {
                userId: -1
            },
            {
                userId: 99
            }]
    ));
});

app.get("/room-owner/:id", function (req, res) {
    let roomId = Number(req.params.id);
    let roomOwnerIds = {
        1: 99,
        2: 12,
        3: 13,
        4: 14
    }
    res.json(JSON.stringify(roomOwnerIds[roomId]));
});

app.get("/room-messages/:id", function (req, res) {
    let roomId = Number(req.params.id);
    res.json(JSON.stringify([
        {
            id: 1,
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam semper diam at erat pulvinar, at pulvinar\n" +
                "            felis blandit. Vestibulum volutpat tellus diam, consequat gravida libero rhoncus ut. Morbi maximus, leo sit\n" +
                "            amet vehicula eleifend, nunc dui porta orci, quis semper odio felis ut quam.",
            username: "E-Doz"
        },
        {
            id: 2,
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam semper diam at erat pulvinar, at pulvinar\n" +
                "            felis blandit. Vestibulum volutpat tellus diam, consequat gravida libero rhoncus ut. Morbi maximus, leo sit\n" +
                "            amet vehicula eleifend, nunc dui porta orci, quis semper odio felis ut quam.",
            username: "E-Doz"
        },
        {
            id: 3,
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam semper diam at erat pulvinar, at pulvinar\n" +
                "            felis blandit. Vestibulum volutpat tellus diam, consequat gravida libero rhoncus ut. Morbi maximus, leo sit\n" +
                "            amet vehicula eleifend, nunc dui porta orci, quis semper odio felis ut quam.",
            username: "E-Doz"
        },
        {
            id: 4,
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam semper diam at erat pulvinar, at pulvinar\n" +
                "            felis blandit. Vestibulum volutpat tellus diam, consequat gravida libero rhoncus ut. Morbi maximus, leo sit\n" +
                "            amet vehicula eleifend, nunc dui porta orci, quis semper odio felis ut quam.",
            username: "E-Doz"
        },
        {
            id: 5,
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam semper diam at erat pulvinar, at pulvinar\n" +
                "            felis blandit. Vestibulum volutpat tellus diam, consequat gravida libero rhoncus ut. Morbi maximus, leo sit\n" +
                "            amet vehicula eleifend, nunc dui porta orci, quis semper odio felis ut quam.",
            username: "E-Doz"
        },
        {
            id: 6,
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam semper diam at erat pulvinar, at pulvinar\n" +
                "            felis blandit. Vestibulum volutpat tellus diam, consequat gravida libero rhoncus ut. Morbi maximus, leo sit\n" +
                "            amet vehicula eleifend, nunc dui porta orci, quis semper odio felis ut quam.",
            username: "E-Doz"
        },
        {
            id: 7,
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam semper diam at erat pulvinar, at pulvinar\n" +
                "            felis blandit. Vestibulum volutpat tellus diam, consequat gravida libero rhoncus ut. Morbi maximus, leo sit\n" +
                "            amet vehicula eleifend, nunc dui porta orci, quis semper odio felis ut quam.",
            username: "E-Doz"
        },
        {
            id: 8,
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam semper diam at erat pulvinar, at pulvinar\n" +
                "            felis blandit. Vestibulum volutpat tellus diam, consequat gravida libero rhoncus ut. Morbi maximus, leo sit\n" +
                "            amet vehicula eleifend, nunc dui porta orci, quis semper odio felis ut quam.",
            username: "E-Doz"
        },
    ]));
});

let server = app.listen(8081, function () {
    let host = server.address().address
    let port = server.address().port
    console.log("Serve on http://%s:%s", host, port)
});
