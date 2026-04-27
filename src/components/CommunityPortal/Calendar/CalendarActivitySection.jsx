import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import styles from './CommunityCalendar.module.css';

function CalendarActivitySection({ selectedDate, events = [], onEventClick }) {
  const [sortOption, setSortOption] = useState('newest');
  const darkMode = useSelector(state => state.theme.darkMode);

  // The "Latest News" feed data
  const calendarActivities = useMemo(() => [
    { id: 1, author: 'Jiaqi', message: 'Published event 1 approved', time: '2 min ago', timestamp: Date.now() - 120000 },
    { id: 2, author: 'Alex', message: 'Event 2 needs attendees', time: '1 hour ago', timestamp: Date.now() - 3600000 },
    { id: 3, author: 'Taylor', message: 'Updated workshop details', time: '3 hours ago', timestamp: Date.now() - 10800000 },
  ], []);

  // Helper to format the calendar's selected date
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Independent sorting logic for the "Latest News" feed
  const sortedActivities = useMemo(() => {
    const activitiesCopy = [...calendarActivities];
    switch (sortOption) {
      case 'newest': return activitiesCopy.sort((a, b) => b.timestamp - a.timestamp);
      case 'oldest': return activitiesCopy.sort((a, b) => a.timestamp - b.timestamp);
      case 'a-z': return activitiesCopy.sort((a, b) => a.author.localeCompare(b.author));
      case 'z-a': return activitiesCopy.sort((a, b) => b.author.localeCompare(a.author));
      default: return activitiesCopy;
    }
  }, [sortOption, calendarActivities]);

  return (
    <div className={`${styles.calendarActivitySection} ${darkMode ? styles.calendarActivitySectionDarkMode : ''}`}>
      
      {/* Header logic: Shows sorting only for News Feed, but title changes for Date Selection */}
      <div className={styles.activityHeaderContainer}>
        <h2 className={`${styles.activityHeader} ${darkMode ? styles.activityHeaderDarkMode : ''}`}>
          {selectedDate ? `Events for ${formatDate(selectedDate)}` : 'Latest News'}
        </h2>

        {!selectedDate && (
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className={`${styles.sortDropdown} ${darkMode ? styles.sortDropdownDarkMode : ''}`}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="a-z">A–Z</option>
            <option value="z-a">Z–A</option>
          </select>
        )}
      </div>

      <div className={styles.activityContentScroll}>
        {selectedDate ? (
          /* --- VIEW 1: Calendar Date Events --- */
          events.length > 0 ? (
            <ul className={styles.calendarActivityList}>
              {events.map((event) => (
                <li key={event.id} className={`${styles.calendarActivityItem} ${darkMode ? styles.calendarActivityItemDarkMode : ''}`}>
                  <button 
                    type="button" 
                    className={styles.eventButton} 
                    onClick={() => onEventClick?.(event)}
                  >
                    <p className={darkMode ? styles.activityMessageDarkMode : styles.activityMessage}>
                      <strong>{event.title}</strong>
                    </p>
                    <small className={darkMode ? styles.activityTimeDarkMode : styles.activityTime}>
                      {event.time} • {event.location}
                    </small>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.activityNoEventsMessage}>No events scheduled for this day.</p>
          )
        ) : (
          /* --- VIEW 2: Independent Sorted Activity Feed --- */
          <ul className={styles.calendarActivityList}>
            {sortedActivities.map((activity) => (
              <li key={activity.id} className={`${styles.calendarActivityItem} ${darkMode ? styles.calendarActivityItemDarkMode : ''}`}>
                <p className={darkMode ? styles.activityMessageDarkMode : styles.activityMessage}>
                  <strong>{activity.author}</strong>: {activity.message}
                </p>
                <small className={darkMode ? styles.activityTimeDarkMode : styles.activityTime}>
                  {activity.time}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CalendarActivitySection;