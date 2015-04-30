define([
	'jquery',
	'underscore',
	'text!templates/portfolio.tmpl'
], function(
	$,
	_,
	PortfolioTemplate
) {
	var _applyPortfolioTemplate = _.template(PortfolioTemplate);
	
	function PortfolioView(params) {
		params = params || {};
		var _name = params.name || '(Set Portfolio Name)';
		var _contracts = params.contracts || {};
		var _constraints = params.constraints || {};
		var _onNewContractClicked = params.onNewContractClicked || function() {};
		var _onDeleteContractClicked = params.onDeleteContractClicked || function() {};


		var _$root = $(_applyPortfolioTemplate({
			name: _name
		}));
		var _$name = _$root.find('#portfolio-name');
		var _$editName = _$root.find('#portfolio-name-edit');
		var _$associatedContracts = _$root.find('#associated-contracts');
		var _$newContract = _$root.find('#new-contract');
		var _$editContract = _$root.find('#edit-contract');
		var _$deleteContract = _$root.find('#delete-contract');
		
		var _$associatedConstraints = _$root.find('#associated-constraints');
		var _$newConstraint = _$root.find('#new-constraint');
		var _$editConstraint = _$root.find('#edit-constraint');
		var _$deleteConstraint = _$root.find('#delete-constraint');


		function _init() {
			_$name.editable({
				type: 'text',
				pk: 1,
				name: 'portfolio-name',
				toggle: 'manual',
				placement: 'bottom'
			});
			if (_contracts) {
				_setContracts(_contracts);
			}
			if (_constraints) {
				_setConstraints(_constraints);
			}
			_bind();
		}

		function _bind() {
			_$editName.click(function(e) {
				e.stopPropagation();
				_$name.editable('toggle');
			});
			_$newContract.on('click', function() {
				_onNewContractClicked();
			});
			_$deleteContract.on('click', function() {
				//parse out the contracts we want to delete
				var contractsToDelete = [];
				_$associatedContracts.val().forEach(function(cId) {
					contractsToDelete.push({
						id: cId,
						name: _contracts[cId].name
					})
				});
				_onDeleteContractClicked(contractsToDelete);
			});

			_$associatedContracts.on('change', function(event) {
				var selected = _$associatedContracts.val();
				if (selected && selected.length) {
					_$editContract.enable();
					_$deleteContract.enable();
				} else {
					_$editContract.enable(false);
					_$deleteContract.enable(false);
				}
			});
			_$associatedConstraints.on('change', function(event) {
				var selected = _$associatedConstraints.val();
				if (selected && selected.length) {
					_$editConstraint.enable();
					_$deleteConstraint.enable();
				} else {
					_$editConstraint.enable(false);
					_$deleteConstraint.enable(false);
				}
			});
			_$root.find('#run-r').on('click', function(e) {
				console.log('run');
				/*
				$.post('//ec2-52-0-86-122.compute-1.amazonaws.com/ocpu/library/opt/opt_test.R', function(data) {
					console.log('post return');
				}).done(function() {
					console.log('done');
				});*/
			});
		}

		function _setContracts(contracts) {
			var contractHtml = '';
			_.each(contracts, function(contract, id) {
				contractHtml += 
					'<option value="' + id + '">' +
					contract.name + '</option>';
			});
			_$associatedContracts.html(contractHtml);
		}

		function _setConstraints(constraintSets) {
			var constraintHtml = '';
			_.each(constraintSets, function(set, id) {
				constraintHtml += 
					'<option value="' + id + '">' +
					set.name + '</option>';
			});
			_$root.find('#associated-constraints').html(constraintHtml);
		}

		this.get$Root = function() {
			return _$root;
		}

		this.setOnNewContractClickedHandler = function(handler) {
			_onNewContractClicked = handler;
		}
		this.setContracts = function(contracts) {
			_contracts = contracts;
			_setContracts(contracts);
		}
		this.setConstraints = function(constraints) {
			_constraints = constraints;
			_setConstraints(constraints);
		}
		this.setPortfolioName = function(name) {
			_name = name;
			_$name.html(name);
		}

		_init();
	}

	return PortfolioView;
});