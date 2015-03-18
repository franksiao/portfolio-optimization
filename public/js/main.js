console.log('main.js');

$.get( "contracts", function(data) {
	console.log(data);
	$('.contract-code').append(JSON.stringify(data, null, 2));
});

$.get( "results", function(data) {
	console.log(data);
	$('.result-code').append(JSON.stringify(data, null, 2));
});

$('#upload-button').on('click', function(e) {
	console.log('button clicked');
	var file = $('#file-input')[0].files[0];
	var data = new FormData();
	data.append('file1',file);
	console.log(data);

	var reader = new FileReader();
	reader.onload = function(e) {
		var text = reader.result;

		$.ajax({
			url: 'create-object',
			method: 'POST',
			cache: false,
			content: data,
			contentType: false,
    		processData: false,
			// contentType: 'multipart/form-data'
		}).done(function() {
			console.log('done');
		}).fail(function() {
			console.log('fail');
		});
	}
	reader.readAsText(file);
});

$('#run-r').on('click', function(e) {
	console.log('run');
	$.post('//ec2-52-0-86-122.compute-1.amazonaws.com/ocpu/library/opt/opt_test.R', function(data) {
		console.log('post return');
	}).done(function() {
		console.log('done');
	});
});