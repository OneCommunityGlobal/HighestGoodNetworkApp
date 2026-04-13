// Activity List Component
import { useState, useEffect, useMemo } from 'react';
import { useSelector, useStore } from 'react-redux';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import styles from './ActivityList.module.css';
import { mockActivities } from './mockActivities';

function ActivityList() {
  

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);
  const [filter, setFilter] = useState({
    type: '',
    date: '',
    location: '',
    pastEvents: false,
  });
  const [sortOrder, setSortOrder] = useState('earliest');
  const [showPastEvents, setShowPastEvents] = useState(false);

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
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        throw new Error('API not implemented yet');
      } catch (err) {
        setError(err.message);
        const parsed = mockActivities.map(a => ({
          ...a,
          _dateObj: new Date(`${a.date}T00:00:00`),
        }));
        setActivities(parsed);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const handleSortChange = e => {
    setSortOrder(e.target.value);
  };

  const handleClearFilters = () => {
    setFilter({
      type: '',
      date: '',
      location: '',
      showPastEvents: false,
    });
    setShowPastEvents(false);
  };

  const handleActivityClick = activity => {
    setSelectedActivity(activity);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const activityTypes = useMemo(
    () => [...new Set(activities.map(activity => activity.type).filter(Boolean))].sort(),
    [activities],
  );

  const filteredActivities = activities
    .filter(activity => showPastEvents || activity._dateObj >= startOfToday)
    .filter(activity => {
      return (
        (!filter.type || activity.type === filter.type) &&
        (!filter.date || activity.date === filter.date) &&
        (!filter.location ||
          activity.location.toLowerCase().startsWith(filter.location.toLowerCase()))
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'earliest' ? dateA - dateB : dateB - dateA;
    });

  return (
    <div
      className={`${styles.activityListContainer} ${
        darkMode ? styles.activityListContainerDark : ''
      }`}
    >
      <h1 className={`${styles.heading} ${darkMode ? 'text-light' : ''}`}>Activity List</h1>

      <div className={`${darkMode ? styles.darkModeFilters : styles.filters}`}>
        <label className={darkMode ? 'text-light' : ''}>
          Type:
          <select
            name="type"
            value={filter.type}
            onChange={handleFilterChange}
            className={darkMode ? styles.darkModeInput : ''}
          >
            <option value="">All Types</option>
            {activityTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className={darkMode ? 'text-light' : ''}>
          Date:
          <input
            type="date"
            name="date"
            value={filter.date}
            onChange={handleFilterChange}
            className={darkMode ? styles.darkModeInput : ''}
            min={new Date().toISOString().split('T')[0]}
          />
        </label>

        <label className={darkMode ? 'text-light' : ''}>
          Sort By:
          <select
            value={sortOrder}
            onChange={handleSortChange}
            className={darkMode ? styles.darkModeInput : ''}
          >
            <option value="earliest">Start Time: Earliest to Latest</option>
            <option value="latest">Start Time: Latest to Earliest</option>
          </select>
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
        <label className={`${styles.showPastToggle} ${darkMode ? styles.darkShowPastToggle : ''}`}>
          Show Past Events:
          <input
            type="checkbox"
            name="showPastEvents"
            checked={showPastEvents}
            onChange={e => setShowPastEvents(e.target.checked)}
          />
        </label>

        <div className={styles.clearButtonWrapper}>
          <button
            type="button"
            onClick={handleClearFilters}
            disabled={!filter.type && !filter.date && !filter.location && !showPastEvents}
            className={`${styles.clearFiltersButton} ${
              darkMode ? styles.clearFiltersButtonDark : ''
            }`}
          >
            Clear All
          </button>
        </div>
      </div>

      <div className={`${styles.activityList} ${darkMode ? styles.darkModeList : ''}`}>
        {loading ? (
          <p className={darkMode ? 'text-light' : ''}>Loading activities...</p>
        ) : filteredActivities.length > 0 ? (
          <ul>
            {filteredActivities.map(activity => (
              <div
                key={activity.id}
                style={{ cursor: 'pointer' }}
                onClick={() => handleActivityClick(activity)}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${activity.name}`}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleActivityClick(activity);
                  }
                }}
              >

              
              <li
                key={activity.id}
                className={`${styles.activityItem} ${darkMode ? styles.darkModeItem : ''}`}
              >
                <strong>{activity.name}</strong>
                <span>
                  {activity.type} – {activity.date} – {activity.location}
                </span>
              </li>
              </div>
            ))}
          </ul>
        ) : (
          <p className={darkMode ? 'text-light' : ''}>No activities found</p>
        )}
      </div>

      {/* Modal for activity details */}
      <Modal isOpen={modalOpen} toggle={handleCloseModal}>
        <ModalHeader toggle={handleCloseModal}>
          {selectedActivity ? selectedActivity.name : ''}
        </ModalHeader>
        <ModalBody>
          {selectedActivity && (
            <div>
              <p>
                <strong>Type:</strong> {selectedActivity.type}
              </p>
              <p>
                <strong>Date:</strong> {selectedActivity.date}
              </p>
              <p>
                <strong>Time:</strong> {selectedActivity.time}
              </p>
              <p>
                <strong>Location:</strong> {selectedActivity.location}
              </p>
              <p>
                <strong>Description:</strong> {selectedActivity.description}
              </p>
              {/* Add more details as needed */}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default ActivityList;
