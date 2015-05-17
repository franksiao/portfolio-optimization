var Queries = require('./Queries.js');
var ApiUtils = require('./ApiUtils');

exports.setup = function(router, connection) {
	router.get('/portfolios', function(req, res, next) {
		var params = {
			db_connection: connection,
			id: req.query.id
		};
		Queries.getPortfolios(params)
		.then(ApiUtils.DefaultApiSuccessHandler(res), ApiUtils.DefaultApiFailureHandler(res));
	});

	router.post('/portfolio', function(req, res, next) {
		Queries.postPortfolio({
			db_connection: connection,
			name: req.body.name
		}).then(function(result) {
			res.send({
				status: 'success',
				data: result
			});
		}, ApiUtils.DefaultApiFailureHandler(res));
	});

	router.put('/portfolio', function(req, res, next) {
		Queries.putPortfolio({
			db_connection: connection,
			id: req.body.id,
			name: req.body.name
		}).then(function(result) {
			res.send({
				status: 'success',
				data: result
			});
		}, ApiUtils.DefaultApiFailureHandler(res));
	});
	router.delete('/portfolio', function(req, res, next) {
		var portfolioId = req.body.id;
		var params = {
			db_connection: connection,
			portfolio_id: portfolioId
		};
		Queries.getContracts(params).then(function(result) {
			var contracts = result.data[0];
			var contractIds = _.pluck(contracts, 'ContractSID');
			Queries.deleteSimulations({
				db_connection: connection,
				contract_ids: contractIds,
				portfolio_id: portfolioId
			}).then(Queries.deleteContracts)
			.then(Queries.deletePortfolio)
			.then(ApiUtils.DefaultApiSuccessHandler(res), ApiUtils.DefaultApiFailureHandler(res));
			//TODO: deleting Constraints
		});
	});
}