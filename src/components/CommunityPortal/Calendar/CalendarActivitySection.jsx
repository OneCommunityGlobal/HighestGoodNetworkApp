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
      <h2 className={`${styles.activityHeader} ${darkMode ? styles.activityHeaderDark : ''}`}>
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
                  className={`${styles.eventButton} ${styles.clickable}`}
                  onClick={() => onEventClick && onEventClick(event)}
                  aria-label={`Click to view details for ${event.title}`}
                >
                  <p
                    className={`${styles.activityMessage} ${
                      darkMode ? styles.activityMessageDarkMode : ''
                    }`}
                  >
                    <strong>{event.title}</strong>
                  </p>
                  <p
                    className={`${styles.activityMessage} ${
                      darkMode ? styles.activityMessageDarkMode : ''
                    }`}
                  >
                    {event.type} • {event.location}
                  </p>
                  <small
                    className={`${styles.activityTime} ${
                      darkMode ? styles.activityTimeDarkMode : ''
                    }`}
                  >
                    {event.time} - {event.endTime}
                  </small>
                  <small
                    className={`${styles.activityTime} ${
                      darkMode ? styles.activityTimeDarkMode : ''
                    }`}
                  >
                    Status: {event.status}
                  </small>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.activityNoEventsMessage}>
            <p>No events found for this date.</p>
          </div>
        )
      ) : (
        <ul className={styles.calendarActivityList}>
          {calendarActivities.map(activity => (
            <li
              key={activity.id}
              className={`${styles.calendarActivityItem} ${
                darkMode ? styles.calendarActivityItemDark : ''
              }`}
            >
              <p
                className={`${styles.activityMessage} ${
                  darkMode ? styles.activityMessageDark : ''
                }`}
              >
                <strong>{activity.author}</strong>: {activity.message}
              </p>
              <small
                className={`${styles.activityTime} ${darkMode ? styles.activityTimeDark : ''}`}
              >
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
