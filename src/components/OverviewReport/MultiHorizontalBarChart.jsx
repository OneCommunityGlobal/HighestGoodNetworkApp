import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 *
 * @param {*}
 * data, dataKeys -- data is the overall data object including the label: e.g this week, last week etc.
 * dataKeys is an array of the keys inside data, excluding the label key
 *
 * Nested objects will be inside the data object, containing the total number of people as well as the percentage of the total.
 * e.g {exampleKey: {total: 100, percentage: 15}}
 * @returns an SVG containing the MultiHorizontalBarChart
 */
function MultiHorizontalBarChart({ data, dataKeys }) {
  const svgRef = useRef(null);

  useEffect(() => {
    const margin = { top: 30, right: 50, bottom: 70, left: 80 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 600 300`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // const x = d3
    //   .scaleLinear()
    //   .domain([0, 100])
    //   .range([0, width]);
    // const y = d3
    //   .scaleBand()
    //   .domain(data.map(d => d.label))
    //   .range([0, height])
    //   .padding(0.3);
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d3.max(dataKeys.map(key => d[key].percentage)))])
      .range([0, width]);
    const y = d3
      .scaleBand()
      .domain(data.map(d => d.label))
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

    dataKeys.forEach((key, index) => {
      barGroup
        .append('rect')
        .attr('class', `${key}-bar`)
        .attr('y', d => y(d.label) + (index * y.bandwidth()) / dataKeys.length)
        .attr('height', y.bandwidth() / dataKeys.length)
        .attr('width', d => x(d[key].percentage))
        .attr('fill', index % 2 === 0 ? 'green' : 'red')
        .attr('transform', () => `translate(0, ${y.bandwidth() / 10})`);

      barGroup
        .append('text')
        .attr('class', 'value-text')
        .attr('x', d => x(d[key].percentage) + 5)
        .attr('y', d => y(d.label) + ((index + 1.5) * y.bandwidth()) / dataKeys.length)
        .text(d => `${d[key].total}`);
    });

    const legend = svg.append('g').attr('transform', `translate(0, ${height + 40})`);

    dataKeys.forEach((key, index) => {
      legend
        .append('rect')
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', index % 2 === 0 ? 'green' : 'red')
        .attr('x', 0 + 100 * index);

      legend
        .append('text')
        .attr('x', 30 + 100 * index)
        .attr('y', 15)
        .text(key);
    });

    // barGroup
    //   .append('rect')
    //   .attr('class', 'with-tasks')
    //   .attr('y', d => y(d.week))
    //   .attr('height', y.bandwidth() / 2)
    //   .attr('width', d => x(d.withTasks))
    //   .attr('fill', 'green');

    // barGroup
    //   .append('rect')
    //   .attr('class', 'without-tasks')
    //   .attr('y', d => y(d.week) + y.bandwidth() / 2)
    //   .attr('height', y.bandwidth() / 2)
    //   .attr('width', d => x(d.withoutTasks))
    //   .attr('fill', 'red')
    //   .attr('transform', () => `translate(0, ${y.bandwidth() / 10})`);

    // barGroup
    //   .append('text')
    //   .attr('class', 'value-text')
    //   .attr('x', d => x(d.withTasks) + 5)
    //   .attr('y', d => y(d.week) + y.bandwidth() / 4)
    //   .text(d => `${d.withTasks}%`);

    // barGroup
    //   .append('text')
    //   .attr('class', 'value-text')
    //   .attr('x', d => x(d.withoutTasks) + 5)
    //   .attr('y', d => y(d.week) + (y.bandwidth() * 3) / 4)
    //   .text(d => `${d.withoutTasks}%`);

    // const legend = svg.append('g').attr('transform', `translate(0, ${height + 40})`);

    // legend
    //   .append('rect')
    //   .attr('width', 20)
    //   .attr('height', 20)
    //   .attr('fill', 'green')
    //   .attr('x', 0);
    // legend
    //   .append('text')
    //   .attr('x', 30)
    //   .attr('y', 15)
    //   .text('With tasks');

    // legend
    //   .append('rect')
    //   .attr('width', 20)
    //   .attr('height', 20)
    //   .attr('fill', 'red')
    //   .attr('x', 120);
    // legend
    //   .append('text')
    //   .attr('x', 150)
    //   .attr('y', 15)
    //   .text('Without tasks');
  }, [data, dataKeys]);

  return <svg ref={svgRef} />;
}

export default MultiHorizontalBarChart;
