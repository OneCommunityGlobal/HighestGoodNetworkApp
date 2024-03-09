import { useEffect, useState } from 'react';
import * as d3 from 'd3/dist/d3.min';
import { CHART_RADIUS, CHART_SIZE } from './constants';
import { generateArrayOfUniqColors } from './colorsGenerator';
import './PieChart.css';


export const PieChart = ({ data, dataLegend, pieChartId, dataLegendHeader }) => {
  const [totalHours, setTotalHours] = useState(0);
  const [colors] = useState(generateArrayOfUniqColors(Object.keys(data).length));
  // create the pie chart
  const getCreateSvgPie = totalValue => {
    var svg = d3
      .select(`#pie-chart-container-${pieChartId}`)
      .append('svg')
      .attr('id', `pie-chart-${pieChartId}`)
      .attr('width', CHART_SIZE)
      .attr('height', CHART_SIZE)
      .append('g')
      .attr('transform', `translate(${CHART_SIZE / 2},${CHART_SIZE / 2})`)
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .text(totalValue.toFixed(2))
    return svg;
  };
  const color = d3.scaleOrdinal().range(colors);
  const pie = d3.pie().value(d => d[1]);
  useEffect(() => {
    const data_ready = pie(Object.entries(data));
    const name = Object.keys(dataLegend).map(key => {
      return dataLegend[key][0];
    });

    let totalValue = data_ready
      .map(obj => obj.value)
      .reduce((a, c) => {
        return a + c;
      }, 0);
    setTotalHours(totalValue);
    var div = d3.select(".tooltip-donut");
    if (div.empty()) {
      div = d3.select("body").append("div")
        .attr("class", "tooltip-donut")
        .style("opacity", 0)
        .style("position", "absolute") // Ensure the tooltip uses absolute positioning
        .style("pointer-events", "none"); // Prevents the tooltip from interfering with mouse events
    }
    getCreateSvgPie(totalValue)
      .selectAll('whatever')
      .data(data_ready)
      .join('path')
      .attr(
        'd',
        d3
          .arc()
          .innerRadius(70)
          .outerRadius(CHART_RADIUS),
      )
      .attr('fill', d => color(d.data[0]))
      .on('mouseover', function (d, i) {
        d3.select(this).transition()
          .duration('50')
          .attr('opacity', '.5')
        div.transition()
          .duration(50)
          .style("opacity", 1)
          .style("visibility", "visible");
        const taskName = Object.keys(dataLegend).map(key => {
          return dataLegend[key][0];
        });
        const index = Object.keys(dataLegend).map(function (e) { return e; }).indexOf(i.data[0]);
        let legendInfo = taskName[index].toString()
        div.html(legendInfo)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 15) + "px");

      })
      .on('mouseout', function (d, i) {
        d3.select(this).transition()
          .duration('50')
          .attr('opacity', '.85')
        div.transition()
          .duration('50')
          .style("opacity", 0)
          .on("end", function () {
            d3.select(this).style("visibility", "hidden"); // Hide after transition
          });

      });




    return () => {
      d3.select(`#pie-chart-${pieChartId}`).remove();
    };
  }, [data]);

  return (
    <div className="pie-chart-wrapper">
      <div id={`pie-chart-container-${pieChartId}`} className="pie-chart" />
      <div>
        <div className="pie-chart-legend-header">
          <div>Name</div>
          <div>{dataLegendHeader}</div>
        </div>
        {Object.keys(dataLegend).map(key => (
          <div key={key} className="pie-chart-legend-item">
            <div className="data-legend-color" style={{ backgroundColor: color(key) }} />
            <div className="data-legend-info">
              {dataLegend[key].map((legendPart, index) => (
                <div className="data-legend-info-part" key={index}>{legendPart}</div>
              ))}
            </div>
          </div>
        ))}
        <div className="data-total-value">Total Hours : {totalHours.toFixed(2)}</div>
      </div>
    </div>
  );
};
