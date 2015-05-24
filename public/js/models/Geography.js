define([
	'jquery',
	'rsvp',
	'underscore'
], function(
	$,
	RSVP,
	_
) {
	function getGeographiesByPortfolio(portfolioId) {
		return (new RSVP.Promise(function(resolve, reject) {
			$.ajax({
				url: 'geography',
				type: 'GET',
				data: {portfolio_id: portfolioId}
			}).done(function(response) {
				resolve(_.pluck(response.data, 'geography'));
			}).fail(function(err) {
				reject(err);
			});
		}));
	}

	return {
		getGeographiesByPortfolio: getGeographiesByPortfolio
	};
});