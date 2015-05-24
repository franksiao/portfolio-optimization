function isNumeric(num) { return /^[-+]?[0-9]+$/.test(num); }
function isInt(num) { return /^(?:[-+]?(?:0|[1-9][0-9]*))$/.test(num); }
function isNumericOrNull(num) {
	if (num && num.length) {
		return isNumeric(num);
	}
	return true;
}
function isValidString(str) {
	if (typeof str === 'string' && str.length > 0) {
		return true;
	}
}
//EXPORTS
exports.isNumericOrNull = isNumericOrNull;
exports.isNumeric = isNumeric;
exports.isInt = isInt;
exports.isValidString = isValidString;
exports.DefaultApiSuccessHandler = function(res) {
	return function success(result) {
		var obj = {
			status: 'success'
		}
		if (result && result.data && Array.isArray(result.data) && result.data.length) {
			obj.data = result.data[0];
		} else {
			obj.data = result;
		}
		res.send(obj);
	}
}
exports.DefaultApiFailureHandler = function(res) {
	return function failure(err) {
		res.status(500).send(err);
	}
}
exports.CustomValidators = {
	isValidId: function(value) {
		if (Array.isArray(value)) {
			value.forEach(function(id) {
				//test if numeric
				if (!isInt(id)) {
					return false;
				}
			});
		} else if (typeof value === 'string') {
			var idArray = value.split(',');
			idArray.forEach(function(id) {
				if (!isInt(id)) {
					return false;
				}
			});
		} else if (!isInt(value)) {
			return false;
		}
		return true;
	},
	isNumericOrNull: isNumericOrNull,
	isCustomValid: function(value, fn) {
		return fn(value);
	},
	isValidType: function(value, types) {
		var isValid = false;
		types.forEach(function(type) {
			if (value === type) {
				isValid = true;
			}
		});
		return isValid;
	},
	isValidString: isValidString
};

exports.formatId = function(id) {
	if (isInt(id)) {
		return [id];
	} else if (typeof id === 'string') {
		return id.split(',');
	} else {
		return id;
	}
}

exports.handleError = function(req,res) {
	var errors = req.validationErrors();
	if (errors) {
		console.log(errors);
		res.status(400).send({
			error: errors[0]
		});
		return true;
	}
	return false;
}

exports.paramsFormatter = function(req, fields) {
	var params = {};
	fields.forEach(function(field) {
		if (req[field] === '') {
			params[field] = null;
		} else if (req[field] !== undefined) {
			params[field] = req[field];
		}
	});
	return params;
}