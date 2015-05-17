var RSVP = require('rsvp');
var QueryUtils = require('./QueryUtils.js');
exports.insert = function(connection, params) {
	console.log('Inserting contract_constraints');
	//required
	var constraints = params.contract_constraint;
	//query
	var queryString = 'INSERT INTO opt.contract_constraint (set_id, contract_id, max_investment, min_investment) Values ?';
	return QueryUtils.standardMultiInsertPromise(connection, queryString, constraints);
}

exports.select = function(connection, params) {
	console.log('Querying contract_constraint');
	//required
	var set_id = params.set_id;
	//query
	var queryString = 'SELECT * from opt.contract_constraint';
	queryString += ' WHERE set_id=' + set_id;
	return QueryUtils.standardSelectPromise(connection, queryString);
}

exports.delete = function(connection, params) {
	console.log('Deleting contract_constraints');
	//required
	var set_id = params.set_id;
	var contract_id = params.contract_id;

	//query
	var queryString = 'DELETE from opt.contract_constraint';
	var queries = [];

	if (set_id) {
		if (!Array.isArray(set_id)) {
			set_id = [set_id];
		}
		if (set_id.length === 0) {
			return RSVP.Promise.resolve([]);
		}
		set_id.forEach(function(id) {
			queries.push('set_id=' + id);
		});
	} else if (contract_id) {
		if (!Array.isArray(contract_id)) {
			contract_id = [contract_id];
		}
		if (contract_id.length === 0) {
			return RSVP.Promise.resolve([]);
		}
		contract_id.forEach(function(id) {
			queries.push('contract_id=' + id);
		});
	}
	queryString += ' WHERE ' + queries.join(' OR ');
	return QueryUtils.standardDeletePromise(connection, queryString);
}