define([
	"jquery",
	'underscore',
	"models/Portfolio",
	"models/Contract",
	"models/Constraint",
	'models/Geography',
	'views/Portfolio',
	'views/NewContract',
	'rsvp',
	'bootstrap-dialog',
	'react',
	'jsx!react-components/ConstraintEdit',
	'visualizations/EfficientFrontier',
	'JSXTransformer',
	'bootstrap-select',
	"jquery-form",
	"fileinput",
	"bootstrap",
	'x-editable',
], function(
	$,
	_,
	PortfolioModel,
	ContractModel,
	ConstraintModel,
	GeographyModel,
	PortfolioView,
	NewContractView,
	RSVP,
	BootstrapDialog,
	React,
	ConstraintEdit,
	EfficientFrontier
) {

	var _constraintEditView = new ConstraintEdit({
		container_id: 'constraint-edit-container',
		onSaveConstraint: _onSaveConstraintHandler
	});
	var _portfolioView = new PortfolioView({
		onNewContractClicked: newContractHandler,
		onDeleteContractClicked: deleteContractHandler,
		onChangePortfolioName: changePortfolioName,
		onDeletePortfolio: deletePortfolio,
		onNewConstraintClicked: newConstraintHandler,
		onEditConstraintClicked: editConstraintHandler,
		onDeleteConstraintClicked: deleteConstraintHandler
	});

	var _newContractView = new NewContractView({
		onCreateNewContract: createNewContractHandler
	});

	var _currentPortfolioId = null;
	var _portfolioMapping = {};
	var _$currentModalContent;

	var _$portfolioSelectContainer = $('#portfolio-select-container');
	var _$portfolioSelect;

	RSVP.on('error', function(reason) {
		console.assert(false, reason);
		console.log(reason.stack);
	});

	_loadPage();
	_bindEvents();

	function _loadPage() {
		_loadPortfolioSelect().then(_loadPortfolioView);
	}

	function _loadPortfolioSelect() {
		return (new RSVP.Promise(function(resolve, reject) {
			//reset variables
			_portfolioMapping = {};
			_$portfolioSelect = $('<select class="portfolio-select"></select>');
			_$portfolioSelectContainer.empty();
			_$portfolioSelectContainer.append(_$portfolioSelect);
			//get portfolio
			PortfolioModel.getAllPortfolios().then(function(portfolios) {
				portfolios.forEach(function(port) {
					_portfolioMapping[port.id] = port.name;
					_$portfolioSelect.append($('<option value="' + port.id + '">' + port.name + '</option>'));
				});
				_$portfolioSelect.selectpicker();

				if (portfolios.length && !_currentPortfolioId) {
					//pick first one as default
					_currentPortfolioId = portfolios[0].id;
				}
				if (_currentPortfolioId) {
					_$portfolioSelect.selectpicker('val', _currentPortfolioId);
					_$portfolioSelect.selectpicker('refresh');
				}
				$('.portfolio-select').on('change', function() {
					_currentPortfolioId = $('.portfolio-select').val();
					_loadPortfolioView(_currentPortfolioId);
				});
				resolve();
			}, function() {
				reject('Failed to load portfolio.');
			});
		}));
	}
	function _bindEvents() {
		$('#page-modal').on('hidden.bs.modal', function(event) {
			_$currentModalContent.detach();
		});
		$('#create-portfolio').on('click', _setPortfolioName);
	}

	function _setPortfolioName(event) {
		BootstrapDialog.confirm({
			title: 'Portfolio Name',
			message: function(dialog) {
				return $('<input type="text" class="form-control" id="new-portfolio-name" placeholder="New Portfolio Name">');
			},
			btnOKLabel: 'Create',
			callback: function(confirmed) {
				if (confirmed) {
					var name = $('#new-portfolio-name').val();
					if (name && name.length > 0) {
						PortfolioModel.postPortfolio(name).then(function(portfolioId) {
							_currentPortfolioId = portfolioId;
							_loadPage();
							//TODO:reload and set new portfolio
						});
					} else {
						//TODO: validation
					}
				}
			}
		});
	}

	function _loadPortfolioView() {
		if (_currentPortfolioId) {
			_portfolioView.setPortfolioName(_portfolioMapping[_currentPortfolioId]);
			ContractModel.getContractsByPortfolio(_currentPortfolioId).then(function(contracts) {
				_portfolioView.setContracts(contracts);
				console.log(contracts);
				ConstraintModel.getConstraintsByPortfolio(_currentPortfolioId).then(function(constraints) {
					console.log(constraints);
					_portfolioView.setConstraints(constraints);
					$('#main-content').append(_portfolioView.get$Root());
					$('.loading').hide();
				});
			});
		} else {
			$('#main-content').append($('<div>Please create a portfolio.</div>'));
			$('.loading').hide();
		}
	}

	//binding
	function newContractHandler() {
		_newContractView.setPortfolioId(_currentPortfolioId);
		_newContractView.resetData();
		_$currentModalContent = _newContractView.get$Root();
		$('#page-modal .modal-dialog').html(_$currentModalContent);
		$('#page-modal').modal({
			backdrop: false
		});
	}

	function deleteContractHandler(contracts) {
		var contractNames = _.pluck(contracts, 'name');
		var contractIds = _.pluck(contracts, 'id');

		BootstrapDialog.confirm({
			title: 'Are you sure you want to delete the following contract(s)?',
			message: contractNames.join(' ,'),
			btnOKLabel: 'Delete',
			callback: function(confirmed) {
				if (confirmed) {
					ContractModel.deleteContract(_currentPortfolioId, contractIds).then(function() {
						return ContractModel.getContractsByPortfolio(_currentPortfolioId, true);
					}).then(function(contracts) {
						_portfolioView.setContracts(contracts);
						$('.loading').hide();
					});
				}
			}
		});
	}
	function deletePortfolio() {
		BootstrapDialog.confirm({
			title: 'Are you sure you want to delete the following portfolio?',
			message: _portfolioMapping[_currentPortfolioId],
			btnOKLabel: 'Delete',
			callback: function(confirmed) {
				if (confirmed) {
					$('.loading').show();
					PortfolioModel.deletePortfolio(_currentPortfolioId).then(function() {
						_currentPortfolioId = null;
						_loadPage();
					}, function() {
						console.log('error deleting portfolio');
					});
				}
			}
		});
	}

	function changePortfolioName(name) {
		return (new RSVP.Promise(function(resolve, reject) {
			PortfolioModel.putPortfolio({id: _currentPortfolioId, name: name}).then(function(result) {
				console.log('update name to', result.name);
				_loadPortfolioSelect().then(resolve, reject)
			}, function() {
				reject();
			});
		}));
	}

	function createNewContractHandler(contract_data) {
		$('.loading').show();
		$('#page-modal').modal('hide');
		var contract = {
			name: contract_data.name,
			resource_id: contract_data.resource_id,
			type: 'AIR', //hard code for now
			return_value: contract_data.return
		};
		ContractModel.postContract(_currentPortfolioId, contract).then(function() {
			return ContractModel.getContractsByPortfolio(_currentPortfolioId, true);
		}).then(function(contracts) {
			_portfolioView.setContracts(contracts);
			$('.loading').hide();
		});
	}
	function newConstraintHandler() {
		var promises = [
			ConstraintModel.getDefaultConstraintValues(),
			GeographyModel.getGeographiesByPortfolio(_currentPortfolioId),
			ContractModel.getContractsByPortfolio(_currentPortfolioId)
		];
		RSVP.all(promises).then(function(data) {
			console.log(data);
			_constraintEditView.update({
				contract: _.values(data[2]),
				portfolio: {
					name: _portfolioMapping[_currentPortfolioId],
					id: _currentPortfolioId
				},
				geography: data[1],
				constraint: data[0]
			});
			$('#constraint-edit-modal').modal({
				backdrop: false
			});
		});
	}

	function _onSaveConstraintHandler(constraint, id) {
		console.log(constraint);
		$('#constraint-edit-modal').modal('hide');
		if (id) {
			ConstraintModel.putConstraint(_currentPortfolioId, id, constraint).then(_loadPortfolioView);
		} else {
			ConstraintModel.postConstraint(_currentPortfolioId, constraint).then(_loadPortfolioView);
		}
	}
	function editConstraintHandler(constraintToEdit) {
		var promises = [
			ConstraintModel.getConstraintById(_currentPortfolioId, constraintToEdit),
			GeographyModel.getGeographiesByPortfolio(_currentPortfolioId),
			ContractModel.getContractsByPortfolio(_currentPortfolioId)
		];
		RSVP.all(promises).then(function(data) {
			console.log(data);
			_constraintEditView.update({
				contract: _.values(data[2]),
				portfolio: {
					name: _portfolioMapping[_currentPortfolioId],
					id: _currentPortfolioId
				},
				geography: data[1],
				constraint: data[0]
			});
			$('#constraint-edit-modal').modal({
				backdrop: false
			});
		});
	}

	function deleteConstraintHandler(constraints) {
		var constraintNames = _.pluck(constraints, 'name');
		var constraintIds = _.pluck(constraints, 'id');

		BootstrapDialog.confirm({
			title: 'Are you sure you want to delete the following constraint(s)?',
			message: constraintNames.join(' ,'),
			btnOKLabel: 'Delete',
			callback: function(confirmed) {
				if (confirmed) {
					ConstraintModel.deleteConstraint(_currentPortfolioId, constraintIds).then(function() {
						return ConstraintModel.getConstraintsByPortfolio(_currentPortfolioId, true);
					}).then(function(constraints) {
						_portfolioView.setConstraints(constraints);
						$('.loading').hide();
					});
				}
			}
		});
	}
	var graph = new EfficientFrontier({
		parent_selector: '#visual-content'
	});
	// $('#run-r').on('click', function(e) {
	// 	console.log('run');
	// 	$.post('//ec2-52-0-86-122.compute-1.amazonaws.com/ocpu/library/opt/opt_test.R', function(data) {
	// 		console.log('post return');
	// 	}).done(function() {
	// 		console.log('done');
	// 	});
});