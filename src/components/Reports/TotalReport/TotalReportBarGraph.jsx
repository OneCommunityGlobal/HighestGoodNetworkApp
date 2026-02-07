import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styles from './TotalReportBarGraph.module.css';
import { useSelector } from 'react-redux';

function TotalReportBarGraph({ barData, range }) {
  const svgId = `svg-container-${range}`;
  const darkMode = useSelector(state => state.theme.darkMode);
  const containerRef = useRef(null);

  const drawChart = (data, darkmode) => {
    data.sort((a, b) => (a.label > b.label ? 1 : -1));

    const container = containerRef.current;
    const { width: containerWidth } = container.getBoundingClientRect(); 
    const containerHeight = containerWidth;

    const margin = { top: 10, right: 8, bottom: 100, left: 20 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const maxValue = Math.max(...data.map(d => d.value));

    const svg = d3
      // eslint-disable-next-line testing-library/no-node-access
      .select(`#${svgId}`)
      .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`) // Make SVG responsive
      .attr('preserveAspectRatio', 'xMidYMid meet') // Preserve aspect ratio
      .attr('width', '100%')
      .attr('height', '100%');

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
      .range(darkMode ? ['#4a90e2', '#003366'] : ['#f5a3a3', '#c3b6f7']);
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
        .style('fill', darkmode ? 'white' : 'black')
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
      .style('fill', 'black')
      .style('fill', darkmode ? 'white' : 'black'); 
  };

  useEffect(() => {
    if (barData && barData.length) {
      drawChart(barData, darkMode);
    }
  }, [barData, darkMode]);

  return (
    <div ref={containerRef} className={styles.svgContainer}>
      <svg id={svgId} className={styles.svgChart} />
    </div>
  );
}

export default TotalReportBarGraph;
