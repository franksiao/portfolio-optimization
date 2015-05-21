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
			$.get('constraint', {portfolio_id: pId}, function(response) {
				console.log(response.data);
				resolve(response.data);
				// if (response.status === 'success') {
				// 	console.log(response);
				// 	resolve(_formatConstraints(response.data));
				// } else {
				// 	console.assert(response.status, response.error);
				// 	reject(response.error);
				// }
			});
			var opt = {
				portfolio_id: 4,
				name:'test',
				total_size: 123,
				contract_constraint: [
					{
						contract_id: 3,
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
						geography: "fdsfadfa",
						max_investment: 1,
						min_investment: 221
					}
				]
			};
			// $.ajax({
			// 	url: 'contract',
			// 	type: 'PUT',
			// 	data: {
			// 		id: 14,
			// 		name: 'whooo3',
			// 		return_value: 12
			// 	},
			// 	success: function(response) {
			// 		console.log(response);
			// 	}
			// });
			// $.ajax({
			// 	url: 'constraint',
			// 	type: 'PUT',
			// 	data: opt,
			// 	success: function(response) {
			// 		console.log(response);
			// 	}
			// });
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