// ES6 Class
class Tree {

    constructor(_config, _data) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 800,
        containerHeight: _config.containerHeight || 800,
        margin: { top: 50, bottom: 0, right: 0, left: 0 }
      }
  
      this.data = _data;
      //this.filtered_data = this.data;
  
      // Call a class function
      this.initVis();
    }
    
    initVis() {
      let vis = this;
      
      vis.colors = ["#8dd3c7","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"];
  
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
  
      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement)
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);
  
      // Append group element that will contain our actual chart
      vis.chart = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);


  
      // // Title label
      // vis.svg.append("g")
      //   .attr('transform', 'translate(' + (vis.config.margin.left + vis.width/2) + ', ' + (font_size + 2) + ')')
      //   .append('text')
      //   .attr('text-anchor', 'middle')
      //   .text(vis.config.title)
      //   // These can be replaced by style if necessary
      //   .attr('font-family', 'sans-serif')
      //   .attr('font-size', font_size)
			
			// define stratify helper function
			// vis.stratify = d3.stratify()
			// 	.id((d) => {return d.phylum})
			// 	.parentId((d) => {return d.kingdom});
      
      vis.updateVis(vis.data, 0, 1);
    }

    /**
     * Prepare the data and scales before we render it.
     */
// updateVis(filteredData, parent_el, child_el) {
//       let vis = this;

//       let all_data = [{parent: '', child: 'life', value: null}];
      
//       let life = formatData(filteredData, parent_el, child_el, all_data);
//       console.log(life);

//       const root = d3.stratify()
//         .id(function(d) { return d.child; })   // Name of the entity (column name is name in csv)
//         .parentId(function(d) { return d.parent; })   // Name of the parent (column name is parent in csv)
//         (life);
//       root.sum(function(d) { return d.value });

//       d3.treemap()
//         .size([800, 800])
//         .padding(4)
//         (root)

//       console.log(root);
    
//       vis.rects = vis.chart.selectAll(".rects")
//         .data(root.leaves())
//         .join("rect")
//           .attr("class", "rects")
//           .attr('x', function (d) { return d.x0; })
//           .attr('y', function (d) { return d.y0; })
//           .attr('width', function (d) { return d.x1 - d.x0; })
//           .attr('height', function (d) { return d.y1 - d.y0; })
//           //.style("stroke", "black")
//           .style("fill", "#69b3a2");

//       // vis.labels = vis.chart.selectAll(".labels")
//       //   .data(root.leaves())
//       //   .join("text")
//       //     .attr("class", "labels")
//       //     .attr("x", function(d){ return d.x0+10})    // +10 to adjust position (more right)
//       //     .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
//       //     .text(function(d){ return (d.data.child + ": " + d.data.value + " samples")})
//       //     .attr("font-size", "15px")
//       //     .attr("fill", "white")

//       vis.rects.on('mouseover', (event, d) =>{
//         console.log(d);
//       })
//       vis.rects.on('click',(event,clicked_d) => {
//         console.log(clicked_d);
//         filteredData = filteredData.filter(function(d) {return(d[hierarchy[child_el]] == clicked_d.data.child)});
//         console.log(filteredData);
//         vis.updateVis(filteredData, child_el, child_el+1);
//       })



//       // process data

  
//       //vis.renderVis();
//     }
  
//     renderVis() {
//       let vis = this;
  
//     }
//   }

// function formatData(filteredData, parent_el, child_el, all_data) {
//     let groupedData = d3.group(filteredData, d=>d[hierarchy[child_el]]);
//     console.log(groupedData);
//     groupedData.delete('');
//     let life = Array.from({ length: groupedData.size} , () => ({ parent: hierarchy[parent_el], child: hierarchy[parent_el], value: null}));
//     console.log(life);
//     //life[0].parent = '';
//     let i = 0;
//     for (const [key, value] of groupedData.entries()) {
//       console.log(key, value);
//       life[i].child = key;
//       if (parent_el > 0){
//         life[i].parent = value[0][hierarchy[parent_el]];
//       }
//       if(child_el == 4) {
//         life[i].value = value.length;
//       }
//       i++;
//     };
    
//     all_data.push.apply(all_data, life);
   
//     console.log(all_data);
//     if (child_el < 4) {
//       all_data = formatData(filteredData, parent_el+1, child_el+1, all_data);
//     }
//     return(all_data);
// }
// const hierarchy = ['life', 'kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'scientificName'];



// THIS SECTION WORKS RECURSIVELY
    updateVis(filteredData, parent_el, child_el) {
      let vis = this;

      let groupedData = d3.group(filteredData, d=>d[hierarchy[child_el]]);
      groupedData.delete('');
      console.log(groupedData);
      let life = Array.from({ length: groupedData.size + 1 } , () => ({ parent: hierarchy[parent_el], child: hierarchy[parent_el], value: null}));
      console.log(life);
      life[0].parent = '';
      let i = 1;
      for (const [key, value] of groupedData.entries()) {
        console.log(key, value);
        life[i].child = key;
        life[i].value = value.length;
        i++;
      };
      console.log(life);

      const root = d3.stratify()
        .id(function(d) { return d.child; })   // Name of the entity (column name is name in csv)
        .parentId(function(d) { return d.parent; })   // Name of the parent (column name is parent in csv)
        (life);
      root.sum(function(d) { return d.value });

      d3.treemap()
        .size([vis.width, vis.height])
        .padding(2)
        (root)

      console.log(root);


      if (!parent_el) {
        vis.path = "";
      }
      
      vis.svg.append("g")
        .append("text")
          .attr("class", "title")
          .attr("x", 10)
          .attr("y", 10) 
          .attr("font-size", "12px")
          .text(vis.path)
    
      vis.rects = vis.chart.selectAll(".rects")
        .data(root.leaves())
        .join("rect")
          .attr("class", "rects")
          .attr('x', function (d) { return d.x0; })
          .attr('y', function (d) { return d.y0; })
          .attr('width', function (d) { return d.x1 - d.x0; })
          .attr('height', function (d) { return d.y1 - d.y0; })
          .attr("fill", function(d,i) {return(vis.colors[i%11])});


      vis.labels = vis.chart.selectAll(".labels")
        .data(root.leaves())
        .join("text")
          .attr("class", "labels")
          .attr("x", function(d){ return d.x0+10})    // +10 to adjust position (more right)
          .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
          .text(function(d){ 
            var string = d.data.child + ": " + d.data.value + " samples";
            if ((d.x1 - d.x0 < string.length * 8) || (d.y1 - d.y0 < 12)) {
              string = "";
            }
            return (string);})
          .style("maxWidth", function (d) { return d.x1 - d.x0; })
          .style("overflow", "hidden")
          .attr("font-size", "12px")
          .attr("fill", "white")


      vis.rects
        .on('click',(event,clicked_d) => {
          if (child_el < 7) {
            console.log(clicked_d);
            filteredData = filteredData.filter(function(d) {return(d[hierarchy[child_el]] == clicked_d.data.child)});

            vis.path  = vis.path + clicked_d.data.child + " -> ";

            console.log(vis.path);
            console.log(filteredData);
            vis.updateVis(filteredData, child_el, child_el+1);
          }
        })
        .on('mousemove', (event,d) => {
          console.log(d);
          d3.select('#tooltip')
              .style('display', 'block')
              .style('left', (event.pageX + 10) + 'px')   
              .style('top', (event.pageY + 10) + 'px')
              .html(`<div class="tooltip"><strong>${d.data.child}</strong> - ${d.data.value} samples</div>`);
          })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        }); 




    	// process data

  
      //vis.renderVis();
    }
  
    renderVis() {
      let vis = this;
  
    }
  }
const hierarchy = ['life', 'kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'scientificName'];