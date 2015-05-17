var RSVP = require('rsvp');
var _ = require('underscore');

exports.standardSelectPromise = function(connection, query) {
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
exports.standardDeletePromise = function(connection, query) {
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
exports.standardInsertPromise = function(connection, query, set) {
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
exports.standardMultiInsertPromise = function(connection, query, sets) {
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