var RSVP = require('rsvp');
var QueryUtils = require('./QueryUtils.js');

exports.select = function(connection, params) {
	console.log('Querying contract');
	//required
	var portfolio_id = params.portfolio_id;
	//query
	var queryString = 'SELECT * from opt.contract';
	queryString += ' WHERE portfolio_id=' + portfolio_id;
	return QueryUtils.standardSelectPromise(connection, queryString);
};

exports.update = function(connection, params) {
	console.log('Updating contract');
	// required
	var id = params.id;
	// optional
	var fields = ['name', 'return_value'];

	//query
	var queryString = 'UPDATE opt.contract';
	var queries = [];
	fields.forEach(function(field) {
		if (params[field] !== undefined) {
			queries.push(field +  '=\'' + params[field] + '\'');
		}
	});
	if (queries.length === 0) {
		console.log('Warning: updating contract with no fields');
		return RSVP.Promise.resolve();
	}
	queryString += (' SET ' + queries.join(', ') + ' WHERE id=' + id);
	return (new RSVP.Promise(function(resolve,reject) {
		var q = connection.query(queryString, function(err, result) {
			if (!err) {
				console.log('Update succesful on:', id);
				resolve(params);
			} else {
				reject(err.code);
				console.log('Error while performing Query.');
				console.log(err);
			}
		});
		console.log(q.sql);
	}));
}

exports.delete = function(connection, params) {
	console.log('Deleting contract');
	//required
	var portfolio_id = params.portfolio_id;
	var ids = params.ids;
	if (!Array.isArray(ids) || ids.length === 0) {
		return RSVP.Promise.resolve();
	}
	//query
	var queryString = 'DELETE from opt.contract WHERE portfolio_id=' + portfolio_id;
	var queries = [];
	ids.forEach(function(id) {
		queries.push('id=' + id);
	});
	if (ids.length > 0) {
		queryString += ' AND ' + queries.join(' OR ');
	}
	return QueryUtils.standardDeletePromise(connection, queryString);
}

exports.insert = function(connection, params) {
	console.log('Inserting contract');
	//query
	var query = 'INSERT INTO opt.contract SET ?';
	return QueryUtils.standardInsertPromise(connection,query,params);
}