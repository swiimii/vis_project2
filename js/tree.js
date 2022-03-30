// ES6 Class
class Tree {

    constructor(_config, _data) {
      this.config = {
        title: _config.title || "Missing Title",
        yLabel: _config.yLabel || "Missing Axis Label",
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 500,
        containerHeight: _config.containerHeight || 300,
        margin: { top: 20, bottom: 100, right: 50, left: 60 }
      }
  
      this.data = _data;
      this.filtered_data = this.data;
  
      // Call a class function
      this.initVis();
    }
    
    initVis() {
      let vis = this;
      
      vis.colors = ["#8dd3c7","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"];
  
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
  
      // Define size of SVG drawing area
      vis.svg = d3.select(document.getElementById(vis.config.parentElement))
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);
  
      // Append group element that will contain our actual chart
      vis.chart = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
  
      // Title label
      vis.svg.append("g")
        .attr('transform', 'translate(' + (vis.config.margin.left + vis.width/2) + ', ' + (font_size + 2) + ')')
        .append('text')
        .attr('text-anchor', 'middle')
        .text(vis.config.title)
        // These can be replaced by style if necessary
        .attr('font-family', 'sans-serif')
        .attr('font-size', font_size)
			
			// define stratify helper function
			vis.stratify = d3.stratify()
				.parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf("|")); });
      
      vis.updateVis();
    }
  
    /**
     * Prepare the data and scales before we render it.
     */
    updateVis(filteredData = null) {
      let vis = this;
      if (filteredData == null) {
				filteredData = vis.data;
			}

			var root = vis.stratify(vis.data)
				.sum(function(d) { return d.value; })
				.sort(function(a, b) { return b.height - a.height || b.value - a.value; });

			
    	// process data

  
      vis.renderVis();
    }
  
    renderVis() {
      let vis = this;
  
    }
  }
