let allData;
let filteredData;

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

    //This is inefficient but I'm not sure what else to do please help
    allData = data;
    filteredData = data;

    // Initialize chart and then show it
    leafletMap = new LeafletMap({ parentElement: '#my-map', legendElement: '#map-legend' }, data);

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
      'containerWidth': 1600
    }, timeData);

    missingData = new stackedBar({
      'parentElement': '#stacked-bar',
      'containerHeight': 300,
      'containerWidth': 300
    }, data);

    tree = new Tree({
      'parentElement':'#tree',
      'containerHeight':435,
      'containerWidth':800
    }, data);

    timeline.brush.on("end", function ({ selection }) {
          if (selection) { 
            brushedYrs = timeline.brushed(selection);
            filteredData = filteredData.filter(function(d) {return(d.year >= brushedYrs[0] && d.year <= brushedYrs[1])});

            //Should probably get moved to a function
            missingData.data = filteredData;
            missingData.updateVis();
            leafletMap.data = filteredData;
            leafletMap.updateVis();
            UpdateBarCharts(filteredData);
            leafletMap.data = filteredData;
            leafletMap.updateVis();
            tree.updateVis(filteredData, 0, 1);
          }
        });

    
  })
  .catch(error => console.error(error));

  
function updateColor(scale)
{
	leafletMap.colorType = scale;
	leafletMap.updateVis(scale);
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
  missingData.data = allData;
  missingData.updateVis();
  UpdateBarCharts();
  timeline.data = getTimelineData(allData);
  timeline.updateVis();
  leafletMap.data = allData;
  leafletMap.updateVis();
  tree.updateVis(allData, 0, 1);
  filteredData = allData;

}

function UpdateAllCharts(data = null) {
  UpdateBarCharts(data);
  if (data == null) {
    data = allData
  } 
  missingData.data = data;
  missingData.updateVis();
  timeline.data = getTimelineData(data);
  timeline.updateVis();
  leafletMap.data = data;
  leafletMap.updateVis();
  tree.updateVis(data, 0, 1);
  filteredData = data;

}
