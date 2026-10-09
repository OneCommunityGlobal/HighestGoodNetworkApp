/* eslint-disable testing-library/no-node-access */
import { useSelector } from 'react-redux';
import { useRef } from 'react';
import InfoTooltip from './InfoTooltip';
import EventParticipationHeader from './EventParticipationHeader';
import EngagementSummaryCards from './EngagementSummaryCards';
import EventTypePieChart from './EventTypePieChart';
import EngagementBarChart from './EngagementBarChart';
import AnalyticsNavigation from './AnalyticsNavigation';
import MyCases from './MyCases';
import DropOffTracking from './DropOffTracking';
import NoShowInsights from './NoShowInsights';
import styles from './Participation.module.css';

function EventParticipation() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const exportRef = useRef(null);

  return (
    <div
      ref={exportRef}
      className={`participation-landing-page-global ${styles.participationLandingPage} ${
        darkMode ? styles.participationLandingPageDark : ''
      }`}
    >
      <EventParticipationHeader />
      <EngagementSummaryCards />
      <div className={styles.chartsSection}>
        <div className={styles.chartsRow}>
          <EventTypePieChart />
          <EngagementBarChart />
        </div>
      </div>

      <MyCases />
      <div
        role="note"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          margin: '16px 0 12px',
          borderRadius: '8px',
          backgroundColor: darkMode ? '#30343b' : '#eef2f7',
          color: darkMode ? '#f8fafc' : '#334155',
        }}
      >
        <InfoTooltip content="The drop-off and no-show analytics below use simulated data for testing and demonstration. These figures do not represent actual attendance records." />
        <strong>Demo Data</strong>
      </div>

      <div className={styles.analyticsSection}>
        <DropOffTracking />
        <NoShowInsights />
      </div>
      <AnalyticsNavigation />

      {/* Print-only footer note */}
    </div>
  );
}

export default EventParticipation;
