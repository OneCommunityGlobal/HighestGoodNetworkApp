import { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { CHART_RADIUS, CHART_SIZE } from './constants';
import './PieChart.css';
// import './UserProjectPieChart.css';

export const PieChart = ({
  data,
  dataLegend,
  chartLegend,
  pieChartId,
  darkMode,
  projectsData = [],
}) {
  const [totalHours, setTotalHours] = useState(0);

  // Custom vibrant color palette
  const customColors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFBE0B',
    '#FF006E',
    '#8338EC',
    '#3A86FF',
    '#FB5607',
    '#38B000',
    '#7209B7',
    '#F72585',
    '#4CC9F0',
    '#80ED99',
    '#F15BB5',
  ];

  let color = d3.scaleOrdinal().range(customColors);

  const getCreateSvgPie = totalValue => {
    if (totalValue === 0) return null;
    // Clear existing SVG before creating new one
    d3.select(`#pie-chart-${pieChartId}`).remove();
    const svg = d3
      .select(`#pie-chart-container-${pieChartId}`)
      .append('svg')
      .attr('id', `pie-chart-${pieChartId}`)
      .attr('width', CHART_SIZE)
      .attr('height', CHART_SIZE)
      .append('g')
      .attr('transform', `translate(${CHART_SIZE / 2},${CHART_SIZE / 2})`);

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .style('fill', darkMode ? 'white' : 'black')
      .text(
        togglePercentage
          ? `${displayValue.toFixed(2)}% of ${calculateTotalHours(projectsData, tasksData).toFixed(
              2,
            )}`
          : `${totalValue.toFixed(2)} Hrs`,
      );

    svg
      .append('foreignObject')
      .attr('x', -40)
      .attr('y', 10)
      .attr('width', 80)
      .attr('height', 40)
      .append('xhtml:div')
      .html(
        `
        <label class="switch">
          <input type="checkbox" ${togglePercentage ? 'checked' : ''} />
          <span class="slider"></span>
        </label>
      `,
      )
      .select('input')
      .on('change', handleTogglePercentage); // Use the existing React handler

    return svg;
  };

  const pie = d3.pie().value(d => d[1]);

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return;

    color = d3.scaleOrdinal().range(customColors);
    const data_ready = pie(Object.entries(data));

    const totalValue = data_ready.map(obj => obj.value).reduce((a, c) => a + c, 0);

    setTotalHours(totalValue);

    let div = d3.select('.tooltip-donut');
    if (div.empty()) {
      div = d3
        .select('body')
        .append('div')
        .attr('class', 'tooltip-donut')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('pointer-events', 'none');
    }

    getCreateSvgPie(totalValue)
      .selectAll('whatever')
      .data(data_ready)
      .join('path')
      .attr(
        'd',
        d3
          .arc()
          .innerRadius(70)
          .outerRadius(CHART_RADIUS),
      )
      .attr('fill', d => color(d.data[0]))
      .style('filter', 'brightness(1.1)')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration('50')
          .attr('opacity', '.7')
          .style('filter', 'brightness(1.2)');

        div
          .transition()
          .duration(50)
          .style('opacity', 1)
          .style('visibility', 'visible');

        const taskName = Object.keys(chartLegend).map(key => chartLegend[key][0]);
        const index = Object.keys(chartLegend)
          .map(e => e)
          .indexOf(d.data[0]);
        const legendInfo = taskName[index].toString();

        div
          .html(legendInfo)
          .style('max-width', '150px')
          .style('white-space', 'normal')
          .style('opacity', 1)
          .style('visibility', 'visible')
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 15}px`);
      })
      .on('mouseout', function handleMouseOut() {
        d3.select(this)
          .transition()
          .duration('50')
          .attr('opacity', '1')
          .style('filter', 'brightness(1.1)');

        div
          .transition()
          .duration(50)
          .style('opacity', 0)
          .on('end', function() {
            d3.select(this).style('visibility', 'hidden');
          });
      });

    return () => {
      d3.select(`#pie-chart-${pieChartId}`).remove();
    };
  }, [tasksData, togglePercentage, selectedProjects]);

  return !tasksData || tasksData?.length === 0 ? (
    <div>Loading</div>
  ) : (
    <div className={`pie-chart-wrapper ${darkMode ? 'text-light' : ''}`}>
      <div id={`pie-chart-container-${pieChartId}`} className="pie-chart" />
      <div className="pie-chart-legend-container">
        <div className="pie-chart-legend-header">
          <div>Name</div>
          <div>{dataLegendHeader}</div>
        </div>
        {Object.keys(dataLegend).map(key => (
          <div key={key} className="pie-chart-legend-item">
            <div
              className="data-legend-color"
              style={{
                backgroundColor: color(key),
                filter: 'brightness(1.1)',
              }}
            />
            <div className="data-legend-info">
              {dataLegend[key].map((legendPart, index) => (
                <div
                  className={`data-legend-info-part ${darkMode ? 'text-light' : ''}`}
                  key={index}
                >
                  {legendPart}
                </div>
              ))}
            </tbody>
          </table>
        </div>

        <div className="data-total-value" style={{ marginTop: 8 }}>
          <strong className={`strong-text ${darkMode ? 'text-light' : ''}`}>Total Hours:</strong>{' '}
          {totalHours.toFixed(2)}
        </div>
      </div>
    </div>
  );
};
