import { useSelector } from 'react-redux';
import styles from './Participation.module.css';

function EventParticipationHeader() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const eventMetrics = {
    totalEvents: 24,
    averageAttendance: 35,
    highestRatedEvent: 'Yoga Class',
    totalParticipants: 840,
  };

  return (
    <header
      className={`${styles.participationHeader} ${darkMode ? styles.participationHeaderDark : ''}`}
    >
      <div className={styles.headerContent}>
        <div className={styles.headerTitle}>
          <h1 className={`${styles.mainTitle} ${darkMode ? styles.mainTitleDark : ''}`}>
            Event Participation Analytics
          </h1>
          <p className={`${styles.subtitle} ${darkMode ? styles.subtitleDark : ''}`}>
            Central hub for accessing event participation data and analytics
          </p>
        </div>

        <div className={styles.headerNavigation}>
          <nav className={styles.navLinks}>
            <a
              href="/communityportal/reports/participation/virtual-vs-inperson"
              className={styles.navLink}
            >
              Virtual vs. In-Person
            </a>
            <a href="/communityportal/reports/participation/event-value" className={styles.navLink}>
              Event Value Estimates
            </a>
            <a href="/communityportal/reports/participation/trends" className={styles.navLink}>
              Participation Trends
            </a>
          </nav>
        </div>
      </div>

      <div className={`${styles.metricsSummary} ${darkMode ? styles.metricsSummaryDark : ''}`}>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{eventMetrics.totalEvents}</div>
          <div className={styles.metricLabel}>Total Events</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{eventMetrics.averageAttendance}</div>
          <div className={styles.metricLabel}>Avg Attendance</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{eventMetrics.highestRatedEvent}</div>
          <div className={styles.metricLabel}>Top Event Type</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{eventMetrics.totalParticipants}</div>
          <div className={styles.metricLabel}>Total Participants</div>
        </div>
      </div>
    </header>
  );
}

export default EventParticipationHeader;
