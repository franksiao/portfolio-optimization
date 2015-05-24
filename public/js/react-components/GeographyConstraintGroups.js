define([
	'jsx!react-components/CheckBoxOption',
	'react',
	'JSXTransformer'
], function(
	CheckBoxOption,
	React
) {

	return React.createClass({
		handleRemoveGroup: function(groupIndex, event) {
			event.stopPropagation();
			this.props.onChange(groupIndex);
		},
		getData: function() {
			var data = [];
			this.props.geography_groups.forEach(function(group, groupIndex) {
				var maxState = this.refs['max_investment_checkbox_' + groupIndex].state;
				var minState = this.refs['min_investment_checkbox_' + groupIndex].state;
				group.geos.forEach(function(geo) {
					data.push({
						geography: geo,
						max_investment: maxState.isChecked ? maxState.value : null,
						min_investment: minState.isChecked ? minState.value : null
					});
				});
			}.bind(this));
			return data;
		},
		render: function() {
			var elementGroups = [];
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