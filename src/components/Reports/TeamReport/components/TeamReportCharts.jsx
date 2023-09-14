import { React, useEffect } from 'react';
import './ReportCharts.css';
import * as d3 from 'd3/dist/d3.min';
import { CHART_RADIUS, CHART_SIZE } from '../../../common/PieChart/constants';
import { generateArrayOfUniqColors } from '../../../common/PieChart/colorsGenerator';
import '../../../common/PieChart/PieChart.css';
import PieChartInfoDetail from './PieChartInfoDetail';

function TeamReportCharts({
  title,
  pieChartId,
  teamWeeklyCommittedHours,
  totalTeamWeeklyWorkedHours,
}) {
  const totalHoursAvailable = teamWeeklyCommittedHours - totalTeamWeeklyWorkedHours;

  const chart = {
    teamWeeklyCommittedHours,
    totalTeamWeeklyWorkedHours,
    totalHoursAvailable,
  };

  const getCreateSvgPie = () =>
    d3
      .select(`#pie-chart-container-${pieChartId}`)
      .append('svg')
      .attr('id', `pie-chart-${pieChartId}`)
      .attr('width', CHART_SIZE)
      .attr('height', CHART_SIZE)
      .append('g')
      .attr('transform', `translate(${CHART_SIZE / 2},${CHART_SIZE / 2})`);

  const color = d3.scaleOrdinal().range(['#B88AD5', '#FAE386', '#E4E4E4']);

  const pie = d3.pie().value(d => d[1]);

  useEffect(() => {
    const data_ready = pie(
      Object.entries([teamWeeklyCommittedHours, totalTeamWeeklyWorkedHours, totalHoursAvailable]),
    );

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
  }, [totalHoursAvailable]);

  return (
    <section className="team-report-chart-wrapper">
      <div className="team-report-chart-teams">
        <h4 style={{ textAlign: 'center'}}>{title}</h4>
        <div style={{ display: 'flex', flexDirection: 'column', justifyItems: 'center', alignItems: 'center'}} className="team-report-chart-info-wrapper mobile-pie-chart">
          <div className="team-report-chart-info">
            <div className="pie-chart-wrapper mobile-pie-chart">
              <div id={`pie-chart-container-${pieChartId}`} className="pie-chart" />
              <div className="pie-chart-info-detail">
                <div className="pie-chart-info-detail-title">
                  <h5>Name</h5>
                  <h5>Hours</h5>
                </div>
                <PieChartInfoDetail
                  keyName="Commited"
                  value={teamWeeklyCommittedHours}
                  color="#B88AD5"
                />
                <PieChartInfoDetail
                  keyName="Worked"
                  value={totalTeamWeeklyWorkedHours}
                  color="#FAE386"
                />
                <PieChartInfoDetail
                  keyName="Total Hours Available"
                  value={totalHoursAvailable > 0 ? totalHoursAvailable : 0}
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

export default TeamReportCharts;
