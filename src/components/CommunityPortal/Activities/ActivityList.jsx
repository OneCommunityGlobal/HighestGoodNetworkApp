// Activity List Component
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from './ActivityList.module.css';
import { mockActivities } from './mockActivities';
// import { useHistory } from 'react-router-dom';
import {
  FaTag,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaDumbbell,
  FaUsers,
  FaGraduationCap,
  FaPalette,
} from 'react-icons/fa';

function ActivityList() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const darkMode = useSelector(state => state.theme.darkMode);
  const [filter, setFilter] = useState({
    type: '',
    date: '',
    location: '',
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

  const filteredActivities = activities.filter(activity => {
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
    });
    setLocationSuggestions([]);
    setShowSuggestions(false);
  };

  const getTypeIcon = type => {
    switch (type) {
      case 'Fitness':
        return <FaDumbbell className={styles.activityIcon} />;
      case 'Social':
        return <FaUsers className={styles.activityIcon} />;
      case 'Educational':
        return <FaGraduationCap className={styles.activityIcon} />;
      case 'Art':
        return <FaPalette className={styles.activityIcon} />;
      default:
        return <FaTag className={styles.activityIcon} />;
    }
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
        <button
          type="button"
          onClick={handleClearFilters}
          disabled={!filter.type && !filter.date && !filter.location}
          className={styles.clearButton}
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
                <strong>{activity.name}</strong>

                {/* Type */}
                <div className={styles.altypeRow}>
                  {getTypeIcon(activity.type)}
                  <span className={styles.altypeText}>{activity.type}</span>
                </div>

                {/* Location + Date */}
                <div className={styles.allocationDateRow}>
                  <div className={styles.allocation}>
                    <FaMapMarkerAlt className={styles.alactivityIcon} />
                    <span>{activity.location}</span>
                  </div>

                  <div className={styles.aldate}>
                    <FaCalendarAlt className={styles.alactivityIcon} />
                    <span>{activity.date}</span>
                  </div>
                </div>
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
