function drawMap(){
	var svg = d3.select("body").selectAll("svg#map");
	console.log("svg", svg)
	var g = svg.append("g").attr("id", "plot");
	var map = g.append("g").attr("id", "map");
	var tooltip = g.append("text").attr("id", "tooltip");
	var legend= g.append("g").attr("id","legend")
	
	var active =d3.select(null);

	var x = d3.scale.linear()
	.domain([10, 810])
	.range([0, 300]);

	var choropleth = d3.scale.threshold()
	.domain([10, 50, 100, 220, 350, 480, 630, 810])
	.range(["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"])

	var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom")
	.tickSize(8)
	.tickValues([10, 50, 100, 220, 350, 480, 630, 810]);

	var projection = d3.geo.albersUsa()
	.scale(1000)

	var path = d3.geo.path()
	.projection(projection);

	tooltip.attr({
		"x": 100,
		"y": 100,
		"text-anchor": "start",
		"dx": -5,
		"dy": -5
	})
	.style({
		"visibility": "hidden"
	})
	.text("N/A");

	legend
	.append("g")
	.attr("class","xaxis")
		// .attr("x", 450)

		.attr("transform","translate(450,30)")
		.call(xAxis)

		legend.attr({
			"x": 100,
			"y": 200,
			"text-anchor": "start",
			"dx": -5,
			"dy": -5
		});

		legend
		.selectAll("rect")
		.data(choropleth.range().map(function(d, i) {
				// console.log(d,i)
				return {
					x0: i ? x(choropleth.domain()[i - 1]) : x.range()[0],
					x1: i < choropleth.domain().length ? x(choropleth.domain()[i]) : x.range()[1],
					z: d
				};
			}))
		.enter().append("rect")
		.attr("height", 10)
		.attr("x", function(d) { 
			return d.x0+450;
		})
		.attr("y", function(d){return 30})
		.attr("width", function(d) { 
				// console.log("d",d)
				return Math.abs(d.x1 - d.x0); 
			})
		.style("fill", function(d) { return d.z; });
		
		xAxis.tickValues(choropleth.domain());

		legend
		.append("text")
		.attr("class", "caption")
		.attr("x",650)
		.attr("y", 25)
		.style("font-size", 14)
		.text("College Amount");



		var geoFile = "us.json";
		d3.json(geoFile, function(error, us) {
			if (error) throw error;

			map.selectAll("path")
			.data(us.features, function(d){
				// console.log(d.properties.NAME)
				return d.properties.NAME;
			})
			.enter()
			.append("path")
			.attr("d", path)
			.attr("class", "district")
			.on("click", clicked);

			util.resize(svg, g, 0);


			var fileName="Most+Recent+Cohorts+(All+Data+Elements).csv";
			// var fileName="https://drive.google.com/open?id=0BzkQxd8cuV2abUMtcFBxa3FyUmM";
			d3.csv(fileName, accessor,callback)


		});

		function accessor(row){
			var out={};
			out.state= row.STABBR;
			out.asian=row.UGDS_ASIAN

			return out;
		}
		function callback(error,rows){
			if(error) throw error;

			var data =d3.nest()
			.key(function(d){return d.state})
			.rollup(function(leaves){return leaves.length;})
			.map(rows, d3.map);

			console.log("data",data)


			map.selectAll("path")
			.style("fill", function(d) {
				return choropleth(data.get(d.properties.NAME));
			})
			.on("mouseover", function(d){
				// console.log("d",d);
				var me = d3.select(this);
				me.classed({"active": true});
				
				tooltip.text(d.properties.NAME + ": "+ data.get(d.properties.NAME));
				
				tooltip.style({"visibility": "visible"});
				this.parentNode.appendChild(this);	
			})
			.on("mouseout", function(d) {
				var me = d3.select(this);
				me.classed({"active": false});
				tooltip.style({"visibility": "hidden"});
			});
		}

		function clicked(d){
			var width=780.9141845703125
			var height= 469.3701477050781

			// console.log("clicked",d)
			if (active.node() === this) return reset();
			active.classed("active", false);
			active = d3.select(this).classed("active", true);

			var bounds = path.bounds(d),
			dx = bounds[1][0] - bounds[0][0],
			dy = bounds[1][1] - bounds[0][1],
			x = (bounds[0][0] + bounds[1][0]) / 2,
			y = (bounds[0][1] + bounds[1][1]) / 2,
			scale = .9 / Math.max(dx / width, dy / height)
			translate = [width / 2 - scale * x, height / 2 - scale * y];

			// console.log("bounds",bounds);
			// console.log("dx, dy", dx,dy);
			// console.log("x, y",x,y)
			// console.log("scale",scale)



			g.transition()
			.duration(750)
			.style("stroke-width", 1.5 / scale + "px")
			.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
		}

		function reset(){
			active.classed("active", false);
			active = d3.select(null);

			// g.transition()
			// .duration(750)
			// .style("stroke-width", "1.5px")
			// .attr("transform", "");
			util.resize(svg, g, 0);

			// console.log("reseted")
		}
	}