define([
	'jquery',
	'underscore',
	'text!templates/new_contract.tmpl'
], function(
	$,
	_,
	NewContractTemplate
) {
	function NewContractView(params) {
		params = params || {};
		var _onUploadStart = params.onUploadStart || function() {};
		var _onUploadFinished = params.onUploadFinished || function() {};
		var _portfolioId = params.portfolioId || null;

		var _$root = $(NewContractTemplate);
		var _$contractNameGroup = _$root.find('#contract-name-group');

		_$root.find("#data-file-upload").fileinput({
			allowedFileExtensions: ["csv"],
			showPreview: false,
			elErrorContainer: _$root.find("#file-type-error")
		});

		_$root.find('#new-contract-name').on('blur', function() {
			_$contractNameGroup.removeClass('has-error');
			_$contractNameGroup.find('.contract-error').hide();
		});

		_$root.find('#uploadForm').ajaxForm({
			beforeSerialize: function($form, options) {
				options.data.portfolio_id = _portfolioId;
				return true;
			},
			beforeSubmit: function(formData, jqForm, options) {
				if (formData[0].value) {
					_onUploadStart();
					return true;
				} else {
					_$contractNameGroup.addClass('has-error');
					_$contractNameGroup.find('.contract-error').show();
					return false;
				}
			},
			success: function(responseText, statusText) {
				_onUploadFinished();
				console.log(responseText);
			},
			data: {
				portfolio_id: _portfolioId
			}
		});

		this.get$Root = function() {
			return _$root;
		}
		this.setPortfolioId = function(id) {
			_portfolioId = id;
		}
		this.resetData = function() {
			_$root.find('#data-file-upload').fileinput('reset');
			_$root.find('#new-contract-name').val('');
		}
	}
	return NewContractView;
});