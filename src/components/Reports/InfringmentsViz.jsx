import React from 'react'
import * as d3 from 'd3'
import {Button, Modal} from 'react-bootstrap'
import './PeopleReport.css';

const InfringmentsViz = ({infringments, fromDate, toDate}) =>{
  const [show, setShow] = React.useState(false)
  const [modalShow, setModalShow] = React.useState(false)
  const [focusedInf, setFocusedInf] = React.useState({})


  const handleModalClose = () => {
    setModalShow(false)
    setFocusedInf({})
  }
  const handleModalShow = (d) => {
    setFocusedInf(d)
    setModalShow(true)
  }

  React.useEffect(()=>{
    generateGraph()
  },[show, fromDate, toDate])

  function displayGraph (bsCount, maxSquareCount) {
        if(!show){
          d3.selectAll('#infplot > *').remove()
        }
        else{
          d3.selectAll('#infplot > *').remove()
          d3.selectAll('#tlplot > *').remove()
          const margin = {top: 10, right: 30, bottom: 30, left: 60},
          width = 1000 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

          const svg = d3.select("#infplot")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform",`translate(${margin.left},${margin.top})`);

          const x = d3.scaleTime()
          .domain(d3.extent(bsCount, d => d.date))
          .range([ 0, width ]);
          svg.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(x));

          const y = d3.scaleLinear()
          .domain( [0, maxSquareCount + 2])
          .range([ height, 0 ]);
          svg.append("g")
          .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format("d")));

          svg.append("path")
          .datum(bsCount)
          .attr("fill", "none")
          .attr("stroke", "black")
          .attr("stroke-width", 1.5)
          .attr("d", d3.line()
            .x(d => x(d.date))
            .y(d => y(d.count)))
            
          const Tooltip = d3.select("#infplot")
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
              .html("Exact date: " + d3.timeFormat("%A, %B %e, %Y")(d.date) + "<br>" + "Count: " + d.count + "<br>" + "Description: " + d.des[0])
              .style("left", `${event.pageX+10}px`)
              .style("top", `${event.pageY}px`)
              .style('width',"500px")
          }
          const mouseleave = function(event,d) {
            Tooltip
              .style("opacity", 0)
          }

          const handleClick = function(event, d) {
            console.log("click",d)
            handleModalShow(d)
          }

          svg
          .append("g")
          .selectAll("dot")
          .data(bsCount)
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
            .on("click", handleClick)
          }
      }
  
      const generateGraph = () => {
        let dict = {}
        let value = []
        let maxSquareCount = 0

        //aggregate infringments
        for (let i = 0; i < infringments.length; i++) {
          if (infringments[i].date in dict){
            dict[infringments[i].date].ids.push(infringments[i]._id)
            dict[infringments[i].date].count+=1
            dict[infringments[i].date].des.push(infringments[i].description)
          }else{
            dict[infringments[i].date]={ids:[infringments[i]._id],count:1,des:[infringments[i].description]}
          }
        }

        //filter infringments by date
        if ((fromDate == '') || (toDate == '')){
          for (var key in dict) {
              value.push({date: d3.timeParse("%Y-%m-%d")(key.toString()),des:dict[key].des,count:dict[key].count,type: 'Infringment',ids: dict[key].ids})
              if(dict[key].count > maxSquareCount){
                maxSquareCount = dict[key].count 
              }
          }
        }
        else{
          for (var key in dict) {
            if((Date.parse(fromDate) <= Date.parse(key.toString())) & (Date.parse(key.toString()) <= Date.parse(toDate))){
              value.push({date: d3.timeParse("%Y-%m-%d")(key.toString()),des:dict[key].des,count:dict[key].count,type: 'Infringment',ids: dict[key].ids})
              if(dict[key].count > maxSquareCount){
                maxSquareCount = dict[key].count 
              }
            }
          }
        }

        console.log('INFvalues',value)

        displayGraph(value, maxSquareCount)

      }

  return (
    <div>
          <Button onClick={() => setShow(!show)} aria-expanded={show}>Show Infringments Graph</Button>
          <div id="infplot"></div>

          <Modal size="lg" show={modalShow} onHide={handleModalClose}>
            <Modal.Header closeButton>
              <Modal.Title>{focusedInf.date ? focusedInf.date.toString() : "Infringment"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <table id="inf">
                <thead>
                  <tr>
                    <th>Descriptions</th>
                  </tr>
                  <tbody>
                    {focusedInf.des ? focusedInf.des.map((desc) => (
                      <tr>
                        <td>{desc}</td>
                      </tr>
                    )) : focusedInf.des}
                  </tbody>
                </thead>

              </table>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleModalClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
    </div>
  )


}

export default InfringmentsViz