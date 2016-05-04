function drawHeatMap(data){
	var translate = function(x, y) { return "translate(" + x + "," + y + ")"; };

	data=data.filter(function(d){
		// console.log("d",d)
		return !isNaN(d.cost);
	})

	data=data.filter(function(d){
		// console.log("d",d)
		return !isNaN(d.tuition_in);
	})

	data=data.filter(function(d){
		// console.log("d",d)
		return !isNaN(d.tuition_out);
	})

	var config = {};
	config.svg = {width: 960, height: 800};
	config.margin = { top: 50, right: 10, bottom: 20, left: 40};

	config.plot = {
		width: config.svg.width - config.margin.right - config.margin.left,
		height: config.svg.height - config.margin.top - config.margin.bottom
	};

	config.legend = {
		width: 100,
		height: 15
	};

	// create svg based on config
	var svg = d3.select("body").selectAll("svg#heatmap")
	.attr("width", config.svg.width)
	.attr("height", config.svg.height);

	// create plot area based on config
	var plot = svg.append("g")
	.attr("id", "plot")
	.attr("transform", translate(config.margin.left, config.margin.top));

	var xScale = d3.scale.ordinal()
	.rangeBands([0, config.plot.width], 0, 0);

	var yScale = d3.scale.ordinal()
	.rangeBands([config.plot.height, 0], 0, 0);

	var colorScale = d3.scale.linear()
	.range(colorbrewer.YlGnBu[3]);

	var dataset= [];

	var c= d3.nest()
	.key(function(d){
		// console.log(d);
		return d.state})
	.rollup(function(d){
		// console.log("d",d, d.length);
		var mycost=0;
		var myti= 0;
		var myto=0

		d.forEach(function(e){
			// console.log("e",e)
			mycost+= +e.cost;
			myti+= +e.tuition_in;
			myto+= +e.tuition_out;
		})
		mycost= mycost/d.length;
		myti=myti/d.length;
		myto=myto/d.length;
		return {"cost": mycost, "tuition_in": myti, "tuition_out": myto};

	})
	.map(data,d3.map);

	console.log("c",c)

	dataset=c;
	data=c;

	xScale.domain(["tuition_in","tuition_out","cost"])
	yScale.domain(c.keys())


	var drawBackground = function() {
		plot.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", config.plot.width)
		.attr("height", config.plot.height)
		.style("fill", "white");
	};

	var drawAxes = function() {
		var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.tickPadding(0);

		var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left")
		.tickPadding(0);

		plot.append("g")
		.attr("id", "x-axis")
		.attr("class", "axis")
		.attr("transform", translate(0, config.plot.height))
		.call(xAxis);

		plot.append("g")
		.attr("id", "y-axis")
		.attr("class", "axis")
		.call(yAxis);
	};

	var drawHeatmap = function() {
	  // create a group per row

	  var rows = plot.append("g")
	  .attr("id", "heatmap")
	  .attr("class", "cell")
	  .selectAll("g")
	  .data(dataset.entries())
	  .enter()
	  .append("g")
	  .attr("id", function(d) { return d.key; })
	  .attr("transform", function(d) { return translate(0, yScale(d.key)); });

	  // create rect per column
	  var cells = rows.selectAll("rect")
	  .data(function(d) { 
	  	d=d.value
	  	// console.log("d",d);
	  	var entry= {}
	  	entry.cost= d.cost;
	  	entry.tuition_in=d.tuition_in;
	  	entry.tuition_out=d.tuition_out;
	  	// entry.push({"cost": 0})
	  	// console.log("entry", entry);
	  	return entry; 
	  })
	  .enter()
	  .append("rect")
	  .attr("x", function(d) { 
	  	console.log("-------")
	  	return xScale(d.key); })
	  .attr("y", 0)
	  .attr("width", xScale.rangeBand())
	  .attr("height", yScale.rangeBand())
	  .style("fill", function(d) { return colorScale(d.value); });
	};

	drawBackground();
	drawAxes();
	drawHeatmap();
	// drawTitle();
	// drawLegend();


}