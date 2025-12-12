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

  const [dateError, setDateError] = useState('');

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
      {
        id: 2,
        name: 'Book Club',
        type: 'Social',
        date: '2024-01-12',
        location: 'Library',
      },
      {
        id: 3,
        name: 'Coding Workshop',
        type: 'Educational',
        date: '2023-12-30',
        location: 'Tech Hub',
      },
      {
        id: 4,
        name: 'Painting Session',
        type: 'Art',
        date: '2024-01-15',
        location: 'Art Studio',
      },
      {
        id: 5,
        name: 'Dance Class',
        type: 'Fitness',
        date: '2024-01-10',
        location: 'Community Center',
      },
      {
        id: 6,
        name: 'Gardening Meetup',
        type: 'Social',
        date: '2024-01-20',
        location: 'Botanical Garden',
      },
      {
        id: 7,
        name: 'Cooking Class',
        type: 'Educational',
        date: '2024-01-18',
        location: 'Culinary School',
      },
      {
        id: 8,
        name: 'Photography Walk',
        type: 'Art',
        date: '2023-12-30',
        location: 'City Park',
      },
      {
        id: 9,
        name: 'Marathon Training',
        type: 'Fitness',
        date: '2024-02-01',
        location: 'Stadium',
      },
      {
        id: 10,
        name: 'Chess Tournament',
        type: 'Social',
        date: '2024-01-12',
        location: 'Library',
      },
      {
        id: 11,
        name: 'Tech Talk',
        type: 'Educational',
        date: '2024-01-15',
        location: 'Tech Hub',
      },
      {
        id: 12,
        name: 'Sculpture Workshop',
        type: 'Art',
        date: '2024-01-25',
        location: 'Art Studio',
      },
      {
        id: 13,
        name: 'Pilates Class',
        type: 'Fitness',
        date: '2024-01-20',
        location: 'Community Center',
      },
      {
        id: 14,
        name: 'Film Screening',
        type: 'Social',
        date: '2024-01-18',
        location: 'Library',
      },
      {
        id: 15,
        name: 'Robotics Expo',
        type: 'Educational',
        date: '2024-01-10',
        location: 'Tech Hub',
      },
    ];
    setActivities(fetchedActivities);
  }, []);

  const handleDateChange = e => {
    const selected = new Date(e.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selected < today) {
      setDateError('Past dates are not supported. Please select a future date.');
      setFilter({ ...filter, date: '' });
      return;
    }

    setDateError('');
    setFilter({ ...filter, date: e.target.value });
  };

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const filteredActivities = activities.filter(activity => {
    return (
      (!filter.type || activity.type.toLowerCase().includes(filter.type.toLowerCase())) &&
      (!filter.date || activity.date === filter.date) &&
      (!filter.location || activity.location.toLowerCase().includes(filter.location.toLowerCase()))
    );
  });

  return (
    <div className={`${styles.body} ${darkMode ? styles.bodyDark : ''}`}>
      <h1 className={`${styles.h1} ${darkMode ? styles.textLight : styles.textDark}`}>
        Activity List
      </h1>

      <div className={`${styles.filters} ${darkMode ? styles.filtersDark : ''}`}>
        <label className={darkMode ? styles.textLight : styles.textDark}>
          Type:
          <input
            type="text"
            name="type"
            value={filter.type}
            onChange={handleFilterChange}
            placeholder="Enter type"
            className={`${styles.input} ${darkMode ? styles.inputDark : ''}`}
          />
        </label>

        <label className={darkMode ? styles.textLight : styles.textDark}>
          Date:
          <input
            type="date"
            name="date"
            min={new Date().toISOString().split('T')[0]}
            value={filter.date}
            onChange={handleDateChange}
            className={`${styles.input} ${darkMode ? styles.inputDark : ''}`}
          />
        </label>

        {dateError && <div className={styles.errorMessage}>{dateError}</div>}

        <label className={darkMode ? styles.textLight : styles.textDark}>
          Location:
          <input
            type="text"
            name="location"
            value={filter.location}
            onChange={handleFilterChange}
            placeholder="Enter location"
            className={`${styles.input} ${darkMode ? styles.inputDark : ''}`}
          />
        </label>
      </div>
      <div className={`${styles.activityList} ${darkMode ? styles.activityListDark : ''}`}>
        {filteredActivities.length > 0 ? (
          <ul>
            {filteredActivities.map(activity => (
              <li
                key={activity.id}
                className={`${styles.listItem} ${darkMode ? styles.listItemDark : ''}`}
              >
                <strong>{activity.name}</strong> - {activity.type} - {activity.date} -{' '}
                {activity.location}
              </li>
            ))}
          </ul>
        ) : (
          <p className={darkMode ? styles.textLight : styles.textDark}>No activities found</p>
        )}
      </div>
    </div>
  );
}

export default ActivityList;
