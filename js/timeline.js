class Timeline {

	constructor(_config, _data, _colorid) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 15, bottom: 50, right: 10, left: 50 }
    }

    this.data = _data;
    this.colorid = _colorid;

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

  	vis.xScale = d3.scaleBand()
  		.range([0, vis.width])
  		.padding(0.1);

  	vis.xAxisG = d3.axisBottom(vis.xScale);
      //.tickValues(vis.xScale.domain().filter(function(d,i){ return !(i%5)}));

  	vis.chart.append('g')
  		.attr("transform", `translate(0, ${vis.height})`)
  		.attr("class", "xAxis")


   	vis.yScale = d3.scaleLinear()
   		.range([vis.height,0]);
   		//.domain([0, ]);

   	vis.yAxisG = d3.axisLeft(vis.yScale);

   	vis.chart.append('g')
   		.attr("class", "yAxis");

    vis.brush = d3.brushX()
    	.extent([[0, 0],[vis.width, vis.height]])

    vis.chart.append("g")
      .attr("class", "brush")
      .call(vis.brush);


    vis.svg.append("text")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .style("font-size", "16px")
      .attr("x", vis.width/2 + vis.config.margin.left)
      .attr("y", vis.height+vis.config.margin.top+40)
      .text("Year");

    vis.svg.append("text")
      .attr("text-anchor", "end")
      .attr("font-weight", "bold")
      .attr("transform", "rotate(-90)")
      .style("font-size", "16px")
      .attr("y", 15)
      .attr("x", -vis.height/2)
      .text("Samples");

    vis.svg.append("text")
      .attr("x", vis.config.containerWidth/2)
      .attr("y", 14)
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .text("Number of Samples Collected Each Year");
    
   	
   	vis.updateVis();
  }

  updateVis() {
  	let vis = this;

    vis.brushedData = vis.data;
    
  	vis.xScale.domain(vis.data.map(d=>d.year));
    vis.xAxisG.tickValues(vis.xScale.domain().filter(function(d,i){ return !((d)%5)}));

  	vis.chart.selectAll(".xAxis").call(vis.xAxisG);

    console.log(d3.max(vis.data.map(o => o.count)));

    vis.yScale.domain([0, d3.max(vis.data.map(o => o.count))]);
    vis.chart.selectAll(".yAxis").call(vis.yAxisG);

  	vis.rects = vis.chart.selectAll(".bar")
  		.data(vis.data)
  		.join("rect")
  			.attr("class", "bar")
  			.attr("x", d=>vis.xScale(d.year))
  			.attr("y", d=>vis.yScale(d.count))
  			.attr("width", vis.xScale.bandwidth())
  			.attr("height", d=> vis.height - vis.yScale(d.count))
  			.attr("fill", "#80b1d3")
  		.on('mouseover', (event,d) => {
        console.log(d);
  			d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + 10) + 'px')   
            .style('top', (event.pageY + 10) + 'px')
            .html(`<div class="tooltip"><strong>${d.year}</strong> - ${d.count} samples</div>`);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });	


  }

  brushed(selection) { 
  	let vis = this;

  	console.log(selection);

    let selectedDomain = [vis.xScale.domain()[Math.trunc(selection[0]/vis.xScale.step())], vis.xScale.domain()[Math.trunc(selection[1]/vis.xScale.step())]];
    vis.brushedData = vis.data.slice(selectedDomain[0] - 1859, selectedDomain[1] - 1859+1);

    vis.xScale.domain(vis.brushedData.map(d=>d.year));
    if((selectedDomain[1] - selectedDomain[0]) > 50){
      vis.xAxisG.tickValues(vis.xScale.domain().filter(function(d,i){ return !((d)%5)}));
    }
    else {
      vis.xAxisG.tickValues(vis.xScale.domain().filter(function(d,i){ return !((d)%1)}));
    }
    
    vis.chart.selectAll(".xAxis").transition().duration(1000).call(vis.xAxisG);

    vis.yScale.domain([0, d3.max(vis.brushedData.map(o => o.count))]);
    vis.chart.selectAll(".yAxis")
      .transition()
      .duration(1000)
      .call(vis.yAxisG);

    vis.rects
      .data(vis.brushedData)
      .join("rect")
      .transition().duration(1000)
        .attr("x", d=>vis.xScale(d.year))
        .attr("y", d=>vis.yScale(d.count))
        .attr("width", vis.xScale.bandwidth())
        .attr("height", d=> vis.height - vis.yScale(d.count));

    vis.chart.select(".brush").call(vis.brush.move, null);

    return(selectedDomain);
    
  }
}