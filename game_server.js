let express = require('express');
const redis = require('redis');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({extended: false});
const fs = require("fs");
const cors = require('cors');

let app = express();
const redis_client = redis.createClient();

function redis_client_init() {
    redis_client.on('connect', function () {
        console.log('Redis Connected!'); // Connected!
    });
}

redis_client_init();

// app.use(express.static('dist'))
app.use(bodyParser.json());
app.use(cors());

let events =
    [
        {
            id: 1,
            name: 'Charity Ball',
            category: 'Fundraising',
            description: 'Spend an elegant night of dinner and dancing with us as we raise money for our new rescue farm.',
            featuredImage: 'https://placekitten.com/500/500',
            images: [
                'https://placekitten.com/500/500',
                'https://placekitten.com/500/500',
                'https://placekitten.com/500/500',
            ],
            location: '1234 Fancy Ave',
            date: '12-25-2019',
            time: '11:30'
        },
        {
            id: 2,
            name: 'Rescue Center Goods Drive',
            category: 'Adoptions',
            description: 'Come to our donation drive to help us replenish our stock of pet food, toys, bedding, etc. We will have live bands, games, food trucks, and much more.',
            featuredImage: 'https://placekitten.com/500/500',
            images: [
                'https://placekitten.com/500/500'
            ],
            location: '1234 Dog Alley',
            date: '11-21-2019',
            time: '12:00'
        }
    ];

let roomList = [
    {
        id: 1,
        name: "room1",
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

app.post("/login", jsonParser, function (req, res) {
    let username = req.body.username;
    let password = req.body.password;
    console.log("username:" + username + " password:"+ password);
    res.json(JSON.stringify(true));
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
            id:2,
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam semper diam at erat pulvinar, at pulvinar\n" +
                "            felis blandit. Vestibulum volutpat tellus diam, consequat gravida libero rhoncus ut. Morbi maximus, leo sit\n" +
                "            amet vehicula eleifend, nunc dui porta orci, quis semper odio felis ut quam.",
            username: "E-Doz"
        },
        {
            id:3,
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam semper diam at erat pulvinar, at pulvinar\n" +
                "            felis blandit. Vestibulum volutpat tellus diam, consequat gravida libero rhoncus ut. Morbi maximus, leo sit\n" +
                "            amet vehicula eleifend, nunc dui porta orci, quis semper odio felis ut quam.",
            username: "E-Doz"
        },
        {
            id:4,
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam semper diam at erat pulvinar, at pulvinar\n" +
                "            felis blandit. Vestibulum volutpat tellus diam, consequat gravida libero rhoncus ut. Morbi maximus, leo sit\n" +
                "            amet vehicula eleifend, nunc dui porta orci, quis semper odio felis ut quam.",
            username: "E-Doz"
        },
        {
            id:5,
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam semper diam at erat pulvinar, at pulvinar\n" +
                "            felis blandit. Vestibulum volutpat tellus diam, consequat gravida libero rhoncus ut. Morbi maximus, leo sit\n" +
                "            amet vehicula eleifend, nunc dui porta orci, quis semper odio felis ut quam.",
            username: "E-Doz"
        },
        {
            id:6,
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam semper diam at erat pulvinar, at pulvinar\n" +
                "            felis blandit. Vestibulum volutpat tellus diam, consequat gravida libero rhoncus ut. Morbi maximus, leo sit\n" +
                "            amet vehicula eleifend, nunc dui porta orci, quis semper odio felis ut quam.",
            username: "E-Doz"
        },
        {
            id:7,
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam semper diam at erat pulvinar, at pulvinar\n" +
                "            felis blandit. Vestibulum volutpat tellus diam, consequat gravida libero rhoncus ut. Morbi maximus, leo sit\n" +
                "            amet vehicula eleifend, nunc dui porta orci, quis semper odio felis ut quam.",
            username: "E-Doz"
        },
        {
            id:8,
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
