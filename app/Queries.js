var RSVP = require('rsvp');
var _ = require("underscore");

var standardQuery = function(resolve, reject, params, queryString, appendToData) {
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



function isNumeric(num) { return /^[-+]?[0-9]+$/.test(num); }
var formatConditions = function(field, valueArray, separator) {
	var conditions = [];
	valueArray.forEach(function(val) {
		if (isNumeric(val)) {
			conditions.push(field + '=' + val);
		} else {
			conditions.push(field + '="' + val + '"');
		}
	});
	return conditions.join(' ' + separator + ' ');
}

//portfolios
exports.getPortfolios = function(params) {
	params = params || {};
	var id = params.id || 0;
	
	return (new RSVP.Promise(function(resolve, reject) {
		var queryString = 'SELECT * from opt.portfolio';
		if (id > 0) {
			queryString += ' WHERE id=' + id;
		}
		console.log(queryString);
		standardQuery(resolve,reject,params,queryString,true);
	}));
};

exports.postPortfolio = function(params) {
	params = params || {};
	var connection = params.db_connection;
	var name = params.name;

	return (new RSVP.Promise(function(resolve,reject) {
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

exports.updateContract = function(params) {
	params = params || {};
	var connection = params.db_connection;
	var id = params.id;
	var name = params.name;
	var return_val = params.return;

	return (new RSVP.Promise(function(resolve,reject) {
		var queryString = 'UPDATE opt.contract SET name = ?, return_var = ? WHERE id = ?';
		var q = connection.query(queryString, [name, Number(return_val), id], function(err, result) {
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
		console.log(q.sql);
	}));
}
exports.putPortfolio = function(params) {
	params = params || {};
	var connection = params.db_connection;
	var id = params.id;
	var name = params.name;

	return (new RSVP.Promise(function(resolve,reject) {
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
	return (new RSVP.Promise(function(resolve,reject) {
		var queryString = 'DELETE from opt.portfolio';
		if (portfolioId) {
			queryString += ' WHERE id=' + portfolioId;
		} else {
			reject('No portfolio id specified');
		}
		standardQuery(resolve,reject,params,queryString,false);
	}));
};
exports.getContracts = function(params) {
	params = params || {};
	var connection = params.db_connection;
	var portfolioId = params.portfolio_id || 0;
	var contractIds = params.contract_ids || [];
	//Query for all contracts
	return (new RSVP.Promise(function(resolve,reject) {
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
		standardQuery(resolve,reject,params,queryString,true);
	}));
};

exports.getConstraints = function(params) {
	params = params || {};
	var connection = params.db_connection || 0;
	var portfolioId = params.portfolio_id || 0;
	var constraintSetId = params.constraint_set_id;
	return (new RSVP.Promise(function(resolve, reject) {
		console.log('Querying for Constraints');
		var queryString = 'SELECT * from opt.constraint_set';
		if (portfolioId > 0) {
			queryString += ' WHERE portfolio_id=' + portfolioId;
		} else if (constraintSetId > 0) {
			queryString += ' WHERE id=' + constraintSetId;
		} else {
			reject('Invalid request for constraints');
		}
		standardQuery(resolve,reject,params,queryString,true);
	}));
}
exports.deleteContracts = function(params) {
	params = params || {};
	var connection = params.db_connection;
	var contractIds = params.contract_ids || [];
	//Query for all contracts
	console.log('Deleting contracts:');
	return (new RSVP.Promise(function(resolve,reject) {
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
		standardQuery(resolve,reject,params,queryString,false);
	}));
};

exports.deleteSimulations = function(params) {
	params = params || {};
	var connection = params.db_connection;
	var contractIds = params.contract_ids || [];
	//Query for all contracts
	console.log('Deleting simulations:');
	return (new RSVP.Promise(function(resolve,reject) {
		var queryString = 'DELETE from opt.simulation_air';
		if (contractIds.length > 0) {
			var queries = [];
			contractIds.forEach(function(id) {
				queries.push('contract_id=' + id);
			});
			queryString += ' WHERE ' + queries.join(' OR ');
			standardQuery(resolve,reject,params,queryString,false);
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
	
	return (new RSVP.Promise(function(resolve,reject) {
		var set = {
			name: name,
			return_var: returnVal,
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
	
	return (new RSVP.Promise(function(resolve,reject) {
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

	return (new RSVP.Promise(function(resolve,reject) {
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

exports.contractConstraint = {
	insert: function(connection, params) {
		console.log('Inserting contract_constraints');
		//required
		var constraints = params.contract_constraint;
		//query
		var queryString = 'INSERT INTO opt.contract_constraint (set_id, contract_id, max_investment, min_investment) Values ?';
		return standardMultiInsertPromise(connection, queryString, constraints);
	},
	select: function(connection, params) {
		console.log('Querying contract_constraint');
		//required
		var set_id = params.set_id;
		//query
		var queryString = 'SELECT * from opt.contract_constraint';
		queryString += ' WHERE set_id=' + set_id;
		return standardSelectPromise(connection, queryString);
	},
	delete: function(connection, params) {
		console.log('Deleting contract_constraints');
		//required
		var set_id = params.set_id;
		if (!Array.isArray(set_id)) {
			set_id = [set_id];
		}
		//query
		if (set_id.length === 0) {
			return RSVP.Promise.resolve([]);
		}
		var queryString = 'DELETE from opt.contract_constraint';
		var queries = [];
		set_id.forEach(function(id) {
			queries.push('set_id=' + id);
		});
		queryString += ' WHERE ' + queries.join(' OR ');
		return standardDeletePromise(connection, queryString);
	}
};

exports.geographyConstraint = {
	insert: function(connection, params) {
		console.log('Inserting geography_constraints');
		//required
		var constraints = params.geography_constraint;
		//query
		var queryString = 'INSERT INTO opt.geography_constraint (set_id, geography, max_investment, min_investment) Values ?';
		return standardMultiInsertPromise(connection, queryString, constraints);
	},
	select: function(connection, params) {
		console.log('Querying geography_constraint');
		//required
		var set_id = params.set_id;
		//query
		var queryString = 'SELECT * from opt.geography_constraint';
		queryString += ' WHERE set_id=' + set_id;
		return standardSelectPromise(connection, queryString);
	},
	delete: function(connection, params) {
		console.log('Deleting geography_constraint');
		//required
		var set_id = params.set_id;
		if (!Array.isArray(set_id)) {
			set_id = [set_id];
		}
		//query
		if (set_id.length === 0) {
			return RSVP.Promise.resolve([]);
		}
		var queryString = 'DELETE from opt.geography_constraint';
		var queries = [];
		set_id.forEach(function(id) {
			queries.push('set_id=' + id);
		});
		queryString += ' WHERE ' + queries.join(' OR ');
		return standardDeletePromise(connection, queryString);
	}
};
exports.constraintSet = {
	select: function(connection, params) {
		console.log('Querying constraint_set');
		//required
		var portfolio_id = params.portfolio_id;
		//optional
		var ids = params.ids;
		//query
		var queryString = 'SELECT * from opt.constraint_set';
		queryString += ' WHERE portfolio_id=' + portfolio_id;
		if (ids) {
			queryString += ' AND ' + formatConditions('id', ids, 'OR');
		}
		return standardSelectPromise(connection, queryString);
	},
	insert: function(connection, params) {
		console.log('Inserting constraint_set');
		//query
		var query = 'INSERT INTO opt.constraint_set SET ?';
		return standardInsertPromise(connection,query,params);
	},
	update: function(connection, params) {
		console.log('Updating constraint_set');
		// required
		var id = params.id;
		// optional
		var fields = ['name', 'target_return', 'target_tvar_threshold', 'total_size'];

		//query
		var queryString = 'UPDATE opt.constraint_set';
		var queries = [];
		fields.forEach(function(field) {
			if (params[field] !== undefined) {
				queries.push(field + '=' + params[field]);
			}
		});
		if (queries.length === 0) {
			console.log('Warning: updating constraint_set with no fields');
			return RSVP.Promise.resolve();
		}
		queryString += (' SET ' + queries.join(', ') + ' WHERE id=' + id);
		return (new RSVP.Promise(function(resolve,reject) {
			var q = connection.query(queryString, function(err, result) {
				if (!err) {
					resolve(params);
				} else {
					reject(err.code);
					console.log('Error while performing Query.');
					console.log(err);
				}
			});
			console.log(q.sql);
		}));
	},
	delete: function(connection, params) {
		console.log('Deleting constraint_set');
		//required
		var portfolio_id = params.portfolio_id;
		var ids = params.ids;
		if (!Array.isArray(ids) || ids.length === 0) {
			return RSVP.Promise.resolve();
		}
		//query
		var queryString = 'DELETE from opt.constraint_set WHERE portfolio_id=' + portfolio_id;
		var queries = [];
		ids.forEach(function(id) {
			queries.push('id=' + id);
		});
		if (ids.length > 0) {
			queryString += ' AND ' + queries.join(' OR ');
		}
		return standardDeletePromise(connection, queryString);
	}
};
var standardSelectPromise = function(connection, query) {
	return (new RSVP.Promise(function(resolve,reject) {
		var q = connection.query(query, function(err,rows,fields) {
			if (!err) {
				resolve(rows);
			} else {
				reject(err.code);
				console.log('Error while performing Query.');
				console.log(err);
			}
		});
		console.log(q.sql)
	})).catch(function(reason) {
		console.log('Error at standardSelectPromise', reason);
	});
}
var standardDeletePromise = function(connection, query) {
	return (new RSVP.Promise(function(resolve,reject) {
		var q = connection.query(query, function(err,result) {
			if (!err) {
				console.log('Deleted Rows:', result.affectedRows);
				resolve();
			} else {
				reject(err.code);
				console.log('Error while performing delete.');
				console.log(err);
			}
		});
		console.log(q.sql)
	})).catch(function(reason) {
		console.log('Error at standardDeletePromise', reason);
	});
}
var standardInsertPromise = function(connection, query, set) {
	return (new RSVP.Promise(function(resolve,reject) {
		var q = connection.query(query, set, function(err, result) {
			if (!err) {
				resolve(_.extend(set, {
					id: result.insertId
				}));
			} else {
				reject(err.code);
				console.log('Error while performing Insert Query.');
				console.log(err);
			}
		});
		console.log(q.sql)
	})).catch(function(reason) {
		console.log('Error at standardInsertPromise', reason);
	});
}
var standardMultiInsertPromise = function(connection, query, sets) {
	return (new RSVP.Promise(function(resolve,reject) {
		var q = connection.query(query, [sets], function(err, result) {
			if (!err) {
				console.log('Rows inserted:', result.affectedRows, 'Starting from id:', result.insertId);
				resolve();
			} else {
				reject(err.code);
				console.log('Error while performing Multi Insert Query.');
				console.log(err);
			}
		});
		console.log(q.sql)
	})).catch(function(reason) {
		console.log('Error at standardMultiInsertPromise', reason);
	});
}