let express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({extended: false});
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

app.use(async function (req, res, next) {
    try {
        let sessionId = req.sessionID;
        let refresh = await UserRedis.refreshLogin(sessionId);
        // if(refresh === 0) {
        //     ResHandler.fail(res,-1, "Please login first.");
        //     return;
        // }
    } catch (e) {
        console.error(e);
        ResHandler.fail(res, -2, e.message);
        return;
    }
    next();
})

const LoginService = require("./services/LoginService.js");
const RoomService = require("./services/RoomService.js");
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
/*
    Account
 */
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

/*
    Game
 */

app.get("/rooms", async function (req, res) {
    let ret = await RoomService.queryRooms();
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.get("/players/:id", async function (req, res) {
    const roomId = Number(req.params.id);
    let ret = await RoomService.queryPlayers(req, res, roomId);
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.get("/seats/:id", async function (req, res) {
    const roomId = Number(req.params.id);
    let ret = await RoomService.querySeats(req, res, roomId);
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.get("/owner/:id", async function (req, res) {
    const roomId = Number(req.params.id);
    let ret = await RoomService.fetchOwner(roomId);
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.post("/create-room", jsonParser, async function (req, res) {
    let ret = await RoomService.createRoom(req, res).then();
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.get('/room-need-password/:roomKey', async (req, res) => {
    const roomKey = req.params.roomKey;
    let ret = await RoomService.needPassword(req, res, roomKey);
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.get('/room-basic-info/:roomId', async (req, res) => {
    const roomId = req.params.roomId;
    let ret = await RoomService.fetchRoomBasicInfo(req, res, roomId);
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.post("/enter-room", jsonParser, async function (req, res) {
    let ret = await RoomService.enterRoom(req, res).then();
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.post("/exit-room", jsonParser, async function (req, res) {
    let ret = await RoomService.exitRoom(req.sessionID).then();
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.post("/change-seat", jsonParser, async function (req, res) {
    let ret = await RoomService.changeSeat(req, res).then();
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.post("/ready", jsonParser, async function (req, res) {
    let ret = await RoomService.ready(req, res).then();
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.get("/is-ready", jsonParser, async function (req, res) {
    let ret = await RoomService.isReady(req, res).then();
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.post("/play", jsonParser, async function (req, res) {
    let ret = await RoomService.play(req, res).then();
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
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
