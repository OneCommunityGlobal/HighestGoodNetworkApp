/* eslint-disable testing-library/no-node-access */
import { useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { getEvents } from '../../../../actions/eventActions';
import EventParticipationHeader from './EventParticipationHeader';
import EngagementSummaryCards from './EngagementSummaryCards';
import EventTypePieChart from './EventTypePieChart';
import EngagementBarChart from './EngagementBarChart';
import AnalyticsNavigation from './AnalyticsNavigation';
import MyCases from './MyCases';
import DropOffTracking from './DropOffTracking';
import NoShowInsights from './NoShowInsights';
import styles from './Participation.module.css';

const formatEventTime = isoString =>
  isoString
    ? new Date(isoString).toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

function EventParticipation() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const exportRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getEvents({ limit: 1000 }).then(response => {
      if (!isMounted) return;
      const fetchedEvents = response?.data?.events || [];
      setEvents(
        fetchedEvents.map(event => ({
          id: event._id,
          eventType: event.type,
          eventDate: event.date,
          eventTime: formatEventTime(event.startTime),
          eventName: event.title,
          attendees: event.currentAttendees,
          maxAttendees: event.maxAttendees,
        })),
      );
      setEventsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      ref={exportRef}
      className={`participation-landing-page-global ${styles.participationLandingPage} ${
        darkMode ? styles.participationLandingPageDark : ''
      }`}
    >
      <EventParticipationHeader events={events} loading={eventsLoading} />
      <EngagementSummaryCards />
      <div className={styles.chartsSection}>
        <div className={styles.chartsRow}>
          <EventTypePieChart events={events} />
          <EngagementBarChart events={events} />
        </div>
      </div>

      <MyCases events={events} />
      <div className={`${styles.analyticsSection}`}>
        <DropOffTracking />
        <NoShowInsights />
      </div>
      <AnalyticsNavigation />

      {/* Print-only footer note */}
    </div>
  );
}

export default EventParticipation;
