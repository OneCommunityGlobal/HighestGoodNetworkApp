import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './Participation.module.css';

function EventParticipationHeader({ events = [], loading = false }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  const eventMetrics = useMemo(() => {
    if (!events.length) {
      return {
        totalEvents: 0,
        averageAttendance: 0,
        topEventType: loading ? '…' : 'N/A',
        totalParticipants: 0,
      };
    }

    const totalParticipants = events.reduce(
      (sum, event) => sum + (Number(event.attendees) || 0),
      0,
    );

    const attendanceByType = events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + (Number(event.attendees) || 0);
      return acc;
    }, {});

    const topEventType = Object.entries(attendanceByType).reduce(
      (top, [eventType, attendance]) =>
        attendance > top.attendance ? { eventType, attendance } : top,
      { eventType: 'N/A', attendance: -1 },
    ).eventType;

    return {
      totalEvents: events.length,
      averageAttendance: Math.round(totalParticipants / events.length),
      topEventType,
      totalParticipants,
    };
  }, [events, loading]);

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
            <Link
              to="/communityportal/reports/participation/virtual-vs-inperson"
              className={styles.navLink}
            >
              Virtual vs. In-Person
            </Link>
            <Link
              to="/communityportal/reports/participation/event-value"
              className={styles.navLink}
            >
              Event Value Estimates
            </Link>
            <Link to="/communityportal/reports/participation/trends" className={styles.navLink}>
              Participation Trends
            </Link>
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
          <div className={styles.metricValue}>{eventMetrics.topEventType}</div>
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
