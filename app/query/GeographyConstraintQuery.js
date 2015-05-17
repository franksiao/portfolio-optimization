var RSVP = require('rsvp');
var QueryUtils = require('./QueryUtils.js');

exports.insert = function(connection, params) {
	console.log('Inserting geography_constraints');
	//required
	var constraints = params.geography_constraint;
	//query
	var queryString = 'INSERT INTO opt.geography_constraint (set_id, geography, max_investment, min_investment) Values ?';
	return QueryUtils.standardMultiInsertPromise(connection, queryString, constraints);
}
exports.select = function(connection, params) {
	console.log('Querying geography_constraint');
	//required
	var set_id = params.set_id;
	//query
	var queryString = 'SELECT * from opt.geography_constraint';
	queryString += ' WHERE set_id=' + set_id;
	return QueryUtils.standardSelectPromise(connection, queryString);
}
exports.delete = function(connection, params) {
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
	return QueryUtils.standardDeletePromise(connection, queryString);
}
