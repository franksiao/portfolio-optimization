define([
	'jquery',
	'rsvp'
], function(
	$,
	RSVP
) {
	function _getAllPortfolios() {
		var promise = new RSVP.Promise(function(resolve, reject) {
			$.get( "portfolio", {'blah': 'blah'}, function(data) {
				resolve(data);
			});
		});
		return promise;
	}
	function _createNewPortfolio(name) {
		return (new RSVP.Promise(function(resolve, reject) {
			$.post( "portfolio", {name: name}, function(data) {
				console.log(data);
				resolve(data.data.id);
			});
		}));
	}
	function _changePortfolioName(id, name) {
		return (new RSVP.Promise(function(resolve, reject) {
			$.ajax({
				url: 'portfolio',
				type: 'PUT',
				data: {
					id: id,
					name: name
				},
				success: function(response) {
					if (response.status === 'success') {
						resolve(response.data);
					} else {
						console.assert(response.status, response.error);
						reject(response.error);
					}
				}
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
				},
				success: function(response) {
					if (response.status === 'success') {
						resolve(response.data);
					} else {
						console.assert(response.status, response.error);
						reject(response.error);
					}
				}
			});
		}));
	}
	return {
		getAllPortfolios: _getAllPortfolios,
		createNewPortfolio: _createNewPortfolio,
		changePortfolioName: _changePortfolioName,
		deletePortfolio: _deletePortfolio
	};
});