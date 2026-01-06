/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect } from 'react';
import styles from './ActivityList.module.css';

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

      <div className={styles.filters}>
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

      <div className={styles.activityList}>
        {filteredActivities.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Date</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map(activity => (
                <tr key={activity.id}>
                  <td>{activity.name}</td>
                  <td>{activity.type}</td>
                  <td>{activity.date}</td>
                  <td>{activity.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No activities found</p>
        )}
      </div>

      {/* Modal for Past Date Notification */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.close} onClick={closeModal}>
              &times;
            </button>

            <h2 className={styles.modalTitle}>Invalid Date Selected</h2>
            <p className={styles.modalMessage}>
              Past activity lookup is not supported. Please choose a future date.
            </p>

            <button className={styles.dismissButton} onClick={closeModal}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityList;
