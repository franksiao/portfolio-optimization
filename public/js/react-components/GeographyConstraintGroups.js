define([
	'jsx!react-components/CheckBoxOption',
	'react',
	'JSXTransformer'
], function(
	CheckBoxOption,
	React
) {

	// function findMatchingGroup(constraint, groups) {
	// 	for (var i = 0; i < groups.length; ++i) {
	// 		if (groups[i].max_investment === constraint.max_investment &&
	// 			groups[i].min_investment === constraint.min_investment) {
	// 			return i;
	// 		}
	// 	}
	// 	return -1;
	// }

	return React.createClass({
		handleRemoveGroup: function(groupIndex, event) {
			event.stopPropagation();
			this.props.onChange(groupIndex);
			// var contract_groups = this.props.contract_groups;
			// this.props.onChange(contract_groups[groupIndex].contract_ids);
			// contract_groups.splice(groupIndex, 1);
			// this.setState({
				// contract_groups: contract_groups
			// });
		},
		render: function() {
			// var groups = [];
			var elementGroups = [];
			// this.props.constraints.forEach(function(constraint) {
			// 	var matchingIndex = findMatchingGroup(constraint, groups);
			// 	if (matchingIndex === -1) {
			// 		groups.push({
			// 			geos: [constraint.geography],
			// 			max_investment: constraint.max_investment,
			// 			min_investment: constraint.min_investment
			// 		});
			// 	} else {
			// 		groups[matchingIndex].geos.push(constraint.geography);
			// 	}
			// });

			this.props.geography_groups.forEach(function(group, index) {
				elementGroups.push(
					<div className="form-group constraint-group">
						<label className="control-label">Set constraints for Geographies: 
							<span className="group-names"> {group.geos.join(' ,')}</span>
							<button type="button" aria-label="Close"
								className="close delete-constraint-group"
								onClick={this.handleRemoveGroup.bind(this, index)} >
								<span aria-hidden="true">×</span>
							</button>
						</label>
						<CheckBoxOption
							ref={'max_investment_checkbox'}
							value={group.max_investment}
							label={'Maximum Investment'}
						/>
						<CheckBoxOption
							ref={'min_investment_checkbox'}
							value={group.min_investment}
							label={'Minimum Investment'}
						/>
					</div>
				);
			}.bind(this));

			return(<div>{elementGroups}</div>);
		}
	});
});