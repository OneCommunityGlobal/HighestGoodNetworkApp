import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './CommunityCalendar.module.css';

function CalendarActivitySection() {
  const [sortOption, setSortOption] = useState('newest');

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

  const darkMode = useSelector(state => state.theme.darkMode);

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

  return (
    <div
      className={`${styles.calendarActivitySection} ${
        darkMode ? styles.calendarActivitySectionDarkMode : ''
      }`}
    >
      <div className={styles.activityHeaderContainer}>
        <h2 className={`${styles.activityHeader} ${darkMode ? styles.activityHeaderDarkMode : ''}`}>
          Latest News
        </h2>
        <select
          value={sortOption}
          onChange={e => setSortOption(e.target.value)}
          className={`${styles.sortDropdown} ${darkMode ? styles.sortDropdownDarkMode : ''}`}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="a-z">A–Z</option>
          <option value="z-a">Z–A</option>
        </select>
      </div>

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
    </div>
  );
}

export default CalendarActivitySection;
