/* eslint-disable testing-library/no-node-access */
// eslint-disable-next-line no-unused-vars
import { React, useEffect, useState } from 'react';
import './ReportCharts.css';
import * as d3 from 'd3';

import { CHART_RADIUS, CHART_SIZE } from '../../../common/PieChart/constants';
import '../../../common/PieChart/PieChart.css';
import PieChartInfoDetail from './PieChartInfoDetail';

function TeamsReportCharts({
  title,
  pieChartId,
  selectedTeamsData,
  selectedTeamsWeeklyEffort,
  darkMode,
}) {
  const chart = {
    team1:
      title === 'Weekly Commited Hours'
        ? selectedTeamsData[0]?.totalCommitedHours
        : selectedTeamsWeeklyEffort[0],
    team2:
      title === 'Weekly Commited Hours'
        ? selectedTeamsData[1]?.totalCommitedHours
        : selectedTeamsWeeklyEffort[1],
    team3:
      title === 'Weekly Commited Hours'
        ? selectedTeamsData[2]?.totalCommitedHours
        : selectedTeamsWeeklyEffort[2],
    team4:
      title === 'Weekly Commited Hours'
        ? selectedTeamsData[3]?.totalCommitedHours
        : selectedTeamsWeeklyEffort[3],
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

  const color = d3.scaleOrdinal().range(['#B88AD5', '#FAE386', '#92C4F9', '#ff5e82']);

  const pie = d3.pie().value(d => d[1]);

  useEffect(() => {
    const dataReady = pie(Object.entries([chart.team1, chart.team2, chart.team3, chart.team4]));

    getCreateSvgPie()
      .selectAll('whatever')
      .data(dataReady)
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
  }, [selectedTeamsData, selectedTeamsWeeklyEffort]);

  return (
    <section className="team-report-chart-wrapper">
      <div className={`team-report-chart-teams ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}>
        <h4>{title}</h4>
        <div className="team-report-chart-info-wrapper">
          <div className="team-report-chart-info">
            {selectedTeamsData.length > 0 ? (
              <div className="pie-chart-wrapper">
                <div id={`pie-chart-container-${pieChartId}`} className="pie-chart" />
                <div className="pie-chart-info-detail">
                  <div className="pie-chart-info-detail-title">
                    <h5>Name</h5>
                    <h5>Hours</h5>
                  </div>
                  <PieChartInfoDetail
                    keyName={selectedTeamsData[0]?.name}
                    value={chart.team1}
                    color="#B88AD5"
                    darkMode={darkMode}
                  />
                  {selectedTeamsData[1] && (
                    <PieChartInfoDetail
                      keyName={selectedTeamsData[1]?.name}
                      value={chart.team2}
                      color="#FAE386"
                      darkMode={darkMode}
                    />
                  )}
                  {selectedTeamsData[2] && (
                    <PieChartInfoDetail
                      keyName={selectedTeamsData[2]?.name}
                      value={chart.team3}
                      color="#92C4F9"
                      darkMode={darkMode}
                    />
                  )}
                  {selectedTeamsData[3] && (
                    <PieChartInfoDetail
                      keyName={selectedTeamsData[3]?.name}
                      value={chart.team4}
                      color="#ff5e82"
                      darkMode={darkMode}
                    />
                  )}
                </div>
              </div>
            ) : (
              <strong>Please select a team. (Max 4)</strong>
            )}
          </div>
          <div className="team-report-chart-info" />
        </div>
      </div>
    </section>
  );
}

export default TeamsReportCharts;
