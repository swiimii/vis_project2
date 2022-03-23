


d3.csv('data/occurrences.csv')
.then(data => {
    data.forEach(d => {
	  d.latitude = +d.decimalLatitude; //make sure these are not strings
	  d.longitude = +d.decimalLongitude; //make sure these are not strings
	  d.year = d.year != '' ? +d.year : null;
    d.month = d.month.trim() != '' && d.month.trim() != '0' ? +d.month : '(Unknown)';
	  d.startDayOfYear = d.startDayOfYear != '' ? +d.startDayOfYear : null;
    d.class = d.class != '' ? d.class : '(Unknown)';
    d.recordedBy = d.recordedBy != '' ? d.recordedBy : '(Unknown)';
	  
	  
    });

    console.log(data);//ok, got my data!

    // Initialize chart and then show it
    leafletMap = new LeafletMap({ parentElement: '#my-map'}, data);

    const myBar1 = new BarChart({
      parentElement: 'bar1',
      title: 'Num. of Specimens Per Month of Year',
      yLabel: 'Specimen Count',
    }, data, "month", 0, false, 'legend3');
  
    const myBar2 = new BarChart({
      parentElement: 'bar2',
      title: 'Num. of Specimens Per Class',
      yLabel: 'Specimen Count',
    }, data, "class", 12, true, 'legend4');

    const myBar3 = new BarChart({
      parentElement: 'bar3',
      title: 'Num. of Specimens Collected Per Contributor',
      yLabel: 'Specimen Count',
    }, data, "recordedBy", 12, true, 'legend5');

    timeData = getTimelineData(data);
    timeline = new Timeline({
      'parentElement': '#timeline',
      'containerHeight': 250,
      'containerWidth': 1500
    }, timeData);


    timeline.brush.on("end", function ({ selection }) {
          if (selection) console.log(timeline.brushed(selection));
        });

  })
  .catch(error => console.error(error));

function updateColor(scale)
{
	leafletMap.colorType = scale;
	leafletMap.updateVis();
}

function getTimelineData(data) {
    let timeData = new Array(159);
    for (let i=0; i < timeData.length; i++){
      timeData[i] = {"year": 1859 + i, "count": 0};
    }

    data.forEach(d=>{
      timeData[d.year - 1859].count = timeData[d.year - 1859].count + 1;
    });
    console.log(timeData);
    return (timeData);
}

function resetTimeline(){
    timeline.updateVis();
}
