var PortfolioQuery = require('./query/PortfolioQuery.js');
var ContractQuery = require('./query/ContractQuery.js');
var ConstraintSetQuery = require('./query/ConstraintSetQuery.js');
var ContractConstraintQuery = require('./query/ContractConstraintQuery.js');
var GeographyConstraintQuery = require('./query/GeographyConstraintQuery.js');
var AirSimulationQuery = require('./query/AirSimulationQuery.js');

var RSVP = require('rsvp');
var ApiUtils = require('./ApiUtils');
var _ = require('underscore');

exports.setup = function(router) {
	router.get('/portfolio', function(req, res, next) {
		var connection = req.connection;
		req.checkQuery('id', 'Invalid id').optional().isValidId();
		if (ApiUtils.handleError(req,res)) {
			return;
		}
		var params = {};
		if (req.query.id) {
			params.ids = ApiUtils.formatId(req.query.id);
		}

		PortfolioQuery.select(connection, params).then(
			ApiUtils.DefaultApiSuccessHandler(res),
			ApiUtils.DefaultApiFailureHandler(res)
		);
	});

	router.put('/portfolio', function(req, res, next) {
		var connection = req.connection;
		req.checkBody('id', 'Invalid id').notEmpty().isInt();
		req.checkBody('name', 'Invalid name').notEmpty().isAlphanumeric();

		if (ApiUtils.handleError(req,res)) {
			return;
		}

		PortfolioQuery.update(connection, {
			id: req.body.id,
			name: req.body.name
		}).then(
			ApiUtils.DefaultApiSuccessHandler(res),
			ApiUtils.DefaultApiFailureHandler(res)
		);
	});

	router.post('/portfolio', function(req, res, next) {
		var connection = req.connection;
		req.checkBody('name', 'Invalid name').notEmpty().isAlphanumeric();

		if (ApiUtils.handleError(req,res)) {
			return;
		}

		PortfolioQuery.insert(connection, {
			name: req.body.name
		}).then(
			ApiUtils.DefaultApiSuccessHandler(res),
			ApiUtils.DefaultApiFailureHandler(res)
		);
	});

	router.delete('/portfolio', function(req, res, next) {
		var connection = req.connection;
		req.checkBody('id', 'Invalid id').notEmpty().isInt();
		if (ApiUtils.handleError(req,res)) {
			return;
		}
		var portfolio_id = req.body.id;
		ContractQuery.select(connection, {portfolio_id: portfolio_id})
		.then(deleteContractHandler)
		.then(deleteSimulationHandler)
		.then(selectConstraintHandler)
		.then(deleteContractConstraintHandler)
		.then(deleteGeographyConstraintHandler)
		.then(deleteConstraintHandler)
		.then(deletePortfolioHandler)
		.then(
			ApiUtils.DefaultApiSuccessHandler(res),
			ApiUtils.DefaultApiFailureHandler(res)
		);

		function deleteContractHandler(contracts) {
			return (new RSVP.Promise(function(resolve,reject) {
				var params = {
					portfolio_id: portfolio_id,
					ids: _.pluck(contracts, 'id')
				};
				ContractQuery.delete(connection, params).then(function() {
					resolve(contracts);
				}, function(err) {
					reject(err);
				});
			})).catch(function(reason) {
				console.log('Error at deleteContractHandler', reason);
			});
		}
		function deleteSimulationHandler(contracts) {
			return (new RSVP.Promise(function(resolve,reject) {
				AirSimulationQuery.delete(connection, {
					contract_id:  _.pluck(contracts, 'id')
				}).then(function() {
					resolve(contracts);
				}, function(err) {
					reject(err);
				});
			})).catch(function(reason) {
				console.log('Error at deleteSimulationHandler', reason);
			});
		}
		function selectConstraintHandler() {
			return (new RSVP.Promise(function(resolve,reject) {
				ConstraintSetQuery.select(connection, {
					portfolio_id:  portfolio_id
				}).then(function(constraints) {
					resolve(constraints);
				}, function(err) {
					reject(err);
				});
			})).catch(function(reason) {
				console.log('Error at selectConstraintHandler', reason);
			});
		}
		function deleteConstraintHandler(constraints) {
			return (new RSVP.Promise(function(resolve,reject) {
				ConstraintSetQuery.delete(connection, {
					portfolio_id:  portfolio_id,
					ids: _.pluck(constraints, 'id')
				}).then(function() {
					resolve(constraints);
				}, function(err) {
					reject(err);
				});
			})).catch(function(reason) {
				console.log('Error at deleteConstraintHandler', reason);
			});
		}
		function deleteContractConstraintHandler(constraints) {
			return (new RSVP.Promise(function(resolve,reject) {
				ContractConstraintQuery.delete(connection, {
					set_id: _.pluck(constraints, 'id')
				}).then(function() {
					resolve(constraints);
				}, function(err) {
					reject(err);
				});
			})).catch(function(reason) {
				console.log('Error at deleteContractConstraintHandler', reason);
			});
		}
		function deleteGeographyConstraintHandler(constraints) {
			return (new RSVP.Promise(function(resolve,reject) {
				GeographyConstraintQuery.delete(connection, {
					set_id: _.pluck(constraints, 'id')
				}).then(function() {
					resolve(constraints);
				}, function(err) {
					reject(err);
				});
			})).catch(function(reason) {
				console.log('Error at deleteGeographyConstraintHandler', reason);
			});
		}
		function deletePortfolioHandler() {
			return (new RSVP.Promise(function(resolve,reject) {
				PortfolioQuery.delete(connection, {
					ids: ApiUtils.formatId(portfolio_id)
				}).then(function() {
					resolve();
				}, function(err) {
					reject(err);
				});
			})).catch(function(reason) {
				console.log('Error at deletePortfolioHandler', reason);
			});
		}
	});
}