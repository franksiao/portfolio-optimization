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
			var opt = {
				// portfolio_id: pId,
				id: 37,
				target_tvar_threshold: 33,
				total_size: 11,
				contract_constraint: [
					{
						contract_id: 1,
						max_investment: 5,
						min_investment: 0
					}
				],
				geography_constraint: [
					{
						geography: "fds",
						max_investment: 1,
						min_investment: 0
					},
					{
						geography: 2,
						max_investment: 1,
						min_investment: 22
					}
				]
			};
			$.ajax({
				url: 'constraint',
				type: 'DELETE',
				data: {
					portfolio_id: 1,
					id: [39, 40]
				},
				success: function(response) {
					console.log(response);
				}
			});
			// $.post('constraint', opt, function(response) {
			// 	console.log(response);
			// });
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