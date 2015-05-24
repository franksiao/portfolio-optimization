var ConstraintSetQuery = require('./query/ConstraintSetQuery.js');
var ContractConstraintQuery = require('./query/ContractConstraintQuery.js');
var GeographyConstraintQuery = require('./query/GeographyConstraintQuery.js');

var ApiUtils = require('./ApiUtils');
var RSVP = require('rsvp');

//helper functions
function contractConstraintValidator(contractConstraints) {
	if (!Array.isArray(contractConstraints)) {
		console.log('Validation Error: contract constraint is not an array');
		return false;
	}
	var contractHasConstraint = {};
	for (var i = 0; i < contractConstraints.length; ++i) {
		var constraint = contractConstraints[i];
		if (!ApiUtils.isInt(constraint.contract_id)) {
			console.log('Validation Error: Invalid contract_id', constraint.contract_id);
			return false;
		}
		if (!ApiUtils.isNumericOrNull(constraint.max_investment)) {
			console.log('Validation Error: Invalid max_investment', constraint.max_investment);
			return false;
		}
		if (!ApiUtils.isNumericOrNull(constraint.min_investment)) {
			console.log('Validation Error: Invalid max_investment', constraint.min_investment);
			return false;
		}
		if (contractHasConstraint.hasOwnProperty(constraint.contract_id)) {
			console.log('Validation Error: Constraint for contract has more than one instance', constraint.contract_id);
			return false;
		} else {
			contractHasConstraint[constraint.contract_id] = true;
		}
	}
	return true;
}

function geographyConstraintValidator(geoConstraint) {
	if (!Array.isArray(geoConstraint)) {
		console.log('Validation Error: geography constraint is not an array');
		return false;
	}
	var geoHasConstraint = {};
	for (var i = 0; i < geoConstraint.length; ++i) {
		var constraint = geoConstraint[i];
		if (!ApiUtils.isValidString(constraint.geography)) {
			console.log('Validation Error: Invalid geography', constraint.geography);
			return false;
		}
		if (!ApiUtils.isNumericOrNull(constraint.max_investment)) {
			console.log('Validation Error: Invalid max_investment', constraint.max_investment);
			return false;
		}
		if (!ApiUtils.isNumericOrNull(constraint.min_investment)) {
			console.log('Validation Error: Invalid max_investment', constraint.min_investment);
			return false;
		}
		if (geoHasConstraint.hasOwnProperty(constraint.geography)) {
			console.log('Validation Error: Constraint for geography has more than one instance', constraint.geography);
			return false;
		} else {
			geoHasConstraint[constraint.geography] = true;
		}
	}
	return true;
}

function setParam(params, key, value) {
	if (value === undefined) {
		return params;
	} else if (value === '') {
		params[key] = null;
	} else {
		params[key] = value;
	}
	return params;
}

function checkNull(value) {
	if (value === '' || value === undefined) {
		return null;
	} else {
		return value
	}
}

exports.setup = function(router) {
	router.get('/constraint', function(req, res) {
		var connection = req.connection;
		//validation
		req.checkQuery('portfolio_id', 'Invalid portfolio_id').notEmpty().isInt();
		req.checkQuery('id', 'Invalid id').optional().isValidId();
		if (ApiUtils.handleError(req,res)) {
			return;
		}
		//query
		var params = {
			portfolio_id: req.query.portfolio_id
		};
		if (req.query.id) {
			params.ids = ApiUtils.formatId(req.query.id);
		}
		ConstraintSetQuery.select(connection, params)
		.then(selectContractConstraintHandler)
		.then(selectGeographyConstraintHandler)
		.then(
			ApiUtils.DefaultApiSuccessHandler(res),
			ApiUtils.DefaultApiFailureHandler(res)
		);

		function selectContractConstraintHandler(constraintSets) {
			var promises = [];
			if (constraintSets.length === 0) {
				return RSVP.Promise.resolve(constraintSets);
			}
			for (var i = 0; i < constraintSets.length; ++i) {
				var set = constraintSets[i];
				promises.push(new RSVP.Promise(function(resolve,reject) {
					ContractConstraintQuery.select(connection, {
						set_id: set.id
					}).then(function(data) {
						resolve(data);
					}, function(err) {
						reject(err);
					});
				}));
			};
			return RSVP.all(promises).then(function success(contractConstraints) {
				for (var i = 0; i < contractConstraints.length; ++i) {
					var constraints = contractConstraints[i];
					var set = constraintSets[i];
					console.assert(Array.isArray(constraints),
						'contract_constraint must return array');
					set.contract_constraint = [];
					constraints.forEach(function(constraint) {
						console.assert(constraint.set_id === set.id,
							'constraint_set id must match set id from contract constraint');
						set.contract_constraint.push({
							max_investment: constraint.max_investment,
							min_investment: constraint.min_investment,
							contract_id: constraint.contract_id
						});
					});
				}
				return constraintSets;
			}).catch(function(reason) {
				console.log('Error at selectContractConstraintHandler', reason);
			});
		}

		function selectGeographyConstraintHandler(constraintSets) {
			var promises = [];
			if (constraintSets.length === 0) {
				return RSVP.Promise.resolve(constraintSets);
			}
			for (var i = 0; i < constraintSets.length; ++i) {
				var set = constraintSets[i];
				promises.push(new RSVP.Promise(function(resolve,reject) {
					GeographyConstraintQuery.select(connection, {
						set_id: set.id
					}).then(function(data) {
						resolve(data);
					}, function(err) {
						reject(err);
					});
				}));
			};
			return RSVP.all(promises).then(function success(geographyConstraints) {
				for (var i = 0; i < geographyConstraints.length; ++i) {
					var constraints = geographyConstraints[i];
					var set = constraintSets[i];
					console.assert(Array.isArray(constraints),
						'geography_constraint must return array');
					set.geography_constraint = [];
					constraints.forEach(function(constraint) {
						console.assert(constraint.set_id === set.id,
							'constraint_set id must match set id from geography constraint');
						set.geography_constraint.push({
							max_investment: constraint.max_investment,
							min_investment: constraint.min_investment,
							geography: constraint.geography
						});
					});
				}
				return constraintSets;
				console.log(JSON.stringify(constraintSets, null, '\t'));
			}).catch(function(reason) {
				console.log('Error at selectGeographyConstraintHandler', reason);
			});
		}
	});
	router.post('/constraint', function(req, res) {
		var connection = req.connection;
		req.checkBody('portfolio_id', 'Invalid portfolio_id').notEmpty().isInt();
		req.checkBody('name', 'Invalid name').notEmpty().isValidString();
		req.checkBody('target_return', 'Invalid target_return').optional().isNumericOrNull();
		req.checkBody('target_tvar_threshold', 'Invalid target_tvar_threshold').optional().isNumericOrNull();
		req.checkBody('total_size', 'Invalid total_size').optional().isNumericOrNull();
		req.checkBody('contract_constraint', 'Invalid contract_constraint')
			.optional().isCustomValid(contractConstraintValidator);
		req.checkBody('geography_constraint', 'Invalid geography_constraint')
			.optional().isCustomValid(geographyConstraintValidator);
		if (ApiUtils.handleError(req,res)) {
			return;
		}
		var contractConstraints = req.body.contract_constraint;
		var geographyConstraints = req.body.geography_constraint;

		//query
		var params = {
			portfolio_id: req.body.portfolio_id,
			name: req.body.name
		};
		params = setParam(params, 'target_return', req.body.target_return);
		params = setParam(params, 'target_tvar_threshold', req.body.target_tvar_threshold);
		params = setParam(params, 'total_size', req.body.total_size);

		var promise = ConstraintSetQuery.insert(connection, params);

		if (contractConstraints && contractConstraints.length) {
			promise = promise.then(insertContractConstraintHandler);
		}
		if (geographyConstraints && geographyConstraints.length) {
			promise = promise.then(insertGeographyConstraintHandler);
		}

		promise.then(
			ApiUtils.DefaultApiSuccessHandler(res),
			ApiUtils.DefaultApiFailureHandler(res)
		);

		function insertContractConstraintHandler(constraintSet) {
			return (new RSVP.Promise(function(resolve,reject) {
				var formattedContractConstraints = [];
				contractConstraints.forEach(function(value) {
					formattedContractConstraints.push([
						constraintSet.id,
						value.contract_id,
						checkNull(value.max_investment),
						checkNull(value.min_investment)
					]);
				});
				ContractConstraintQuery.insert(connection, {
					contract_constraint: formattedContractConstraints
				}).then(function() {
					resolve(constraintSet);
				}, function(err) {
					reject(err);
				});
			})).catch(function(reason) {
				console.log('Error at insertContractConstraintHandler', reason);
			});
		}
		function insertGeographyConstraintHandler(constraintSet) {
			return (new RSVP.Promise(function(resolve,reject) {
				var formattedGeoConstraints = [];
				geographyConstraints.forEach(function(value) {
					formattedGeoConstraints.push([
						constraintSet.id,
						value.geography,
						checkNull(value.max_investment),
						checkNull(value.min_investment)
					]);
				});
				GeographyConstraintQuery.insert(connection, {
					geography_constraint: formattedGeoConstraints
				}).then(function() {
					resolve(constraintSet);
				}, function(err) {
					reject(err);
				});
			})).catch(function(reason) {
				console.log('Error at insertGeographyConstraintHandler', reason);
			});
		}
	});

	router.put('/constraint', function(req, res) {
		var connection = req.connection;
		//validation
		req.checkBody('id', 'Invalid').notEmpty().isInt();
		req.checkBody('name', 'Invalid name').optional().notEmpty().isAlphanumeric();
		req.checkBody('target_return', 'Invalid target_return').optional().isNumericOrNull();
		req.checkBody('target_tvar_threshold', 'Invalid target_tvar_threshold').optional().isNumericOrNull();
		req.checkBody('total_size', 'Invalid total_size').optional().isNumericOrNull();
		req.checkBody('contract_constraint', 'Invalid contract_constraint')
			.optional().isCustomValid(contractConstraintValidator);
		req.checkBody('geography_constraint', 'Invalid geography_constraint')
			.optional().isCustomValid(geographyConstraintValidator);

		if (ApiUtils.handleError(req,res)) {
			return;
		}
		var contractConstraints = req.body.contract_constraint || [];
		var geographyConstraints = req.body.geography_constraint || [];
		//query
		var params = {
			id: req.body.id
		};
		params = setParam(params, 'name', req.body.name);
		params = setParam(params, 'target_return', req.body.target_return);
		params = setParam(params, 'target_tvar_threshold', req.body.target_tvar_threshold);
		params = setParam(params, 'total_size', req.body.total_size);

		var promise = ConstraintSetQuery.update(connection, params);

		promise = promise.then(deleteContractConstraintHandler)
		if (contractConstraints.length > 0) {
			promise = promise.then(insertContractConstraintHandler);
		}
		
		promise = promise.then(deleteGeographyConstraintHandler)
		if (geographyConstraints.length > 0) {
			promise = promise.then(insertGeographyConstraintHandler)
		}

		promise.then(
			ApiUtils.DefaultApiSuccessHandler(res),
			ApiUtils.DefaultApiFailureHandler(res)
		);

		function deleteContractConstraintHandler(constraintSet) {
			return (new RSVP.Promise(function(resolve,reject) {
				ContractConstraintQuery.delete(connection, {
					set_id: constraintSet.id
				}).then(function() {
					resolve(constraintSet);
				}, function(err) {
					reject(err);
				});
			})).catch(function(reason) {
				console.log('Error at deleteContractConstraintHandler', reason);
			});
		}
		function insertContractConstraintHandler(constraintSet) {
			return (new RSVP.Promise(function(resolve,reject) {
				var formattedContractConstraints = [];
				contractConstraints.forEach(function(value) {
					formattedContractConstraints.push([
						constraintSet.id,
						value.contract_id,
						checkNull(value.max_investment),
						checkNull(value.min_investment)
					]);
				});
				ContractConstraintQuery.insert(connection, {
					contract_constraint: formattedContractConstraints
				}).then(function() {
					resolve(constraintSet);
				}, function(err) {
					reject(err);
				});
			})).catch(function(reason) {
				console.log('Error at insertContractConstraintHandler', reason);
			});
		}
		function deleteGeographyConstraintHandler(constraintSet) {
			return (new RSVP.Promise(function(resolve,reject) {
				GeographyConstraintQuery.delete(connection, {
					set_id: constraintSet.id
				}).then(function() {
					resolve(constraintSet);
				}, function(err) {
					reject(err);
				});
			})).catch(function(reason) {
				console.log('Error at deleteGeographyConstraintHandler', reason);
			});
		}
		function insertGeographyConstraintHandler(constraintSet) {
			return (new RSVP.Promise(function(resolve,reject) {
				var formattedGeoConstraints = [];
				geographyConstraints.forEach(function(value) {
					formattedGeoConstraints.push([
						constraintSet.id,
						value.geography,
						checkNull(value.max_investment),
						checkNull(value.min_investment)
					]);
				});
				GeographyConstraintQuery.insert(connection, {
					geography_constraint: formattedGeoConstraints
				}).then(function() {
					resolve(constraintSet);
				}, function(err) {
					reject(err);
				});
			})).catch(function(reason) {
				console.log('Error at insertGeographyConstraintHandler', reason);
			});
		}
	});

	router.delete('/constraint', function(req, res) {
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
		ConstraintSetQuery.delete(connection, params)
		.then(deleteContractConstraintHandler)
		.then(deleteGeographyConstraintHandler)
		.then(
			ApiUtils.DefaultApiSuccessHandler(res),
			ApiUtils.DefaultApiFailureHandler(res)
		);
		function deleteContractConstraintHandler() {
			return (new RSVP.Promise(function(resolve,reject) {
				ContractConstraintQuery.delete(connection, {
					set_id: ids
				}).then(function() {
					resolve();
				}, function(err) {
					reject(err);
				});
			})).catch(function(reason) {
				console.log('Error at deleteContractConstraintHandler', reason);
			});
		}
		function deleteGeographyConstraintHandler() {
			return (new RSVP.Promise(function(resolve,reject) {
				GeographyConstraintQuery.delete(connection, {
					set_id: ids
				}).then(function() {
					resolve();
				}, function(err) {
					reject(err);
				});
			})).catch(function(reason) {
				console.log('Error at deleteGeographyConstraintHandler', reason);
			});
		}
	});
}