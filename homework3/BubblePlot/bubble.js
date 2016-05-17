/*
 * Draws our parallel coordinates. Assumes the following globals:
 * - data
 * - config
 * - scales
 *
 * Note: Want to avoid these kinds of globals, and/or passing these values
 * around to related functions? Look into closures in JavaScript!
 */
function drawBubble() {
  var svg = d3.select("body").append("svg")
    .attr("width", config.svg.width)
    .attr("height", config.svg.height);

  var plot = svg.append("g")
    .attr("id", "plot")
    .attr("transform", translate(config.pad.left, config.pad.top));

  // oh noes when we draw our bubbles fall off our plot!
  // we need to adjust to account for the radius size

  // we could try to subtract the max radius size from our range...
  // var xrange  = scales.x.range();
  // var xdomain = scales.x.domain();
  // var xshift  = config.r.max / (xrange[1] - xrange[0]);

  // xrange[0] += config.r.max;
  // xrange[1] -= config.r.max;
  // scales.x.range(xrange);

  // var yrange = scales.y.range();
  // yrange[0] -= config.r.max;
  // yrange[1] += config.r.max;
  // scales.y.range(yrange);

  // the above approach means our axis lines do not connect anymore
  // instead we can shift the domain---but by how much? a shift by 10
  // in the x-direction is different than 10 in the y-direction. we
  // will calculate what percent the max radius size is of each range
  // and shift the domain by that percent
  var xrange  = scales.x.range();
  var xdomain = scales.x.domain();
  var xshift  = (config.r.max + 5) / (xrange[1] - xrange[0]); // plus 5 padding
  xshift = xshift * (xdomain[1] - xdomain[0]);
  scales.x.domain([xdomain[0] - xshift, xdomain[1] + xshift]);

  var yrange  = scales.y.range();
  var ydomain = scales.y.domain();
  var yshift  = (config.r.max + 5) / (yrange[0] - yrange[1]);
  yshift = yshift * (ydomain[1] - ydomain[0]); // note not swapped
  scales.y.domain([ydomain[0] - yshift, ydomain[1] + yshift]);

  drawAxisLines(plot);
  drawCircles(plot);

  drawAreaLegend(plot);
  drawFillLegend(svg);

  drawTitle(svg);

  console.log("drawing complete");
}

function drawAxisLines(plot) {
  var xaxis = d3.svg.axis().scale(scales.x).orient("bottom");
  var yaxis = d3.svg.axis().scale(scales.y).orient("left");

  plot.append("g")
    .attr("id", "x")
    .attr("class", "axis")
    .attr("transform", translate(0, config.height))
    .call(xaxis);

  plot.select("g#x")
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", d3.max(scales.x.range()))
    .attr("y", 0)
    .attr("dx", 0)
    .attr("dy", "-5px")
    .text(config.cols.x);

  plot.append("g")
    .attr("id", "y")
    .attr("class", "axis")
    .call(yaxis);

  plot.select("g#y")
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", 0)
    .attr("y", d3.min(scales.y.range()))
    .attr("dx", 0)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90,0," + d3.min(scales.y.range()) + ")")
    .text(config.cols.y);
}

function drawCircles(plot) {
  var bubbles = plot.append("g").attr("class", "bubbles")
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("id", function(d) { return d.State; });

  bubbles.append("circle")
    .attr("cx", function(d) { return scales.x(d[config.cols.x]); })
    .attr("cy", function(d) { return scales.y(d[config.cols.y]); })
    .attr("r", function(d) { return scales.area(d[config.cols.area]); })
    .style("fill", function(d) { return scales.fill(d[config.cols.fill]); });

  bubbles.append("text")
    .attr("x", function(d) { return scales.x(d[config.cols.x]); })
    .attr("y", function(d) { return scales.y(d[config.cols.y]); })
    .attr("dx", 0)
    .attr("dy", "4px")
    .attr("text-anchor", "middle")
    .text(function(d) { return d.State; });
}

function drawAreaLegend(plot) {
  var legend = plot.append("g")
    .attr("id", "area-legend")
    .attr("class", "legend");

  legend.append("text")
    .attr("text-anchor", "middle")
    .attr("x", config.r.max)
    .attr("y", config.r.max + config.r.max)
    .attr("dx", 0)
    .attr("dy", "12px")
    .text(config.cols.area);

  legend.append("circle")
    .attr("cx", config.r.max)
    .attr("cy", config.r.max)
    .attr("r", config.r.max);

  legend.append("text")
    .attr("text-anchor", "middle")
    .attr("x", config.r.max)
    .attr("y", 0)
    .attr("dx", 0)
    .attr("dy", "12px")
    .text(Math.round(scales.area.invert(config.r.max)));

  var mid = config.r.min + (config.r.max - config.r.min) / 2;

  legend.append("circle")
    .attr("cx", config.r.max)
    .attr("cy", config.r.max + config.r.max - mid)
    .attr("r", mid);

  legend.append("text")
    .attr("text-anchor", "middle")
    .attr("x", config.r.max)
    .attr("y", config.r.max + config.r.max - mid - mid)
    .attr("dx", 0)
    .attr("dy", "12px")
    .text(Math.round(scales.area.invert(mid)));

  var bounds = legend.node().getBBox();
  var yshift = config.height - bounds.height;

  legend.attr("transform", translate(5, yshift));
}

/*
 * draw plot title in upper left margin
 * will center the text in the margin
 */
var drawTitle = function(svg) {
  var title = svg.append("text")
    .text("Zillow Market Health Index by State")
    .attr("id", "title")
    .attr("x", config.pad.left)
    .attr("y", 0)
    .attr("dx", 0)
    .attr("dy", "18px")
    .attr("text-anchor", "left")
    .attr("font-size", "18px");

  // shift text so it is centered in plot area
  var bounds = title.node().getBBox();
  var yshift = (config.pad.top - bounds.height) / 2;
  title.attr("transform", translate(0, yshift));
};

/*
 * draws a fill legend in the top right corner
 * adapted from heatmap demo
 */
var drawFillLegend = function(svg) {
  // map our color domain to percentage stops for our gradient
  // we know min is 0% and max is 100%
  // but we have to find where the average falls between there
  var percentScale = d3.scale.linear()
    .domain(d3.extent(scales.fill.domain()))
    .rangeRound([0, 100]);

  // setup gradient for legend
  // http://bl.ocks.org/mbostock/1086421
  svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .selectAll("stop")
    .data(scales.fill.domain())
    .enter()
    .append("stop")
    .attr("offset", function(d) {
      return "" + percentScale(d) + "%";
    })
    .attr("stop-color", function(d) {
      return scales.fill(d);
    });

  // create group for legend elements
  // will translate it to the appropriate location later
  var legend = svg.append("g")
    .attr("id", "fill-legend");

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
    .tickValues(scales.fill.domain());

  // draw it!
  legend.append("g")
    .attr("id", "fill")
    .attr("class", "axis")
    .attr("transform", translate(0, config.legend.height))
    .call(legendAxis);

  legend.select("g#fill")
    .append("text")
    .attr("class", "axis")
    .attr("text-anchor", "middle")
    .attr("x", config.legend.width / 2.0)
    .attr("y", 8)
    .attr("dx", 0)
    .attr("dy", ".71em")
    .text(config.cols.fill);

  // calculate how much to shift legend group to fit in our plot area nicely
  var bounds = legend.node().getBBox();
  var xshift = config.svg.width - bounds.width - config.pad.right;
  var yshift = config.pad.top - bounds.height;
  legend.attr("transform", translate(xshift, yshift));
};

function translate(x, y) {
  return "translate(" + x + "," + y + ")";
}
