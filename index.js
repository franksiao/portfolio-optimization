var express = require("express");
var mysql = require('mysql');
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


//promise helpers
var ApiUtils = require('./app/ApiUtils');
var Queries = require('./app/Queries.js');

var connection;
var server;

//http://codeforgeek.com/2015/03/restful-api-node-and-express-4/
function initialize() {
	var pool = mysql.createPool({
		connectionLimit: 20,
		host: config.db_host,
		user: config.db_user,
		password: config.db_password,
		port: config.db_port,
		database : 'opt',
		debug: false
	});
	pool.getConnection(function(error,pConnection) {
		if (error) {
			console.log(error);
		} else {
			connection = pConnection;
			setupServer();
			startServer();
		}
	});
	RSVP.on('error', function(reason) {
		console.error(reason);
	});
};

function setupServer() {

	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.use(expressValidator({
		customValidators: ApiUtils.CustomValidators
	}));
	app.use(express.static(__dirname + '/public'));

	var router = express.Router();
	app.use('/', router);

	FileUploadApi.setup(router, connection);
	PortfolioApi.setup(router, connection);
	ContractApi.setup(router, connection);
	GeographyApi.setup(router, connection);
	ConstraintApi.setup(router, connection);
}

function startServer() {
	server = app.listen(3001, function() {
		console.log('Server Started');
	});
	//im not sure if this is nessesary
	server.on('close', function() {
		console.log('Closing server');
		connection.end(function(err) {
			console.log(err);
			console.log('Ending connection');
		});
	});
}

var standardSuccessHandler = function(res) {
	return function success(result) {
		var obj = {
			status: 'success'
		}
		if (result.data && Array.isArray(result.data) && result.data.length) {
			obj.data = result.data[0];
		}
		res.send(obj);
	}
}
var standardFailureHandler = function(res) {
	return function failure(err) {
		res.send({
			status: 'failed',
			error: err
		});
	}
}

app.get('/constraints', function(req, res, next) {
	var params = {
		db_connection: connection,
		constraint_set_id: req.query.set_id,
		portfolio_id: req.query.portfolio_id
	}
	Queries.getConstraints(params)
	.then(standardSuccessHandler(res), standardFailureHandler(res));
});



app.get('/results', function(req, res, next) {
	//Query for all results
	console.log('Querying for results:');
	connection.query('SELECT * from opt.result', function(err, rows, fields) {
		if (!err) {
			res.send(rows);
			console.log('Results');
			console.log(rows);
		} else {
			console.log('Error while performing Query.');
			console.log(err);
		}
	});
});

function clearTable(tbl) {
	return function() {
		var promise = new RSVP.Promise(function(resolve,reject) {
			console.log('Clearing table ', tbl);
			var q = connection.query('TRUNCATE TABLE ' + tbl, function(err, result) {
				if (err) {
					reject(err);
				} else {
					console.log('Cleared');
					console.log(result);
					resolve();
				}
			});
			console.log(q.sql);
		});
		return promise;
	}
}


app.post('/clear-all', function(req, res) {
	console.log('clear-all');
	clearTable('opt.tblResult')()
	.then(clearTable('opt.tblContracts'))
	.then(clearTable('opt.tblSimulations'))
	.then(handClearSuccess, handleClearFailure);
	function handClearSuccess(data) {
		res.send('clear success');
	}
	function handleClearFailure(err) {
		console.log(err);
		res.send('clear failure');
	}
});

initialize();
