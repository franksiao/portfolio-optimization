define([
	'jquery',
	'rsvp'
], function(
	$,
	RSVP
) {
	function _getAllPortfolios() {
		return (new RSVP.Promise(function(resolve, reject) {
			$.ajax({
				url: 'portfolio',
				type: 'GET'
			}).done(function(response) {
				resolve(response.data);
			}).fail(function(err) {
				reject(err.responseText);
			});
		}));
	}
	function _postPortfolio(name) {
		return (new RSVP.Promise(function(resolve, reject) {
			$.ajax({
				url: 'portfolio',
				type: 'POST',
				data: {name: name}
			}).done(function(response) {
				resolve(response.data.id);
			}).fail(function(err) {
				reject(err);
			});
		}));
	}
	function _putPortfolio(portfolio) {
		return (new RSVP.Promise(function(resolve, reject) {
			$.ajax({
				url: 'portfolio',
				type: 'PUT',
				data: portfolio
			}).done(function(response) {
				resolve(response.data);
			}).fail(function(err) {
				reject(err);
			});
		}));
	}

	function _deletePortfolio(id) {
		return (new RSVP.Promise(function(resolve, reject) {
			$.ajax({
				url: 'portfolio',
				type: 'DELETE',
				data: {
					id: id
				}
			}).done(function(response) {
				resolve(response.data);
			}).fail(function(err) {
				reject(err);
			});
		}));
	}
	return {
		getAllPortfolios: _getAllPortfolios,
		postPortfolio: _postPortfolio,
		putPortfolio: _putPortfolio,
		deletePortfolio: _deletePortfolio
	};
});