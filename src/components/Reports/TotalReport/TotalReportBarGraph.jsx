// eslint-disable-next-line no-unused-vars
import React, { useEffect } from 'react';
import * as d3 from 'd3/dist/d3.min';
import './TotalReportBarGraph.css';

function TotalReportBarGraph({ barData, range }) {
  const svgId = `svg-container-${range}`;

  const drawChart = data => {
    data.sort((a, b) => (a.label > b.label ? 1 : -1));
    const maxValue = Number(
      data.reduce((prev, curr) => (prev.value - curr.value > 0 ? prev : curr)).value,
    );
    const margin = { top: 10, right: 8, bottom: 15, left: 20 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(`#${svgId}`);
    svg.selectAll('*').remove();
    const chart = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xScale = d3
      .scaleBand()
      .range([0, width])
      .domain(data.map(s => s.label))
      .padding(0.4);

    const yScale = d3
      .scaleLinear()
      .range([height, 10])
      .domain([0, maxValue]);

    const colorScale = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range(['darksalmon', 'darkslateblue']);

    chart
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    const barGroups = chart
      .selectAll()
      .data(data)
      .enter()
      .append('g');

    barGroups
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.label))
      .attr('y', d => yScale(d.value))
      .attr('height', d => height - yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('fill', d => colorScale(d.value))
      // eslint-disable-next-line no-unused-vars
      .on('mouseenter', (_, i) => {
        d3.selectAll('.value').attr('opacity', 0);
        d3.select(d3.event.currentTarget)
          .transition()
          .duration(300)
          .attr('opacity', 0.6);
        barGroups
          .append('text')
          .attr('class', 'value')
          .attr('x', d => xScale(d.label) + xScale.bandwidth() / 2)
          .attr('y', d => yScale(d.value))
          .attr('text-anchor', 'middle')
          .text(d => `${d.value}`)
          .style('fill', 'black');

        if (data[0].months) {
          barGroups
            .append('text')
            .attr('class', 'value')
            .attr('x', d => xScale(d.label) + xScale.bandwidth() / 2)
            .attr('y', yScale(0) + 30)
            .attr('text-anchor', 'middle')
            .text(d => `${d.months} mos.`)
            .style('fill', 'black');
        }
      })
      .on('mouseleave', () => {
        d3.selectAll('.value').attr('opacity', 1);
        d3.select(d3.event.currentTarget)
          .transition()
          .duration(300)
          .attr('opacity', 1);
        chart.selectAll('.value').remove();
      });
  };

  useEffect(() => {
    if (barData.length > 0) {
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
