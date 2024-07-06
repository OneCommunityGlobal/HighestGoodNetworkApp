import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const DonutChart = ({ data, width, height, innerRadius, outerRadius, totalText, colors }) => {
  const ref = useRef();

  useEffect(() => {
    // Clear any previous svg elements
    d3.select(ref.current)
      .selectAll('*')
      .remove();

    const expandedRadius = outerRadius + 10;

    const svg = d3
      .select(ref.current)
      .attr('viewBox', `0 0 ${width + 200} ${height + 100}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${(width + 200) / 2 - 100}, ${(height + 100) / 2})`);

    const colorScale = d3
      .scaleOrdinal()
      .domain(data.map(d => d.label))
      .range(colors);

    const pie = d3.pie().value(d => d.value);

    const arc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const arcs = svg
      .selectAll('arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => colorScale(d.data.label))
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr(
            'd',
            d3
              .arc()
              .innerRadius(innerRadius)
              .outerRadius(expandedRadius),
          );
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc);
      });

    arcs
      .append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .style('font-size', `${Math.min(width, height) * 0.03}px`)
      .text(d => d.data.value);

    arcs
      .append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('dy', '1.0em')
      .style('font-size', `${Math.min(width, height) * 0.025}px`)
      .text(d => `(${((d.data.value / d3.sum(data, d => d.value)) * 100).toFixed(2)}%)`);

    // Append the total text in the center
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('font-size', `${Math.min(width, height) * 0.04}px`)
      .text(totalText);

    // Create legend
    const legend = svg
      .selectAll('.legend')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(${outerRadius + 50}, ${i * 25 - height / 4 + 20})`);

    legend
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', (d, i) => colorScale(d.label));

    legend
      .append('text')
      .attr('x', 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'start')
      .style('font-size', '12px')
      .text(d => d.label);
  }, [data, width, height, innerRadius, outerRadius, totalText, colors]);

  return <svg ref={ref} style={{ maxWidth: '100%', height: 'auto' }} />;
};

export default DonutChart;
