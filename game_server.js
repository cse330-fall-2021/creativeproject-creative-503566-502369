let express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({extended: false});
const cookieParser = require("cookie-parser");
const UserRedis = require("./redis/UserRedis.js");
const {Server} = require("socket.io");
const session = require("express-session")({
    secret: "thisismysecrctekeyasdsdgwefq324saf121d",
    saveUninitialized: true,
    cookie: {
        secure: false
    },
    resave: false,
});
const sharedSession = require("express-socket.io-session");
const cors = require("cors");

let app = express();

// Middlewares
// app.use(express.static('dist'))
app.use(bodyParser.json());
app.use(cookieParser());
// Add headers before the routes are defined
// app.use(function (req, res, next) {
//     // Website you wish to allow to connect
//     let referer = req.headers.referer;
//     referer = referer.substring(0, referer.length -1);
//     res.setHeader('Access-Control-Allow-Origin', referer);
//     // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     // Pass to next layer of middleware
//     next();
// });
app.use(cors({
    origin: [
        'http://localhost:8080',
        'http://192.168.1.140:8080'
    ],
    credentials: true,
    exposedHeaders: ['set-cookie']
}));

app.use(session);

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
const DrawWordsDao = require("./dao/DrawWordsDao.js");


/*
    Static
 */
// app.use('/public', express.static('static'));
console.log(__dirname + '/dist');
app.use(express.static(__dirname + '/dist'));

app.get('/', function (req, res) {
    res.send("Hello There!");
});
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
    let socketIO = req.app.get('socketio');
    let ret = await RoomService.createRoom(req, res, socketIO).then();
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.get('/room-need-password/:roomId', async (req, res) => {
    const roomId = req.params.roomId;
    let ret = await RoomService.needPassword(req, res, roomId);
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
    let socketIO = req.app.get('socketio');
    let ret = await RoomService.enterRoom(req, res, socketIO).then();
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.post("/exit-room", jsonParser, async function (req, res) {
    let socketIO = req.app.get('socketio');
    let ret = await RoomService.exitRoom(req.sessionID, socketIO).then();
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.post("/change-seat", jsonParser, async function (req, res) {
    let socketIO = req.app.get('socketio');
    let ret = await RoomService.changeSeat(req, res, socketIO).then();
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.post("/ready", jsonParser, async function (req, res) {
    let socketIO = req.app.get('socketio');
    let ret = await RoomService.ready(req, res, socketIO).then();
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
    let socketIO = req.app.get('socketio');
    let ret = await RoomService.play(req, res, socketIO).then();
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.post("/bind-room", jsonParser, async function (req, res) {
    let socketIO = req.app.get('socketio');
    let ret = await RoomService.bindRoom(req, res, socketIO).then();
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.get("/draw-word/:roomId", jsonParser, async function (req, res) {
    const roomId = req.params.roomId;
    let ret = await RoomService.getDrawWord(req, res, roomId).then();
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.post("/send-message", async function (req, res) {
    let socketIO = req.app.get('socketio');
    let ret = await RoomService.sendMessage(req, res, socketIO).then();
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.get("/room-messages/:id", function (req, res) {
    let roomId = Number(req.params.id);
    res.json(JSON.stringify([
        // {
        //     id: 1,
        //     message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam semper diam at erat pulvinar, at pulvinar\n" +
        //         "            felis blandit. Vestibulum volutpat tellus diam, consequat gravida libero rhoncus ut. Morbi maximus, leo sit\n" +
        //         "            amet vehicula eleifend, nunc dui porta orci, quis semper odio felis ut quam.",
        //     username: "E-Doz"
        // },
    ]));
});

app.get("/game-state/:roomId", jsonParser, async function (req, res) {
    const roomId = req.params.roomId;
    let ret = await RoomService.getGameState(req, res, roomId).then();
    if (ret.err === 0) {
        ResHandler.success(res, ret.data);
    } else {
        ResHandler.fail(res, ret.err, ret.errMsg);
    }
});

app.get("/is-test", jsonParser, async function (req, res) {
    let ret = await DrawWordsDao.fetchWord();
    ResHandler.success(res, ret[0].draw_word);
});

let server = app.listen(8081, function () {
    let host = server.address().address
    let port = server.address().port
    console.log("Serve on http://%s:%s", host, port)
});

const io = new Server(server, {
    cors: {
        // origin: "http://localhost:8080",
        origin: ["http://localhost:8080", "http://192.168.1.140:8080"],
        methods: ["GET", "POST"],
        allowedHeaders: ["socket-connection-header"],
        credentials: true
    }
});
app.set('socketio', io);
io.use(sharedSession(session));

// Init redis
const RedisInstance = require("./dao/RedisInstance.js");
RedisInstance.redis_client_init(io);

io.on('connection', async (socket) => {
    let sessionId = socket.handshake.session.id;
    let socketId = socket.id;
    try {
        await UserRedis.bindSocketId(sessionId, socketId).then();
    } catch (e) {
        socket.disconnect(true);
    }
    console.log('a user connected');
    socket.on('disconnect', function () {
        console.log('A user disconnected');
    });
    socket.on('disconnect', function () {
        console.log('A user disconnected');
    });
    socket.on("sendPath", function (data) {
        let dataObj = JSON.parse(data);
        let roomId = dataObj.roomId;
        let pathJSONString = dataObj.path;
        io.to(roomId.toString()).emit("receivePath", pathJSONString);
    });
});
