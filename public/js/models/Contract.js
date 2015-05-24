define([
	'jquery',
	'rsvp',
	'underscore'
], function(
	$,
	RSVP,
	_
) {
	function putContract(portfolioId, contract) {
		return (new RSVP.Promise(function(resolve, reject) {
			contract.portfolio_id = portfolioId;
			$.ajax({
				url: 'contract',
				type: 'PUT',
				data: contract
			}).done(function() {
				resolve();
			}).fail(function(err) {
				reject(err);
			});
		}));
	}
	function deleteContract(portfolioId, contractIds) {
		return (new RSVP.Promise(function(resolve, reject) {
			$.ajax({
				url: 'contract',
				type: 'DELETE',
				data: {id: contractIds, portfolio_id: portfolioId}
			}).done(function() {
				resolve();
			}).fail(function(err) {
				reject(err);
			});
		}));
	}

	function postContract(portfolioId, contract) {
		return (new RSVP.Promise(function(resolve, reject) {
			contract.portfolio_id = portfolioId
			$.ajax({
				url: 'contract',
				type: 'POST',
				data: contract
			}).done(function() {
				resolve();
			}).fail(function(err) {
				reject(err);
			});
		}));
	}

	_contractsByPortfolioIds = {};
	function getContractsByPortfolio(portfolioId, refetch) {
		if (!refetch && _contractsByPortfolioIds[portfolioId]) {
			return RSVP.Promise.resolve(_contractsByPortfolioIds[portfolioId]);
		}
		return (new RSVP.Promise(function(resolve, reject) {
			$.ajax({
				url: 'contract',
				type: 'GET',
				data: {portfolio_id: portfolioId}
			}).done(function(response) {
				_contractsByPortfolioIds[portfolioId] = _formatContracts(response.data);
				resolve(_contractsByPortfolioIds[portfolioId]);
			}).fail(function(err) {
				reject(err);
			});
		}));
	}

	function _formatContracts(data) {
		var formattedContracts = {};
		data.forEach(function(contract) {
			formattedContracts[contract.id] = contract;
		});
		return formattedContracts;
	}

	return {
		getContractsByPortfolio: getContractsByPortfolio,
		deleteContract: deleteContract,
		postContract: postContract,
		putContract: putContract
	};
});