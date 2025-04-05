import { useSelector } from 'react-redux';

function CalendarActivitySection() {
  const calendarActivities = [
    { id: 1, author: 'Jiaqi', message: 'Published event 1 approved', time: '2 min ago' },
    { id: 2, author: 'Alex', message: 'Event 2 needs attendees', time: '1 hour ago' },
    { id: 3, author: 'Taylor', message: 'Updated workshop details', time: '3 hours ago' },
  ];

  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div className={`calendar-activity-section ${darkMode ? 'calendar-activity-section' : ''}`}>
      <h2 className={`activity-header ${darkMode ? 'activity-header-dark-mode' : ''}`}>
        Latest News
      </h2>
      <ul className="calendar-activity-list">
        {calendarActivities.map(activity => (
          <li
            key={activity.id}
            className={`calendar-activity-item ${darkMode ? 'calendar-activity-item' : ''}`}
          >
            <p className={`activity-message ${darkMode ? 'activity-message-dark-mode' : ''}`}>
              <strong>{activity.author}</strong>: {activity.message}
            </p>
            <small className={`activity-time ${darkMode ? 'activity-time-dark-mode' : ''}`}>
              {activity.time}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CalendarActivitySection;
