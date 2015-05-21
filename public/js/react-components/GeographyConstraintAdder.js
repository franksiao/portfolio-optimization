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
			this.props.geographies.forEach(function(geo) {
				options.push(<option value={geo}>{geo}</option>);
			});
			return(
				<div className="form-group">
					<label for="geography-constraint-select" className="control-label">
						{'Select Geo(s) to add constraint to:'}
					</label>
					<select multiple className="form-control" id="geography-constraint-select">
						{options}
					</select>
					<div className="button-container">
						<button 
							type="button" 
							className="btn btn-primary btn-sm"
							onClick={this.onAddGroup} >
							{'Add Geography Group'}
						</button>
					</div>
				</div>
			);
		}
	});
});