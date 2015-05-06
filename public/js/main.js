define([
	"jquery",
	'underscore',
	"models/Portfolio",
	"models/Contract",
	"models/Constraint",
	'views/Portfolio',
	'views/NewContract',
	'views/SideBar',
	'rsvp',
	'bootstrap-dialog', //TODO: lame since its a global
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
	PortfolioView,
	NewContractView,
	SideBar,
	RSVP,
	BootstrapDialog
) {

	var _portfolioView = new PortfolioView({
		onNewContractClicked: newContractHandler,
		onDeleteContractClicked: deleteContractHandler,
		onChangePortfolioName: changePortfolioName,
		onDeletePortfolio: deletePortfolio
	});
	var _newContractView = new NewContractView({
		onUploadStarted: newContractUploadStartedHandler,
		onUploadFinished: newContractUploadFinishedHandler
	});

	var _currentPortfolioId = null;
	var _portfolioMapping = {};
	var _$currentModalContent;

	var _$portfolioSelectContainer = $('#portfolio-select-container');
	var _$portfolioSelect;

	RSVP.on('error', function(reason) {
		console.assert(false, reason);
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
				portfolios.data.forEach(function(port) {
					_portfolioMapping[port.portID] = port.portName;
					_$portfolioSelect.append($('<option value="' + port.portID + '">' + port.portName + '</option>'));
				});
				_$portfolioSelect.selectpicker();

				if (portfolios.data.length && !_currentPortfolioId) {
					//pick first one as default
					_currentPortfolioId = portfolios.data[0].portID;
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
						PortfolioModel.createNewPortfolio(name).then(function(portfolioId) {
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
		_portfolioView.setPortfolioName(_portfolioMapping[_currentPortfolioId]);
		ContractModel.getContracts(_currentPortfolioId).then(function(contracts) {
			_portfolioView.setContracts(contracts);
			console.log(contracts);
			ConstraintModel.getConstraints(_currentPortfolioId).then(function(constraints) {
				console.log(constraints);
				_portfolioView.setConstraints(constraints);
				$('#page-content-wrapper').append(_portfolioView.get$Root());
				$('.loading').hide();
			});
		});
	}

	//binding
	function newContractHandler() {
		_newContractView.setPortfolioId(_currentPortfolioId);
		_newContractView.resetData();
		_$currentModalContent = _newContractView.get$Root();
		$('#page-modal .modal-dialog').html(_$currentModalContent);
		$('#page-modal').modal({
			keyboard: false
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
					ContractModel.deleteContracts(contractIds);
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
			PortfolioModel.changePortfolioName(_currentPortfolioId, name).then(function(result) {
				console.log('update name to', result.name);
				_loadPortfolioSelect().then(resolve, reject)
			}, function() {
				reject();
			});
		}));
	}

	function newContractUploadStartedHandler() {
		$('.loading').show();
	}

	function newContractUploadFinishedHandler() {
		ContractModel.getContracts(_currentPortfolioId).then(function(contracts) {
			_portfolioView.setContracts(contracts);
			$('#page-modal').modal('hide');
			$('.loading').hide();
		});
	}
/*

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
	*/
});