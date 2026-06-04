// Activity List Component
import { useState, useEffect, useMemo } from 'react';
import { useSelector, useStore } from 'react-redux';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import styles from './ActivityList.module.css';
// import { useHistory } from 'react-router-dom';
// import { fuzzySearch } from '../../../utils/fuzzySearch';
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
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dateError, setDateError] = useState('');
  const todayDate = new Date().toISOString().split('T')[0];
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
    if (name === 'date') {
      if (value) {
        // Split Date
        const [year, month, day] = value.split('-').map(Number);
        const selectedDate = new Date(year, month - 1, day);

        //today's date without timezone
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          setDateError(
            'Past Activity Date Lookup is not supported. Please select today or a future date',
          );
        } else {
          setDateError('');
        }
      } else {
        setDateError('');
      }
    }
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
    setLocationSuggestions([]);
    setShowSuggestions(false);
    setDateError('');
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

  const activityTypes = useMemo(() => {
    const typeOrder = new Map();

    activities.forEach(activity => {
      if (activity.type && !typeOrder.has(activity.type)) {
        typeOrder.set(activity.type, typeOrder.size);
      }
    });

    return [...typeOrder.keys()].sort(
      (typeA, typeB) => typeOrder.get(typeA) - typeOrder.get(typeB),
    );
  }, [activities]);

  const filteredActivities = activities
    .filter(activity => showPastEvents || activity._dateObj >= startOfToday)
    .filter(activity => {
      return (
        (!filter.type || fuzzySearch(activity.type, filter.type, 0.5)) &&
        (!filter.date || activity.date === filter.date) &&
        (!filter.location || fuzzySearch(activity.location, filter.location, 0.5))
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

      <div className={`${styles.filters} ${darkMode ? styles.darkModeFilters : ''}`}>
        <div className={styles.filterInputsRow}>
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
              min={todayDate}
              className={darkMode ? styles.darkModeInput : ''}
            />
          </label>

          <label className={darkMode ? 'text-light' : ''}>
            Location:
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="location"
                value={filter.location}
                onChange={handleFilterChange}
                onFocus={() => {
                  if (filter.location) {
                    const suggestions = getLocationSuggestions(filter.location);
                    setLocationSuggestions(suggestions);
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="Enter location"
                autoComplete="off"
                className={darkMode ? styles.darkModeInput : ''}
              />

              {showSuggestions && locationSuggestions.length > 0 && (
                <div
                  className={`${styles.suggestions} ${darkMode ? styles.darkSuggestions : ''}`}
                  role="listbox"
                  aria-label="Location suggestions"
                >
                  {locationSuggestions.map((location, index) => (
                    <div
                      key={index}
                      className={styles.suggestionItem}
                      role="option"
                      tabIndex={0}
                      aria-selected="false"
                      onMouseDown={e => {
                        e.preventDefault();
                        handleSuggestionClick(location);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSuggestionClick(location);
                        }
                      }}
                    >
                      {location}
                    </div>
                  ))}
                </div>
              )}
            </div>
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

          <label
            className={`${styles.showPastToggle} ${darkMode ? styles.darkShowPastToggle : ''}`}
          >
            Show Past Events:
            <input
              type="checkbox"
              checked={showPastEvents}
              onChange={e => setShowPastEvents(e.target.checked)}
            />
          </label>

          <div className={styles.clearButtonWrapper}>
            <button
              type="button"
              onClick={handleClearFilters}
              disabled={!filter.type && !filter.date && !filter.location && !showPastEvents}
              className={styles.clearButton}
            >
              Clear All
            </button>
          </div>
        </div>

        <div className={styles.errorContainer}>
          {dateError && (
            <div className={styles.errorRow}>
              <p className={styles.errorMessage}>{dateError}</p>
            </div>
          )}
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
