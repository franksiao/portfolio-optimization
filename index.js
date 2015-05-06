var express = require("express");
var mysql = require('mysql');
var multer = require('multer');
var fs = require('fs');
var csvtojson = require("csvtojson");
var _ = require("underscore");
var bodyParser = require("body-parser");

var config = require('./config.json');

var app = express();

//promise helpers
var Promise = require('promise');
var pReadFile = Promise.denodeify(fs.readFile);

var Queries = require('./app/Queries.js');

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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.use(multer({
	dest: './uploads/',
	rename: function (fieldname, filename) {
		return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
	},
	onFileUploadComplete: function(file, req, res) {
		console.log(file.fieldname + ' uploaded to  ' + file.path);
	}
}));

app.get('/portfolios', function(req, res, next) {
	var params = {
		db_connection: connection,
		id: req.query.id
	};
	Queries.getPortfolios(params)
	.then(standardSuccessHandler(res), standardFailureHandler(res));
});

app.post('/portfolio', function(req, res, next) {
	Queries.postPortfolio({
		db_connection: connection,
		name: req.body.name
	}).then(function(result) {
		res.send({
			status: 'success',
			data: result
		});
	}, standardFailureHandler(res));
});

app.put('/portfolio', function(req, res, next) {
	Queries.putPortfolio({
		db_connection: connection,
		id: req.body.id,
		name: req.body.name
	}).then(function(result) {
		res.send({
			status: 'success',
			data: result
		});
	}, standardFailureHandler(res));
});
app.delete('/portfolio', function(req, res, next) {
	var portfolioId = req.body.id;
	var params = {
		db_connection: connection,
		portfolio_id: portfolioId
	};
	Queries.getContracts(params).then(function(result) {
		var contracts = result.data[0];
		var contractIds = _.pluck(contracts, 'ContractSID');
		Queries.deleteSimulations({
			db_connection: connection,
			contract_ids: contractIds,
			portfolio_id: portfolioId
		}).then(Queries.deleteContracts)
		.then(Queries.deletePortfolio)
		.then(standardSuccessHandler(res), standardFailureHandler(res));
		//TODO: deleting Constraints
	});
});
app.get('/contracts', function(req, res, next) {
	var params = {
		db_connection: connection,
		contract_ids: req.query.ids,
		portfolio_id: req.query.portfolio_id
	}
	Queries.getContracts(params)
	.then(standardSuccessHandler(res), standardFailureHandler(res));
});

app.delete('/contracts', function(req, res, next) {
	var contractIds = req.body.ids;
	if (contractIds && contractIds.length > 0) {
		var params = {
			db_connection: connection,
			contract_ids: contractIds
		};
		Queries.deleteSimulations(params)
		.then(Queries.deleteContracts)
		.then(standardSuccessHandler(res),standardFailureHandler(res));
	} else {
		res.send({
			status: 'failed',
			error: 'No contract ids specified'
		});
	}
});
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
	connection.query('SELECT * from opt.tblResult', function(err, rows, fields) {
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

//TODO: setup pooling http://codeforgeek.com/2015/01/nodejs-mysql-tutorial/
var connection = mysql.createConnection({
  host     : config.db_host,
  user     : config.db_user,
  password : config.db_password,
  port : config.db_port,
  database : 'opt'
});

connection.connect();

function insertNewContract(contractName, portfolioId) {
	return function(contractData) {
		var promise = new Promise(function(resolve,reject) {
			console.log('Inserting new contract named: ' + contractName);
			var set = {
				'Name': contractName,
				'return': 0,
				'portID': portfolioId
			};
			var q = connection.query('INSERT INTO opt.tblContracts SET ?', set, function(err, result) {
				if (!err) {
					console.log('Inserted ' + result.insertId);
					resolve({
						name: contractName,
						id: result.insertId,
						data: contractData
					});
				} else {
					console.log('Error while performing Query.');
					console.log(err);
					reject(err);
				}
			});
			console.log(q.sql);
		});
		return promise;
	};
};

function populateSimulations(params) {
	var promise = new Promise(function(resolve,reject) {
		console.log('Populating simulations');
		var data = formatSimulations(params.data, params.id);
		var query = 'INSERT INTO opt.tblSimulations (ContractSID, Year, Event, Loss, Geography) Values ?';
		var q = connection.query(query, [data], function(err, result) {
			if (err) {
				reject(err);
			} else {
				console.log(result);
				console.log('Loaded simulations');
				resolve();
			}
		});
		console.log(q.sql);
		console.log(q.values);
	});
	return promise;
}

function clearTable(tbl) {
	return function() {
		var promise = new Promise(function(resolve,reject) {
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

function deleteFile(path) {
	return function() {
		console.log('Deleting: ', path);
		var promise = new Promise(function(resolve, reject) {
			fs.unlink(path, function(err) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
		return promise;
	}
}

function formatSimulations(simulations, id) {
	var formatted = [];
	_.each(simulations, function(value, key) {
		formatted.push([
			id,
			value.Year,
			value.Event,
			value.Loss,
			value.Geo
		]);
	});
	return formatted;
}
//TODO:Figure out if I even need to end the connection
//connection.end();

function convertToJson(data) {
	var promise = new Promise(function(resolve,reject) {
		var converter = new csvtojson.core.Converter();
		converter.fromString(data, function(err, json) {
			if (err) {
				reject(err);
			} else {
				resolve(json);
			}
		});
	});
	return promise;
}


app.post('/upload-object', function(req, res) {
	console.log('Uploading');
	var path = req.files.contract_file.path;
	var contractName = req.body.contract_name;
	console.log(req.body);
	var portfolioId = req.body.portfolio_id;
	pReadFile(path, 'utf8')
	.then(convertToJson)
	.then(insertNewContract(contractName, portfolioId))
	.then(populateSimulations)
	.then(clearTable('opt.tblResult'))
	.then(deleteFile(path))
	.then(handUploadSuccess, handleUploadFailure);
	function handUploadSuccess(data) {
		res.send('success');
	}
	function handleUploadFailure(err) {
		console.log(err);
		res.send('failure');
	}
});
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
app.listen(3001);