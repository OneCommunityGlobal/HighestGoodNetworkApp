import { React, useEffect, useState } from 'react';
import './ReportCharts.css';
import * as d3 from 'd3/dist/d3.min';
import { CHART_RADIUS, CHART_SIZE } from '../../../common/PieChart/constants';
import { generateArrayOfUniqColors } from '../../../common/PieChart/colorsGenerator';
import '../../../common/PieChart/PieChart.css';
import PieChartInfoDetail from './PieChartInfoDetail';

function TeamsReportCharts({ title, pieChartId, selectedTeamsData }) {

  const chart = {
    team1: title === 'Commited Hours' ? selectedTeamsData[0]?.totalCommitedHours : selectedTeamsData[0]?.totalWorkedHours,
    team2: title === 'Commited Hours' ? selectedTeamsData[1]?.totalCommitedHours : selectedTeamsData[1]?.totalWorkedHours,
    team3: title === 'Commited Hours' ? selectedTeamsData[2]?.totalCommitedHours : selectedTeamsData[2]?.totalWorkedHours,
    team4: title === 'Commited Hours' ? selectedTeamsData[3]?.totalCommitedHours : selectedTeamsData[3]?.totalWorkedHours,
  }
  
  const getCreateSvgPie = () => d3.select(`#pie-chart-container-${pieChartId}`)
    .append('svg')
    .attr('id', `pie-chart-${pieChartId}`)
    .attr('width', CHART_SIZE)
    .attr('height', CHART_SIZE)
    .append('g')
    .attr('transform', `translate(${CHART_SIZE / 2},${CHART_SIZE / 2})`);

  const color = d3.scaleOrdinal()
    .range(['#B88AD5', '#FAE386', '#92C4F9', '#ff5e82']);

  const pie = d3.pie().value((d) => d[1]);

  useEffect(() => {
    console.log(selectedTeamsData)
    const data_ready = pie(Object.entries([chart.team1, chart.team2, chart.team3, chart.team4]));

    getCreateSvgPie()
      .selectAll('whatever')
      .data(data_ready)
      .join('path')
      .attr('d', d3.arc()
        .innerRadius(70)
        .outerRadius(CHART_RADIUS))
      .attr('fill', (d) => color(d.data[0]))
      .style('opacity', 0.8);

    return () => {
      d3.select(`#pie-chart-${pieChartId}`).remove();
    };
  }, [selectedTeamsData]);

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
                  <h5>Hours</h5>
                </div>
                <PieChartInfoDetail keyName={selectedTeamsData[0]?.name} value={chart.team1} color="#B88AD5" />
                <PieChartInfoDetail keyName={selectedTeamsData[1]?.name} value={chart.team2} color="#FAE386" />
                <PieChartInfoDetail keyName={selectedTeamsData[2]?.name} value={chart.team3} color="#92C4F9" />
                <PieChartInfoDetail keyName={selectedTeamsData[3]?.name} value={chart.team4} color="#ff5e82" />
              </div>
            </div>
          </div>
          <div className="team-report-chart-info">
          </div>
        </div>
      </div>
    </section>
  );
}

export default TeamsReportCharts;