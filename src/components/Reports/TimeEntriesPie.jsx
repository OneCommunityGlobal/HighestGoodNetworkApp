import React from 'react'
import * as d3 from 'd3'
import {Button} from 'react-bootstrap'

const TimeEntriesPie = ({timeEntries}) =>{
  const [show, setShow] = React.useState(false)

  React.useEffect(()=>{
    generateGraph()
  },[show])

  function displayGraph (timeCatVal) {
      console.log('pie vals',timeCatVal,timeCatVal.length)
      if(!show){
        d3.selectAll('#pieplot > *').remove()
      }
      else{
        d3.selectAll('#pieplot > *').remove()
        
        var width = 360;
        var height = 360;
        var radius = Math.min(width, height) / 2;
        var donutWidth = 75;
        var legendRectSize = 18;                                  
        var legendSpacing = 4;                                    

        const color = d3.scaleOrdinal(d3.schemeRdBu[10])

        var svg = d3.select('#pieplot')
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .append('g')
          .attr('transform', 'translate(' + (width / 2) + 
            ',' + (height / 2) + ')');

        var arc = d3.arc()
          .innerRadius(radius - donutWidth)
          .outerRadius(radius);

        var pie = d3.pie()
          .value(function(d) { return d.time; })
          .sort(null);

        var path = svg.selectAll('path')
          .data(pie(timeCatVal))
          .enter()
          .append('path')
          .attr('d', arc)
          .attr('fill', function(d, i) {
            console.log('inn',d.data.project,color(d.data.project)) 
            return color(d.data.project)
          });

        }
      }
  
  const generateGraph = () => {

    let timeCatDict = {}
    let timeCatVal = []

    if(timeEntries.period){
      for(let i = 0; i < timeEntries.period.length; i++){
        let convertedHours = parseInt(timeEntries.period[i].hours) + (timeEntries.period[i].minutes === '0' ? 0 : parseInt(timeEntries.period[i].minutes)/60)
        if(timeEntries.period[i].projectName in timeCatDict){
          timeCatDict[timeEntries.period[i].projectName].time += convertedHours
        }
        else{
          timeCatDict[timeEntries.period[i].projectName] = {time: convertedHours,}
        }
      }
    }

    let counter = 0
    for(var key in timeCatDict){
      timeCatVal.push({id: counter, project: key, time: timeCatDict[key].time})
      counter += 1
    }

    displayGraph(timeCatVal)

  }

  return (
      <div>
          <Button onClick={() => setShow(!show)} aria-expanded={show}>Show Time Entries Pie Chart</Button>
          <div id="pieplot"></div>
      </div>
  )


}

export default TimeEntriesPie