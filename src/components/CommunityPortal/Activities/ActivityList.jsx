import React, { useState, useEffect } from 'react';
import './ActivityList.module.css';

function ActivityList() {
  // console.log('ActivityList component rendered');
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState({
    type: '',
    date: '',
    location: '',
  });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // console.log('ActivityList component rendered');
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
        name: 'Coding Workshops',
        type: 'Educational',
        date: '2023-12-30',
        location: 'Tech Hub',
      },
    ];
    setActivities(fetchedActivities);
  }, []);

  const handleFilterChange = e => {
    const { name, value } = e.target;

    // console.log(`Selected ${name}:`, value);

    if (name === 'date') {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // console.log("Today's date:", today);
      if (selectedDate < today) {
        setModalOpen(true); // Open the modal
        setFilter({ ...filter, [name]: '' }); // Reset the filter
      } else {
        setFilter({ ...filter, [name]: value });
      }
    } else {
      setFilter({ ...filter, [name]: value });
    }
  };

  const closeModal = () => {
    setModalOpen(false); // Close the modal
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
      <h1>Activity Lists</h1>

      <div className="styles.filters">
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

      <div className="styles.activity-list">
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

      {/* Modal for Past Date Notification */}
      {modalOpen && (
        <div className="styles.modal-overlay">
          <div className="styles.modal-content">
            <button className={styles.close} onClick={closeModal} onKeyPress={handleKeyPress}>
              &times; {/* Using button for close action */}
            </button>
            <p>Past activity lookup is not supported.</p>
            <button className="dismiss-button" onClick={closeModal}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityList;
