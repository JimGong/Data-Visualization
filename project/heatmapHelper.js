/*
 * we assume the following global variables are defined:
 * - svg, plot
 * - xScale, yScale
 * - config
 */
 var plot;
 var svg;
 var xScale;
 var yScale;
 var config;
 var dataset;

 var translate = function(x, y) { return "translate(" + x + "," + y + ")"; };

 function init(mysvg, myplot, myxScale,myyScale,myconfig,mydataset){
  plot=myplot;
  svg=mysvg;
  xScale=myxScale;
  yScale=myyScale;
  config=myconfig
  dataset=mydataset
}

/*
 * draw white plot background
 * useful for debugging before we draw the heatmap
 */
 var drawBackground = function() {
  plot.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", config.plot.width)
  .attr("height", config.plot.height)
  .style("fill", "white");
};

/*
 * draws the x and y axis
 * https://github.com/mbostock/d3/wiki/SVG-Axes#axis
 */
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

/*
 * draws the heatmap
 * not too complicated due to how we nested the data
 * but, it can be tricky to figure out which scale to use where
 */
 var drawHeatmap = function() {
  // create a group per row
  // console.log("wtf")
  // console.log("heatmap.js data",dataset )
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
  .data(function(d) { return d.value.entries(); })
  .enter()
  .append("rect")
  .attr("x", function(d) { return xScale(d.key); })
  .attr("y", 0)
  .attr("width", xScale.rangeBand())
  .attr("height", yScale.rangeBand())
  .style("fill", function(d) { return colorScale(d.value); });
};

/*
 * draw plot title in upper left margin
 * will center the text in the margin
 */
 var drawTitle = function() {
  var title = svg.append("text")
  .text("Heatmap Showing Total Incidents by Weekday and Month")
  .attr("id", "title")
  .attr("x", config.margin.left)
  .attr("y", 0)
  .attr("dx", 0)
  .attr("dy", "18px")
  .attr("text-anchor", "left")
  .attr("font-size", "18px");

  // shift text so it is centered in plot area
  var bounds = title.node().getBBox();
  var yshift = (config.margin.top - bounds.height) / 2;
  title.attr("transform", translate(0, yshift));
};

/*
 * draw a color legend at top of plot
 * this is ridiculously hard for the amount of pixels we
 * are drawing, but it is also ridiculously important
 *
 * another approach is to threshold our values
 * we will leave that for another time
 */
 var drawLegend = function() {
  // map our color domain to percentage stops for our gradient
  // we know min is 0% and max is 100%
  // but we have to find where the average falls between there
  var percentScale = d3.scale.linear()
  .domain(d3.extent(colorScale.domain()))
  .rangeRound([0, 100]);

  // setup gradient for legend
  // http://bl.ocks.org/mbostock/1086421
  svg.append("defs")
  .append("linearGradient")
  .attr("id", "gradient")
  .selectAll("stop")
  .data(colorScale.domain())
  .enter()
  .append("stop")
  .attr("offset", function(d) {
    return "" + percentScale(d) + "%";
  })
  .attr("stop-color", function(d) {
    return colorScale(d);
  });

  // create group for legend elements
  // will translate it to the appropriate location later
  var legend = svg.append("g")
  .attr("id", "legend");
    // .attr("transform", translate(
    //   config.svg.width - config.margin.right - config.legend.width,
    //   (config.margin.top - config.legend.height) / 2)
    // );

  // draw the color rectangle with gradient
  legend.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", config.legend.width)
  .attr("height", config.legend.height)
  .attr("fill", "url(#gradient)");

  // create another scale so we can easily draw an axis on the color box
  var legendScale = d3.scale.linear()
  .domain(percentScale.domain())
  .range([0, config.legend.width]);

  // use an axis generator to draw axis under color box
  var legendAxis = d3.svg.axis()
  .scale(legendScale)
  .orient("bottom")
  .innerTickSize(4)
  .outerTickSize(4)
  .tickPadding(4)
  .tickValues(colorScale.domain());

  // draw it!
  legend.append("g")
  .attr("id", "color-axis")
  .attr("class", "legend")
  .attr("transform", translate(0, config.legend.height))
  .call(legendAxis)

  // calculate how much to shift legend group to fit in our plot area nicely
  var bounds = legend.node().getBBox();
  var xshift = config.svg.width - bounds.width;
  var yshift = (config.margin.top - bounds.height) / 2;
  legend.attr("transform", translate(xshift, yshift));
};
