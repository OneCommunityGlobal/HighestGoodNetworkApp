/* eslint-disable react/prop-types */
/* eslint-disable import/no-unresolved */
import { ReportPage } from 'components/Reports/sharedComponents/ReportPage';
import React from 'react';
import './ReportLogs.css';

function ReportLogs({ title }) {
  return (
    <section>
      <h2 className="teams-report-time-title">{ title }</h2>
      <div className="teams-report-time-logs-wrapper">
        <ReportPage.ReportBlock
          firstColor="#ff5e82"
          secondColor="#e25cb2"
          className="team-report-time-log-block"
        >
          <h3>50</h3>
          <p>Weekly Committed Hours</p>
        </ReportPage.ReportBlock>
        <ReportPage.ReportBlock
          firstColor="#b368d2"
          secondColor="#831ec4"
          className="team-report-time-log-block"
        >
          <h3>50</h3>
          <p>Team Completed Hours</p>
        </ReportPage.ReportBlock>
        <ReportPage.ReportBlock
          firstColor="#64b7ff"
          secondColor="#928aef"
          className="team-report-time-log-block"
        >
          <h3>12</h3>
          <p>Total Team Blue Squares</p>
        </ReportPage.ReportBlock>
        <ReportPage.ReportBlock
          firstColor="#ffdb56"
          secondColor="#ff9145"
          className="team-report-time-log-block"
        >
          <h3>800</h3>
          <p>Total Team Hours Worked</p>
        </ReportPage.ReportBlock>
      </div>
    </section>
  );
}
export default ReportLogs;
