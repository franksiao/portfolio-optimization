define([
	'react',
	'JSXTransformer'
], function(
	React
) {

	return React.createClass({
		getInitialState: function() {
			return {
				isChecked: (this.props.value !== null),
				value: (this.props.value === null ? '' : this.props.value)
			};
		},
		handleChange: function(event) {
			this.setState({
				isChecked: this.refs.constraint_checkbox.getDOMNode().checked,
				value: this.refs.constraint_value.getDOMNode().value
			});
		},
		render: function() {
			return (
				<form className="form-inline">
					<div className="checkbox col-md-4">
						<label>
							<input type="checkbox"
								checked={this.state.isChecked}
								ref="constraint_checkbox"
								onChange={this.handleChange}
							/>
							{'  '+this.props.label}
						</label>
					</div>
					<input type="text"
						className="form-control"
						value={this.state.value}
						ref="constraint_value"
						onChange={this.handleChange}
					/>
				</form>
			);
		}
	});
});