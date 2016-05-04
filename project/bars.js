
function drawbars(data, zoomdate) {
	var statesList= ["ME", "MA", "MI", "NV", "NJ", "NY", "NC", "OH", "PA", "RI", "TN", "TX", "UT", "WA", "WI", "PR", "MD", "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "MN", "MS", "MO", "NE", "NH", "NM", "ND", "OK", "OR", "SC", "SD", "VT", "VA", "WV", "WY"]
	var races= ["white", "black", "asian"];
	console.log("-----------------------------------")
	// console.log("data", data)


	data=data.filter(function(d){
		// console.log("d",d.cost, isNaN(d.cost))
		return !isNaN(d.races.white);
	})
	data=data.filter(function(d){
		// console.log("d",d)
		return !isNaN(d.races.black);
	})
	data=data.filter(function(d){
		// console.log("d",d)
		return !isNaN(d.races.asian);
	})

	console.log("data",data);

	var margin = {top: 20, right: 20, bottom: 50, left:80},
	width = 780.9141845703125 - margin.left - margin.right,
	height = 800 - margin.top - margin.bottom;

	var x = d3.scale.linear().rangeRound([0,width]);

	var y = d3.scale.ordinal().rangeRoundBands([height,0],.1);

	var color = d3.scale.ordinal()
	.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

	var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom")

	var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left");

	var svg = d3.select("body").selectAll("svg#bars");
	// console.log("svg", svg)

	svg.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var states = d3.nest()
	.key(function(d){
		return d.state;
	})
	.rollup(function(c){
		// console.log("c",c)

		var out ={}
		out.white= d3.mean(c,function(e){return e.races.white})
		out.black= d3.mean(c,function(e){return e.races.black})
		out.asian= d3.mean(c,function(e){return e.races.asian})

		return out;
	})
	.map(data,d3.map);
	console.log("states", states);

	var racebystate= states.entries();
	console.log("racebystate",racebystate)

	color.domain(data.map(function(d){
		// console.log("d",d.races);
		return Object.keys(d.races);
	}))

	racebystate.forEach(function(d){
		var y0=0;
		// console.log("d",d);
		d.whatever= color.domain().map(function(names){

			// var out=[]
			// out.push({a:"a"})
			// console.log("out",out)

			// console.log("name",names[0])

			names= names[0];
			// console.log("names", names)
			// console.log(names, states.get(d.key)[names])

			// console.log("-------", states.get(d.key)["white"]);
			return {race: names, y0:y0, y1:y0+= states.get(d.key)[names]}


		})
	})

	console.log("racebystate", racebystate)

	// console.log("&&&&&&&&",states.get("CA").black)

	y.domain(states.keys());
	x.domain([0,1]);

	svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(35," + height + ")")
	.call(xAxis)
	.append("text")
	.attr("x", width/2)
	.attr("y", 25)
	.text("Amount");

	svg.append("g")
	.attr("class", "y axis")
	.attr("transform", "translate(35," + 0 + ")")
	.call(yAxis)
	.append("text")
	.attr("x", -25)
	.attr("y", 8)
	.text("Year");


	var state= svg.selectAll(".district")
	.data(racebystate)
	.enter().append("g")
	.attr("class", "g")
	.attr("transform", function(d) { return "translate(36, " + y(d.key) + ")"; });

	state.selectAll("rect")
	.data(function(d){
		// console.log("d",d);
		return d.whatever;
	})
	.enter().append("rect")
	.attr("width", function(d){
		return (x(d.y1)- x(d.y0))
	})
	.attr("x", function(d) { 
		return x(d.y0);
	})
	.attr("height", y.rangeBand())
	.style("fill", function(d){
		console.log("d",d)
		return color(d.key)
	})
}
