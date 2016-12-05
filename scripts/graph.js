$(document).ready(function() {
  var width = $(".correlation").width(),
    height = $(".correlation").height();

  var fill = d3.scale.category20();

  var force = d3.layout.force()
      .size([width, height])
      .nodes([{}]) // initialize with a single node
      .linkDistance(30)
      .charge(-60)
      .on("tick", tick);

  var svg = d3.select(".correlation").append("svg")
      .attr("width", width)
      .attr("height", height);

  svg.append("rect")
      .attr("width", width)
      .attr("height", height);

  var nodes = force.nodes(),
      links = force.links(),
      node = svg.selectAll(".node"),
      link = svg.selectAll(".link");

  var cursor = svg.append("circle")
      .attr("r", 30)
      .attr("transform", "translate(-100,-100)")
      .attr("class", "cursor");

  var drag_line = svg.append('svg:path')
    .attr('class', 'link dragline hidden')
    .attr('d', 'M0,0L0,0');

  var selected_node = null,
      selected_link = null,
      mousedown_link = null,
      mousedown_node = null,
      mouseup_node = null;
   
  function resetMouseVars() {
    mousedown_node = null;
    mouseup_node = null;
    mousedown_link = null;
  }

  function mousemove() {
    cursor.attr("transform", "translate(" + d3.mouse(this) + ")");

    if (!mousedown_node) return;
 
    // update drag line
    drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

    restart();
  }

  function mousedown() {
    if (mousedown_node || mousedown_link) return;

    var point = d3.mouse(this),
        node = {x: point[0], y: point[1]},
        n = nodes.push(node);

    restart();
  }

  function mouseup() {
    if (mousedown_node) {
      // hide drag line
      drag_line
        .classed('hidden', true);

      // check for drag-to-self
      if (mouseup_node === mousedown_node) { resetMouseVars(); return; }

      // add link to graph (update if exists)
      // NB: links are strictly source < target; arrows separately specified by booleans
      var source, target;
      if (mousedown_node.id < mouseup_node.id) {
        source = mousedown_node;
        target = mouseup_node;
      } else {
        source = mouseup_node;
        target = mousedown_node;
      }
   
      var link;
      link = links.filter(function(l) {
        return (l.source === source && l.target === target);
      })[0];
   
      if(!link) {
        link = {source: source, target: target};
        links.push(link);
      }
   
      // select new link
      selected_link = link;
      selected_node = null;
      
      restart();
    }
   
    // because :active only works in WebKit?
    svg.classed('active', false);
   
    // clear mouse event vars
    resetMouseVars();
  }

  function tick() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }

  function restart() {
    link = link.data(links);

    link.enter().insert("line", ".node")
        .attr("class", "link");

    node = node.data(nodes);

    node.enter().insert("circle", ".cursor")
        .attr("class", "node")
        .attr("r", 5)
        .on('mousedown', function(d) {
          mousedown_node = d;

          if (mousedown_node === selected_node) selected_node = null;
          else selected_node = mousedown_node;
          
          selected_link = null;

          drag_line
            .classed('hidden', false)
            .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

          restart();
        })
        .on('mouseover', function(d) {
          if (!mousedown_node) return;
          mouseup_node = d;
        });

    force.start();
  }

  svg.on("mousedown", mousedown)
     .on("mousemove", mousemove)     
     .on('mouseup', mouseup);

  restart();
});
