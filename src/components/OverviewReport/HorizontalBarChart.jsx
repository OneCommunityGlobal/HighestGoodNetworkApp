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

    const xAxis = d3
      .axisTop(xScale)
      .ticks(10) // Adjust number of ticks as needed
      .tickFormat(d => `${d}%`);

    const yAxis = d3.axisLeft(yScale);

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);

    const bars = svg
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar-group');

    bars
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => yScale(d.label))
      .attr('width', d => xScale(d.value))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => (d.label === 'In Teams' ? 'green' : 'red'));

    // Adding text labels at the end of each bar
    bars
      .append('text')
      .attr('class', 'bar-value')
      .attr('x', d => xScale(d.value) + 5) // Offset text a little right of the bar end
      .attr('y', d => yScale(d.label) + yScale.bandwidth() / 2) // Vertically center text
      .attr('dy', '.35em') // Adjust vertical alignment here
      .text(d => `${d.value}`); // Display the value
  }, [data, width, height]);

  return <svg ref={svgRef} />;
}

export default HorizontalBarChart;
