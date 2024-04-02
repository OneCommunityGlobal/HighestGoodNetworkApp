import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function MultiHorizontalBarChart({ data }) {
  const svgRef = useRef(null);

  useEffect(() => {
    const margin = { top: 30, right: 30, bottom: 70, left: 80 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleLinear()
      .domain([0, 100])
      .range([0, width]);
    const y = d3
      .scaleBand()
      .domain(data.map(d => d.week))
      .range([0, height])
      .padding(0.3);

    svg.append('g').call(
      d3
        .axisTop(x)
        .ticks(10)
        .tickFormat(d => `${d}%`),
    );
    svg.append('g').call(d3.axisLeft(y));

    const barGroup = svg
      .selectAll('.bar-group')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar-group');

    barGroup
      .append('rect')
      .attr('class', 'with-tasks')
      .attr('y', d => y(d.week))
      .attr('height', y.bandwidth() / 2)
      .attr('width', d => x(d.withTasks))
      .attr('fill', 'green');

    barGroup
      .append('rect')
      .attr('class', 'without-tasks')
      .attr('y', d => y(d.week) + y.bandwidth() / 2)
      .attr('height', y.bandwidth() / 2)
      .attr('width', d => x(d.withoutTasks))
      .attr('fill', 'red')
      .attr('transform', () => `translate(0, ${y.bandwidth() / 10})`);

    barGroup
      .append('text')
      .attr('class', 'value-text')
      .attr('x', d => x(d.withTasks) + 5)
      .attr('y', d => y(d.week) + y.bandwidth() / 4)
      .text(d => `${d.withTasks}%`);

    barGroup
      .append('text')
      .attr('class', 'value-text')
      .attr('x', d => x(d.withoutTasks) + 5)
      .attr('y', d => y(d.week) + (y.bandwidth() * 3) / 4)
      .text(d => `${d.withoutTasks}%`);

    const legend = svg.append('g').attr('transform', `translate(0, ${height + 40})`);

    legend
      .append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', 'green')
      .attr('x', 0);
    legend
      .append('text')
      .attr('x', 30)
      .attr('y', 15)
      .text('With tasks');

    legend
      .append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', 'red')
      .attr('x', 120);
    legend
      .append('text')
      .attr('x', 150)
      .attr('y', 15)
      .text('Without tasks');
  }, []);

  return <svg ref={svgRef} />;
}

export default MultiHorizontalBarChart;
