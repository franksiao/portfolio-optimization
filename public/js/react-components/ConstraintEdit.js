define([
	'react',
	'JSXTransformer'
], function(
	React
) {
// tutorial1.js
	var ConstraintEdit = React.createClass({
	  render: function() {
	    return (
	      <div className="commentBox">
	        Hello, world! I am a CommentBox.
	      </div>
	    );
	  }
	});
	function render(id) {
		React.render(
		<ConstraintEdit />,
		document.getElementById(id)
		);
	}
	// return ConstraintEdit;
	return {
		render: render
	};

});
