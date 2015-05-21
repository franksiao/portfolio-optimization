define([
	'jsx!react-components/ContractConstraintAdder',
	'jsx!react-components/GeographyConstraintAdder',
	'jsx!react-components/ContractConstraintGroups',
	'jsx!react-components/GeographyConstraintGroups',
	'jsx!react-components/CheckBoxOption',
	'react',
	'JSXTransformer'
], function(
	ContractConstraintAdder,
	GeographyConstraintAdder,
	ContractConstraintGroups,
	GeographyConstraintGroups,
	CheckBoxOption,
	React
) {
	function findMatchingGroup(constraint, groups) {
		for (var i = 0; i < groups.length; ++i) {
			if (groups[i].max_investment === constraint.max_investment &&
				groups[i].min_investment === constraint.min_investment) {
				return i;
			}
		}
		return -1;
	}

	function ReactConstraintEdit(params) {
		var _container_id = params.container_id;

		var ConstraintEdit = React.createClass({
			getInitialState: function() {
				var data = this.props.data;
				var contract_mapping = {};
				var geo_mapping = {};
				var contract_groups = [];
				var geography_groups = [];

				data.contract.forEach(function(contract) {
					contract_mapping[contract.id] = {
						name: contract.name,
						used: false
					};
				});
				data.constraint.contract_constraint.forEach(function(constraint) {
					if (contract_mapping[constraint.contract_id]) {
						contract_mapping[constraint.contract_id].used = true;
					}
				});
				data.geography.forEach(function(geo) {
					geo_mapping[geo] = {
						used: false
					}
				});
				data.constraint.geography_constraint.forEach(function(geo) {
					if (geo_mapping[geo.geography]) {
						geo_mapping[geo.geography].used = true;
					}
				});


				data.constraint.contract_constraint.forEach(function(constraint) {
					var matchingIndex = findMatchingGroup(constraint, contract_groups);
					if (matchingIndex === -1) {
						contract_groups.push({
							contract_ids: [constraint.contract_id],
							contract_names: [contract_mapping[constraint.contract_id].name],
							max_investment: constraint.max_investment,
							min_investment: constraint.min_investment
						});
					} else {
						contract_groups[matchingIndex].contract_ids.push(constraint.contract_id);
						contract_groups[matchingIndex].contract_names.push(contract_mapping[constraint.contract_id].name);
					}
				});

				data.constraint.geography_constraint.forEach(function(constraint) {
					var matchingIndex = findMatchingGroup(constraint, geography_groups);
					if (matchingIndex === -1) {
						geography_groups.push({
							geos: [constraint.geography],
							max_investment: constraint.max_investment,
							min_investment: constraint.min_investment
						});
					} else {
						geography_groups[matchingIndex].geos.push(constraint.geography);
					}
				});
				return {
					contract_mapping: contract_mapping,
					geo_mapping: geo_mapping,
					contract_groups: contract_groups,
					geography_groups: geography_groups
				};
			},
			getUnusedGeographies: function() {
				var geo_mapping = this.state.geo_mapping;
				return this.props.data.geography.filter(function(geo) {
					return (geo_mapping.hasOwnProperty(geo) && 
						geo_mapping[geo].used === false);
				});
			},
			getUnusedContracts: function() {
				var contract_mapping = this.state.contract_mapping;
				return this.props.data.contract.filter(function(contract) {
					return (contract_mapping.hasOwnProperty(contract.id) && 
						contract_mapping[contract.id].used === false);
				});
			},
			handleRemovedContractConstraints: function(groupIndex) {
				console.log(removedContracts);
				var contract_mapping = this.state.contract_mapping;
				var contract_groups = this.state.contract_groups;
				var removedContracts = contract_groups[groupIndex].contract_ids;
				
				removedContracts.forEach(function(contract_id) {
					contract_mapping[contract_id].used = false;
				});

				contract_groups.splice(groupIndex, 1);
				this.setState({
					contract_groups: contract_groups,
					contract_mapping: contract_mapping
				});
			},
			handleRemovedGeoConstraints: function(groupIndex) {
				var geo_mapping = this.state.geo_mapping;
				var geography_groups = this.state.geography_groups;
				var removedContracts = geography_groups[groupIndex].geos;
				
				removedContracts.forEach(function(geo_id) {
					geo_mapping[geo_id].used = false;
				});

				geography_groups.splice(groupIndex, 1);
				this.setState({
					geography_groups: geography_groups,
					geo_mapping: geo_mapping
				});
			},
			onNewContractGroupAdded: function(contractGroupIds) {
				console.log(contractGroupIds);
				var contract_mapping = this.state.contract_mapping;
				var contract_groups = this.state.contract_groups;
				contractGroupIds.forEach(function(id) {
					contract_mapping[id].used = true;
				});
				var contract_names = contractGroupIds.map(function(id) {
					return contract_mapping[id].name;
				});
				contract_groups.push({
					contract_ids: contractGroupIds,
					contract_names: contract_names,
					max_investment: null,
					min_investment: null
				});
				this.setState({
					contract_mapping: contract_mapping,
					contract_groups: contract_groups
				});
			},
			onNewGeographyGroupAdded: function(geoGroupNames) {
				console.log(geoGroupNames);
				var geo_mapping = this.state.geo_mapping;
				var geography_groups = this.state.geography_groups;
				geoGroupNames.forEach(function(name) {
					geo_mapping[name].used = true;
				});
				// var contract_names = geoGroupNames.map(function(id) {
				// 	return geo_mapping[id].name;
				// });
				geography_groups.push({
					geos: geoGroupNames,
					max_investment: null,
					min_investment: null
				});
				this.setState({
					geo_mapping: geo_mapping,
					geography_groups: geography_groups
				});
			},
			render: function() {
				var data = this.props.data;

				return (
					<div className="modal-content constraint-edit">
						<div className="modal-body">
							<ContractConstraintAdder
								contracts={this.getUnusedContracts()}
								onChange={this.onNewContractGroupAdded}
							/>
							<GeographyConstraintAdder 
								geographies={this.getUnusedGeographies()}
								onChange={this.onNewGeographyGroupAdded}
							/>
							<ContractConstraintGroups contract_mapping={this.state.contract_mapping}
								contract_groups={this.state.contract_groups}
								onChange={this.handleRemovedContractConstraints}/>
							<GeographyConstraintGroups geography_groups={this.state.geography_groups}
								onChange={this.handleRemovedGeoConstraints} />
							<label className="control-label">Set constraints for Portfolio:
								<span className="group-names"> {data.portfolio.name}</span>
							</label>
							<CheckBoxOption
								ref={'target_return_checkbox'}
								value={data.constraint.target_return}
								label={'Target Return'}
							/>
							<CheckBoxOption
								ref={'target_tvar_threshold_checkbox'}
								value={data.constraint.target_tvar_threshold}
								label={'Target tVar Threshold'}
							/>
							<CheckBoxOption
								ref={'total_size_checkbox'}
								value={data.constraint.total_size}
								label={'Total Size'}
							/>
							<div className="modal-footer">
								<button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
								<button onClick={this.saveChanges} type="button" className="btn btn-primary">Save Constraint</button>
							</div>
						</div>
					</div>
				);
			}
		});

		function update(data) {
			React.render(<ConstraintEdit data={data} />, document.getElementById(_container_id));
		}
		this.setData = update;
	}
	return ReactConstraintEdit;
});
