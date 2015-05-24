var GeographyQuery = require('./query/GeographyQuery.js');
var ApiUtils = require('./ApiUtils');

exports.setup = function(router) {
	router.get('/geography', function(req, res, next) {
		var connection = req.connection;
		req.checkQuery('portfolio_id', 'Invalid portfolio_id').notEmpty().isInt();
		var params = {
			portfolio_id: req.query.portfolio_id
		};
		GeographyQuery.select(connection, params)
		.then(ApiUtils.DefaultApiSuccessHandler(res), ApiUtils.DefaultApiFailureHandler(res));
	});
};