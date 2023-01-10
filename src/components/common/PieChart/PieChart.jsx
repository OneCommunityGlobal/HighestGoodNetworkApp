import { useEffect } from 'react';
import * as d3 from 'd3/dist/d3.min';
import { CHART_RADIUS, CHART_SIZE } from './constants';
import { generateArrayOfUniqColors } from './colorsGenerator';
import './PieChart.css';

export const PieChart = ({ data, dataLegend, pieChartId, dataLegendHeader }) => {
  const getCreateSvgPie = () => {
    return d3
      .select(`#pie-chart-container-${pieChartId}`)
      .append('svg')
      .attr('id', `pie-chart-${pieChartId}`)
      .attr('width', CHART_SIZE)
      .attr('height', CHART_SIZE)
      .append('g')
      .attr('transform', `translate(${CHART_SIZE / 2},${CHART_SIZE / 2})`)
      .append('text')
      .attr('text-anchor', 'middle')
      .text(sum);
      
  };

  const color = d3.scaleOrdinal().range(generateArrayOfUniqColors(Object.keys(data).length));

  const pie = d3.pie().value(d => d[1]);

  useEffect(() => {
    const data_ready = pie(Object.entries(data));

    getCreateSvgPie()
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
      .style('opacity', 0.8);

    return () => {
      d3.select(`#pie-chart-${pieChartId}`).remove();
    };
  }, [data]);

  {
    /* Variable totalling sum of hours worked to be input in pie chart */
  }
  let hoursCompleted = document.getElementsByClassName('data-legend-info-part');

  let totalHoursCompleted = [];

  for (let i = 0; i < hoursCompleted.length; i++) {
    const hours = hoursCompleted[i];
    totalHoursCompleted.push(Number(hours));
  }

  let sum = 0;

  for (let i = 0; i < totalHoursCompleted.length; i++) {
    sum += totalHoursCompleted[i];
  }

  return (
    <div className="pie-chart-wrapper">
      <div id={`pie-chart-container-${pieChartId}`} className="pie-chart" />
      <div>
        <div className="pie-chart-legend-header">
          <div>Name</div>
          <div>{dataLegendHeader}</div>
        </div>
        {/*Values for Name Header entered here*/}
        {Object.keys(dataLegend).map(key => (
          <div key={key} className="pie-chart-legend-item">
            <div className="data-legend-color" style={{ backgroundColor: color(key) }} />
            <div className="data-legend-info">
              {dataLegend[key].map(legendPart => (
                <div className="data-legend-info-part">{legendPart}</div>
              ))}
            </div>
          </div>
        ))}
        {/*Values for Hours Header entered here*/}

        <div className="pie-chart-legend-item">
          <div className="data-legend-info">
            Total Hours Worked:
            <div className="data-legend-info-part">{sum}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
