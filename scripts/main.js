//
$(document).ready(function() {
  LinUCB.init();
  var margin = {top: 10, right: 50, bottom: 20, left: 50},
      width = 115 - margin.left - margin.right,
      height = $(".boxplot").height() - margin.top - margin.bottom;

  var min = -3,
      max = 3;

  var chart = d3.box()
      .whiskers(iqr(1.5))
      .width(width)
      .height(height);
///////
  chart.domain([min, max]);
  var data = [];
  for (var i = 0; i < LinUCB.k_arms; i++) {
    data.push([i]);
  }

  var svg = d3.select(".boxplot").selectAll("svg")
      .data(data)
    .enter().append("svg")
      .attr("class", "box")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.bottom + margin.top);
    svg.append("text")
      .attr("x", 2)
      .attr("y", margin.top + 3)
      .text(function(d) {
        return d[0];
      });
    svg.append("text")
      .attr("class", "box-chosen-count")
      .attr("x", 2)
      .attr("y", 2 * margin.top + 3)
      .text(0);
    svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(chart);
window.duration = 1000;
$('.boxplot').click(function() {
  var interval = setTimeout(function timeout() {
    svg.call(chart.duration(duration));
    var iter = LinUCB.iter();
    var $count = $($(".box-chosen-count")[iter.chosen]);
    $count.text(parseInt($count.text()) + 1);
    if (LinUCB.regret.length >= 1000) {
      console.log(LinUCB.regret.join('\n'));
      debugger;
    }
    else {
      setTimeout(timeout, duration);
    }
  }, duration);
});
/////////////////

  function randomize(d) {
    if (!d.randomizer) d.randomizer = randomizer(d);
    return d.map(d.randomizer);
  }

  function randomizer(d) {
    var k = d3.max(d) * .02;
    return function(d) {
      return Math.max(min, Math.min(max, d + k * (Math.random() - .5)));
    };
  }

  // Returns a function to compute the interquartile range.
  function iqr(k) {
    return function(d, i) {
      var q1 = d.quartiles[0],
          q3 = d.quartiles[2],
          iqr = (q3 - q1) * k,
          i = -1,
          j = d.length;
      while (d[++i] < q1 - iqr);
      while (d[--j] > q3 + iqr);
      return [i, j];
    };
  }
});
