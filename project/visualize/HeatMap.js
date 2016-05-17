function drawHeatMap(data){

	// data never changed.
	// dataset keep getting changed
	console.log("-------------HEAT MAP----------------------")

	var translate = function(x, y) { return "translate(" + x + "," + y + ")"; };

	data=data.filter(function(d){
		// console.log("d",d.fee);
		return !isNaN(d.fee.cost);
	})

	data=data.filter(function(d){
		// console.log("d",d)
		return !isNaN(d.fee.tuition_in);
	})

	data=data.filter(function(d){
		// console.log("d",d)
		return !isNaN(d.fee.tuition_out);
	})

	var config = {};
	config.svg = {width: 500, height: 800};
	config.margin = { top: 30, right: 80, bottom: 30, left: 270};

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

	var colorScale = d3.scale.quantile()
	.range(colorbrewer.YlGnBu[5]);


	// console.log("data", data);

	var dataset= [];
	// console.log("data",data)

	var c= d3.nest()
	.key(function(d){
		// console.log(d);
		return d.state
	})
	.rollup(function(d){
		var out={}
		out.tuition_in= d3.mean(d,function(e){return e.fee.tuition_in})
		out.tuition_out= d3.mean(d,function(e){return e.fee.tuition_out})
		out.cost= d3.mean(d,function(e){return e.fee.cost})
		// console.log("out",out);
		return out;
	})
	.map(data,d3.map)

	// console.log("c",c)
	// console.log("c entries", c.entries())

	dataset=c;
	// data=c;

	xScale.domain(["tuition_in","tuition_out","cost"])
	var statesDomain= c.keys();
	yScale.domain(statesDomain);

	function minMaxAvg(b){
		var curStateMax;
		var curStateMin;

		var curMin= 10000000000000000;
		var curMax= 0;
		var avg=0;

		var keyList =  b.keys();
		// console.log("keyList", keyList)

		var xList = ["tuition_in","tuition_out","cost"];

		for(var i=0;  i< keyList.length; i++){
			var  curKey = b.get(keyList[i]);
			// console.log(curKey);

			for(var j=0; j<3; j++){
				// console.log("!!",xList[j])
				var curFee= curKey[xList[j]];

				avg = avg+ +curFee;
				// console.log("-------", curFee);

				if(curMax< curFee){
					curMax= curFee;
				}
				if(curMin>curFee){
					curMin= curFee;
				}
			}

		}
		// console.log("avg",avg)
		avg= avg/(+keyList.length)/(+xList.length);

		return  {min: curMin,max: curMax, avg: avg}
	}

	var myminMaxAvg= minMaxAvg(c);
	// console.log("minmax", myminMaxAvg)

	var min= myminMaxAvg.min
	var max= myminMaxAvg.max
	var avg= myminMaxAvg.avg

	// console.log("min",min)

	colorScale.domain([min,avg, max])



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

	var drawHeatmap = function(mydata) {
	  // create a group per row
	  // console.log("")
	  var rows = plot.append("g")
	  .attr("id", "heatmap")
	  .attr("class", "cell")
	  .selectAll("g")
	  .data(mydata.entries())


	  
	  rows.enter()
	  .append("g")
	  .attr("id", function(d) {
	  	// console.log("d",d)
	  	return d.key; })
	  .attr("transform", function(d) { 
	  	return translate(0, yScale(d.key)); 
	  });


	  var cells = rows.selectAll("rect")
	  .data(function(d) {
	  	// console.log(d)
	  	var arr=[];
	  	arr.push({key: "cost", value: d.value.cost})
	  	arr.push({key: "tuition_in",value: d.value.tuition_in})
	  	arr.push({key: "tuition_out",value: d.value.tuition_out})
	  	// console.log("arr",arr);

	  	return arr;
	  })

	  // console.log(cells.enter());

	  cells.enter()
	  .append("rect")
	  .attr("id", function(d){return d.key})
	  .attr("x", function(d) {
	  	// console.log("d",d);
	  	return xScale(d.key);
	  })
	  .attr("y", 0)
	  .attr("width", xScale.rangeBand())
	  .attr("height", yScale.rangeBand())
	  .style("fill", function(d) { 
	  	// console.log("d------", d.value);

	  	return colorScale(d.value) })
	  .style("fill-opacity", 0)
	  .transition().duration(600)
	  .style("fill-opacity", 1);

	  cells.on("mouseover",function(e){
	  	// console.log("e",e)
	  	var me= d3.select(this);
	  	var parent = d3.select(this.parentNode);
	  	var parentdata= parent.data()[0].key;
	  	// console.log("parentdata", )
	  	// console.log("me",me,"parent", parent);
	  	tooltip.text(parentdata+" -> "+e.key+": $"+ (e.value/1000).toFixed(2) +"K");
	  	tooltip.style({
	  		"visibility": "visible"
	  	})
	  })
	  .on("mousemove",function(d){
	  	var coords= d3.mouse(svg.node());
	  	tooltip.attr({"x": coords[0], "y": coords[1]});
	  })
	}

	// console.log("colorScale domain", colorScale.domain())

	drawBackground();
	drawAxes();
	drawHeatmap(dataset);

	var tooltip = svg.append("text").attr("id", "tooltip");
	tooltip.attr({
		"x": 1130,
		"y": 100,
		"text-anchor": "start",
		"dx": -5,
		"dy": -5
	})
	.style({
		"visibility": "hidden"
	})
	.text("N/A");

	// drawTitle();
	// drawLegend();

	d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").selectAll(".tick text").on("click", HeatMapOnClick);
	
	function HeatMapOnClick(targetState){
		console.log("clicked",targetState)

		var me=d3.select(this);
		// console.log("--------", me.attr("class"));

		// console.log("me", me)
		if(me.attr("class")===null||me.attr("class")===""){

			console.log("************* HeatMap zoom into schools")
			var newdataset= data.filter(function(d){
				// console.log(d.state, d.state===targetState);
				return d.state===targetState;
			})
			console.log("newdataset", newdataset);

			if(newdataset.length>=62){

				newdataset=newdataset.filter(function(a){
					return newdataset.indexOf(a)<=62;
				})
			}

			var e= d3.nest()
			.key(function(d){
				return d.school
			})
			.rollup(function(d){
				var out={}
				out.tuition_in= d3.mean(d,function(e){return e.fee.tuition_in})
				out.tuition_out= d3.mean(d,function(e){return e.fee.tuition_out})
				out.cost= d3.mean(d,function(e){return e.fee.cost})
				out.school = d.school;
				return out;
			})
			.map(newdataset,d3.map)

			console.log("e",e)

			var newydomain=[];

			newdataset.forEach(function(q){
				// console.log("-----",q);
				newydomain.push(q.school);
			})

			var newdataset = e;
			
			yScale.domain(newydomain);
			// console.log("y domain", yScale.domain());

			d3.selectAll("g#heatmap").remove();
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").remove();
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#x-axis").remove();

			drawAxes();
			drawHeatmap(newdataset);
			
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").selectAll(".tick text").classed({"selected": true});
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").selectAll(".tick text").on("click", HeatMapOnClick);

		}else{
			console.log("HeatMap zoom back to states");

			d3.selectAll("g#heatmap").remove();
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").remove();
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#x-axis").remove();
			console.log("olddataset", dataset);

			yScale.domain(statesDomain);

			drawAxes();
			drawHeatmap(dataset);

			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").selectAll(".tick text").classed({"selected": false});
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").selectAll(".tick text").on("click", HeatMapOnClick);
		}
	}

	function zoominHeatMap(targetState, zoomin){
		if(zoomin){
			var newdataset= data.filter(function(d){
				return d.state===targetState;
			})
			console.log("newdataset", newdataset);

			if(newdataset.length>=62){

				newdataset=newdataset.filter(function(a){
					return newdataset.indexOf(a)<=62;
				})
			}

			var e= d3.nest()
			.key(function(d){
				return d.school
			})
			.rollup(function(d){
				var out={}
				out.tuition_in= d3.mean(d,function(e){return e.fee.tuition_in})
				out.tuition_out= d3.mean(d,function(e){return e.fee.tuition_out})
				out.cost= d3.mean(d,function(e){return e.fee.cost})
				out.school = d.school;
				return out;
			})
			.map(newdataset,d3.map)

			console.log("e",e)

			var newydomain=[];

			newdataset.forEach(function(q){
				newydomain.push(q.school);
			})

			var newdataset = e;

			yScale.domain(newydomain);

			d3.selectAll("g#heatmap").remove();
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").remove();
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#x-axis").remove();

			drawAxes();
			drawHeatmap(newdataset);

			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").selectAll(".tick text").classed({"selected": true});
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").selectAll(".tick text").on("click", HeatMapOnClick);

		}else{
			console.log("HeatMap zoom back to states");

			d3.selectAll("g#heatmap").remove();
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").remove();
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#x-axis").remove();
			console.log("olddataset", dataset);

			yScale.domain(statesDomain);

			drawAxes();
			drawHeatmap(dataset);

			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").selectAll(".tick text").classed({"selected": false});
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").selectAll(".tick text").on("click", HeatMapOnClick);
		}
	}
	return zoominHeatMap;

}