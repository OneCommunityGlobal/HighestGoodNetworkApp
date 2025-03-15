// Activity List Component
import { useState, useEffect } from 'react';
import './ActivityList.css';

function ActivityList() {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState({
    type: '',
    date: '',
    location: '',
  });

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
    <div>
      <h1>Activity List</h1>

      <div className="filters">
        <label>
          Type:
          <input
            type="text"
            name="type"
            value={filter.type}
            onChange={handleFilterChange}
            placeholder="Enter type"
          />
        </label>

        <label>
          Date:
          <input type="date" name="date" value={filter.date} onChange={handleFilterChange} />
        </label>

        <label>
          Location:
          <input
            type="text"
            name="location"
            value={filter.location}
            onChange={handleFilterChange}
            placeholder="Enter location"
          />
        </label>
      </div>

      <div className="activity-list">
        {filteredActivities.length > 0 ? (
          <ul>
            {filteredActivities.map(activity => (
              <li key={activity.id}>
                <strong>{activity.name}</strong> - {activity.type} - {activity.date} -{' '}
                {activity.location}
              </li>
            ))}
          </ul>
        ) : (
          <p>No activities found</p>
        )}
      </div>
    </div>
  );
}

export default ActivityList;
