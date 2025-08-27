import { useSelector } from 'react-redux';
import styles from './CommunityCalendar.module.css';

function CalendarActivitySection() {
  const calendarActivities = [
    { id: 1, author: 'Jiaqi', message: 'Published event 1 approved', time: '2 min ago' },
    { id: 2, author: 'Alex', message: 'Event 2 needs attendees', time: '1 hour ago' },
    { id: 3, author: 'Taylor', message: 'Updated workshop details', time: '3 hours ago' },
  ];

  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div
      className={`${styles.calendarActivitySection} ${
        darkMode ? styles.calendarActivitySectionDarkMode : ''
      }`}
    >
      <h2 className={`activity-header ${darkMode ? 'activity-header-dark-mode' : ''}`}>
        Latest News
      </h2>
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
    </div>
  );
}

export default CalendarActivitySection;
