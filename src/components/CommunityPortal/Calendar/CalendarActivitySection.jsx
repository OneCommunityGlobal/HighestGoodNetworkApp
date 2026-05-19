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
  const darkMode = useSelector(state => state.theme.darkMode);

  // Defensive filter: even if the parent passes a stale list, only show events matching selectedDate
  const eventsForDate = selectedDate
    ? events.filter(event => {
        if (!event.date) return false;
        return new Date(event.date).toDateString() === selectedDate.toDateString();
      })
    : [];

  const formatDate = date => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
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
        {selectedDate ? formatDate(selectedDate) : 'Select a date'}
      </h2>
      {selectedDate && (
        <p
          className={`${styles.activityDateSummary} ${
            darkMode ? styles.activityDateSummaryDark : ''
          }`}
        >
          {(() => {
            if (eventsForDate.length === 0) return 'No events scheduled';
            const word = eventsForDate.length === 1 ? 'event' : 'events';
            return `${eventsForDate.length} ${word} scheduled`;
          })()}
        </p>
      )}

      {eventsForDate.length > 0 ? (
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
                  onClick={() => onEventClick && onEventClick(event)}
                  aria-label={`View details for ${event.title}`}
                >
                  {/* Status badge + time row */}
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

                  {/* Title */}
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
                    className={`${styles.activityTime} ${
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
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className={styles.activityNoEventsMessage}>
          <p>Select a date with events to see the schedule.</p>
        </div>
      )}
    </div>
  );
}

CalendarActivitySection.propTypes = {
  selectedDate: PropTypes.instanceOf(Date),
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      date: PropTypes.instanceOf(Date),
      title: PropTypes.string,
      status: PropTypes.string,
      time: PropTypes.string,
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
