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
		var queryString = 'SELECT * from opt.portfolio';
		if (id > 0) {
			queryString += ' WHERE id=' + id;
		}
		console.log(queryString);
		_standardQuery(resolve,reject,params,queryString,true);
	}));
};

exports.postPortfolio = function(params) {
	params = params || {};
	var connection = params.db_connection;
	var name = params.name;

	return (new Promise(function(resolve,reject) {
		var queryString = 'INSERT INTO opt.portfolio SET ?';
		connection.query(queryString, {name: name}, function(err, result) {
			if (!err) {
				console.log(result);
				resolve({
					name: name,
					id: result.insertId
				});
			} else {
				reject(err.code);
				console.log('Error while performing Query.');
				console.log(err);
			}
		});
	}));
}

exports.putPortfolio = function(params) {
	params = params || {};
	var connection = params.db_connection;
	var id = params.id;
	var name = params.name;

	return (new Promise(function(resolve,reject) {
		var queryString = 'UPDATE opt.portfolio SET name = ? WHERE id = ?';
		connection.query(queryString, [name, id], function(err, result) {
			if (!err) {
				console.log(result);
				resolve({
					id: result.insertId,
					name: name
				});
			} else {
				reject(err.code);
				console.log('Error while performing Query.');
				console.log(err);
			}
		});
	}));
}
exports.deletePortfolio = function(params) {
	params = params || {};
	var connection = params.db_connection;
	var portfolioId = params.portfolio_id || [];
	//Query for all contracts
	console.log('Deleting portfolio:');
	return (new Promise(function(resolve,reject) {
		var queryString = 'DELETE from opt.portfolio';
		if (portfolioId) {
			queryString += ' WHERE id=' + portfolioId;
		} else {
			reject('No portfolio id specified');
		}
		_standardQuery(resolve,reject,params,queryString,false);
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

		var queryString = 'SELECT * from opt.contract';
		if (contractIds.length > 0) {
			var queries = [];
			ids.forEach(function(id) {
				queries.push('id=' + id);
			});
			queryString += ' WHERE ' + queries.join(' OR ');
		} else if (portfolioId > 0) {
			queryString += ' WHERE portfolio_id=' + portfolioId;
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
		var queryString = 'SELECT * from opt.constraint_set';
		if (portfolioId > 0) {
			queryString += ' WHERE portfolio_id=' + portfolioId;
		} else if (constraintSetId > 0) {
			queryString += ' WHERE id=' + constraintSetId;
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
		var queryString = 'DELETE from opt.contract';
		if (contractIds.length > 0) {
			var queries = [];
			contractIds.forEach(function(id) {
				queries.push('id=' + id);
			});
			queryString += ' WHERE ' + queries.join(' OR ');
		} else {
			resolve(params);
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
		var queryString = 'DELETE from opt.simulation_air';
		if (contractIds.length > 0) {
			var queries = [];
			contractIds.forEach(function(id) {
				queries.push('contract_id=' + id);
			});
			queryString += ' WHERE ' + queries.join(' OR ');
			_standardQuery(resolve,reject,params,queryString,false);
		} else {
			resolve(params);
		}
	}));
};

exports.insertContract = function(params) {
	params = params || {};
	var connection = params.db_connection;
	var name = params.name || 0;
	var portfolioId = params.portfolio_id || 0;
	var returnVal = params.return_val;
	
	return (new Promise(function(resolve,reject) {
		var set = {
			name: name,
			'return': returnVal,
			portfolio_id: portfolioId
		};
		var queryString = 'INSERT INTO opt.contract SET ?';
		connection.query(queryString, set, function(err, result) {
			if (!err) {
				resolve({
					name: name,
					id: result.insertId
				});
			} else {
				reject(err.code);
				console.log('Error while performing Query.');
				console.log(err);
			}
		});
	}));
}

exports.insertContract = function(params) {
	params = params || {};
	var connection = params.db_connection;
	var name = params.name || 0;
	var portfolioId = params.portfolio_id || 0;
	var returnVal = params.return_val;
	
	return (new Promise(function(resolve,reject) {
		var set = {
			name: name,
			'return': returnVal,
			portfolio_id: portfolioId
		};
		var queryString = 'INSERT INTO opt.contract SET ?';
		connection.query(queryString, set, function(err, result) {
			if (!err) {
				resolve({
					name: name,
					id: result.insertId
				});
			} else {
				reject(err.code);
				console.log('Error while performing Query.');
				console.log(err);
			}
		});
	}));
}


exports.insertSimulations = function(params) {
	params = params || {};
	var connection = params.db_connection;
	var simulations = params.simulations || [];

	return (new Promise(function(resolve,reject) {
		//TODO: we probably need to validate that the data matches the column values
		var queryString = 'INSERT INTO opt.simulation_air (contract_id, year, event, loss, geography) Values ?';
		var q = connection.query(queryString, [simulations], function(err, result) {
			if (!err) {
				resolve();
			} else {
				console.log('Error while performing Query.');
				console.log(err);
				reject(err.code);
			}
		});
		console.log(q.sql);
	}));
}