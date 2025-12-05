// Activity List Component
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from './ActivityList.module.css';
// import { useHistory } from 'react-router-dom';

function ActivityList() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState({
    type: '',
    date: '',
    location: '',
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('activity-list-dark-body');
    } else {
      document.body.classList.remove('activity-list-dark-body');
    }

    return () => {
      document.body.classList.remove('activity-list-dark-body');
    };
  }, [darkMode]);

  useEffect(() => {
    // Fetch activities (mock or replace with API call)
    const fetchedActivities = [
      {
        id: 1,
        name: 'Yoga Class',
        type: 'Fitness',
        date: '2024-01-10',
        location: 'Community Center',
      },
      { id: 2, name: 'Book Club', type: 'Social', date: '2024-01-12', location: 'Library' },
      {
        id: 3,
        name: 'Coding Workshop',
        type: 'Educational',
        date: '2023-12-30',
        location: 'Tech Hub',
      },
    ];
    setActivities(fetchedActivities);
  }, []);

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const filteredActivities = activities.filter(activity => {
    return (
      (!filter.type || activity.type.includes(filter.type)) &&
      (!filter.date || activity.date === filter.date) &&
      (!filter.location || activity.location.includes(filter.location))
    );
  });

  return (
    <div className={`${styles.activityListContainer} ${darkMode ? 'bg-oxford-blue' : ''}`}>
      <h1 className={`${styles.heading} ${darkMode ? 'text-light' : ''}`}>Activity List</h1>

      <div className={`${styles.filters} ${darkMode ? styles.darkModeFilters : ''}`}>
        <label className={darkMode ? 'text-light' : ''}>
          Type:
          <input
            type="text"
            name="type"
            value={filter.type}
            onChange={handleFilterChange}
            placeholder="Enter type"
            className={darkMode ? styles.darkModeInput : ''}
          />
        </label>

        <label className={darkMode ? 'text-light' : ''}>
          Date:
          <input
            type="date"
            name="date"
            value={filter.date}
            onChange={handleFilterChange}
            className={darkMode ? styles.darkModeInput : ''}
          />
        </label>

        <label className={darkMode ? 'text-light' : ''}>
          Location:
          <input
            type="text"
            name="location"
            value={filter.location}
            onChange={handleFilterChange}
            placeholder="Enter location"
            className={darkMode ? styles.darkModeInput : ''}
          />
        </label>
      </div>
      <div className={`${styles.activityList} ${darkMode ? styles.darkModeList : ''}`}>
        {filteredActivities.length > 0 ? (
          <ul>
            {filteredActivities.map(activity => (
              <li key={activity.id} className={darkMode ? styles.darkModeItem : ''}>
                <strong>{activity.name}</strong> - {activity.type} - {activity.date} -{' '}
                {activity.location}
              </li>
            ))}
          </ul>
        ) : (
          <p className={darkMode ? 'text-light' : ''}>No activities found</p>
        )}
      </div>
    </div>
  );
}

export default ActivityList;
