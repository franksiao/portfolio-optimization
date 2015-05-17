var RSVP = require('rsvp');
var QueryUtils = require('./QueryUtils.js');

exports.delete = function(connection, params) {
	console.log('Deleting simulation_air');
	//required
	var contract_id = params.contract_id;
	//query
	var queryString = 'DELETE from opt.simulation_air';
	var queries = [];

	if (!Array.isArray(contract_id)) {
		contract_id = [contract_id];
	}
	if (contract_id.length === 0) {
		return RSVP.Promise.resolve([]);
	}
	contract_id.forEach(function(id) {
		queries.push('contract_id=' + id);
	});
	queryString += ' WHERE ' + queries.join(' OR ');
	return QueryUtils.standardDeletePromise(connection, queryString);
}
exports.insert = function(connection, params) {
	console.log('Inserting simulation_air');
	//required
	var simulation = params.simulation;
	//query
	var queryString = 'INSERT INTO opt.simulation_air (contract_id, year, event, loss, geography) Values ?';
	return QueryUtils.standardMultiInsertPromise(connection, queryString, simulation);
}