import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useSelector } from 'react-redux';
import styles from './TotalReportBarGraph.module.css';

function TotalReportBarGraph({ barData, range }) {
  const svgId = `svg-container-${range}`;
  const darkMode = useSelector(state => state.theme.darkMode);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!barData?.length) return undefined;

    const drawChart = () => {
      const container = containerRef.current;
      if (!container) return;

      const sortedData = [...barData].sort((a, b) =>
        String(a.label).localeCompare(String(b.label), undefined, { numeric: true }),
      );
      const containerWidth = container.getBoundingClientRect().width;
      if (!containerWidth) return;

      const containerHeight = containerWidth;
      const margin = { top: 20, right: 12, bottom: 76, left: 24 };
      const width = Math.max(1, containerWidth - margin.left - margin.right);
      const height = Math.max(1, containerHeight - margin.top - margin.bottom);
      const maxValue = Math.max(1, ...sortedData.map(item => Number(item.value) || 0));
      const axisFontSize = containerWidth <= 380 ? 8 : containerWidth <= 600 ? 9 : 11;

      const svg = d3
        // eslint-disable-next-line testing-library/no-node-access
        .select(`#${svgId}`)
        .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('width', '100%')
        .attr('height', '100%');

      svg.selectAll('*').remove();

      const chart = svg
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
      const xScale = d3
        .scaleBand()
        .domain(sortedData.map(item => item.label))
        .range([0, width])
        .padding(0.35);
      const yScale = d3
        .scaleLinear()
        .domain([0, maxValue])
        .range([height, 0]);
      const colorScale = d3
        .scaleLinear()
        .domain([0, maxValue])
        .range(darkMode ? ['#4a90e2', '#003366'] : ['#f5a3a3', '#c3b6f7']);

      sortedData.forEach(item => {
        const value = Number(item.value) || 0;
        const x = xScale(item.label);
        const y = yScale(value);
        const barHeight = height - y;
        const bandwidth = xScale.bandwidth();
        const label = String(item.value);
        const valueFontSize = Math.min(containerWidth <= 380 ? 9 : 12, Math.max(7, bandwidth * 0.42));
        const labelFitsBar =
          valueFontSize >= 8 && label.length * valueFontSize * 0.62 <= bandwidth;

        const bar = chart
          .append('rect')
          .attr('class', styles.bar)
          .attr('x', x)
          .attr('y', y)
          .attr('width', bandwidth)
          .attr('height', barHeight)
          .attr('fill', colorScale(value));

        bar.append('title').text(`${item.label}: ${label}`);

        if (labelFitsBar) {
          const labelInsideBar = barHeight >= valueFontSize + 4;
          chart
            .append('text')
            .attr('class', 'bar-value')
            .attr('x', x + bandwidth / 2)
            .attr('y', labelInsideBar ? y + barHeight / 2 : y - 5)
            .attr('text-anchor', 'middle')
            .style('fill', darkMode ? 'white' : 'black')
            .style('font-size', `${valueFontSize}px`)
            .style('font-weight', 'bold')
            .text(label);
        }
      });

      const maxVisibleTicks = Math.max(2, Math.floor(width / (containerWidth <= 500 ? 34 : 48)));
      const tickInterval = Math.max(1, Math.ceil(sortedData.length / maxVisibleTicks));
      const tickValues = sortedData
        .filter((_, index) => index % tickInterval === 0 || index === sortedData.length - 1)
        .map(item => item.label);

      chart
        .append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickValues(tickValues))
        .selectAll('text')
        .attr('transform', 'rotate(-35)')
        .attr('dx', '-0.45em')
        .attr('dy', '0.25em')
        .attr('text-anchor', 'end')
        .style('font-size', `${axisFontSize}px`)
        .style('fill', darkMode ? 'white' : 'black');
    };

    drawChart();
    window.addEventListener('resize', drawChart);
    return () => window.removeEventListener('resize', drawChart);
  }, [barData, darkMode, svgId]);

  return (
    <div ref={containerRef} className={styles.svgContainer}>
      <svg id={svgId} className={styles.svgChart} />
    </div>
  );
}

export default TotalReportBarGraph;
