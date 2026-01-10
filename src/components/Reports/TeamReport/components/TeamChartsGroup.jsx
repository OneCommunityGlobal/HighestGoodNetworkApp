// eslint-disable-next-line no-unused-vars
import React from 'react';
import { ReportPage } from '~/components/Reports/sharedComponents/ReportPage';
import ReportCharts from './ReportCharts';

function TeamChartsGroup() {
  return (
    <div className="team-chart-wrapper">
      <ReportPage.ReportBlock className="team-chart-container">
        <div data-testid="team-chart-container">
          <ReportCharts title="Breakdown of Weekly Hours So Far This Week" pieChartId="chart1" />
        </div>
      </ReportPage.ReportBlock>
      <ReportPage.ReportBlock className="team-chart-container">
        <div data-testid="team-chart-container">
          <ReportCharts title="Breakdown of Weekly Hours So Far This Week" pieChartId="chart2" />
        </div>
      </ReportPage.ReportBlock>
    </div>
  );
}

export default TeamChartsGroup;
