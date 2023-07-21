import { ReportPage } from 'components/Reports/sharedComponents/ReportPage';
import React, { useState } from 'react';
import { useEffect } from 'react';
import './ReportLogs.css';

function TeamReportLogs({ title, teamMembers, teamTotalBlueSquares, teamWeeklyCommittedHours, totalTeamWeeklyWorkedHours }) {
  return (
    <section>
      <h2 className="teams-report-time-title">{ title }</h2>
      <div className="teams-report-time-logs-wrapper">
        <ReportPage.ReportBlock
          firstColor="#ff5e82"
          secondColor="#e25cb2"
          className="team-report-time-log-block"
        >
          <h3>{teamMembers.length}</h3>
          <p>Number of Members</p>
        </ReportPage.ReportBlock>
        <ReportPage.ReportBlock
          firstColor="#64b7ff"
          secondColor="#928aef"
          className="team-report-time-log-block"
        >
          <h3>{teamTotalBlueSquares}</h3>
          <p>Total Team Blue Squares</p>
        </ReportPage.ReportBlock>
        <ReportPage.ReportBlock
          firstColor="#b368d2"
          secondColor="#831ec4"
          className="team-report-time-log-block"
        >
          <h3>{teamWeeklyCommittedHours}</h3>
          <p>Weekly Committed Hours</p>
        </ReportPage.ReportBlock>
        <ReportPage.ReportBlock
          firstColor="#ffdb56"
          secondColor="#ff9145"
          className="team-report-time-log-block"
        >
          <h3>{totalTeamWeeklyWorkedHours}</h3>
          <p>Total Worked Hours This Week</p>
        </ReportPage.ReportBlock>
      </div>
    </section>
  );
}
export default TeamReportLogs;