const express = require('express');
const app = express();
const router = express.Router();
const port = 4000;

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// url: http://localhost:4000/
app.get('/', (request, response) => response.send('Hello World'));

// all routes prefixed with /api
app.use('/api/vdm', router);

// using router.get() to prefix our path
// url: http://localhost:4000/api/
router.get('/', (request, response) => {
    response.json({ message: 'Hello, welcome to my server' });
});

// Read jsonString from file
var fs = require('fs');
var file = fs.readFileSync('connections.txt', "utf8");
const jsonData = JSON.parse(file);

const nodes = [{
    name: 'Nkia',
    id: 0,
    children: [{
        name: 'R&D',
        id: 1
    }, {
        name: 'Sales',
        id: 2,
        children: [{
            name: 'Global',
            id: 3
        }]
    }]
},

{
    name: 'Hello',
    id: 0,
    children: [{
        name: 'R&D',
        id: 1
    }, {
        name: 'Sales',
        id: 2,
        children: [{
            name: 'Global',
            id: 3
        }]
    }]
}
];

router.get('/getConnections', (request, response) => {
    var fs = require('fs');
    var filex = fs.readFileSync('sources.txt', "utf8");
    const jsonDatax = JSON.parse(filex);

    response.json(jsonDatax);
});

router.get('/datasources', (request, response) => {
    response.json(jsonData);
});

router.get('/getConnections2', (request, response) => {
    var fs = require('fs');
    var filex = fs.readFileSync('Connection2.txt', "utf8");
    const jsonDatax = JSON.parse(filex);

    response.json(jsonDatax);
});

router.get('/acquiredDatasets', (request, response) => {
    response.json(JSON.parse(fs.readFileSync('acquiredDatasets.json', "utf8")));
});

router.get('/exploredDatasets', (request, response) => {
    response.json(JSON.parse(fs.readFileSync('exploredDatasets.json', "utf8")));
});

// set the server to listen on port 4000
app.listen(port, () => console.log(`Listening on port ${port}`));

const url = require('url');

router.get('/stuff', (request, response) => {
    var urlParts = url.parse(request.url, true);
    var parameters = urlParts.query;
    var myParam = parameters.myParam;
    // e.g. myVenues = 12;

    var myResponse = `I multiplied the number you gave me (${myParam}) by 5 and got: ${myParam * 5}`;

    response.json({ message: myResponse });
});

// // this array is used for identification of allowed origins in CORS
// const originWhitelist = ['http://localhost:3000', '*'];

// // middleware route that all requests pass through
// router.use((request, response, next) => {
//   console.log('Server info: Request received');

//   let origin = request.headers.origin;
//   console.log(origin);

//   // only allow requests from origins that we trust
//   if (originWhitelist.indexOf(origin) > -1) {
//     response.setHeader('Access-Control-Allow-Origin', 'origin');
//   }

//   // only allow get requests, separate methods by comma e.g. 'GET, POST'
//   response.setHeader('Access-Control-Allow-Methods', 'GET');
//   response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//   response.setHeader('Access-Control-Allow-Credentials', true);

//   // push through to the proper route
//   next();
// });