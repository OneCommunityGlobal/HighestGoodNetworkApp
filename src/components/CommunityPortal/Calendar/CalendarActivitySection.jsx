import { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faLocationDot, faTag } from '@fortawesome/free-solid-svg-icons';
import styles from './CommunityCalendar.module.css';

const STATUS_CLASS = {
  New: 'statusNew',
  'Needs Attendees': 'statusNeedsAttendees',
  'Filling Fast': 'statusFillingFast',
  'Full Event': 'statusFull',
};

const STATUS_ICON = {
  New: '⭐',
  'Needs Attendees': '🙋',
  'Filling Fast': '⚡',
  'Full Event': '⛔',
};

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

  // Defensive filter: even if the parent passes a stale list, only show events matching selectedDate
  const eventsForDate = selectedDate
    ? events.filter(event => {
        if (!event.date) return false;
        return new Date(event.date).toDateString() === selectedDate.toDateString();
      })
    : [];

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
      month: 'long',
      day: 'numeric',
    });
  };

  let eventsSummary = 'No events scheduled';

  if (eventsForDate.length > 0) {
    const eventLabel = eventsForDate.length === 1 ? 'event' : 'events';
    eventsSummary = `${eventsForDate.length} ${eventLabel} scheduled`;
  }

  let activityContent;

  if (!selectedDate) {
    activityContent = (
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
    );
  } else if (eventsForDate.length === 0) {
    activityContent = (
      <div className={styles.activityNoEventsMessage}>
        <p>No events found for this date.</p>
      </div>
    );
  } else {
    activityContent = (
      <ul className={styles.calendarActivityList}>
        {eventsForDate.map(event => {
          const statusClass = STATUS_CLASS[event.status] || 'statusNew';

          return (
            <li
              key={event.id}
              className={`${styles.calendarActivityItem} ${
                darkMode ? styles.calendarActivityItemDarkMode : ''
              }`}
            >
              <button
                type="button"
                className={styles.activityEventBtn}
                onClick={() => onEventClick?.(event)}
                aria-label={`View details for ${event.title}`}
              >
                <div className={styles.activityEventTopRow}>
                  <span
                    className={`${styles.activityStatusBadge} ${
                      darkMode ? styles.activityStatusBadgeDark : ''
                    } ${styles[statusClass]}`}
                  >
                    {STATUS_ICON[event.status] || '⭐'}&nbsp;{event.status}
                  </span>

                  <span
                    className={`${styles.activityEventTime} ${
                      darkMode ? styles.activityEventTimeDark : ''
                    }`}
                  >
                    <FontAwesomeIcon icon={faClock} className={styles.activityMetaIcon} />
                    {event.time}
                  </span>
                </div>

                <p
                  className={`${styles.activityEventTitle} ${
                    darkMode ? styles.activityEventTitleDark : ''
                  }`}
                >
                  {event.title}
                </p>

                <small
                  className={`${styles.activityTime} ${
                    darkMode ? styles.activityTimeDarkMode : ''
                  }`}
                >
                  {event.time} - {event.endTime}
                </small>

                <small
                  className={`${styles.activityLocAndType} ${
                    darkMode ? styles.activityTimeDarkMode : ''
                  }`}
                >
                  <span>
                    <FontAwesomeIcon icon={faLocationDot} className={styles.activityMetaIcon} />
                    {event.location}
                  </span>

                  <span>
                    <FontAwesomeIcon icon={faTag} className={styles.activityMetaIcon} />
                    {event.type}
                  </span>
                </small>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

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

      {selectedDate && (
        <p
          className={`${styles.activityDateSummary} ${
            darkMode ? styles.activityDateSummaryDark : ''
          }`}
        >
          {eventsSummary}
        </p>
      )}

      {activityContent}
    </div>
  );
}

CalendarActivitySection.propTypes = {
  selectedDate: PropTypes.instanceOf(Date),
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      date: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
      title: PropTypes.string,
      status: PropTypes.string,
      time: PropTypes.string,
      endTime: PropTypes.string,
      location: PropTypes.string,
      type: PropTypes.string,
    }),
  ),
  onEventClick: PropTypes.func,
};

CalendarActivitySection.defaultProps = {
  selectedDate: null,
  events: [],
  onEventClick: null,
};

export default CalendarActivitySection;
