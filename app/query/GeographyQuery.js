var RSVP = require('rsvp');
var QueryUtils = require('./QueryUtils.js');

exports.select = function(connection, params) {
	console.log('Querying geography');
	//required
	var portfolio_id = params.portfolio_id;
	//query
	var queryString = 'SELECT * from opt.v_geography WHERE portfolio_id=' + portfolio_id;
	return QueryUtils.standardSelectPromise(connection, queryString);
}