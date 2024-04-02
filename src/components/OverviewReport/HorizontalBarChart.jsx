import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function HorizontalBarChart({ data, width, height }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data) return;

    const margin = { top: 50, right: 30, bottom: 30, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3
      .scaleLinear()
      .domain([0, (d3.max(data, d => d.value) / 10 + 1) * 10])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerHeight])
      .padding(0.1);

    // const xAxis = d3.axisTop(xScale);
    const xAxis = d3
      .axisTop(xScale)
      .ticks(10) // Adjust number of ticks as needed
      .tickFormat(d => `${d}%`);

    const yAxis = d3.axisLeft(yScale);

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const chart = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    chart.append('g').call(xAxis);

    chart.append('g').call(yAxis);

    chart
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => yScale(d.label))
      .attr('width', d => xScale(d.value))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => (d.label === 'In Teams' ? 'green' : 'red'));
  }, [data, width, height]);

  return <svg ref={svgRef} />;
}

export default HorizontalBarChart;
