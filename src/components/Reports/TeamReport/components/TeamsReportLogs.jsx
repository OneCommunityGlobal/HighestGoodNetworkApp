import { ReportPage } from '~/components/Reports/sharedComponents/ReportPage';
import React, { useState, useEffect } from 'react';

import styles from './ReportLogs.module.css';

function TeamsReportLogs({ title, selectedTeamsTotalValues, selectedTeamsWeeklyEffort, darkMode }) {
  const totalTeamsWorkedHours = selectedTeamsWeeklyEffort.reduce(
    (accumulator, current) => accumulator + current,
    0,
  );

  return (
    <section>
      <h2
        style={{ textAlign: 'center', color: darkMode ? 'white' : 'black' }}
        className={styles['teams-report-time-title']}
      >
        {title}
      </h2>
      <div className={styles['teams-report-time-logs-wrapper']}>
        <ReportPage.ReportBlock
          data-testid="log-block"
          firstColor="#ff5e82"
          secondColor="#e25cb2"
          className={styles['team-report-time-log-block']}
          darkMode={darkMode}
        >
          <h3 className={styles['text-light']}>{selectedTeamsTotalValues.selectedTeamsTotalPeople}</h3>
          <p>Number of Members</p>
        </ReportPage.ReportBlock>
        <ReportPage.ReportBlock
          data-testid="log-block"
          firstColor="#64b7ff"
          secondColor="#928aef"
          className={styles['team-report-time-log-block']}
          darkMode={darkMode}
        >
          <h3 className={styles['text-light']}>{selectedTeamsTotalValues.selectedTeamsTotalBlueSquares}</h3>
          <p>Total Team Blue Squares</p>
        </ReportPage.ReportBlock>
        <ReportPage.ReportBlock
          data-testid="log-block"
          firstColor="#b368d2"
          secondColor="#831ec4"
          className={styles['team-report-time-log-block']}
          darkMode={darkMode}
        >
          <h3 className={styles['text-light']}>{selectedTeamsTotalValues.selectedTeamsTotalCommitedHours}</h3>
          <p>Weekly Committed Hours</p>
        </ReportPage.ReportBlock>
        <ReportPage.ReportBlock
          data-testid="log-block"
          firstColor="#ffdb56"
          secondColor="#ff9145"
          className={styles['team-report-time-log-block']}
          darkMode={darkMode}
        >
          <h3 className={styles['text-light']}>{totalTeamsWorkedHours}</h3>
          <p>Total Worked Hours This Week</p>
        </ReportPage.ReportBlock>
      </div>
    </section>
  );
}
export default TeamsReportLogs;
