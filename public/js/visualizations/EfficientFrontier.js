define([
	'jquery',
	'underscore',
	'd3'
], function(
	$,
	_,
	d3
) {
	var data = [
		{
 			contract_id : 1, 
 			TVaR: 1,
 			return: 3
		},
		{
 			contract_id : 2,
 			TVaR: 2,
 			return: 3.75
		},
		{
 			contract_id : 3, 
 			TVaR: 2.9,
 			return: 4
		},
		{
 			contract_id : 4, 
 			TVaR: 3.4,
 			return: 2.6
		},
		{
 			contract_id : 5, 
 			TVaR: 47,
 			return: 5
		},
		{
 			contract_id : 6,
 			TVaR: 55,
 			return: 7.75
		},
		{
 			contract_id : 7, 
 			TVaR: 81,
 			return: 9.8
		},
		{
 			contract_id : 8, 
 			TVaR: 89,
 			return: 8.4
		}
	];
	return function EfficientFrontier(params) {
		var parentSelector = params.parent_selector;

		var margin = {top: 20, right: 20, bottom: 30, left: 40},
		width = 800 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;

		var x = d3.scale.linear()
						.range([0, width]);

		var y = d3.scale.linear()
						.range([height, 0]);

		var color = d3.scale.category10();

		var xAxis = d3.svg.axis()
						.scale(x)
						.orient("bottom");

		var yAxis = d3.svg.axis()
						.scale(y)
						.orient("left");
		
		var svg = d3.select(parentSelector).append("svg")
					.attr("width", width + margin.left + margin.right)
    				.attr("height", height + margin.top + margin.bottom)
  					.append("g")
    				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


		// x.domain(d3.extent(data, function(d) { return d.TVaR; })).nice();
		// y.domain(d3.extent(data, function(d) { return d.return; })).nice();
		x.domain([
			0,
			100
		]);
		y.domain([0,10]);


		svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis)
			.append("text")
				.attr("class", "label")
				.attr("x", width)
				.attr("y", -6)
				.style("text-anchor", "end")
				.text("TVaR (as a % of principal)");

		svg.append("g")
				.attr("class", "y axis")
				.call(yAxis)
			.append("text")
				.attr("class", "label")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text("Expected Annual Return (as a % of principal");

		// svg.selectAll(".dot")
		// 	.data(data)
		// 	.enter().append("circle")
		// 	.attr("class", "dot")
		// 	.attr("r", 3.5)
		// 	.attr("cx", function(d) { 
		// 		return x(d.TVaR); 
		// 	}).attr("cy", function(d) {
		// 		return y(d.return);
		// 	}).style("fill", function(d) { return color('Stand Alone Security'); });
		
		svg.selectAll(".point")
			.data(data)
			.enter().append("path")
			.attr("class", "point")
			.attr("d", d3.svg.symbol().type("triangle-up"))
			.attr("transform", function(d) { return "translate(" + x(d.TVaR) + "," + y(d.return) + ")"; });

		var legend = svg.selectAll(".legend")
			.data(color.domain())
			.enter().append("g")
			.attr("class", "legend")
			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		legend.append("rect")
			.attr("x", width - 18)
			.attr("width", 18)
			.attr("height", 18)
			.style("fill", color);

		legend.append("text")
			.attr("x", width - 24)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(function(d) { return d; });
	};

});