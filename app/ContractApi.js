var ContractQuery = require('./query/ContractQuery.js');
var AirSimulationQuery = require('./query/AirSimulationQuery.js');
var ContractConstraintQuery = require('./query/ContractConstraintQuery.js');


var ApiUtils = require('./ApiUtils');
var _ = require("underscore");
var fs = require('fs');
var csvtojson = require("csvtojson");
var RSVP = require('rsvp');
var pReadFile = RSVP.denodeify(fs.readFile);

var getResourceFile = function(resource_id) {
	var path = 'uploads/' + resource_id + '.csv';
	return pReadFile(path, 'utf8');
}
var deleteResourceFile = function(resource_id) {
	var path = 'uploads/' + resource_id + '.csv';
	return (new RSVP.Promise(function(resolve, reject) {
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
	return (new RSVP.Promise(function(resolve,reject) {
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

exports.setup = function(router) {
	router.get('/contract', function(req, res, next) {
		var connection = req.connection;
		req.checkQuery('portfolio_id', 'Invalid portfolio_id').notEmpty().isInt();
		req.checkQuery('id', 'Invalid id').optional().isValidId();
		if (ApiUtils.handleError(req,res)) {
			return;
		}
		var params = {
			portfolio_id: req.query.portfolio_id
		}
		if (req.query.id) {
			params.ids = ApiUtils.formatId(req.query.id);
		}

		ContractQuery.select(connection, params).then(
			ApiUtils.DefaultApiSuccessHandler(res),
			ApiUtils.DefaultApiFailureHandler(res)
		);
	});

	router.put('/contract', function(req, res, next) {
		var connection = req.connection;
		//validation
		req.checkBody('id', 'Invalid').notEmpty().isInt();
		req.checkBody('name', 'Invalid name').optional().notEmpty().isAlphanumeric();
		req.checkBody('return_value', 'Invalid return_value').optional().isNumericOrNull();
		if (ApiUtils.handleError(req,res)) {
			return;
		}
		//query
		var params = ApiUtils.paramsFormatter(req.body, ['id', 'name', 'return_value']);
		console.log(params);
		ContractQuery.update(connection, params).then(
			ApiUtils.DefaultApiSuccessHandler(res),
			ApiUtils.DefaultApiFailureHandler(res)
		);
	});
	router.delete('/contract', function(req, res, next) {
		var connection = req.connection;
		//validation
		req.checkBody('portfolio_id', 'Invalid portfolio_id').notEmpty().isInt();
		req.checkBody('id', 'Invalid id').notEmpty().isValidId();

		if (ApiUtils.handleError(req,res)) {
			return;
		}
		//query
		var ids = ApiUtils.formatId(req.body.id);
		var params = {
			portfolio_id: req.body.portfolio_id,
			ids: ids
		};

		ContractQuery.delete(connection, params)
		.then(deleteSimulationHandler)
		.then(deleteContractConstraintHandler)
		.then(
			ApiUtils.DefaultApiSuccessHandler(res),
			ApiUtils.DefaultApiFailureHandler(res)
		);
		function deleteSimulationHandler() {
			return (new RSVP.Promise(function(resolve,reject) {
				AirSimulationQuery.delete(connection, {
					contract_id: ids
				}).then(function() {
					resolve();
				}, function(err) {
					reject(err);
				});
			})).catch(function(reason) {
				console.log('Error at deleteSimulationHandler', reason);
			});
		}
		function deleteContractConstraintHandler() {
			return (new RSVP.Promise(function(resolve,reject) {
				ContractConstraintQuery.delete(connection, {
					contract_id: ids
				}).then(function() {
					resolve();
				}, function(err) {
					reject(err);
				});
			})).catch(function(reason) {
				console.log('Error at deleteContractConstraintHandler', reason);
			});
		}
	});
	router.post('/contract', function(req,res) {
		var connection = req.connection;
		req.checkBody('portfolio_id', 'Invalid portfolio_id').notEmpty().isInt();
		req.checkBody('type', 'Invalid type').notEmpty().isValidType(['AIR']);
		req.checkBody('name', 'Invalid name').notEmpty().isAlphanumeric();
		req.checkBody('return_value', 'Invalid return_value').notEmpty().isNumericOrNull();
		req.checkBody('resource_id', 'Invalid resource_id').notEmpty();

		if (ApiUtils.handleError(req,res)) {
			return;
		}

		var simulations;

		getResourceFile(req.body.resource_id)
		.then(convertDataToJson)
		.then(insertContractHandler)
		.then(insertSimulationHandler)
		.then(function success(result) {
			deleteResourceFile(req.body.resource_id).then(function() {
				ApiUtils.DefaultApiSuccessHandler(res)(result);
			}, function() {
				console.log('Warning: failed to delete resource file', req.body.resource_id);
				ApiUtils.DefaultApiSuccessHandler(res)(result);
			});
		}, function failure(err) {
			deleteResourceFile(req.body.resource_id).then(function() {
				ApiUtils.DefaultApiFailureHandler(res)(err);
			}, function() {
				console.log('Warning: failed to delete resource file', req.body.resource_id);
				ApiUtils.DefaultApiFailureHandler(res)(result);
			});
		});		

		function insertContractHandler(jsonData) {
			simulations = jsonData;
			return (new RSVP.Promise(function(resolve,reject) {
				var params = {
					name: req.body.name,
					return_value: req.body.return_value,
					type: req.body.type,
					portfolio_id: req.body.portfolio_id
				};
				ContractQuery.insert(connection, params).then(function(contract) {
					resolve(contract);
				}, function(err) {
					reject(err);
				});
			})).catch(function(reason) {
				console.log('Error at insertContractHandler', reason);
			});
		}

		function insertSimulationHandler(contract) {
			return (new RSVP.Promise(function(resolve,reject) {
				var formattedSimulations = [];
				_.each(simulations, function(value, key) {
					formattedSimulations.push([
						contract.id,
						value.Year,
						value.Event,
						value.Loss,
						value.Geo
					]);
				});
				AirSimulationQuery.insert(connection, {
					simulation: formattedSimulations
				}).then(function() {
					resolve(contract);
				}, function(err) {
					reject(err);
				});
			})).catch(function(reason) {
				console.log('Error at insertSimulationHandler', reason);
			});
		}
	});

}