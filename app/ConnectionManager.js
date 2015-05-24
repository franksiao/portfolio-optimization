var mysql = require('mysql');

exports.setup = function(router, config) {
	var pool = mysql.createPool({
		connectionLimit: 20,
		host: config.db_host,
		user: config.db_user,
		password: config.db_password,
		port: config.db_port,
		database : 'opt',
		debug: false
	});
	router.use(function makeConnection(req, res, next) {
		pool.getConnection(function(error, connection) {
			if (error) {
				console.log(error);
				res.status(500).send('Error making connection to database');
			} else {
				req.connection = connection;
				next();
			}
		});
	});
}