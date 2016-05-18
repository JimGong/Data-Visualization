var globaldata;

var svg;
var y;
var color;
var yAxis;
var ydomain_states;

var racebystate_global;

var onClick;

function drawbars (data, zoomdate) {

	var statesList= ["ME", "MA", "MI", "NV", "NJ", "NY", "NC", "OH", "PA", "RI", "TN", "TX", "UT", "WA", "WI", "PR", "MD", "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "MN", "MS", "MO", "NE", "NH", "NM", "ND", "OK", "OR", "SC", "SD", "VT", "VA", "WV", "WY"]
	var races= ["white", "black", "asian","hisp","aian","nhpi","nra","other"];
	var whitetotal=0, blacktotal=0, asiantotal=0, hisptotal=0, aiantotal=0, nhpitotal=0, nratotal=0, othertotal=0
	var sortby = {}	

	data=data.filter(function(d){
		return !isNaN(d.races.white);
	})
	data=data.filter(function(d){
		return !isNaN(d.races.black);
	})
	data=data.filter(function(d){
		return !isNaN(d.races.asian);
	})

	data.forEach(function(d){
		d=d.races;
		d.other= 1- d.asian-d.aian-d.black-d.hisp-d.nhpi-d.nra-d.white;
	})

	data.forEach(function(d){
		d=d.races;
		whitetotal+= d.white
		blacktotal+= d.black
		asiantotal+= d.asian
		hisptotal+= d.hisp
		aiantotal+= d.aian
		nhpitotal+= d.nhpi
		nratotal+= d.nra
		othertotal+= d.othertotal
	})

	sortby.white= whitetotal;
	sortby.black= blacktotal;
	sortby.asian= asiantotal;
	sortby.hisp= hisptotal;
	sortby.aian = aiantotal;
	sortby.nhpi = nhpitotal;
	sortby.other= othertotal;

	races.sort(function(a,b){
		return -sortby[a]+sortby[b];
	});

	globaldata=data;

	var margin = {top: 30, right: 50, bottom: 30, left:100},
	width = 900 - margin.left - margin.right,
	height = 800 - margin.top - margin.bottom;

	var x = d3.scale.linear().rangeRound([0,width]);

	y = d3.scale.ordinal().rangeRoundBands([height,0],.1);

	color = d3.scale.ordinal()
	.range(['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5']);

	var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom")
	.tickFormat(d3.format(".1%"))

	yAxis = d3.svg.axis()
	.scale(y)
	.orient("right");

	svg = d3.select("body").selectAll("svg#bars");
	svg.transition().duration(750);

	var states = d3.nest()
	.key(function(d){
		return d.state;
	})
	.rollup(function(c){
		var out ={}
		out.white= d3.mean(c,function(e){return e.races.white})
		out.black= d3.mean(c,function(e){return e.races.black})
		out.asian= d3.mean(c,function(e){return e.races.asian})
		out.hisp=d3.mean(c,function(e){return e.races.hisp})
		out.aian=d3.mean(c,function(e){return e.races.aian})
		out.nhpi=d3.mean(c,function(e){return e.races.nhpi})
		out.nra=d3.mean(c,function(e){return e.races.nra})
		out.other=d3.mean(c,function(e){return e.races.other})
		return out;
	})
	.map(data,d3.map);

	var racebystate= states.entries();

	color.domain(races);
	globalcolor=color;

	racebystate.forEach(function(d){
		var y0=0;
		d.whatever= color.domain().map(function(names){
			return {race: names, y0:y0, y1:y0+= states.get(d.key)[names]}
		})
	})

	racebystate_global=racebystate;

	ydomain_states=states.keys().reverse();

	y.domain(ydomain_states);
	x.domain([0,1]);

	svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(20," + height + ")")
	.call(xAxis)
	.append("text")
	.attr("x", width/2-45)
	.attr("y", 32)
	.text("Race By Percentage");

	var state= svg.selectAll(".district")
	.data(racebystate)
	.enter().append("g")
	.attr("class", "state")
	.attr("id",function(d){
		return d.key;
	})
	.attr("transform", function(d) { return "translate(15, " + y(d.key) + ")"; });

	var enter= state.selectAll("rect")
	.data(function(d){
		return d.whatever;
	})
	.enter();

	var bars= enter.append("rect")
	.attr("class", "bar")
	.attr("width", function(d){
		return (x(d.y1)- x(d.y0))
	})
	.attr("x", function(d) { 
		return x(d.y0);
	})
	.attr("height", y.rangeBand())
	.attr("id", function(d){return d.race})
	.style("fill", function(d){
		return color(d.race)
	})

	svg.append("g")
	.attr("class", "y axis")
	.attr("transform", "translate(15," + 0 + ")")
	.call(yAxis)
	.append("text")
	.attr("id", "yAxisText")
	.attr("x", 10)
	.attr("y", 9)
	.text("State");

	d3.selectAll(".y .tick text").on("click", onClick);

	function barMouseOver(d){
		var part1 = d.race;
		var part2= d.y1-d.y0;
		part2=part2*100
		part2= d3.format(".2f")(part2)
		tooltip.text(part1+": "+ part2+"%");
		tooltip.style({
			"visibility": "visible"
		})

	}
	function barMouseOut(d){
		tooltip.style({
			"visibility": "hidden"
		})
	}

	function shadeColor2(d, percent) { 
		var oldcolor= color(d);
		var f=parseInt(oldcolor.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
		return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
	}

	function barsOnClick(d){
		if(svg.selectAll("rect#"+d.race).attr("class")!="bar selected"){
			svg.selectAll("rect#aian").transition().duration(550).style("fill", function(d){return shadeColor2("aian", 0.8)});
			svg.selectAll("rect#asian").transition().duration(550).style("fill", function(d){return shadeColor2("asian", 0.8)});
			svg.selectAll("rect#black").transition().duration(550).style("fill", function(d){return shadeColor2("black", 0.8)});
			svg.selectAll("rect#hisp").transition().duration(550).style("fill", function(d){return shadeColor2("hisp", 0.8)});
			svg.selectAll("rect#nhpi").transition().duration(550).style("fill", function(d){return shadeColor2("nhpi", 0.8)});
			svg.selectAll("rect#nra").transition().duration(550).style("fill", function(d){return shadeColor2("nra", 0.8)});
			svg.selectAll("rect#other").transition().duration(550).style("fill", function(d){return shadeColor2("other", 0.8)});
			svg.selectAll("rect#white").transition().duration(550).style("fill", function(d){return shadeColor2("white", 0.8)});
			svg.selectAll("rect#"+d.race).transition().duration(550).style("fill",function(e){return shadeColor2(e.race, -0.12)});
			svg.selectAll("rect#"+d.race).classed({"selected":true});
		}else{
			svg.selectAll("rect#aian").transition().duration(550).style("fill", function(d){return shadeColor2("aian", 0)});
			svg.selectAll("rect#asian").transition().duration(550).style("fill", function(d){return shadeColor2("asian", 0)});
			svg.selectAll("rect#black").transition().duration(550).style("fill", function(d){return shadeColor2("black", 0)});
			svg.selectAll("rect#hisp").transition().duration(550).style("fill", function(d){return shadeColor2("hisp", 0)});
			svg.selectAll("rect#nhpi").transition().duration(550).style("fill", function(d){return shadeColor2("nhpi", 0)});
			svg.selectAll("rect#nra").transition().duration(550).style("fill", function(d){return shadeColor2("nra", 0)});
			svg.selectAll("rect#other").transition().duration(550).style("fill", function(d){return shadeColor2("other", 0)});
			svg.selectAll("rect#white").transition().duration(550).style("fill", function(d){return shadeColor2("white", 0)});
			svg.selectAll("rect#"+d.race).classed({"selected":false});
		}
	}

	bars.on("mouseover", barMouseOver);
	bars.on("mouseout", barMouseOut)
	bars.on("click", barsOnClick);

	var legend = svg.selectAll(".legend")
	.data(color.domain().slice())
	.enter().append("g")
	.attr("class", "legend")
	.attr("transform", function(d, i) { 
		return "translate("+ 0 +","+ i*25 + ")"; });


	legend.append("rect")
	.attr("x", 770)
	.attr("y", 22)
	.attr("width", 18)
	.attr("height", 18)
	.style("fill", color);

	legend.append("text")
	.attr("x", 790)
	.attr("y", 30)
	.attr("dy", ".35em")
	.style("text-anchor", "start")
	.text(function(d) { return d; });

	d3.selectAll("svg#bars").selectAll(".legend").on("click", legendOnClick);
	function legendOnClick(d){
		if(svg.selectAll("rect#"+d).attr("class")!="bar selected"){
			svg.selectAll("rect#aian").transition().duration(550).style("fill", function(d){return shadeColor2("aian", 0.8)});
			svg.selectAll("rect#asian").transition().duration(550).style("fill", function(d){return shadeColor2("asian", 0.8)});
			svg.selectAll("rect#black").transition().duration(550).style("fill", function(d){return shadeColor2("black", 0.8)});
			svg.selectAll("rect#hisp").transition().duration(550).style("fill", function(d){return shadeColor2("hisp", 0.8)});
			svg.selectAll("rect#nhpi").transition().duration(550).style("fill", function(d){return shadeColor2("nhpi", 0.8)});
			svg.selectAll("rect#nra").transition().duration(550).style("fill", function(d){return shadeColor2("nra", 0.8)});
			svg.selectAll("rect#other").transition().duration(550).style("fill", function(d){return shadeColor2("other", 0.8)});
			svg.selectAll("rect#white").transition().duration(550).style("fill", function(d){return shadeColor2("white", 0.8)});
			svg.selectAll("rect#"+d).transition().duration(550).style("fill",function(e){return shadeColor2(d, -0.12)});
			svg.selectAll("rect#"+d).classed({"selected":true});
		}else{
			svg.selectAll("rect#aian").transition().duration(550).style("fill", function(d){return shadeColor2("aian", 0)});
			svg.selectAll("rect#asian").transition().duration(550).style("fill", function(d){return shadeColor2("asian", 0)});
			svg.selectAll("rect#black").transition().duration(550).style("fill", function(d){return shadeColor2("black", 0)});
			svg.selectAll("rect#hisp").transition().duration(550).style("fill", function(d){return shadeColor2("hisp", 0)});
			svg.selectAll("rect#nhpi").transition().duration(550).style("fill", function(d){return shadeColor2("nhpi", 0)});
			svg.selectAll("rect#nra").transition().duration(550).style("fill", function(d){return shadeColor2("nra", 0)});
			svg.selectAll("rect#other").transition().duration(550).style("fill", function(d){return shadeColor2("other", 0)});
			svg.selectAll("rect#white").transition().duration(550).style("fill", function(d){return shadeColor2("white", 0)});
			svg.selectAll("rect#"+d).classed({"selected":false});
		}
	}

	var tooltip= svg.append("text").attr("id", "tooltip");
	tooltip.attr({
		"x": 775,
		"y": 250,
		"text-anchor": "start",
		"dx": -5,
		"dy": -5
	})
	.style({
		"visibility": "hidden"
	})
	.text("N/A");




	d3.selectAll(".y .tick text").on("click", onClick);

	onClick= function(d){
		var me=d3.select(this);

		if(me.attr("class")===null||me.attr("class")===""){
			var all=d3.selectAll(".y .tick text");

			var newdata= data;
			newdata=newdata.filter(function(e){
				return e.state===d;
			})

			var racebyschool=newdata;
			racebyschool.forEach(function(e){
				var y0=0;
				e.whatever= color.domain().map(function(names){
					return {race: names, y0:y0, y1:y0+= e.races[names]}
				})
			})

			if(racebyschool.length>=62){
				racebyschool= racebyschool.filter(function(a){
					return racebyschool.indexOf(a)<=62
				})
			}
			
			var ydomain=[]
			racebyschool.forEach(function(q){
				ydomain.push(q.school)
			})

			zoomdate(ydomain,racebyschool,true)

			svg.selectAll(".y").remove();
			svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(20," + 0 + ")")
			.call(yAxis)
			.append("text")
			.attr("id", "yAxisText")
			.attr("x", 10)
			.attr("y", 9)
			.text("College");

			d3.selectAll(".y .tick text").classed({"selected": true})

			d3.selectAll(".y .tick text").on("click", onClick);

			bars.on("mouseover", barMouseOver);
			bars.on("mouseout", barMouseOut)
			bars.on("click", barsOnClick);

		}else{
			zoomdate(states.keys(), racebystate,false)

			svg.selectAll(".y").remove();
			svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(20," + 0 + ")")
			.call(yAxis)
			.append("text")
			.attr("id", "yAxisText")
			.attr("x", 10)
			.attr("y", 9)
			.text("State");

			d3.selectAll(".y .tick text").classed({"selected": false})

			d3.selectAll(".y .tick text").on("click", onClick)


			bars.on("mouseover", barMouseOver);
			bars.on("mouseout", barMouseOut)
			bars.on("click", barsOnClick);
			d3.selectAll("svg#bars").selectAll(".legend").on("click", legendOnClick);

		}	
	}

	var zoomdate = function(newdomain, newdata, isSchool) {
		d3.selectAll("svg#bars").selectAll(".state").transition().remove()

		y.domain(newdomain.reverse());

		state= svg.selectAll(".district")
		.data(newdata)
		.enter().append("g")
		.attr("class", "state")
		.attr("id",function(d){
			return d.key;
		})
		if(isSchool==true){
			d3.selectAll("text#yAxisText").text("College")

			state.attr("transform", function(d) {
				return "translate(20, " + y(d.school) + ")"; });
		}else{
			d3.selectAll("text#yAxisText").text("State")

			state.attr("transform", function(d) {
				return "translate(20, " + y(d.key) + ")"; });
		}

		bars= state.selectAll("rect")
		.data(function(d){
			return d.whatever;
		}).enter().append("rect")

		.attr("class", "bar")
		.attr("width", function(d){
			return (x(d.y1)- x(d.y0))
		})
		.attr("x", function(d) { 
			return x(d.y0);
		})
		.attr("height", y.rangeBand())
		.attr("id", function(d){return d.race})
		.style("fill", function(d){
			return color(d.race)
		})

		bars.style("fill-opacity", 0)
		.transition()
		.style("fill-opacity", 1);

		bars.on("click", barsOnClick);
		bars.on("mouseover", barMouseOver);
		bars.on("mouseout", barMouseOut)


		var t = svg.transition().duration(750);
		t.select(".y.axis").call(yAxis);

	};

	d3.selectAll(".y .tick text").on("click", onClick)
	bars.on("mouseover", barMouseOver);
	bars.on("mouseout", barMouseOut)
	bars.on("click", barsOnClick);
	d3.selectAll("svg#bars").selectAll(".legend").on("click", legendOnClick);

	return zoomdate;	
}

var barhelper=function (targetState, zoomdate){

	var newdata= globaldata;
	newdata=newdata.filter(function(e){
		return e.state===targetState;
	})

	var racebyschool=newdata;
	racebyschool.forEach(function(e){
		var y0=0;
		e.whatever= color.domain().map(function(names){
			return {race: names, y0:y0, y1:y0+= e.races[names]}
		})
	})
	
	if(racebyschool.length>=62){
		racebyschool= racebyschool.filter(function(a){
			return racebyschool.indexOf(a)<=62
		})
	}

	var ydomain=[]
	racebyschool.forEach(function(q){
		ydomain.push(q.school)
	})

	zoomdate(ydomain,racebyschool,true)

	svg.selectAll(".y").remove();
	svg.append("g")
	.attr("class", "y axis")
	.attr("transform", "translate(20," + 0 + ")")
	.call(yAxis)
	.append("text")
	.attr("id", "yAxisText")
	.attr("x", 15)
	.attr("y", 9)
	.text("State");

	function barMouseOver(d){
		var part1 = d.race;
		var part2= d.y1-d.y0;
		part2=part2*100
		part2= d3.format(".2f")(part2)
		tooltip.text(part1+": "+ part2+"%");
		tooltip.style({
			"visibility": "visible"
		})

	}
	function barMouseOut(d){
		tooltip.style({
			"visibility": "hidden"
		})
	}
	var bars= d3.selectAll("svg#bars").selectAll(".bar");
	var tooltip=d3.selectAll("svg#bars").selectAll("text#tooltip")
	tooltip.attr("x",775);
	bars.on("mouseover", barMouseOver);
	bars.on("mouseout", barMouseOut)


	d3.selectAll(".y .tick text").on("click", onClick);

}

var barhelperRest=function (zoomdate){
	zoomdate(ydomain_states, racebystate_global,false)
	svg.selectAll(".y").remove();
	svg.append("g")
	.attr("class", "y axis")
	.attr("transform", "translate(20," + 0 + ")")
	.call(yAxis)
	.append("text")
	.attr("id", "yAxisText")
	.attr("x", 15)
	.attr("y", 9)
	.text("State");

	d3.selectAll(".y .tick text").on("click", onClick);
}



