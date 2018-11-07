const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const router = express.Router();
const port = 4000;

var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(fileUpload());

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

var jobs = []
var conformedDataElements = []

router.get('/getConnections', (request, response) => {
    var fs = require('fs');
    var filex = fs.readFileSync('sources.txt', "utf8");
    const jsonDatax = JSON.parse(filex);

    response.json(jsonDatax);
});

////////////////
// Upload
////////////
router.post('/upload', (req, res, next) => {
    console.log(req.files);
    let uploadFile = req.files.file
    const fileName = req.files.file.name
    uploadFile.mv(
      `${__dirname}/public/files/${fileName}`,
      function (err) {
        if (err) {
          return res.status(500).send(err)
        }

        res.json({
          file: `public/${req.files.file.name}`,
        })
      },
    )
  })


router.post('/rawfile', (request, response) => {
    var jsonData = { dataSetId: 447, wrangledId: 1190, name: "/data/Ins_Demo_Parameters.csv", flowId: 310, url: "http://52.201.45.52:3005/data/304/1177" }
    response.json(jsonData);
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

///////
// Jobs
////////////
router.get('/jobs', (request, response) => {
    response.json(JSON.parse(fs.readFileSync('jobs.json', "utf8")));
});

router.post('/jobs', (request, response) => {
    console.log(request.body)
    jobs.push(request.body)
    var ret = { id: jobs.length };
    response.json(ret);
});

/////////////////////
// DataElements
/////////////////
router.get('/dataElements', (request, response) => {
    response.json(JSON.parse(fs.readFileSync('dataElementList.json', "utf8")));
});

router.get('/dataElements/:id', (request, response) => {
    var id = request.params.id;
    console.log(request.params);
    response.json(JSON.parse(fs.readFileSync('dataElement.json', "utf8")));
});

//////////
// Conformed data elements
router.get('/conformedDataElements', (request, response) => {
    response.json(JSON.parse(fs.readFileSync('conformedDataElementList.json', "utf8")));
});

router.get('/conformedDataElements/:id', (request, response) => {
    var id = request.params.id;
    // always returns CDE id:2
    response.json(JSON.parse(fs.readFileSync('cdeDetail.json', "utf8")));
});


//////////
// Conformed Data Object
router.get('/conformedDataObjects', (request, response) => {
    response.json(JSON.parse(fs.readFileSync('conformedDataObjectList.json', "utf8")));
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