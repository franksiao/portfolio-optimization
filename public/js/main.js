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
		onDeleteContractClicked: deleteContractHandler
	});
	var _newContractView = new NewContractView({
		onUploadStarted: newContractUploadStartedHandler,
		onUploadFinished: newContractUploadFinishedHandler
	});
	var _sideBar;

	var _$currentModalContent;

	RSVP.on('error', function(reason) {
		console.assert(false, reason);
	});
	PortfolioModel.getAllPortfolios().then(function(portfolios) {
		var formattedData = [];
		portfolios.data.forEach(function(port) {
			formattedData.push({
				id: port.portID,
				name: port.portName
			});
		});
		_sideBar = new SideBar({
			items: formattedData,
			onItemSelected: function() {
				console.log('something was selected');
			}
		});
		var selectedPortfolioId = _sideBar.getSelected('id');
		_portfolioView.setPortfolioName(_sideBar.getSelected('name'));
		ContractModel.getContracts(selectedPortfolioId).then(function(contracts) {
			_portfolioView.setContracts(contracts);
			console.log(contracts);
			ConstraintModel.getConstraints(selectedPortfolioId).then(function(constraints) {
				console.log(constraints);
				_portfolioView.setConstraints(constraints);
				$('#page-content-wrapper').append(_portfolioView.get$Root());
				$('.loading').hide();
			});
		});
		$('#sidebar-wrapper').append(_sideBar.get$Root());
	});
	$('#page-modal').on('hidden.bs.modal', function(event) {
		_$currentModalContent.detach();
	});

	//binding
	function newContractHandler() {
		_newContractView.setPortfolioId(_sideBar.getSelected('id'));
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

	function newContractUploadStartedHandler() {
		$('.loading').show();
	}

	function newContractUploadFinishedHandler() {
		var selectedPortfolioId = _sideBar.getSelected('id');
		ContractModel.getContracts(selectedPortfolioId).then(function(contracts) {
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