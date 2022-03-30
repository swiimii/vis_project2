class stackedBar {
	constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 20, bottom: 100, right: 50, left: 60 }
    }

    this.data = _data;

    // Call a class function
    this.initVis();
  }
  initVis() {
  	let vis = this;
  	vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
  	vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

  	vis.svg = d3.select(vis.config.parentElement)
  		.attr('width', vis.config.containerWidth)
  		.attr('height', vis.config.containerHeight);

  	vis.chart = vis.svg.append('g')
  		.attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

  	vis.formattedData = [{group: "GPS", with:0, without:0},
  						 {group: "Date", with:0, without:0}];

  	console.log(vis.formattedData);
  	vis.xScale = d3.scaleBand()
  		.domain(vis.formattedData.map((d)=> d.group))
  		.range([0, vis.width])
  		.padding(0.2);

  	vis.xAxisG = d3.axisBottom(vis.xScale);

  	vis.chart.append('g')
  		.attr("transform", `translate(0, ${vis.height})`)
  		.call(vis.xAxisG);

  	vis.yScale = d3.scaleLinear()
   		.range([vis.height,0]);

   	vis.yAxisG = d3.axisLeft(vis.yScale);

   	vis.chart.append('g')
   		.attr("class", "yAxis");

   	vis.color = d3.scaleOrdinal()
   		.domain(['with', 'without'])
   		.range(["#fb8072","#80b1d3"]);

   	// this is from barChart.js - want same formatting as Sam's bar charts
   	vis.svg.append("g")
      .attr('transform', 'translate(' + (12 + 2) + ', ' + (vis.config.margin.top + vis.height/2) + ')')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .text('Specimen Count')
      // These can be replaced by style if necessary
      .attr('font-family', 'sans-serif')
      .attr('font-size', 12)

    vis.svg.append("g")
      .attr('transform', 'translate(' + (vis.config.margin.left + vis.width/2) + ', ' + (12 + 2) + ')')
      .append('text')
      .attr('text-anchor', 'middle')
      .text('Num. of Specimens Missing Data')
      // These can be replaced by style if necessary
      .attr('font-family', 'sans-serif')
      .attr('font-size', 12)

    vis.svg.selectAll("legdots")
    	.data(['with', 'without'])
    	.enter()
    	.append("circle")
    		.attr("cx", function(d,i){ return vis.config.margin.left + 30 + i*80})
    		.attr("cy", vis.config.margin.top + vis.height + 30)
    		.attr("r", 5)
    		.style("fill", function(d){ return vis.color(d)})

    vis.svg.selectAll("leglabels")
		.data(['with', 'without'])
		.enter()
		.append("text")
		    .attr("x", function(d,i){ return vis.config.margin.left + i*80 + 40})
		    .attr("y", vis.config.margin.top + vis.height + 30) // 100 is where the first dot appears. 25 is the distance between dots
		    .style("fill", function(d){ return vis.color(d)})
		    .text(function(d){ return d + ' data'})
		    .attr('font-family', 'sans-serif')
     		.attr('font-size', 12)
		    .attr("text-anchor", "left")
		    .style("alignment-baseline", "middle")

   	vis.updateVis();
  }
  updateVis() {
  	let vis = this;

  	vis.formattedData[0].without = vis.data.filter((d)=>d.latitude == 9999.99).length;
  	vis.formattedData[0].with = vis.data.length - vis.formattedData[0].without;

  	vis.formattedData[1].without = vis.data.filter((d)=>d.startDayOfYear == null).length;
  	vis.formattedData[1].with = vis.data.length - vis.formattedData[1].without;

  	vis.yScale.domain([0,vis.formattedData[0].with+vis.formattedData[0].without]).nice();
  	vis.chart.selectAll(".yAxis")
  	  .transition()
      .duration(1000)
      .call(vis.yAxisG);

  	vis.stackedData = d3.stack()
    	.keys(['with', 'without'])
    	(vis.formattedData)


	vis.groups = vis.svg.selectAll(".bars")
	  .data(vis.stackedData)
      .join("g")
      .attr("class", "bars")
      .style("fill", d => vis.color(d.key))

    vis.rect = vis.groups.selectAll("rect")
      .data(function(d) { return d; })
      .join("rect")
      .attr("x", function(d) { return vis.xScale(d.data.group) + vis.config.margin.left; })
      .attr("y", function(d) { return vis.yScale(d[1]) + vis.config.margin.top; })
      .attr("height", function(d) { return vis.yScale(d[0]) - vis.yScale(d[1]); })
      .attr("width", vis.xScale.bandwidth())
      .on('mouseover', (event,d) => {
        console.log(d);
  			d3.select('#tooltip')
            //.style('opacity', 1)
            .style('display', 'block')
            .style('left', (event.pageX + 10) + 'px')   
            .style('top', (event.pageY + 10) + 'px')
            .html(`<div class="tooltip">${d.data.group} Data</div>
                <li>Without: ${d.data.without}</li>
                <li>With: ${d.data.with}</li>
                <li>Total: ${d.data.without+d.data.with}</li>`);
        })
        .on('mouseleave', () => {
          //d3.select('#tooltip').style('opacity', 0);
          d3.select('#tooltip').style('display', 'none');
        });	
  }

}