$(document).ready(function() {
  var width = $(".correlation").width(),
    height = $(".correlation").height();

  var fill = d3.scale.category20();

  var initializeNodes = [];
  for (var i = 0; i < LinUCB.k_arms; i++) {
    initializeNodes.push({index: i});
  }

  var force = d3.layout.force()
      .size([width, height])
      .nodes(initializeNodes) // initialize
      .linkDistance(60)
      .charge(-120)
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
    if (!mousedown_node) return;
 
    // update drag line
    drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

    restart();
  }

  function mousedown() {
    if (mousedown_node || mousedown_link) return;
    restart();
  }

  function mouseup() {
    if (mousedown_node) {
      // hide drag line
      drag_line
        .classed('hidden', true);

      // check for drag-to-self
      if (!mouseup_node || mouseup_node === mousedown_node) { resetMouseVars(); return; }

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
        linksToContextVectors();
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

    node.attr("transform", function(d){return "translate("+d.x+","+d.y+")"});
  }

  function restart() {
    link = link.data(links);

    link.enter().insert("line", ".node")
        .attr("class", "link");

    node = node.data(nodes);

    var g = node.enter().append("svg:g")
      .attr("class", "node");
    g.append('circle')
      .attr("r", 15)
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
      .on('mouseenter', function(d) {
        if (!mousedown_node) return;
        mouseup_node = d;
      })
      .on('mouseleave', function(d) {
        if (mouseup_node === d) {
          mouseup_node = null;
        }
      });
      g.append('text')
        .attr("x", 0)
        .attr("dy", ".35em")
        .text(function(d) {return d.index;})
        .attr("text-anchor", "middle");

    force.start();
  }

  svg.on("mousedown", mousedown)
     .on("mousemove", mousemove)     
     .on('mouseup', mouseup);

  restart();

  function linksToContextVectors() {
    for (var i = 0; i < links.length; i++) {
      var a = links[i].source.index;
      var b = links[i].target.index;
      LinUCB.arms[a].setSharedContextAt(b, 1);
      LinUCB.arms[b].setSharedContextAt(a, 1);
    }
  }

});