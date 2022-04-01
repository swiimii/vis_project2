class LeafletMap {

  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
	  legendElement: _config.legendElement,
    }
    this.data = _data;
    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

	vis.svg2 = d3.select(vis.config.legendElement).append('svg')
		.attr('width', 1600)
		.attr('height', 400);
	
    //ESRI
    vis.esriUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    vis.esriAttr = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

    //TOPO
    vis.topoUrl ='https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    vis.topoAttr = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'

    //Thunderforest Outdoors- requires key... so meh... 
    vis.thOutUrl = 'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey={apikey}';
    vis.thOutAttr = '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    //Stamen Terrain
    vis.stUrl = 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}';
    vis.stAttr = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';

    //this is the base map layer, where we are showing the map background
    vis.base_layer = L.tileLayer(vis.esriUrl, {
      id: 'esri-image',
      attribution: vis.esriAttr,
      ext: 'png'
    });
	var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
		attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
	});
	var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	});
	var Stamen_Terrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
		attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		subdomains: 'abcd',
		ext: 'png'
	});
	
	vis.basemaps = {
		  "ESRI": vis.base_layer,
		  "Topography": OpenTopoMap,
		  "Street Map": OpenStreetMap_Mapnik,
		  "Stamen Terrain": Stamen_Terrain
	};

    vis.theMap = L.map('my-map', {
      center: [30, 0],
      zoom: 2,
      layers: [vis.base_layer],
	  selectArea: true
    });
	
	vis.theMap.on('areaselected', (e) => {
		console.log(e.bounds);
		console.log(e.bounds.toBBoxString()); // lon, lat, lon, lat
		vis.filterData(e.bounds.toBBoxString());
	});
	
	L.control.layers(vis.basemaps).addTo(vis.theMap);
	
	vis.colorType = 'year'; //this is used to determine how to color the map using the different color scales
	vis.colorScaleYear = d3.scaleSequential()
		.interpolator(d3.interpolateViridis)
		.domain(d3.extent(vis.data, d => d.year));
		
	vis.colorScaleStartDay = d3.scaleSequential()
		.interpolator(d3.interpolateOranges)
		.domain(d3.extent(vis.data, d => d.startDayOfYear));
	
	vis.colorScaleClass = d3.scaleOrdinal()
		.domain(new Set(vis.data.map(d => d.phylum)))
		.range(d3.schemeAccent);



    //initialize svg for d3 to add to map
    L.svg({clickable:true}).addTo(vis.theMap)// we have to make the svg layer clickable
    vis.overlay = d3.select(vis.theMap.getPanes().overlayPane)
    vis.svg = vis.overlay.select('svg').attr("pointer-events", "auto")

    vis.Dots = vis.svg.selectAll('circle')
                    .data(vis.data) 
                    .join('circle')
                        .attr("fill", function(d){
							switch(vis.colorType)
							{
								case 'year':
									return vis.colorScaleYear(d.year);
									break;
								case 'SD':
									return vis.colorScaleStartDay(d.startDayOfYear);
									break;
								case 'class':
									return vis.colorScaleClass(d.class);
									break;
								default:
									console.log('the fuck you doing');
							}
							})
                        .attr("stroke", "black")
                        //Leaflet has to take control of projecting points. Here we are feeding the latitude and longitude coordinates to
                        //leaflet so that it can project them on the coordinates of the view. Notice, we have to reverse lat and lon.
                        //Finally, the returned conversion produces an x and y point. We have to select the the desired one using .x or .y
                        .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).x)
                        .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).y) 
                        .attr("r", 3)
                        .on('mouseover', function(event,d) { //function to add mouseover event
                            d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                              .duration('150') //how long we are transitioning between the two states (works like keyframes)
                              .attr("fill", "red") //change the fill
                              .attr('r', 4); //change radius

                            //create a tool tip
                            d3.select('#tooltip')
                                .style('display', 'block')
                                .style('z-index', 1000000)
                                  // Format number with million and thousand separator
                                .html(`<div class="tooltip-label"><l> Collector: ${d.recordedBy}</l><br>
										<l>Collection Date ${d.eventDate}</l><br>
										<l>Classification: ${d.higherClassification}</l><br>
										<l>Habitat: ${d.habitat}</l><br>
										<l>Substrate: ${d.substrate}</l></div>`);

                          })
                        .on('mousemove', (event) => {
                            //position the tooltip
                            d3.select('#tooltip')
                             .style('left', (event.pageX + 10) + 'px')   
                              .style('top', (event.pageY + 10) + 'px');
                         })              
                        .on('mouseleave', function() { //function to add mouseover event
                            d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                              .duration('150') //how long we are transitioning between the two states (works like keyframes)
                              .attr("fill", function(d){
									switch(vis.colorType)
									{
										case 'year':
											return vis.colorScaleYear(d.year);
											break;
										case 'SD':
											return vis.colorScaleStartDay(d.startDayOfYear);
											break;
										case 'class':
											return vis.colorScaleClass(d.class);
											break;
										default:
											console.log('the fuck you doing');
									}
									})
                              .attr('r', 3) //change radius

                            d3.select('#tooltip').style('display', 'none');//turn off the tooltip

                          })
                        .on('click', (event, d) => { 
                        		window.open(d.references);
                        //experimental feature I was trying- click on point and then fly to it
                           // vis.newZoom = vis.theMap.getZoom()+2;
                           // if( vis.newZoom > 18)
                           //  vis.newZoom = 18; 
                           // vis.theMap.flyTo([d.latitude, d.longitude], vis.newZoom);
                          });
    
	//legend stuff
	vis.svg2.append("g")
		.attr('class', 'legend')
		.attr('transform', 'translate(1100,20)');
	
	vis.legendClass = d3.legendColor()
		.title('Legend')
		.shape("path", d3.symbol().type(d3.symbolCircle).size(150))
		.shapePadding(10)
		.scale(vis.colorScaleClass)
		.cellFilter(function(d){ return d.label !== '' });
		
	vis.svg2.select('.legend')
		.call(vis.legendClass);

    //handler here for updating the map, as you zoom in and out           
    vis.theMap.on("zoomend", function(){
      vis.updateVis();
    });
	
	//brush stuff
	
	/*document.addEventListener('mousedown', (e) => {
		if (e.button == 2) {vis.theMap.dragging.disable();}
		}
	);

	document.addEventListener('mouseup', (e) => {
		if (e.button == 2)	{ vis.theMap.dragging.enable(); }
		}
	);
	
	vis.brush = d3.brush()
		.filter(function filter(event) {
			return !event.ctrlKey;
		})
		.on("end", vis.brushed);
	vis.svg.append('g')
		.attr('class', 'brush')
		.call(vis.brush);*/
	

  }

  updateVis() {
    let vis = this;

    //want to see how zoomed in you are? 
    // console.log(vis.map.getZoom()); //how zoomed am I
    
    //want to control the size of the radius to be a certain number of meters? 
    vis.radiusSize = 3; 
    // if( vis.theMap.getZoom > 15 ){
    //   metresPerPixel = 40075016.686 * Math.abs(Math.cos(map.getCenter().lat * Math.PI/180)) / Math.pow(2, map.getZoom()+8);
    //   desiredMetersForPoint = 100; //or the uncertainty measure... =) 
    //   radiusSize = desiredMetersForPoint / metresPerPixel;
    // }
   
   //redraw based on new zoom- need to recalculate on-screen position
	vis.Dots
		.data(vis.data)
		.join('circle')
		  .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).x)
		  .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).y)
		  .attr("r", vis.radiusSize)
		  .attr("fill", function(d){
				switch(vis.colorType)
				{
					case 'year':
						return vis.colorScaleYear(d.year);
						break;
					case 'SD':
						return vis.colorScaleStartDay(d.startDayOfYear);
						break;
					case 'class':
						return vis.colorScaleClass(d.class);
						break;
					default:
						console.log('the fuck you doing');
				}
				});
			

	}

  renderVis() {
    let vis = this;

    //not using right now... 
 
  }
  
  filterData(bLatLon)
  {
	  let vis = this;
	  let newData = [];
	  
	  let latlon = bLatLon.split(',');
	  vis.data.filter(function(d) {
		  if(d.decimalLatitude <= parseFloat(latlon[3]) && d.decimalLatitude >= parseFloat(latlon[1]) && d.decimalLongitude >= parseFloat(latlon[0]) && d.decimalLongitude <= parseFloat(latlon[2]))
		  {
			  newData.push(d);
		  }
	  });
	  console.log(newData);
	  updateAllCharts(newData);
	  
  }
  
  
}