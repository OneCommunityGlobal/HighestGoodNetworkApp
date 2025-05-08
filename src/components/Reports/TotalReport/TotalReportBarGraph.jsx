import { useEffect } from 'react';
import * as d3 from 'd3/dist/d3.min';
import './TotalReportBarGraph.css';

function TotalReportBarGraph({ barData, range }) {
  const svgId = `svg-container-${range}`;

  const drawChart = (data) => {
    data.sort((a, b) => (a.label > b.label ? 1 : -1));

    const svgWidth = 500;
    const svgHeight = 450;             
    const margin = { top: 10, right: 8, bottom: 100, left: 20 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const maxValue = Math.max(...data.map(d => d.value));

    const svg = d3
      .select(`#${svgId}`)
      .attr('width', svgWidth)
      .attr('height', svgHeight);

    svg.selectAll('*').remove();

    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(data.map(d => d.label))
      .range([0, width])
      .padding(0.4);

    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([height, 0]);

    const colorScale = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range(['darksalmon', 'darkslateblue']);

    data.forEach(d => {
      const x = xScale(d.label);
      const barHeight = height - yScale(d.value);
      const y = yScale(d.value);

     
      chart
        .append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', xScale.bandwidth())
        .attr('height', barHeight)
        .attr('fill', colorScale(d.value));

    
      const yText =
        barHeight >= 30
          ? y + barHeight / 2
          : 
            y - 10;

      chart
        .append('text')
        .attr('x', x + xScale.bandwidth() / 2)
        .attr('y', yText)
        .attr('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .text(Number.isNaN(d.value) ? '' : d.value);
    });

   
    chart
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'black');
  };

  useEffect(() => {
    if (barData && barData.length) {
      drawChart(barData);
    }
  }, [barData]);

  return (
    <div className="svg-container">
      <svg id={svgId} className="svg-chart" />
    </div>
  );
}

export default TotalReportBarGraph;
