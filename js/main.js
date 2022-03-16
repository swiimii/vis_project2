


d3.csv('data/occurrences.csv')
.then(data => {
    data.forEach(d => {
	  d.latitude = +d.decimalLatitude; //make sure these are not strings
	  d.longitude = +d.decimalLongitude; //make sure these are not strings
	  d.year = d.year != '' ? +d.year : null;
    d.month = d.month != '' ? +d.month : null;
	  d.startDayOfYear = d.startDayOfYear != '' ? +d.startDayOfYear : null;
	  
	  
    });

    console.log(data);//ok, got my data!

    // Initialize chart and then show it
    leafletMap = new LeafletMap({ parentElement: '#my-map'}, data);

    const myBar1 = new BarChart({
      parentElement: 'bar1',
    }, data, "month", 12, 'legend3');
  
    const myBar2 = new BarChart({
      parentElement: 'bar2',
    }, data, "class", 12, 'legend4');

    const myBar3 = new BarChart({
      parentElement: 'bar3',
    }, data, "recordedBy", 12, 'legend5');


  })
  .catch(error => console.error(error));

function updateColor(scale)
{
	leafletMap.colorType = scale;
	leafletMap.updateVis();
}
