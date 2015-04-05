$(document).ready(function() {

	var $contractNameGroup = $('#contract-name-group');

	$("#data-file-upload").fileinput({
		allowedFileExtensions: ["csv"],
		showPreview: false,
		elErrorContainer: "#file-type-error"
	});
	$.get( "contracts", function(data) {
		console.log(data);
		$('.contract-code').append(JSON.stringify(data, null, 2));
	});

	$.get( "results", function(data) {
		console.log(data);
		$('.result-code').append(JSON.stringify(data, null, 2));
	});

	$('#run-r').on('click', function(e) {
		console.log('run');
		$.post('//ec2-52-0-86-122.compute-1.amazonaws.com/ocpu/library/opt/opt_test.R', function(data) {
			console.log('post return');
		}).done(function() {
			console.log('done');
		});
	});

	$('#clear-all').on('click', function(e) {
		console.log('clear all');
		$.post('clear-all', function() {
			console.log('cleared');
		});
	});

	$('#uploadForm').ajaxForm({
		beforeSubmit: function(formData, jqForm, options) {
			if (formData[0].value) {
				return true;
			} else {
				$contractNameGroup.addClass('has-error');
				$contractNameGroup.find('.contract-error').show();
				return false;
			}
		},
		success: function(responseText, statusText) {
			console.log(responseText);
		}
	});

	$('#new-contract-name').on('blur', function() {
		$contractNameGroup.removeClass('has-error');
		$contractNameGroup.find('.contract-error').hide();
	});

});