var Promise = require('promise');

var _standardQuery = function(resolve, reject, params, queryString, appendToData) {
	var connection = params.db_connection;
	if (!connection) {
		reject('Invalid connection to db.');
	}
	console.log(queryString);
	connection.query(queryString, function(err,rows,fields) {
		if (!err) {
			if (appendToData) {
				if (!params.data) {
					params.data = [];
				}
				params.data.push(rows);
			}
			resolve(params);
		} else {
			reject(err.code);
			console.log('Error while performing Query.');
			console.log(err);
		}
	});
}

//portfolios
exports.getPortfolios = function(params) {
	params = params || {};
	var id = params.id || 0;
	
	return (new Promise(function(resolve, reject) {
		var queryString = 'SELECT * from opt.tblPortfolios';
		if (id > 0) {
			queryString += ' WHERE portID=' + id;
		}
		console.log(queryString);
		_standardQuery(resolve,reject,params,queryString,true);
	}));
};

exports.getContracts = function(params) {
	params = params || {};
	var connection = params.db_connection;
	var portfolioId = params.portfolio_id || 0;
	var contractIds = params.contract_ids || [];
	//Query for all contracts
	return (new Promise(function(resolve,reject) {
		console.log('Querying for contracts:');

		var queryString = 'SELECT * from opt.tblContracts';
		if (contractIds.length > 0) {
			var queries = [];
			ids.forEach(function(id) {
				queries.push('contractSID=' + id);
			});
			queryString += ' WHERE ' + queries.join(' OR ');
		} else if (portfolioId > 0) {
			queryString += ' WHERE portID=' + portfolioId;
		} else {
			reject('Invalid request for contracts');
		}
		_standardQuery(resolve,reject,params,queryString,true);
	}));
};

exports.getConstraints = function(params) {
	params = params || {};
	var connection = params.db_connection || 0;
	var portfolioId = params.portfolio_id || 0;
	var constraintSetId = params.constraint_set_id;
	return (new Promise(function(resolve, reject) {
		console.log('Querying for Constraints');
		var queryString = 'SELECT * from opt.tblConstraint';
		if (portfolioId > 0) {
			queryString += ' WHERE portID=' + portfolioId;
		} else if (constraintSetId > 0) {
			queryString += ' WHERE constraintSetID=' + constraintSetId;
		} else {
			reject('Invalid request for constraints');
		}
		_standardQuery(resolve,reject,params,queryString,true);
	}));
}
exports.deleteContracts = function(params) {
	params = params || {};
	var connection = params.db_connection;
	var contractIds = params.contract_ids || [];
	//Query for all contracts
	console.log('Deleting contracts:');
	return (new Promise(function(resolve,reject) {
		var queryString = 'DELETE from opt.tblContracts';
		if (contractIds.length > 0) {
			var queries = [];
			contractIds.forEach(function(id) {
				queries.push('contractSID=' + id);
			});
			queryString += ' WHERE ' + queries.join(' OR ');
		} else {
			reject('No contract ids specified');
		}
		_standardQuery(resolve,reject,params,queryString,false);
	}));
};

exports.deleteSimulations = function(params) {
	params = params || {};
	var connection = params.db_connection;
	var contractIds = params.contract_ids || [];
	//Query for all contracts
	console.log('Deleting simulations:');
	return (new Promise(function(resolve,reject) {
		var queryString = 'DELETE from opt.tblSimulations';
		if (contractIds.length > 0) {
			var queries = [];
			contractIds.forEach(function(id) {
				queries.push('contractSID=' + id);
			});
			queryString += ' WHERE ' + queries.join(' OR ');
		} else {
			reject('Invalid params for deleteSimulations');
		}
		_standardQuery(resolve,reject,params,queryString,false);
	}));
};

exports.insertContract = function(params) {
	params = params || {};
	var connection = params.db_connection;
	var name = params.contract_name || 0;
	var portfolioId = params.portfolio_id || 0;
}