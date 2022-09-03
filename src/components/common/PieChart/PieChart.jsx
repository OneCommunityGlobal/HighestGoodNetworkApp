import { useEffect } from 'react';
import * as d3 from 'd3';

const CHART_SIZE = 280;
const CHART_MARGIN = 40;
const CHART_RADIUS = CHART_SIZE / 2 - CHART_MARGIN;

export const PieChart = ({ data }) => {

  const getCreateSvgPie = () => {
    return d3.select("#pie-chart-container")
      .append("svg")
      .attr("id", "pie-chart")
      .attr("width", CHART_SIZE)
      .attr("height", CHART_SIZE)
      .append("g")
      .attr("transform", `translate(${CHART_SIZE / 2},${CHART_SIZE / 2})`);
  }


  useEffect(() => {

    const pie = d3.pie()
      .value(d => d[1])

    const color = d3.scaleOrdinal()
      .range(["rgb(255, 94, 130)", "rgb(179, 104, 210)", "rgb(100, 183, 255)", "rgb(255, 219, 86)", "rgb(94, 255, 219)", "rgb(255, 158, 180)", "rgb(255, 145, 69)", "rgb(0, 146, 178)"]);

    const data_ready = pie(Object.entries(data));

    const svgPie = getCreateSvgPie();

    svgPie
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

  return <div id="pie-chart-container" className='pie-chart' />
};
