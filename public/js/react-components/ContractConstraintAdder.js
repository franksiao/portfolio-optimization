define([
	'react',
	'JSXTransformer'
], function(
	React
) {

	return React.createClass({
		onAddGroup: function(event) {
			event.stopPropagation();
			this.props.onChange($(this.getDOMNode()).find('select').val());
		},
		render: function() {
			var options = [];
			this.props.contracts.forEach(function(contract) {
				options.push(<option value={contract.id}>{contract.name}</option>)
			});
			return(
				<div className="form-group">
					<label for="contract-constraint-select" className="control-label">
						{'Select contract(s) to add constraint to:'}
					</label>
					<select multiple className="form-control" id="contract-constraint-select">
						{options}
					</select>
					<div className="button-container">
						<button 
							type="button" 
							className="btn btn-primary btn-sm"
							onClick={this.onAddGroup} >
							{'Add Contract Group'}
						</button>
					</div>
				</div>
			);
		}
	});
});