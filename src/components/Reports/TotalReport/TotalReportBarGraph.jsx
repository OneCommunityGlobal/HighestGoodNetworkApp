import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useSelector } from 'react-redux';
import styles from './TotalReportBarGraph.module.css';

const getReadableLabel = (label, fallbackLabel) => {
  const text = label === null || label === undefined ? '' : String(label);
  if (!text || text.includes('NaN') || text === 'Invalid Date') {
    return fallbackLabel || 'Selected date range';
  }
  return text;
};

function TotalReportBarGraph({
  barData,
  range,
  idSuffix = '',
  fallbackLabel = '',
}) {
  const svgId = `svg-container-${range}${idSuffix}`;
  const darkMode = useSelector(state => state.theme.darkMode);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!barData?.length) return undefined;

    const isComparisonChart = idSuffix.includes('compare');
    let barColor = '#5b6ee1';
    if (darkMode) barColor = '#4a90e2';
    if (isComparisonChart) {
      barColor = darkMode ? '#f59e0b' : '#d97706';
    }
    const aboveBarLabelColor = darkMode ? '#f8fafc' : '#1f2937';
    const insideLabelMinHeight = 34;

    const drawChart = () => {
      const container = containerRef.current;
      if (!container) return;

      const normalizedData = barData
        .map(item => {
          const value = Number(item.value);
          return {
            ...item,
            label: getReadableLabel(item.label, fallbackLabel),
            value: Number.isFinite(value) ? value : 0,
          };
        })
        .sort((a, b) =>
          a.label.localeCompare(b.label, undefined, { numeric: true }),
        );

      const containerWidth = container.getBoundingClientRect().width;
      if (!containerWidth) return;

      const containerHeight = Math.max(containerWidth * 0.75, 320);
      const margin = { top: 20, right: 12, bottom: 76, left: 24 };
      const width = Math.max(1, containerWidth - margin.left - margin.right);
      const height = Math.max(1, containerHeight - margin.top - margin.bottom);
      const maxValue = Math.max(1, ...normalizedData.map(item => item.value));
      let axisFontSize = 11;
      if (containerWidth <= 600) axisFontSize = 9;
      if (containerWidth <= 380) axisFontSize = 8;

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
        .domain(normalizedData.map(item => item.label))
        .range([0, width])
        .padding(0.35);
      const yScale = d3.scaleLinear().domain([0, maxValue]).range([height, 0]);
      const colorScale = d3
        .scaleLinear()
        .domain([0, maxValue])
        .range(darkMode ? ['#4a90e2', '#003366'] : ['#f5a3a3', '#c3b6f7']);

      normalizedData.forEach(item => {
        const x = xScale(item.label);
        const y = yScale(item.value);
        const barHeight = height - y;
        const bandwidth = xScale.bandwidth();
        const label = String(item.value);
        const valueFontSize = Math.min(
          containerWidth <= 380 ? 9 : 12,
          Math.max(7, bandwidth * 0.42),
        );
        const labelFitsBar =
          item.value > 0 &&
          valueFontSize >= 8 &&
          label.length * valueFontSize * 0.62 <= bandwidth;
        const labelInsideBar =
          barHeight >= Math.max(insideLabelMinHeight, valueFontSize + 4);
        let valueLabelColor = aboveBarLabelColor;
        if (labelInsideBar && darkMode) valueLabelColor = 'white';
        else if (labelInsideBar) valueLabelColor = '#1f2937';

        const bar = chart
          .append('rect')
          .attr('class', styles.bar)
          .attr('x', x)
          .attr('y', y)
          .attr('width', bandwidth)
          .attr('height', barHeight)
          .attr('fill', isComparisonChart ? barColor : colorScale(item.value));

        bar.append('title').text(`${item.label}: ${label}`);

        if (labelFitsBar) {
          chart
            .append('text')
            .attr('class', 'bar-value')
            .attr('x', x + bandwidth / 2)
            .attr('y', labelInsideBar ? y + barHeight / 2 : Math.max(y - 5, 14))
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', labelInsideBar ? 'middle' : 'baseline')
            .style('fill', valueLabelColor)
            .style('font-size', `${valueFontSize}px`)
            .style('font-weight', 'bold')
            .text(label);
        }
      });

      const maxVisibleTicks = Math.max(
        2,
        Math.floor(width / (containerWidth <= 500 ? 34 : 48)),
      );
      const tickInterval = Math.max(
        1,
        Math.ceil(normalizedData.length / maxVisibleTicks),
      );
      const tickValues = normalizedData
        .filter(
          (_, index) =>
            index % tickInterval === 0 || index === normalizedData.length - 1,
        )
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
  }, [barData, darkMode, fallbackLabel, idSuffix, svgId]);

  return (
    <div ref={containerRef} className={styles.svgContainer}>
      <svg id={svgId} className={styles.svgChart} />
    </div>
  );
}

export default TotalReportBarGraph;
