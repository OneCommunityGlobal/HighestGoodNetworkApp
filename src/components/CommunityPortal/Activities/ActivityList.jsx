import { useState, useEffect, useMemo } from 'react';
import { useSelector, useStore } from 'react-redux';
import styles from './ActivityList.module.css';
import { mockActivities } from './mockActivities';

function ActivityList() {
  let darkMode = false;

  try {
    const store = useStore();
    darkMode = store?.getState()?.theme?.darkMode ?? false;
  } catch (e) {
    darkMode = false;
  }

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    type: '',
    date: '',
    location: '',
    pastEvents: false,
  });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  const getLocationSuggestions = input => {
    if (!input.trim()) return [];

    const uniqueLocations = [...new Set(activities.map(a => a.location))];
    const lowerInput = input.toLowerCase();

    return uniqueLocations.filter(loc => loc.toLowerCase().startsWith(lowerInput)).slice(0, 10);
  };

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });

    if (name === 'location') {
      const suggestions = getLocationSuggestions(value);
      setLocationSuggestions(suggestions);
      setShowSuggestions(true);
    }
  };

  const handleSortChange = e => {
    setSortOrder(e.target.value);
  };

  const handleSuggestionClick = location => {
    setFilter({ ...filter, location });
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  const handleClearFilters = () => {
    setFilter({
      type: '',
      date: '',
      location: '',
      showPastEvents: false,
    });
    setShowPastEvents(false);
    setLocationSuggestions([]);
    setShowSuggestions(false);
  };

  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

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
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Enter location"
              autoComplete="off"
              className={darkMode ? styles.darkModeInput : ''}
            />

            {showSuggestions && locationSuggestions.length > 0 && (
              <div className={`${styles.suggestions} ${darkMode ? styles.darkSuggestions : ''}`}>
                {locationSuggestions.map((location, index) => (
                  <div
                    key={index}
                    role="button"
                    tabIndex={0}
                    className={styles.suggestionItem}
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
              <li
                key={activity.id}
                className={`${styles.activityItem} ${darkMode ? styles.darkModeItem : ''}`}
              >
                <strong>{activity.name}</strong>
                <span>
                  {activity.type} – {activity.date} – {activity.location}
                </span>
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
