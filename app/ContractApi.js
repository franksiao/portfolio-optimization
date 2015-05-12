var Queries = require('./Queries.js');
var _ = require("underscore");
var fs = require('fs');
var csvtojson = require("csvtojson");
var Promise = require('promise');
var pReadFile = Promise.denodeify(fs.readFile);

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

var getResourceFile = function(resource_id) {
	var path = 'uploads/' + resource_id + '.csv';
	return pReadFile(path, 'utf8');
}
var deleteResourceFile = function(resource_id) {
	var path = 'uploads/' + resource_id + '.csv';
	return (new Promise(function(resolve, reject) {
		fs.unlink(path, function(err) {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	}));
}

var convertDataToJson = function(data) {
	return (new Promise(function(resolve,reject) {
		var converter = new csvtojson.core.Converter();
		converter.fromString(data, function(err, json) {
			if (err) {
				reject(err);
			} else {
				resolve(json);
			}
		});
	}));
}

exports.setup = function(router, connection) {
	router.get('/contracts', function(req, res, next) {
		var params = {
			db_connection: connection,
			contract_ids: req.query.ids,
			portfolio_id: req.query.portfolio_id
		}
		Queries.getContracts(params)
		.then(standardSuccessHandler(res), standardFailureHandler(res));
	});

	router.delete('/contracts', function(req, res, next) {
		var contractIds = req.body.ids;
		if (contractIds && contractIds.length > 0) {
			var params = {
				db_connection: connection,
				contract_ids: contractIds
			};
			//TODO: getconstraints with constraint target matching? or not
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
	router.post('/contract', function(req,res) {
		var resource_id = req.body.resource_id;
		var name = req.body.name;
		var portfolio_id = req.body.portfolio_id;
		var return_val = req.body.return;

		getResourceFile(resource_id)
		.then(convertDataToJson)
		.then(createContractHandler)
		.then(createSimulationHandler)
		.then(function success(contract_id) {
			deleteResourceFile(resource_id).then(function() {
				res.send({
					status: 'success',
					id: contract_id
				});
			}, function() {
				console.log('Warning: failed to delete resource file');
				res.send({
					status: 'success',
					id: contract_id
				});
			});
		}, function failure(err) {
			deleteResourceFile(resource_id).then(function() {
				res.send({
					status: 'failed',
					error: err
				});
			}, function() {
				console.log('Warning: failed to delete resource file');
				res.send({
					status: 'failed',
					error: err
				});
			});
		});

		function createContractHandler(simulations) {
			return (new Promise(function(resolve,reject) {
				Queries.insertContract({
					db_connection: connection,
					name: name,
					portfolio_id: portfolio_id,
					return_val: return_val
				}).then(function(db_response) {
					resolve({
						contract_id: db_response.id,
						simulations: simulations
					});
				}, function(err) {
					reject(err);
				});
			}));
		}
		function createSimulationHandler(data) {
			return (new Promise(function(resolve,reject) {
				var formattedSimulations = [];
				_.each(data.simulations, function(value, key) {
					formattedSimulations.push([
						data.contract_id,
						value.Year,
						value.Event,
						value.Loss,
						value.Geo
					]);
				});
				Queries.insertSimulations({
					db_connection: connection,
					simulations: formattedSimulations
				}).then(function() {
					resolve(data.contract_id);
				}, function(err) {
					reject(err);
				});
			}));
		}
	});

}