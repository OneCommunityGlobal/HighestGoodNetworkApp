import { useSelector } from 'react-redux';
import styles from './CommunityCalendar.module.css';

function CalendarActivitySection({ selectedDate, events = [], onEventClick }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  const calendarActivities = [
    { id: 1, author: 'Jiaqi', message: 'Published event 1 approved', time: '2 min ago' },
    { id: 2, author: 'Alex', message: 'Event 2 needs attendees', time: '1 hour ago' },
    { id: 3, author: 'Taylor', message: 'Updated workshop details', time: '3 hours ago' },
  ];

  const formatDate = date => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      className={`${styles.calendarActivitySection} ${
        darkMode ? styles.calendarActivitySectionDarkMode : ''
      }`}
    >
      <h2 className={`activity-header ${darkMode ? 'activity-header-dark-mode' : ''}`}>
        {selectedDate ? `Events for ${formatDate(selectedDate)}` : 'Latest News'}
      </h2>
      {selectedDate ? (
        events.length > 0 ? (
          <ul className={styles.calendarActivityList}>
            {events.map(event => (
              <li
                key={event.id}
                className={`${styles.calendarActivityItem} ${
                  darkMode ? styles.calendarActivityItemDarkMode : ''
                }`}
              >
                <button
                  type="button"
                  className={`${styles.clickable} ${styles.eventButton}`}
                  onClick={() => onEventClick && onEventClick(event)}
                  aria-label={`Click to view details for ${event.title}`}
                >
                  <p
                    className={`activity-message ${darkMode ? styles.activityMessageDarkMode : ''}`}
                  >
                    <strong>{event.title}</strong>
                  </p>
                  <p
                    className={`activity-message ${darkMode ? styles.activityMessageDarkMode : ''}`}
                  >
                    {event.type} • {event.location}
                  </p>
                  <small className={`activity-time ${darkMode ? styles.activityTimeDarkMode : ''}`}>
                    {event.time}
                  </small>
                  <small className={`activity-time ${darkMode ? styles.activityTimeDarkMode : ''}`}>
                    Status: {event.status}
                  </small>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.noEventsMessage}>
            <p>No events found for this date.</p>
          </div>
        )
      ) : (
        <ul className={styles.calendarActivityList}>
          {calendarActivities.map(activity => (
            <li
              key={activity.id}
              className={`${styles.calendarActivityItem} ${
                darkMode ? styles.calendarActivityItemDarkMode : ''
              }`}
            >
              <p className={`activity-message ${darkMode ? styles.activityMessageDarkMode : ''}`}>
                <strong>{activity.author}</strong>: {activity.message}
              </p>
              <small className={`activity-time ${darkMode ? styles.activityTimeDarkMode : ''}`}>
                {activity.time}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CalendarActivitySection;
