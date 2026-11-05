import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styles from './TotalReportBarGraph.module.css';
import { useSelector } from 'react-redux';

function TotalReportBarGraph({
  barData,
  range,
  idSuffix = '',
  fallbackLabel = '',
}) {
  const svgId = `svg-container-${range}${idSuffix}`;
  const darkMode = useSelector(state => state.theme.darkMode);
  const containerRef = useRef(null);
  const isComparisonChart = idSuffix.includes('compare');
  const barColor = isComparisonChart
    ? darkMode
      ? '#f59e0b'
      : '#d97706'
    : darkMode
      ? '#4a90e2'
      : '#5b6ee1';
  const aboveBarLabelColor = darkMode ? '#f8fafc' : '#1f2937';
  const insideLabelMinHeight = 34;

  const getReadableLabel = label => {
    const text = label === null || label === undefined ? '' : String(label);
    if (!text || text.includes('NaN') || text === 'Invalid Date') {
      return fallbackLabel || 'Selected date range';
    }
    return text;
  };

  const drawChart = (data, darkmode) => {
    const normalizedData = data
      .map(item => ({
        ...item,
        label: getReadableLabel(item.label),
        value: Number.isNaN(Number(item.value)) ? 0 : Number(item.value),
      }))
      .sort((a, b) => (a.label > b.label ? 1 : -1));

    const container = containerRef.current;
    const { width: containerWidth } = container.getBoundingClientRect();
    const containerHeight = Math.max(containerWidth * 0.75, 320);

    const margin = { top: 10, right: 8, bottom: 100, left: 20 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const maxValue = Math.max(...normalizedData.map(d => d.value), 1);

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
      .domain(normalizedData.map(d => d.label))
      .range([0, width])
      .padding(0.4);

    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([height, 0]);

    normalizedData.forEach(d => {
      const x = xScale(d.label);
      const barHeight = height - yScale(d.value);
      const y = yScale(d.value);
      const labelFitsInside = barHeight >= insideLabelMinHeight;

      chart
        .append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', xScale.bandwidth())
        .attr('height', barHeight)
        .attr('fill', barColor);

      chart
        .append('text')
        .attr('x', x + xScale.bandwidth() / 2)
        .attr('y', labelFitsInside ? y + barHeight / 2 : Math.max(y - 8, 14))
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', labelFitsInside ? 'middle' : 'baseline')
        .style('fill', labelFitsInside ? 'white' : aboveBarLabelColor)
        .style('font-size', '24px')
        .style('font-weight', 'bold')
        .text(d.value > 0 ? d.value : '');
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
