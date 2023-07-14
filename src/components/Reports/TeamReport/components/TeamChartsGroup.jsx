import React from 'react';
import { ReportPage } from 'components/Reports/sharedComponents/ReportPage';
import ReportCharts from './ReportCharts';

function TeamChartsGroup() {
  return (
    <div className="team-chart-wrapper">
      <ReportPage.ReportBlock className="team-chart-container">
        <ReportCharts title="Breakdown of Weekly Hours So Far This Week" pieChartId="chart1" />
      </ReportPage.ReportBlock>
      <ReportPage.ReportBlock className="team-chart-container">
        <ReportCharts title="Breakdown of Weekly Hours So Far This Week" pieChartId="chart2" />
      </ReportPage.ReportBlock>
    </div>
  );
}

export default TeamChartsGroup;
