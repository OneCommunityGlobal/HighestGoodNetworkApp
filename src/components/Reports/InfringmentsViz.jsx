import React from 'react'
import * as d3 from 'd3/dist/d3.min'
import {Button, Modal} from 'react-bootstrap'
import './PeopleReport/PeopleReport.css';

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
            const margin = {top: 10, right: 30, bottom: 30, left: 60},
            width = 1000 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

            var tooltipEl = function(d) {
              return (
                '<div class="tip__container">' +
                '<div class="close">' +
                "<button>&times</button>" +
                "</div>" +
                '<div>' +
                "Exact date: " + d3.timeFormat("%A, %B %e, %Y")(d.date) + "<br>" + "Count: " + (d.count == 1 ? d.count : (d.count + ` <span class="detailsModal"><a>See All</a></span>`)) + "<br>" + "Description: " + d.des[0] +
                "</div>" +
                '</div>' 
              )
            }

            var legendEl = function(){
              return(
                '<div class="lengendSubContainer">' +
                  '<div class="infLabelsOff">' +
                      '<button>Labels Off</button>' +
                  '</div>' +
                  '<div class="infCountLabelsOn">' +
                      '<button>Show Squares</button>' +
                  '</div>' +
                  '<div class="infDateLabelsOn">' +
                      '<button>Show Dates</button>' +
                  '</div>' +
                '</div>'
              )
            }

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
              .on('click', function(event, d) {

                let prevTooltip = d3.select(`.inf${d.id}`)
    
                if (prevTooltip.empty()){
                  let Tooltip = d3.select("#infplot")
                  .append("div")
                  .style("opacity", 0)
                  .attr("class", `tooltip inf${d.id}`)
                  .style("background-color", "white")
                  .style("border", "solid")
                  .style("border-width", "2px")
                  .style("border-radius", "5px")
                  .style("padding", "5px")
                  .style('max-width',"500px")
                  .style('z-index',1000)
                  
                  Tooltip.html(tooltipEl(d))
                  .style("left", `${event.pageX+10}px`)
                  .style("top", `${event.pageY}px`)
                  .style("opacity", 1)
      
                  Tooltip.select(".close").on("click", function() {
                    Tooltip.remove()
                  });

                  Tooltip.select(".detailsModal").on("click", function(){
                    handleModalShow(d)
                  })
                }
              })
          
            svg.append("g").selectAll("text")
            .data(bsCount)
            .join("text")
              .attr("class", "infCountLabel")
              .attr("x", d => x(d.date) + 10)
              .attr("y", d => y(d.count) - 5)
              .attr("fill", "black")
              .style('z-index',999)
              .style('font-weight',700)
              .style('display','none')
              .text(d => parseInt(d.count))
  
            svg.append("g").selectAll("text")
            .data(bsCount)
            .join("text")
              .attr("class", "infDateLabel")
              .attr("x", d => x(d.date) + 10)
              .attr("y", d => y(d.count) - 5)
              .attr("fill", "black")
              .style('z-index',999)
              .style('font-weight',700)
              .style('display','none')
              .text(d => d3.timeFormat("%m/%d/%Y")(d.date))

            let legend = d3.select("#infplot")
            .append("div")
            .attr("class", "legendContainer")
            .style("position","relative")
            .style("top",`-450px`)
            .style("left",`980px`)
            // .style("top",`-${height + margin.top + margin.bottom + 10}px`)
            // .style("left",`${width - 110}px`)
  
            legend.html(legendEl())
  
            legend.select(".infLabelsOff").on("click", function(){
              d3.selectAll(".infCountLabel").style("display","none")
              d3.selectAll(".infDateLabel").style("display","none")
            })
  
            legend.select(".infCountLabelsOn").on("click", function(){
              d3.selectAll(".infCountLabel").style("display","block")
              d3.selectAll(".infDateLabel").style("display","none")
            })
  
            legend.select(".infDateLabelsOn").on("click", function(){
              d3.selectAll(".infDateLabel").style("display","block")
              d3.selectAll(".infCountLabel").style("display","none")
            }) 
          
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
        if ((fromDate == '') || (toDate == '')){ //condition no longer needed
          for (var key in dict) {
              value.push({date: d3.timeParse("%Y-%m-%d")(key.toString()),des:dict[key].des,count:dict[key].count,type: 'Infringment',ids: dict[key].ids})
              if(dict[key].count > maxSquareCount){
                maxSquareCount = dict[key].count 
              }
          }
        }
        else{
          let counter = 0
          for (var key in dict) {
            if((Date.parse(fromDate) <= Date.parse(key.toString())) & (Date.parse(key.toString()) <= Date.parse(toDate))){
              value.push({id: counter,date: d3.timeParse("%Y-%m-%d")(key.toString()),des:dict[key].des,count:dict[key].count,type: 'Infringment',ids: dict[key].ids})
              if(dict[key].count > maxSquareCount){
                maxSquareCount = dict[key].count 
              }
            counter += 1
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
