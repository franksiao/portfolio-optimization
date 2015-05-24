define([
	'jsx!react-components/CheckBoxOption',
	'react',
	'JSXTransformer',
], function(
	CheckBoxOption,
	React
) {

	return React.createClass({

		getInitialState: function() {
			return {
				contract_groups: this.props.contract_groups.slice(0)
			};
		},
		handleRemoveGroup: function(groupIndex, event) {
			event.stopPropagation();
			this.props.onChange(groupIndex);
		},
		getData: function() {
			var data = [];
			this.props.contract_groups.forEach(function(group, groupIndex) {
				var maxState = this.refs['max_investment_checkbox_' + groupIndex].state;
				var minState = this.refs['min_investment_checkbox_' + groupIndex].state;
				group.contract_ids.forEach(function(contractId) {
					data.push({
						contract_id: contractId,
						max_investment: maxState.isChecked ? maxState.value : null,
						min_investment: minState.isChecked ? minState.value : null
					});
				});
			}.bind(this));
			return data;
		},
		render: function() { 
			var elementGroups = [];
			this.props.contract_groups.forEach(function(group, index) {
				elementGroups.push(
					<div className="form-group constraint-group">
						<label className="control-label">Set constraints for Contracts:
							<span className="group-names"> {group.contract_names.join(' ,')}</span>
							<button type="button" aria-label="Close"
								className="close delete-constraint-group"
								onClick={this.handleRemoveGroup.bind(this, index)} >
								<span aria-hidden="true">×</span>
							</button>
						</label>
						<CheckBoxOption
							ref={'max_investment_checkbox_'+index}
							value={group.max_investment}
							label={'Maximum Investment'}
						/>
						<CheckBoxOption
							ref={'min_investment_checkbox_'+index}
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