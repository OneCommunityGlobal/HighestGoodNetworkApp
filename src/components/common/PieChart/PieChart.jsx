import { useEffect } from 'react';
import * as d3 from 'd3';
import { CHART_RADIUS, CHART_SIZE, pieChartColors } from './constants';
import './PieChart.css'

export const PieChart = ({ data, dataLegend }) => {

  const getCreateSvgPie = () => {
    return d3.select("#pie-chart-container")
      .append("svg")
      .attr("id", "pie-chart")
      .attr("width", CHART_SIZE)
      .attr("height", CHART_SIZE)
      .append("g")
      .attr("transform", `translate(${CHART_SIZE / 2},${CHART_SIZE / 2})`);
  }

  const color = d3.scaleOrdinal()
    .range(pieChartColors);

  const pie = d3.pie().value(d => d[1])


  useEffect(() => {

    const data_ready = pie(Object.entries(data));

    console.log(data);
    console.log(dataLegend);

    getCreateSvgPie()
      .selectAll('whatever')
      .data(data_ready)
      .join('path')
      .attr('d', d3.arc()
        .innerRadius(70)
        .outerRadius(CHART_RADIUS)
      )
      .attr('fill', d => color(d.data[0]))
      .style("opacity", 0.8)

    return () => {
      d3.select("#pie-chart").remove();
    }
  }, [data])

  return (
    <div className='pie-chart-wrapper'>
      <div id="pie-chart-container" className='pie-chart' />
      <div>
        {Object.keys(dataLegend).map((key) => (
          <div key={key} className='pie-chart-legend-item'>
            <div className='data-legend-color' style={{ backgroundColor: color(key) }} />
            {dataLegend[key]}
          </div>
        ))}
      </div>
    </div>
  )
};
