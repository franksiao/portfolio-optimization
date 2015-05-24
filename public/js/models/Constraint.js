define([
	'jquery',
	'rsvp',
	'underscore'
], function(
	$,
	RSVP,
	_
) {
	var _constraintsByPortfioIds = {};
	function putConstraint(portfolioId, constraintId, constraint) {
		return (new RSVP.Promise(function(resolve, reject) {
			constraint.portfolio_id = portfolioId;
			constraint.id = constraintId;
			$.ajax({
				url: 'constraint',
				type: 'PUT',
				data: constraint
			}).done(function(response) {
				console.log('PUT Constraint:', response);
				resolve(getConstraintById(portfolioId, constraintId, true));
			}).fail(function(err) {
				reject(err);
			});
		}));
	}
	function postConstraint(portfolioId, constraint) {
		return (new RSVP.Promise(function(resolve, reject) {
			constraint.portfolio_id = portfolioId;
			$.ajax({
				url: 'constraint',
				type: 'POST',
				data: constraint
			}).done(function(response) {
				console.log('POST Constraint:',response);
				resolve(getConstraintById(portfolioId, response.data.id, true));
			}).fail(function(err) {
				reject(err);
			});
		}));
	}
	function getConstraintById(portfolioId, constraintId, refetch) {
		if (!refetch && _constraintsByPortfioIds[portfolioId] &&
			_constraintsByPortfioIds[portfolioId][constraintId]) {
			return _constraintsByPortfioIds[portfolioId][constraintId]
		}
		return (new RSVP.Promise(function(resolve, reject) {
			$.ajax({
				url: 'constraint',
				type: 'GET',
				data: {portfolio_id: portfolioId, id: constraintId}
			}).done(function(response) {
				if (response.data.length === 1) {
					_constraintsByPortfioIds[portfolioId][constraintId] = response.data[0];
					resolve(response.data[0]);
				} else {
					reject('getConstraintById: No constraint exists for ', constraintId);
				}
			}).fail(function(err) {
				reject(err);
			});
		}));
	}
	function getDefaultConstraintValues() {
		return RSVP.Promise.resolve({
			name: null,
			target_return: null,
			target_tvar_threshold: null,
			total_size: null,
			contract_constraint: [],
			geography_constraint: []
		});
	}
	function getConstraintsByPortfolio(portfolioId, refetch) {
		if (!refetch && _constraintsByPortfioIds[portfolioId]) {
			return RSVP.Promise.resolve(_constraintsByPortfioIds[portfolioId]);
		}
		var promise = new RSVP.Promise(function(resolve, reject) {
			$.ajax({
				url: 'constraint',
				type: 'GET',
				data: {portfolio_id: portfolioId}
			}).done(function(response) {
				_constraintsByPortfioIds[portfolioId] = _formatConstraints(response.data);
				resolve(_constraintsByPortfioIds[portfolioId]);
			}).fail(function(err) {
				reject(err);
			});
		});
		return promise;
	}

	function _formatConstraints(data) {
		var formattedConstraints = {};
		data.forEach(function(constraint) {
			formattedConstraints[constraint.id] = constraint;
		});
		return formattedConstraints;
	}
	return {
		postConstraint: postConstraint,
		putConstraint: putConstraint,
		getConstraintsByPortfolio: getConstraintsByPortfolio,
		getConstraintById: getConstraintById,
		getDefaultConstraintValues: getDefaultConstraintValues
	};
});