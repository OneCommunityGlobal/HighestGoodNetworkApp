import { React, useEffect } from 'react';
import './ReportCharts.css';
import * as d3 from 'd3/dist/d3.min';
import { CHART_RADIUS, CHART_SIZE } from '../../../common/PieChart/constants';
import { generateArrayOfUniqColors } from '../../../common/PieChart/colorsGenerator';
import '../../../common/PieChart/PieChart.css';
import PieChartInfoDetail from './PieChartInfoDetail';

function ReportCharts({ title, pieChartId }) {
  const getCreateSvgPie = () =>
    d3
      .select(`#pie-chart-container-${pieChartId}`)
      .append('svg')
      .attr('id', `pie-chart-${pieChartId}`)
      .attr('width', CHART_SIZE)
      .attr('height', CHART_SIZE)
      .append('g')
      .attr('transform', `translate(${CHART_SIZE / 2},${CHART_SIZE / 2})`);

  const color = d3.scaleOrdinal().range(generateArrayOfUniqColors(Object.keys([2, 6, 9]).length));

  const pie = d3.pie().value(d => d[1]);

  useEffect(() => {
    const data_ready = pie(Object.entries([2, 6, 9]));

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
  }, []);

  return (
    <section className="team-report-chart-wrapper">
      <div className="team-report-chart-teams">
        <h4>{title}</h4>
        <div className="team-report-chart-info-wrapper">
          <div className="team-report-chart-info">
            <div className="pie-chart-wrapper">
              <div id={`pie-chart-container-${pieChartId}`} className="pie-chart" />
              <div className="pie-chart-info-detail">
                <div className="pie-chart-info-detail-title">
                  <h5>Name</h5>
                  <h5>Hour</h5>
                </div>
                <PieChartInfoDetail keyName="Task A" value="4.71" color="#ED869C" />
                <PieChartInfoDetail keyName="Task B" value="10.48" color="#92C4F9" />
                <PieChartInfoDetail keyName="Task C" value="26.6" color="#B88AD5" />
                <PieChartInfoDetail keyName="Task D" value="19.32" color="#FAE386" />
                <PieChartInfoDetail
                  keyName="Total Available for week"
                  value="38.89"
                  color="#E4E4E4"
                />
              </div>
            </div>
          </div>
          <div className="team-report-chart-info"></div>
        </div>
      </div>
    </section>
  );
}

export default ReportCharts;
