
var util = (function() {

  var main = {};

  /* Helper method to make translating easier in SVGs. */
  main.translate = function(x, y) {
    return "translate(" + String(x) + "," + String(y) + ")";
  };

  /*
   * Fixes the width, height, and viewbox of an SVG to fit
   * the plot plus the specified padding.
   */
  main.resize = function(svg, plot, padding) {
    // http://stackoverflow.com/questions/23560038/
    var bbox = plot.node().getBBox();
    var view = [bbox.x, bbox.y, bbox.width, bbox.height];

    var x = -bbox.x + (padding / 2.0);
    var y = -bbox.y + (padding / 2.0);

    svg.attr("width",  bbox.width  + padding);
    svg.attr("height", bbox.height + padding);

    plot.attr("viewBox", view.join(" "));
    plot.transition()
    .duration(750)
    .attr("transform", "translate(" + x + ", " + y + ")");

    // set svg attributes
    view = [0, 0, bbox.width + padding, bbox.height + padding];
    svg.attr("viewBox", view.join(" "));
    svg.attr("version", "1.1");
    svg.attr("xmlns", "http://www.w3.org/2000/svg");
    svg.attr("preserveAspectRatio", "xMinYMin meet");
  };

  /* Converts text to title case. */
  main.toTitleCase = function(text) {
    // http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
    return text.replace(/\b\w+/g, function(word) {
      return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    });
  };

  return main;
})();
