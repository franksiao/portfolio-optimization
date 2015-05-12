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
		var _createNewContract = params.onCreateNewContract || function() {};
		var _portfolioId = params.portfolioId || null;
		var _resource_id = null;

		var _$root = $(NewContractTemplate);
		var _$contractNameGroup = _$root.find('#contract-name-group');
		var _$contractReturnGroup = _$root.find('#contract-return-group');

		_$root.find("#data-file-upload").fileinput({
			allowedFileExtensions: ["csv"],
			showPreview: false,
			elErrorContainer: _$root.find("#file-type-error")
		});

		_$root.find('#new-contract-name').on('blur', function() {
			_$contractNameGroup.removeClass('has-error');
			_$contractNameGroup.find('.contract-error').hide();
		});

		_$root.find('#create-contract').on('click', function() {
			var name = _$root.find('#new-contract-name').val();
			var returnVal = Number(_$root.find('#new-contract-return').val());
			if (!name) {
				_$contractNameGroup.addClass('has-error');
				_$contractNameGroup.find('.contract-error').show();
				return;
			}
			if (!Number.isFinite(returnVal)) {
				_$contractReturnGroup.addClass('has-error');
				_$contractReturnGroup.find('.contract-error').show();
				return;
			}
			if (_resource_id) {
				_createNewContract({
					name: _$root.find('#new-contract-name').val(),
					resource_id: _resource_id,
					'return': returnVal
				});
			}
		});

		_$root.find('#uploadForm').ajaxForm({
			beforeSubmit: function() {
				$('.loading').show();
				return true;
			},
			success: function(response, statusText) {
				_$root.find('#file-upload').hide();
				_$root.find('#upload-success .file-name').text(response.data.file_name);
				_$root.find('#upload-success').show();
				_$root.find('#create-contract').enable();

				_resource_id = response.data.resource_id;
				$('.loading').hide();
				console.log(response);
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
			_$root.find('#file-upload').show();
			_$root.find('#upload-success .file-name').text('');
			_$root.find('#upload-success').hide();
			_$root.find('#data-file-upload').fileinput('reset');
			_$root.find('#new-contract-name').val('');
			_$root.find('#create-contract').enable(false);
			_resource_id = null;
		}
	}
	return NewContractView;
});