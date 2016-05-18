function drawHeatMap(data){

	var translate = function(x, y) { return "translate(" + x + "," + y + ")"; };

	data=data.filter(function(d){
		return !isNaN(d.fee.cost);
	})

	data=data.filter(function(d){
		return !isNaN(d.fee.tuition_in);
	})

	data=data.filter(function(d){
		return !isNaN(d.fee.tuition_out);
	})

	var config = {};
	config.svg = {width: 500, height: 800};
	config.margin = { top: 30, right: 120, bottom: 30, left: 260};

	config.plot = {
		width: config.svg.width - config.margin.right - config.margin.left,
		height: config.svg.height - config.margin.top - config.margin.bottom
	};

	config.legend = {
		width: 100,
		height: 15
	};

	var svg = d3.select("body").selectAll("svg#heatmap")
	.attr("width", config.svg.width)
	.attr("height", config.svg.height);

	var plot = svg.append("g")
	.attr("id", "plot")
	.attr("transform", translate(config.margin.left, config.margin.top));

	var xScale = d3.scale.ordinal()
	.rangeBands([0, config.plot.width], 0, 0);

	var yScale = d3.scale.ordinal()
	.rangeBands([config.plot.height, 0], 0, 0);

	var colorScale = d3.scale.quantile()
	.range(colorbrewer.YlGnBu[5]);

	var dataset= [];

	var c= d3.nest()
	.key(function(d){
		return d.state
	})
	.rollup(function(d){
		var out={}
		out.tuition_in= d3.mean(d,function(e){return e.fee.tuition_in})
		out.tuition_out= d3.mean(d,function(e){return e.fee.tuition_out})
		out.cost= d3.mean(d,function(e){return e.fee.cost})
		return out;
	})
	.map(data,d3.map)

	dataset=c;

	xScale.domain(["tuition_in","tuition_out","cost"])
	var statesDomain= c.keys();
	yScale.domain(statesDomain.reverse());

	function minMaxAvg(b){
		var curStateMax;
		var curStateMin;

		var curMin= 10000000000000000;
		var curMax= 0;
		var avg=0;

		var keyList =  b.keys();

		var xList = ["tuition_in","tuition_out","cost"];

		for(var i=0;  i< keyList.length; i++){
			var  curKey = b.get(keyList[i]);
			for(var j=0; j<3; j++){
				var curFee= curKey[xList[j]];

				avg = avg+ +curFee;

				if(curMax< curFee){
					curMax= curFee;
				}
				if(curMin>curFee){
					curMin= curFee;
				}
			}

		}
		avg= avg/(+keyList.length)/(+xList.length);

		return  {min: curMin,max: curMax, avg: avg}
	}

	var myminMaxAvg= minMaxAvg(c);

	var min= myminMaxAvg.min
	var max= myminMaxAvg.max
	var avg= myminMaxAvg.avg

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
		var rows = plot.append("g")
		.attr("id", "heatmap")
		.attr("class", "cell")
		.selectAll("g")
		.data(mydata.entries())

		rows.enter()
		.append("g")
		.attr("id", function(d) {
			return d.key; })
		.attr("transform", function(d) { 
			return translate(0, yScale(d.key)); 
		});


		var cells = rows.selectAll("rect")
		.data(function(d) {
			var arr=[];
			arr.push({key: "cost", value: d.value.cost})
			arr.push({key: "tuition_in",value: d.value.tuition_in})
			arr.push({key: "tuition_out",value: d.value.tuition_out})
			return arr;
		})

		cells.enter()
		.append("rect")
		.attr("id", function(d){return d.key})
		.attr("x", function(d) {
			return xScale(d.key);
		})
		.attr("y", 0)
		.attr("width", xScale.rangeBand())
		.attr("height", yScale.rangeBand())
		.style("fill", function(d) { 
			return colorScale(d.value) })
		.style("fill-opacity", 0)
		.transition().duration(600)
		.style("fill-opacity", 1);

		cells.on("mouseover",function(e){
			var me= d3.select(this);
			var parent = d3.select(this.parentNode);
			var parentdata= parent.data()[0].key;
			tooltip.text(e.key+": $"+ (e.value/1000).toFixed(2) +"K")

			tooltip.style({
				"visibility": "visible"
			})
		})
		.on("mouseout", function(d){
			tooltip.style({
				"visibility": "hidden"
			})
		})
	}

	drawBackground();
	drawAxes();
	drawHeatmap(dataset);

	var tooltip = svg.append("text").attr("id", "tooltip");
	tooltip.attr({
		"x": 400,
		"y": 100,
		"text-anchor": "start",
		"dx": -5,
		"dy": -5
	})
	.style({
		"visibility": "hidden"
	})
	.text("N/A");

	d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").selectAll(".tick text").on("click", HeatMapOnClick);
	
	function HeatMapOnClick(targetState){

		var me=d3.select(this);

		if(me.attr("class")===null||me.attr("class")===""){

			var newdataset= data.filter(function(d){
				return d.state===targetState;
			})

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

			var newydomain=[];

			newdataset.forEach(function(q){
				newydomain.push(q.school);
			})

			var newdataset = e;
			
			yScale.domain(newydomain.sort().reverse());

			d3.selectAll("g#heatmap").remove();
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").remove();
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#x-axis").remove();

			drawAxes();
			drawHeatmap(newdataset);
			
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").selectAll(".tick text").classed({"selected": true});
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").selectAll(".tick text").on("click", HeatMapOnClick);

		}else{
			d3.selectAll("g#heatmap").remove();
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").remove();
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#x-axis").remove();

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

			var newydomain=[];

			newdataset.forEach(function(q){
				newydomain.push(q.school);
			})

			var newdataset = e;

			yScale.domain(newydomain.reverse());

			d3.selectAll("g#heatmap").remove();
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").remove();
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#x-axis").remove();

			drawAxes();
			drawHeatmap(newdataset);

			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").selectAll(".tick text").classed({"selected": true});
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").selectAll(".tick text").on("click", HeatMapOnClick);

		}else{
			d3.selectAll("g#heatmap").remove();
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").remove();
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#x-axis").remove();

			yScale.domain(statesDomain);

			drawAxes();
			drawHeatmap(dataset);

			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").selectAll(".tick text").classed({"selected": false});
			d3.select("body").selectAll("svg#heatmap").select("g#plot").select("g#y-axis").selectAll(".tick text").on("click", HeatMapOnClick);
		}
	}
	return zoominHeatMap;

}