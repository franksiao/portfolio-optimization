define([
	'jquery',
	'rsvp',
	'underscore'
], function(
	$,
	RSVP,
	_
) {
	function getConstraints(pId) {
		var promise = new RSVP.Promise(function(resolve, reject) {
			$.get('constraints', {portfolio_id: pId}, function(response) {
				if (response.status === 'success') {
					console.log(response);
					resolve(_formatConstraints(response.data));
				} else {
					console.assert(response.status, response.error);
					reject(response.error);
				}
			});
		});
		return promise;
	}

	function _formatConstraints(data) {
		var formattedConstraints = {};
		data.forEach(function(constraint) {
			var setId = constraint.constraintSetID;
			if (!formattedConstraints.hasOwnProperty(setId)) {
				formattedConstraints[setId] = {
					name: constraint.constraintName,
					constraints: []
				};
				//TODO: maybe constraint name should be a separate table
			}
			formattedConstraints[setId].constraints.push({
				id: constraint.constraintID,
				type: constraint.constraintType,
				target: constraint.constraintTarget,
				value: constraint.constraint
				//TODO: we need constraint target type too
			});
		});
		return formattedConstraints;
	}

	return {
		getConstraints: getConstraints
	};
});