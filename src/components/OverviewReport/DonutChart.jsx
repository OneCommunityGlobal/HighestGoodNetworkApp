import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function DonutChart({ legendHeading, data, width, height, total }) {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const radius = Math.min(width, height) / 2;
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const legendRectSize = 18;
    const legendSpacing = 4;

    const pie = d3.pie().value(d => d.value);
    const dataReady = pie(data);

    const arc = d3
      .arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius * 0.8);

    svg
      .selectAll('path')
      .data(dataReady)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.label))
      .attr('stroke', 'white')
      .style('stroke-width', '2px');

    svg
      .selectAll('text')
      .data(dataReady)
      .enter()
      .append('text')
      .text(d => `${((d.data.value / d3.sum(data, d2 => d2.value)) * 100).toFixed(2)}%`)
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .style('text-anchor', 'middle')
      .style('font-size', 12)
      .style('fill', 'white');

    const sum = total || d3.sum(data, d => d.value);
    svg
      .append('text')
      .text(`Total: ${sum}`)
      .attr('transform', 'translate(0, 20)')
      .style('text-anchor', 'middle')
      .style('font-size', 40)
      .style('font-weight', 600);

    const legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(-400,${-height + radius * 1.6})`);

    const legends = legend
      .selectAll('.legend')
      .data(color.domain())
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(0,${i * (legendRectSize + legendSpacing)})`);

    legend
      .append('text')
      .text(legendHeading)
      .attr('transform', 'translate(40, -10)')
      .style('text-anchor', 'middle')
      .style('font-size', 16)
      .style('font-weight', 'bold');

    legends
      .append('rect')
      .attr('width', legendRectSize + 10)
      .attr('height', legendRectSize)
      .style('fill', color)
      .style('stroke', color)
      .style('border-radius', '6px');

    legends
      .append('text')
      .attr('x', legendRectSize + legendSpacing + 10)
      .attr('y', legendRectSize - legendSpacing)
      .data(data)
      .text(d => `${d.label} - ${d.value}`);
  }, [data, height, width]);

  return <svg ref={svgRef} style={{ marginRight: '-200px' }} />;
}

export default DonutChart;
