var multer = require('multer');
exports.setup = function(router) {
	router.use(multer({
		dest: './uploads/',
		rename: function (fieldname, filename) {
			return Date.now();
		},
		onFileUploadComplete: function(file, req, res) {
			console.log(file.fieldname + ' uploaded to  ' + file.path);
		}
	}));

	router.post('/upload-object', function(req, res) {
		var connection = req.connection;
		var file = req.files.contract_file;
		var resource_id = file.name.substr(0, file.name.lastIndexOf('.')) || file.name;
		res.send({
			status: 'success',
			data: {
				file_name: file.originalname,
				resource_id: resource_id
			}
		});
	});
}