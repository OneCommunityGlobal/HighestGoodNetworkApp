import { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from './ActivityList.module.css';
import { mockActivities } from './mockActivities';

function ActivityList() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);
  const [filter, setFilter] = useState({
    type: '',
    date: '',
    location: '',
    pastEvents: false,
  });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Replace with actual API endpoint
        // const response = await fetch('/api/activities');
        // if (!response.ok) {
        //   throw new Error('Failed to fetch activities');
        // }
        // const data = await response.json();
        // setActivities(data);

        // Simulating API call - remove this when real API is available
        // For now, we'll use mock data directly
        throw new Error('API not implemented yet');
      } catch (err) {
        console.warn('Failed to fetch activities from API, using mock data:', err.message);
        setError(err.message);
        // Fallback to mock data
        setActivities(mockActivities);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const visibleActivities = useMemo(() => {
    const parsed = activities.map(a => ({
      ...a,
      _dateObj: new Date(`${a.date}T00:00:00`),
    }));

    const filtered = showPastEvents ? parsed : parsed.filter(a => a._dateObj >= startOfToday);
    filtered.sort((a, b) => a._dateObj - b._dateObj);
    setFilter({ ...filter, pastEvents: showPastEvents });
    return filtered;
  }, [activities, showPastEvents, startOfToday]);

  // Get location suggestions with STRICT prefix-based matching only
  const getLocationSuggestions = input => {
    if (!input.trim()) {
      return [];
    }

    // Get unique locations
    const uniqueLocations = [...new Set(activities.map(a => a.location))];
    const lowerInput = input.toLowerCase();

    // ONLY return locations that START with the input (prefix matching)
    const prefixMatches = uniqueLocations.filter(loc => loc.toLowerCase().startsWith(lowerInput));

    // Limit to top 10 results
    return prefixMatches.slice(0, 10);
  };

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });

    // Update location suggestions when location input changes
    if (name === 'location') {
      const suggestions = getLocationSuggestions(value);
      setLocationSuggestions(suggestions);
      setShowSuggestions(true);
    }
  };

  const filteredActivities = visibleActivities.filter(activity => {
    return (
      (!filter.type || activity.type === filter.type) &&
      (!filter.date || activity.date === filter.date) &&
      (!filter.location ||
        activity.location.toLowerCase().startsWith(filter.location.toLowerCase()))
    );
  });

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
      pastEvents: false,
    });
    setShowPastEvents(false);
    setLocationSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className={`${styles.body} ${darkMode ? styles.darkBody : ''}`}>
      <h1 className={styles.h1}>Activity List</h1>

      <div className={`${styles.filters} ${darkMode ? styles.darkFilters : ''}`}>
        <label>
          Type:
          <select name="type" value={filter.type} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Fitness">Fitness</option>
            <option value="Social">Social</option>
            <option value="Educational">Educational</option>
            <option value="Art">Art</option>
          </select>
        </label>

        <label>
          Date:
          <input type="date" name="date" value={filter.date} onChange={handleFilterChange} />
        </label>

        <label>
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
                // Delay to allow click on suggestion
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder="Enter location"
              autoComplete="off"
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
                      e.preventDefault(); // Prevent blur from firing
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
        <button
          type="button"
          className={`${styles.clearFiltersButton} ${
            darkMode ? styles.clearFiltersButtonDark : ''
          }`}
          onClick={handleClearFilters}
          disabled={!filter.type && !filter.date && !filter.location && !filter.pastEvents}
        >
          Clear All
        </button>
      </div>

      <div className={`${styles.activityList} ${darkMode ? styles.darkActivityList : ''}`}>
        {loading ? (
          <p>Loading activities...</p>
        ) : filteredActivities.length > 0 ? (
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
