// @TODO: YOUR CODE HERE!

var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);


// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(povertyData, chosenXAxis) {

// create scales
var xLinearScale = d3.scaleLinear()
  .domain([d3.min(povertyData, d => d[chosenXAxis]) * 0.8,
    d3.max(povertyData, d => d[chosenXAxis]) * 1.2
  ])
  .range([0, width]);

return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating y-scale var upon click on axis label
function yScale(hairData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(hairData, d => d[chosenYAxis]) * 0.8,
      d3.max(hairData, d => d[chosenYAxis]) * 1.2
    ])
    .range([0, width]);

  return yLinearScale;

}




// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "abbr") {
    var label = "State Names:";
  }
  else {
    var label = "Population Poverty";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.abbr}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })

// onmouseout event
.on("mouseout", function(data, index) {
  toolTip.hide(data);
});

return circlesGroup;
}


// Retrieve data from the CSV file and execute everything below
d3.csv("/assets/data/data.csv").then(function(healthData, err) {
  if (err) throw err;


// parse data
healthData.forEach(function(data) {
  data.poverty = +data.poverty;
  data.age = +data.age;
  data.income = +data.income;
  data.healthcare = +data.healthcare;
  data.obesity = +data.obesity;
  data.smokes = +data.smokes;
  
});

// xLinearScale function above csv import
var xLinearScale = xScale(healthData, chosenXAxis);

// Create y scale function
var yLinearScale = yScale(healthData, chosenYAxis);

// Create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);


// append x axis
var xAxis = chartGroup.append("g")
.classed("x-axis", true)
.attr("transform", `translate(0, ${height})`)
.call(bottomAxis);

// append y axis
var yAxis = chartGroup.append("g")
.classed("y-axis", true)
.attr("transform", `translate(0, ${height})`)
.call(leftAxis);



// append initial circles
var circlesGroup = chartGroup.selectAll("circle")
.data(healthData)
.enter()
.append("circle")
.attr("cx", d => xLinearScale(d[chosenXAxis]))
.attr("cy", d => yLinearScale(d[chosenYAxis]))
.attr("r", 20)
.attr("fill", "blue")
.attr("label", d => abbr)
.attr("opacity", ".1");


// Create group for  3 x- axis labels
var labelsGroup = chartGroup.append("g")
.attr("transform", `translate(${width / 3}, ${height + 20})`);


var povertydataLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");


  var agedataLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 40)
  .attr("value", "age") // value to grab for event listener
  .classed("inactive", true)
  .text("Age (Median)");

  var incomedataLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 60)
  .attr("value", "income") // value to grab for event listener
  .classed("inactive", true)
  .text("Household Income (Median)");


  // Create group for  3 y- axis labels
var ylabelsGroup = chartGroup.append("g")
.attr("transform", `translate(${height / 3}, ${width + 20})`);


var obesitydataLabel = ylabelsGroup.append("text")
    .attr("x", 20)
    .attr("y", 0)
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obesity (%)");


  var smokedataLabel = ylabelsGroup.append("text")
  .attr("x", 40)
  .attr("y", 0)
  .attr("value", "smokes") // value to grab for event listener
  .classed("inactive", true)
  .text("Smokes (%)");

  var heslthcaredataLabel = ylabelsGroup.append("text")
  .attr("x", 60)
  .attr("y", 0)
  .attr("value", "healthcare") // value to grab for event listener
  .classed("inactive", true)
  .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertydataLabel
            .classed("active", true)
            .classed("inactive", false);
            agedataLabel
            .classed("active", false)
            .classed("inactive", true);
            incomedataLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertydataLabel
            .classed("active", false)
            .classed("inactive", true);
            agedataLabel
            .classed("active", true)
            .classed("inactive", false);
            incomedataLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertydataLabel
            .classed("active", false)
            .classed("inactive", true);
            agedataLabel
            .classed("active", false)
            .classed("inactive", true);
            incomedataLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
    
    // y axis labels event listener
  ylabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenXAxis with value
      chosenYAxis = value;

      // console.log(chosenXAxis)

      // functions here found above csv import
      // updates x scale for new data
      yLinearScale = xScale(healthData, chosenYAxis);

      // updates x axis with transition
      yAxis = renderAxes(yLinearScale, yAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenYAxis === "obesity") {
        obesitydataLabel
          .classed("active", true)
          .classed("inactive", false);
          smokedataLabel
          .classed("active", false)
          .classed("inactive", true);
          heslthcaredataLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "smokes") {
        obesitydataLabel
          .classed("active", false)
          .classed("inactive", true);
          smokedataLabel
          .classed("active", true)
          .classed("inactive", false);
          heslthcaredataLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        obesitydataLabel
          .classed("active", false)
          .classed("inactive", true);
          smokedataLabel
          .classed("active", false)
          .classed("inactive", true);
          healthcaredataLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });
}).catch(function(error) {
  console.log(error);
});
