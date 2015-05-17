var RSVP = require('rsvp');
var QueryUtils = require('./QueryUtils.js');

exports.select = function(connection, params) {
	console.log('Querying portfolio');
	//optional
	var ids = params.ids || [];
	//query
	var queryString = 'SELECT * from opt.portfolio';
	if (ids.length > 0) {
		var queries = [];
		ids.forEach(function(id) {
			queries.push('id=' + id);
		});
		queryString += ' WHERE ' + queries.join(' OR ');
	}
	return QueryUtils.standardSelectPromise(connection, queryString);
}

exports.update = function(connection, params) {
	console.log('Updating portfolio');
	// required
	var id = params.id;
	var name = params.name;
	//query
	var queryString = 'UPDATE opt.portfolio SET name = \'' + name + '\' WHERE id = ' + id;

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
}

exports.insert = function(connection, params) {
	console.log('Inserting portfolio');
	//query
	var query = 'INSERT INTO opt.portfolio SET ?';
	return QueryUtils.standardInsertPromise(connection,query,params);
}

exports.delete = function(connection, params) {
	console.log('Deleting portfolio');
	//required
	var ids = params.ids;
	if (!Array.isArray(ids) || ids.length === 0) {
		return RSVP.Promise.resolve();
	}
	//query
	var queryString = 'DELETE from opt.portfolio WHERE ';
	var queries = [];
	ids.forEach(function(id) {
		queries.push('id=' + id);
	});

	queryString += queries.join(' OR ');

	return QueryUtils.standardDeletePromise(connection, queryString);
}