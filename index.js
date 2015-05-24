var express = require("express");
var bodyParser = require("body-parser");
var expressValidator = require('express-validator');
var RSVP = require('rsvp');

var config = require('./config.json');
var app = express();
var PortfolioApi = require('./app/PortfolioApi.js');
var ContractApi = require('./app/ContractApi.js');
var FileUploadApi = require('./app/FileUploadApi.js');
var ConstraintApi = require('./app/ConstraintApi.js');
var GeographyApi = require('./app/GeographyApi.js');

var ConnectionManager = require('./app/ConnectionManager.js');


//promise helpers
var ApiUtils = require('./app/ApiUtils');

//http://codeforgeek.com/2015/03/restful-api-node-and-express-4/
function initialize() {
	RSVP.on('error', function(reason) {
		console.error(reason);
	});
	setupRoutes();
	startServer();
};

function setupRoutes() {
	var router = express.Router();
	
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.use(expressValidator({
		customValidators: ApiUtils.CustomValidators
	}));
	app.use(express.static(__dirname + '/public'));
	app.use('/', router);
	
	ConnectionManager.setup(router, config);
	FileUploadApi.setup(router);
	PortfolioApi.setup(router);
	ContractApi.setup(router);
	GeographyApi.setup(router);
	ConstraintApi.setup(router);
}

function startServer() {
	app.listen(3001, function() {
		console.log('Server Started');
	});
}

initialize();
