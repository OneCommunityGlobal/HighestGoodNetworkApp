import React from 'react'
import * as d3 from 'd3/dist/d3.min'
import {Button} from 'react-bootstrap'

const TimeEntriesViz = ({timeEntries, fromDate, toDate}) =>{
  const [show, setShow] = React.useState(false)

  React.useEffect(()=>{
    generateGraph()
  },[show, fromDate, toDate])

  function displayGraph (logs, maxHoursCount) {
      if(!show){
        d3.selectAll('#tlplot > *').remove()
      }
      else{
        d3.selectAll('#tlplot > *').remove()
        d3.selectAll('#infplot > *').remove()
        const margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 1000 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

        const svg = d3.select("#tlplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",`translate(${margin.left},${margin.top})`);

        const x = d3.scaleTime()
        .domain(d3.extent(logs, d => d.date))
        .range([ 0, width ]);
        svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

        const y = d3.scaleLinear()
        .domain( [0, maxHoursCount + 2])
        .range([ height, 0 ]);
        svg.append("g")
        .call(d3.axisLeft(y));

        svg.append("path")
        .datum(logs)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(d => x(d.date))
          .y(d => y(d.count)))
          
        const Tooltip = d3.select("#tlplot")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        
        const mouseover = function(event,d) {
          Tooltip
            .style("opacity", 1)
        }
        const mousemove = function(event,d) {
          Tooltip
            .html("Exact date: " + d3.timeFormat("%A, %B %e, %Y")(d.date) + "<br>" + "Count: " + d.count)
            .style("left", `${event.pageX+10}px`)
            .style("top", `${event.pageY}px`)
        }
        const mouseleave = function(event,d) {
          Tooltip
            .style("opacity", 0)
        }

        svg
        .append("g")
        .selectAll("dot")
        .data(logs)
        .join("circle")
          .attr("class", "myCircle")
          .attr("cx", d => x(d.date))
          .attr("cy", d => y(d.count))
          .attr("r", 3)
          .attr("stroke", "#69b3a2")
          .attr("stroke-width", 3)
          .attr("fill", "white")
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseleave", mouseleave)
        }
      }
  
      const generateGraph = () => {
        let timeEntriesDict = {}      
        let timeEntryvalues = []
        let maxHoursCount = 0
        
        //aggregate entries
        if (timeEntries.period){
          for (let i = 0; i < timeEntries.period.length; i++ ){
            let convertedHours = parseInt(timeEntries.period[i].hours) + (timeEntries.period[i].minutes === '0' ? 0 : parseInt(timeEntries.period[i].minutes)/60)
            if(timeEntries.period[i].dateOfWork in timeEntriesDict){
              timeEntriesDict[timeEntries.period[i].dateOfWork].time += convertedHours
              timeEntriesDict[timeEntries.period[i].dateOfWork].des.push(timeEntries.period[i].notes)
  
            }
            else{
              timeEntriesDict[timeEntries.period[i].dateOfWork] = {time: convertedHours,
                                                                          isTangible: [[timeEntries.period[i].isTangible, convertedHours]],
                                                                          des: [timeEntries.period[i].notes]
                                                                              }
            }
          }
        }

        //filter time entries by date
        if ((fromDate == '') || (toDate == '')){
          for(var key in timeEntriesDict){
            timeEntryvalues.push({date: d3.timeParse("%Y-%m-%d")(key.toString()),count: timeEntriesDict[key].time ,des:timeEntriesDict[key].des, isTangible: timeEntriesDict[key].isTangible, type: 'Entry'})
            if(timeEntriesDict[key].time > maxHoursCount){
              maxHoursCount = timeEntriesDict[key].time
            }
        }
        }
        else{
          for(var key in timeEntriesDict){
            if((Date.parse(fromDate) <= Date.parse(key.toString())) & (Date.parse(key.toString()) <= Date.parse(toDate))){
              timeEntryvalues.push({date: d3.timeParse("%Y-%m-%d")(key.toString()),count: timeEntriesDict[key].time ,des:timeEntriesDict[key].des, isTangible: timeEntriesDict[key].isTangible,type: 'Entry'})
              if(timeEntriesDict[key].time > maxHoursCount){
                maxHoursCount = timeEntriesDict[key].time
              }
            }
          }
        }

        timeEntryvalues.sort(function(a,b){
          return new Date(b.date) - new Date(a.date)
        })

        displayGraph(timeEntryvalues, maxHoursCount)

      }

  return (
      <div>
          <Button onClick={() => setShow(!show)} aria-expanded={show}>Show Time Entries Graph</Button>
          <div id="tlplot"></div>
      </div>
  )


}

export default TimeEntriesViz