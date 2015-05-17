define([
	'jquery',
	'rsvp',
	'underscore'
], function(
	$,
	RSVP,
	_
) {
	function getContracts(pId) {
		var promise = new RSVP.Promise(function(resolve, reject) {
			$.get('contract', {portfolio_id: pId}, function(response) {
				if (response.status === 'success') {
					resolve(_formatContracts(response.data));
				} else {
					console.assert(response.status, response.error);
					reject(response.error);
				}
			});
		});
		return promise;
	}
	function _formatContracts(data) {
		var formattedContracts = {};
		data.forEach(function(contract) {
			formattedContracts[contract.id] = {
				name: contract.name
			};
		});
		return formattedContracts;
	}
	function deleteContracts(cIds, portfolio_id) {
		console.log('delete contracts', cIds);
		var promise = new RSVP.Promise(function(resolve, reject) {
			$.ajax({
				url: 'contract',
				type: 'DELETE',
				data: {id: cIds, portfolio_id: portfolio_id}
			}).done(function(response) {
				if (response.status === 'success') {
					console.log(response);
					resolve();
				} else {
					console.assert(response.status, response.error);
					reject(response.error);
				}
			}).fail(function(jqXHR) {
				console.log(jqXHR.responseJSON.error);
			});
		});
		return promise;
	}
	function createContract(params) {
		return (new RSVP.Promise(function(resolve, reject) {
			$.ajax({
				url: 'contract',
				type: 'POST',
				data: params,
				success: function(response) {
					if (response.status === 'success') {
						resolve();
					} else {
						console.assert(response.status, response.error);
						reject(response.error);
					}
				}
			});
		}));
	}

	return {
		getContracts: getContracts,
		deleteContracts: deleteContracts,
		createContract: createContract
	};
});