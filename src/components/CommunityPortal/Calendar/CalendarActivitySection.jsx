import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './CommunityCalendar.module.css';

function CalendarActivitySection({ selectedDate, events = [], onEventClick }) {
  const [sortOption, setSortOption] = useState('newest');

  const darkMode = useSelector(state => state.theme.darkMode);

  const calendarActivities = [
    {
      id: 1,
      author: 'Jiaqi',
      message: 'Published event 1 approved',
      time: '2 min ago',
      timestamp: Date.now() - 120000,
    },
    {
      id: 2,
      author: 'Alex',
      message: 'Event 2 needs attendees',
      time: '1 hour ago',
      timestamp: Date.now() - 3600000,
    },
    {
      id: 3,
      author: 'Taylor',
      message: 'Updated workshop details',
      time: '3 hours ago',
      timestamp: Date.now() - 10800000,
    },
  ];

  const getSortedActivities = () => {
    const activitiesCopy = [...calendarActivities];

    switch (sortOption) {
      case 'newest':
        return activitiesCopy.sort((a, b) => b.timestamp - a.timestamp);

      case 'oldest':
        return activitiesCopy.sort((a, b) => a.timestamp - b.timestamp);

      case 'a-z':
        return activitiesCopy.sort((a, b) => a.author.localeCompare(b.author));

      case 'z-a':
        return activitiesCopy.sort((a, b) => b.author.localeCompare(a.author));

      default:
        return activitiesCopy;
    }
  };

  const sortedActivities = getSortedActivities();

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
      <div className={styles.activityHeaderContainer}>
        <h2 className={`${styles.activityHeader} ${darkMode ? styles.activityHeaderDarkMode : ''}`}>
          {selectedDate ? `Events for ${formatDate(selectedDate)}` : 'Latest News'}
        </h2>

        {!selectedDate && (
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
            className={`${styles.sortDropdown} ${darkMode ? styles.sortDropdownDarkMode : ''}`}
            aria-label="Sort latest news"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="a-z">A–Z</option>
            <option value="z-a">Z–A</option>
          </select>
        )}
      </div>

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
          {sortedActivities.map(activity => (
            <li
              key={activity.id}
              className={`${styles.calendarActivityItem} ${
                darkMode ? styles.calendarActivityItemDarkMode : ''
              }`}
            >
              <p
                className={`${styles.activityMessage} ${
                  darkMode ? styles.activityMessageDarkMode : ''
                }`}
              >
                <strong>{activity.author}</strong>: {activity.message}
              </p>

              <small
                className={`${styles.activityTime} ${darkMode ? styles.activityTimeDarkMode : ''}`}
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
