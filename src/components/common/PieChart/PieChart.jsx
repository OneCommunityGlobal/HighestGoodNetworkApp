/* eslint-disable no-restricted-globals */
import { useEffect, useState } from 'react';
import * as d3 from 'd3/dist/d3.min';
import { CHART_RADIUS, CHART_SIZE } from './constants';
import { generateArrayOfUniqColors } from './colorsGenerator';
import './PieChart.css';

// eslint-disable-next-line import/prefer-default-export, react/function-component-definition
export const PieChart = ({
  data,
  dataLegend,
  chartLegend,
  pieChartId,
  dataLegendHeader,
  darkMode,
}) => {
  const [totalHours, setTotalHours] = useState(0);
  const [colors] = useState(generateArrayOfUniqColors(Object.keys(data).length));
  const [togglePercentage, setTogglePercentage] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState(Object.keys(data));

  const handleTogglePercentage = () => {
    setTogglePercentage(prev => {
      const newToggleState = !prev;
      setTogglePercentage(newToggleState);
      if (!newToggleState) {
        setSelectedTasks(Object.keys(data));
      }
    });
  };

  const handleTaskClick = task => {
    if (togglePercentage) {
      setSelectedTasks(prevSelectedTasks =>
        prevSelectedTasks.includes(task)
          ? prevSelectedTasks.filter(t => t !== task)
          : [...prevSelectedTasks, task],
      );
    }
  };

  // create the pie chart
  const getCreateSvgPie = totalValue => {
    const svg = d3
      .select(`#pie-chart-container-${pieChartId}`)
      .append('svg')
      .attr('id', `pie-chart-${pieChartId}`)
      .attr('width', CHART_SIZE)
      .attr('height', CHART_SIZE)
      .append('g')
      .attr('transform', `translate(${CHART_SIZE / 2},${CHART_SIZE / 2})`);

    const displayValue = togglePercentage
      ? (selectedTasks.reduce((sum, task) => sum + (data[task] || 0), 0) / totalValue) * 100
      : totalValue;

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .style('fill', darkMode ? 'white' : 'black')
      .text(
        togglePercentage
          ? `${displayValue.toFixed(2)}% of ${totalValue.toFixed(2)}`
          : totalValue.toFixed(2),
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
      .on('change', handleTogglePercentage);

    svg
      .append('foreignObject')
      .attr('x', -10)
      .attr('y', 30)
      .attr('width', 20)
      .attr('height', 20)
      .append('xhtml:div').html(`
        <div style="text-align: center; color: ${darkMode ? 'white' : 'black'};">
          %
        </div>
      `);

    return svg;
  };
  let color = d3.scaleOrdinal().range(colors);
  const pie = d3.pie().value(d => d[1]);
  useEffect(() => {
    color = d3.scaleOrdinal().range(colors);

    // eslint-disable-next-line camelcase
    const data_ready = pie(Object.entries(data));

    const totalValue = data_ready
      .map(obj => obj.value)
      .reduce((a, c) => {
        return a + c;
      }, 0);
    setTotalHours(totalValue);
    let div = d3.select('.tooltip-donut');
    if (div.empty()) {
      div = d3
        .select('body')
        .append('div')
        .attr('class', 'tooltip-donut')
        .style('opacity', 0)
        .style('position', 'absolute') // Ensure the tooltip uses absolute positioning
        .style('pointer-events', 'none'); // Prevents the tooltip from interfering with mouse events
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
      .style('opacity', d => (selectedTasks.includes(d.data[0]) ? 1 : 0.1))
      .on('click', (event, d) => handleTaskClick(d.data[0]))
      .on('mouseover', function(d, i) {
        d3.select(this)
          .transition()
          .duration('50')
          .attr('opacity', '.5');
        div
          .transition()
          .duration(50)
          .style('opacity', 1)
          .style('visibility', 'visible');
        // const taskName = Object.keys(chartLegend).map(key => {
        //   return chartLegend[key][0];
        // });
        // const index = Object.keys(chartLegend)
        //   .map(function(e) {
        //     return e;
        //   })
        //   .indexOf(i.data[0]);
        // const legendInfo = taskName[index].toString();
        const taskName = chartLegend[i.data[0]][0];
        const taskValue = i.value;
        const percentage = ((taskValue / totalValue) * 100).toFixed(2);

        const legendInfo = togglePercentage
          ? `${taskName}: ${percentage}% of ${totalValue.toFixed(2)}`
          : `${taskName}: ${taskValue.toFixed(2)} Hours`;

        div.html(legendInfo);
        // .style('left', `${d.pageX + 10}px`)
        // .style('top', `${d.pageY - 15}px`);

        div.style('max-width', '150px').style('white-space', 'normal');

        const containerWidth = document.getElementById(`pie-chart-container-${pieChartId}`)
          .offsetWidth;
        const tooltipWidth = div.node().offsetWidth;
        const mouseX = d.pageX;

        const tooltipX =
          mouseX + 10 + tooltipWidth > containerWidth ? mouseX - tooltipWidth - 10 : mouseX + 10;

        div.style('left', `${tooltipX}px`).style('top', `${d.pageY - 15}px`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration('50')
          .attr('opacity', '.85');
        div
          .transition()
          .duration('50')
          .style('opacity', 0)
          .on('end', function() {
            d3.select(this).style('visibility', 'hidden'); // Hide after transition
          });
      });

    return () => {
      d3.select(`#pie-chart-${pieChartId}`).remove();
    };
  }, [data, togglePercentage, selectedTasks]);

  return (
    <div className={`pie-chart-wrapper ${darkMode ? 'text-light' : ''}`}>
      <div id={`pie-chart-container-${pieChartId}`} className="pie-chart" />
      <div className="pie-chart-legend-container">
        <div className="pie-chart-legend-header">
          <div>Name</div>
          <div>{dataLegendHeader}</div>
        </div>
        {Object.keys(dataLegend).map(key => (
          <div key={key} className="pie-chart-legend-item">
            <div className="data-legend-color" style={{ backgroundColor: color(key) }} />
            <div className="data-legend-info">
              {dataLegend[key].map((legendPart, index) => (
                <div
                  className={`data-legend-info-part ${darkMode ? 'text-light' : ''}`}
                  key={index}
                >
                  {legendPart}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="data-total-value">Total Hours : {totalHours.toFixed(2)}</div>
      </div>
    </div>
  );
};
