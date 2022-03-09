


d3.csv('data/occurrences.csv')
.then(data => {
    data.forEach(d => {
	  d.latitude = +d.decimalLatitude; //make sure these are not strings
	  d.longitude = +d.decimalLongitude; //make sure these are not strings
	  d.year = d.year != '' ? +d.year : null;
	  d.startDayOfYear = d.startDayOfYear != '' ? +d.startDayOfYear : null;
	  
	  
    });

    console.log(data);//ok, got my data!

    // Initialize chart and then show it
    leafletMap = new LeafletMap({ parentElement: '#my-map'}, data);


  })
  .catch(error => console.error(error));

function updateColor(scale)
{
	leafletMap.colorType = scale;
	leafletMap.updateVis();
}
