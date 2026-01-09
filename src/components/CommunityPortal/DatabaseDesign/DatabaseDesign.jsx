import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaVideo,
  FaBuilding,
  FaSpinner,
} from 'react-icons/fa';
import moment from 'moment-timezone';
import { getEvents, getEventTypes, getEventLocations } from '~/actions/eventActions';
import styles from './DatabaseDesign.module.css';

function DatabaseDesign() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const history = useHistory();
  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [eventLocations, setEventLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    hasCapacity: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch filter options
        const [typesResponse, locationsResponse] = await Promise.all([
          getEventTypes(),
          getEventLocations(),
        ]);

        if (typesResponse.data) {
          setEventTypes(typesResponse.data.types || []);
        }
        if (locationsResponse.data) {
          setEventLocations(locationsResponse.data.locations || []);
        }

        // Fetch events
        await fetchEvents();
      } catch (err) {
        setError(err.message || 'An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchEvents = async () => {
    try {
      setError(null);
      const response = await getEvents({
        type: filters.type,
        location: filters.location,
        page: 1,
        limit: 50,
      });

      if (response.data && response.data.events) {
        setEvents(response.data.events);
      } else if (response.status && response.status >= 400) {
        throw new Error(response.message || 'Failed to fetch events');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching events');
      toast.error(err.message || 'Failed to load events');
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      type: '',
      location: '',
      hasCapacity: false,
    });
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchEvents().finally(() => setLoading(false));
  };

  const handleConfirmAttendance = async eventId => {
    setActionLoading(prev => ({ ...prev, [`confirm-${eventId}`]: true }));
    try {
      // Navigate to event registration page
      history.push(`/communityportal/Activities/Register/${eventId}`);
    } catch (err) {
      toast.error('Failed to navigate to attendance confirmation');
    } finally {
      setActionLoading(prev => ({ ...prev, [`confirm-${eventId}`]: false }));
    }
  };

  const handleLogActivity = async eventId => {
    setActionLoading(prev => ({ ...prev, [`log-${eventId}`]: true }));
    try {
      // Navigate to activity attendance page
      history.push(`/communityportal/ActivityAttendance`);
    } catch (err) {
      toast.error('Failed to navigate to activity logging');
    } finally {
      setActionLoading(prev => ({ ...prev, [`log-${eventId}`]: false }));
    }
  };

  const handleReports = async eventId => {
    setActionLoading(prev => ({ ...prev, [`reports-${eventId}`]: true }));
    try {
      // Navigate to reports page
      history.push('/communityportal/reports/participation');
    } catch (err) {
      toast.error('Failed to navigate to reports');
    } finally {
      setActionLoading(prev => ({ ...prev, [`reports-${eventId}`]: false }));
    }
  };

  if (loading) {
    return (
      <div className={`${styles.page} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.loadingContainer}>
          <FaSpinner className={styles.spinner} />
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className={`${styles.page} ${darkMode ? styles.darkMode : ''}`}>
        <header className={styles.header}>
          <h1>Event Database Design</h1>
          <p className={styles.subtitle}>Organize and categorize events by type and location</p>
        </header>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>Error: {error}</p>
          <button onClick={handleRetry} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${darkMode ? styles.darkMode : ''}`}>
      <header className={styles.header}>
        <h1>Event Database Design</h1>
        <p className={styles.subtitle}>Organize and categorize events by type and location</p>
      </header>

      <div className={styles.filtersSection}>
        <div className={styles.filterGroup}>
          <label htmlFor="eventType">Event Type</label>
          <select
            id="eventType"
            value={filters.type}
            onChange={e => handleFilterChange('type', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Types</option>
            {eventTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="location">Location</label>
          <select
            id="location"
            value={filters.location}
            onChange={e => handleFilterChange('location', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Locations</option>
            {eventLocations.map(location => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="availability">Availability</label>
          <label className={styles.checkboxWrapper}>
            <input
              type="checkbox"
              checked={filters.hasCapacity}
              onChange={e => handleFilterChange('hasCapacity', e.target.checked)}
            />
            Only show events with available capacity
          </label>
        </div>

        <div className={styles.filtersGroup}>
          {(filters.type || filters.location || filters.hasCapacity) && (
            <button
              id="clearFilter"
              onClick={handleClearFilters}
              className={styles.clearFiltersButton}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {error && events.length > 0 && (
        <div className={styles.errorBanner}>
          <span>Warning: {error}</span>
          <button onClick={handleRetry} className={styles.retryButtonSmall}>
            Retry
          </button>
        </div>
      )}

      <div className={styles.resultsCount}>
        <span>
          Showing {events.length} event{events.length !== 1 ? 's' : ''}
          {filters.type || filters.location
            ? ` (filtered by ${[filters.type, filters.location].filter(Boolean).join(', ')})`
            : ''}
        </span>
      </div>

      <div className={styles.eventsSection}>
        {events.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No events found matching your filters.</p>
          </div>
        ) : (
          <div className={styles.eventsGrid}>
            {events
              .filter(event => {
                if (filters.hasCapacity) {
                  const capacity = event.maxAttendees || 0;
                  const currentAttendees = event.currentAttendees || 0;
                  const hasCapacity = capacity === 0 ? true : currentAttendees < capacity; // unlimited if 0
                  if (!hasCapacity) return false;
                }
                return true;
              })
              .map(event => {
                const formattedDate = event.date
                  ? moment(event.date).format('dddd, MMM D, YYYY')
                  : 'Date TBD';
                const formattedStartTime = event.startTime
                  ? moment(event.startTime).format('h:mm A')
                  : '';
                const formattedEndTime = event.endTime
                  ? moment(event.endTime).format('h:mm A')
                  : '';
                const timeRange =
                  formattedStartTime && formattedEndTime
                    ? `${formattedStartTime} - ${formattedEndTime}`
                    : 'Time TBD';
                const isVirtual = event.location === 'Virtual';
                const organizer = event.resources?.[0]?.name || 'Organizer TBD';
                const capacity = event.maxAttendees || 0;
                const currentAttendees = event.currentAttendees || 0;

                return (
                  <div
                    key={event._id || event.id}
                    className={`${styles.eventCard} ${
                      isVirtual ? styles.virtualEvent : styles.inPersonEvent
                    }`}
                  >
                    <div className={styles.eventHeader}>
                      <h3>{event.title}</h3>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[`status${event.status?.replace(/\s+/g, '')}`]
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>

                    <div className={styles.eventFormatIndicator}>
                      {isVirtual ? (
                        <span className={styles.formatBadge}>
                          <FaVideo className={styles.formatIcon} />
                          Virtual Event
                        </span>
                      ) : (
                        <span className={styles.formatBadge}>
                          <FaBuilding className={styles.formatIcon} />
                          In-Person Event
                        </span>
                      )}
                    </div>

                    <div className={styles.eventDetails}>
                      <div className={styles.eventDetailRow}>
                        <FaCalendarAlt className={styles.detailIcon} />
                        <span>{formattedDate}</span>
                      </div>
                      <div className={styles.eventDetailRow}>
                        <FaClock className={styles.detailIcon} />
                        <span>{timeRange}</span>
                      </div>
                      <div className={styles.eventDetailRow}>
                        <FaMapMarkerAlt className={styles.detailIcon} />
                        <span>{event.location}</span>
                      </div>
                      <div className={styles.eventDetailRow}>
                        <FaUsers className={styles.detailIcon} />
                        <span>
                          {currentAttendees} / {capacity} attendees
                        </span>
                      </div>
                    </div>

                    <div className={styles.eventMeta}>
                      <span className={styles.eventType}>{event.type}</span>
                      <span className={styles.organizer}>Organized by: {organizer}</span>
                    </div>

                    {event.description && (
                      <p className={styles.eventDescription}>{event.description}</p>
                    )}

                    <div className={styles.eventActions}>
                      <button
                        onClick={() => handleConfirmAttendance(event._id || event.id)}
                        className={styles.actionButton}
                        disabled={actionLoading[`confirm-${event._id || event.id}`]}
                      >
                        {actionLoading[`confirm-${event._id || event.id}`] ? (
                          <>
                            <FaSpinner className={styles.buttonSpinner} />
                            Loading...
                          </>
                        ) : (
                          'Confirm Attendance'
                        )}
                      </button>
                      <button
                        onClick={() => handleLogActivity(event._id || event.id)}
                        className={styles.actionButton}
                        disabled={actionLoading[`log-${event._id || event.id}`]}
                      >
                        {actionLoading[`log-${event._id || event.id}`] ? (
                          <>
                            <FaSpinner className={styles.buttonSpinner} />
                            Loading...
                          </>
                        ) : (
                          'Log Activity'
                        )}
                      </button>
                      <button
                        onClick={() => handleReports(event._id || event.id)}
                        className={styles.actionButton}
                        disabled={actionLoading[`reports-${event._id || event.id}`]}
                      >
                        {actionLoading[`reports-${event._id || event.id}`] ? (
                          <>
                            <FaSpinner className={styles.buttonSpinner} />
                            Loading...
                          </>
                        ) : (
                          'Reports'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

export default DatabaseDesign;
