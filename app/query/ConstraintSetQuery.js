var RSVP = require('rsvp');
var QueryUtils = require('./QueryUtils.js');

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
exports.select = function(connection, params) {
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
	return QueryUtils.standardSelectPromise(connection, queryString);
}
exports.insert = function(connection, params) {
	console.log('Inserting constraint_set');
	//query
	var query = 'INSERT INTO opt.constraint_set SET ?';
	return QueryUtils.standardInsertPromise(connection,query,params);
}
exports.update = function(connection, params) {
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
			if (params[field] === null) {
				queries.push(field + '=null');
			} else {
				queries.push(field +  '=\'' + params[field] + '\'');
			}
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
}

exports.delete = function(connection, params) {
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
	return QueryUtils.standardDeletePromise(connection, queryString);
}
