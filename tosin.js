var margin = {top: 20, right: 80, bottom: 50, left: 100},
    width = 830 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var parseDate = d3.time.format("%d-%m-%Y").parse;

var x = d3.time.scale()
    .range([0, width]);

var yleft = d3.scale.linear()
    .range([height, 0]);

var yright = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(5)
    .innerTickSize(15)
    .outerTickSize(0)
    .orient("bottom");

var yAxisLeft = d3.svg.axis()
    .scale(yleft)
    .ticks(5)
    .innerTickSize(15)
    .outerTickSize(0)
    .orient("left");

var yAxisRight = d3.svg.axis()
    .scale(yright)
    .ticks(5)
    .innerTickSize(15)
    .outerTickSize(0)
    .orient("right");

var lineleft = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return yleft(d.collision); });

var lineright = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return yright(d.collision); });

var svg = d3.select("#tosin").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.tsv("collisions.tsv", function(error, data) {

  console.log('data', data);


  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

  console.log('color domain', color.domain());
  
  data.forEach(function(d) {
    d.date = parseDate(d.date);
  });

  var collisions = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {date: d.date, collision: +d[name]};
      })
    };
  });

  console.log('collissions : ',collisions)

  x.domain(d3.extent(data, function(d) { return d.date; }));

  yleft.domain([
    d3.min(collisions[0]['values'], function(v) { return v.collision; }),
    d3.max(collisions[0]['values'], function(v) { return v.collision; })
  ]);

  yright.domain([
    d3.min(collisions[1]['values'], function(v) { return v.collision; }),
    d3.max(collisions[1]['values'], function(v) { return v.collision; })
  ]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxisLeft);

  svg.append("g")
      .attr("class", "y axis")
      .attr("style", "transform:translate("+x.range()[1]+"px,0px)")
      .call(yAxisRight);

  var collision = svg.selectAll(".collision")
      .data(collisions)
    .enter().append("g")
      .attr("class", "collision");

  var path = svg.selectAll(".collision").append("path")
      .attr("class", "line")
      .attr("d", function(d) { 
        console.log(d);
        if (d.name == "nonFatal") 
            {return lineleft(d.values);}
        else {return lineright(d.values)}
      })                              
      .style("stroke", function(d) { if (d.name == "fatal") 
                                        {return "rgb(255,000,000)"}
                                      else {return "#000";}
                                         });

var totalLength = [path[0][0].getTotalLength(), path[0][1].getTotalLength()];

console.log(totalLength);


   d3.select(path[0][0])
      .attr("stroke-dasharray", totalLength[0] + " " + totalLength[0] ) 
      .attr("stroke-dashoffset", totalLength[0])
      .transition()
        .duration(8000)
        .ease("linear")
        .attr("stroke-dashoffset", 0);

   d3.select(path[0][1])
      .attr("stroke-dasharray", totalLength[1] + " " + totalLength[1] )
      .attr("stroke-dashoffset", totalLength[1])
      .transition()
        .duration(8000)
        .ease("linear")
        .attr("stroke-dashoffset", 0);

});