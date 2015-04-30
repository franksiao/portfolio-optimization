define([
	'jquery',
	'rsvp'
], function(
	$,
	RSVP
) {
	function _getAllPortfolios() {
		var promise = new RSVP.Promise(function(resolve, reject) {
			$.get( "portfolios", function(data) {
				resolve(data);
			});
		});
		return promise;
	}

	return {
		getAllPortfolios: _getAllPortfolios
	};
});