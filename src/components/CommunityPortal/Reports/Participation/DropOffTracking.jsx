import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './Participation.module.css';
import mockEvents from './mockData';

function DropOffTracking() {
  const [selectedEvent, setSelectedEvent] = useState('All Events');
  const [selectedTime, setSelectedTime] = useState('All Time');
  const darkMode = useSelector(state => state.theme.darkMode);

  const eventTypes = useMemo(() => {
    const uniqueTypes = [...new Set(mockEvents.map(event => event.eventType))];
    return ['All Events', ...uniqueTypes];
  }, []);

  const getDateRange = () => {
    const today = new Date();
    let startDate;
    let endDate;

    if (selectedTime === 'Today') {
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    } else if (selectedTime === 'This Week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (selectedTime === 'This Month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  };

  const parsePercent = value => Number(String(value).replace('%', '').trim()) || 0;

  const filteredEvents = useMemo(() => {
    return mockEvents.filter(event => {
      if (selectedEvent !== 'All Events' && event.eventType !== selectedEvent) {
        return false;
      }

      if (selectedTime !== 'All Time') {
        const { startDate, endDate } = getDateRange();
        const eventDate = new Date(event.eventDate);
        return eventDate >= startDate && eventDate <= endDate;
      }

      return true;
    });
  }, [selectedEvent, selectedTime]);

  const summaryMetrics = useMemo(() => {
    if (!filteredEvents.length) {
      return {
        averageDropOffRate: '0%',
        averageNoShowRate: '0%',
        totalAttendees: 0,
        totalEvents: 0,
      };
    }

    const totalDropOff = filteredEvents.reduce(
      (sum, event) => sum + parsePercent(event.dropOffRate),
      0,
    );

    const totalNoShow = filteredEvents.reduce(
      (sum, event) => sum + parsePercent(event.noShowRate),
      0,
    );

    const totalAttendees = filteredEvents.reduce(
      (sum, event) => sum + (Number(event.attendees) || 0),
      0,
    );

    return {
      averageDropOffRate: `${Math.round(totalDropOff / filteredEvents.length)}%`,
      averageNoShowRate: `${Math.round(totalNoShow / filteredEvents.length)}%`,
      totalAttendees,
      totalEvents: filteredEvents.length,
    };
  }, [filteredEvents]);

  return (
    <section
      className={`tracking-container-global ${styles.trackingContainer} ${
        darkMode ? styles.trackingContainerDark : ''
      }`}
    >
      <div className={`${styles.trackingHeader} ${darkMode ? styles.trackingHeaderDark : ''}`}>
        <div>
          <h3>Drop-off and no-show rate tracking</h3>
          <p className={styles.sectionSubtext}>
            Review attendance reliability, event retention, and participation trends by event type
            and time range.
          </p>
        </div>

        <div className={`${styles.trackingFilters} ${darkMode ? styles.trackingFiltersDark : ''}`}>
          <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
            {eventTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)}>
            <option value="All Time">All Time</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
          </select>
        </div>
      </div>

      <div className={styles.trackingSummary}>
        <div className={`${styles.trackingRate} ${darkMode ? styles.trackingRateDark : ''}`}>
          <p className={styles.trackingRateValue}>
            {summaryMetrics.averageDropOffRate} <span>Average</span>
          </p>
          <p className={styles.trackingRateSubheading}>
            <span>Drop-off rate</span>
          </p>
        </div>

        <div className={`${styles.trackingRate} ${darkMode ? styles.trackingRateDark : ''}`}>
          <p className={styles.trackingRateValue}>
            {summaryMetrics.averageNoShowRate} <span>Average</span>
          </p>
          <p className={styles.trackingRateSubheading}>
            <span>No-show rate</span>
          </p>
        </div>

        <div className={`${styles.trackingRate} ${darkMode ? styles.trackingRateDark : ''}`}>
          <p className={styles.trackingRateValue}>
            {summaryMetrics.totalAttendees} <span>Total</span>
          </p>
          <p className={styles.trackingRateSubheading}>
            <span>Attendees</span>
          </p>
        </div>

        <div className={`${styles.trackingRate} ${darkMode ? styles.trackingRateDark : ''}`}>
          <p className={styles.trackingRateValue}>
            {summaryMetrics.totalEvents} <span>Filtered</span>
          </p>
          <p className={styles.trackingRateSubheading}>
            <span>Events</span>
          </p>
        </div>
      </div>

      <div
        className={`${styles.trackingListContainer} ${
          darkMode ? styles.trackingListContainerDark : ''
        }`}
      >
        <table
          className={`tracking-table-global ${styles.trackingTable} ${
            darkMode ? `tracking-table-global-dark ${styles.trackingTableDark}` : ''
          }`}
        >
          <thead>
            <tr>
              <th>Event name</th>
              <th>Event type</th>
              <th>No-show rate</th>
              <th>Drop-off rate</th>
              <th>Attendees</th>
            </tr>
          </thead>

          <tbody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <tr key={event.id}>
                  <td>{event.eventName}</td>
                  <td>{event.eventType}</td>
                  <td className={styles.trackingRateGreen}>{event.noShowRate}</td>
                  <td className={styles.trackingRateRed}>{event.dropOffRate}</td>
                  <td>{event.attendees}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className={styles.emptyStateCell}>
                  No event participation records found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default DropOffTracking;
