import { useState, useEffect, useRef } from 'react';
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
import {
  getEvents,
  getEventTypes,
  getEventLocations,
  joinWaitlist,
  leaveWaitlist,
} from '~/actions/eventActions';
import styles from './DatabaseDesign.module.css';

const DEFAULT_EVENT_TYPES = ['Workshop', 'Meeting', 'Webinar', 'Social Gathering'];
const DEFAULT_EVENT_LOCATIONS = ['Virtual', 'In person'];

const getEventType = event => event.type || event.eventType || '';
const getEventLocation = event => event.location || '';
const normalizeFormat = value => {
  const normalizedValue = value
    ?.trim()
    .toLowerCase()
    .replace(/[-_]/g, ' ');
  return normalizedValue === 'virtual' || normalizedValue === 'online' ? 'Virtual' : 'In person';
};
const getEventFormat = event => {
  const declaredFormat = event.format || event.eventFormat;
  return normalizeFormat(declaredFormat || getEventLocation(event));
};
const matchesValue = (value, filter) =>
  !filter || value.trim().toLowerCase() === filter.trim().toLowerCase();

const NAVIGATION_ACTIONS = {
  confirm: {
    label: 'Confirm Attendance',
    path: eventId => `/communityportal/Activities/Register/${eventId}`,
    error: 'Failed to navigate to attendance confirmation',
  },
  log: {
    label: 'Log Activity',
    path: () => '/communityportal/ActivityAttendance',
    error: 'Failed to navigate to activity logging',
  },
  reports: {
    label: 'Reports',
    path: () => '/communityportal/reports/participation',
    error: 'Failed to navigate to reports',
  },
};

function NavigationActionButton({ eventId, action, isLoading, onNavigate }) {
  const { label } = NAVIGATION_ACTIONS[action];

  return (
    <button
      onClick={() => onNavigate(eventId, action)}
      className={styles.actionButton}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <FaSpinner className={styles.buttonSpinner} /> Opening…
        </>
      ) : (
        label
      )}
    </button>
  );
}

function EventActions({
  event,
  isFull,
  alreadyJoined,
  userId,
  actionLoading,
  onNavigate,
  onJoinWaitlist,
  onLeaveWaitlist,
}) {
  const eventId = event._id || event.id;
  const waitlistAction = alreadyJoined ? onLeaveWaitlist : onJoinWaitlist;
  const isWaitlistAction = isFull || alreadyJoined;

  if (isFull && !alreadyJoined && !event.waitlistEnabled) {
    return (
      <div className={styles.eventActions}>
        <output className={styles.fullEventMessage}>Event full</output>
      </div>
    );
  }

  if (isWaitlistAction) {
    const isLoading = actionLoading[`waitlist-${eventId}`];
    let buttonLabel = 'Join Waitlist';
    if (alreadyJoined) buttonLabel = 'Leave Waitlist';
    else if (!userId) buttonLabel = 'Login to Join';

    return (
      <div className={styles.eventActions}>
        <button
          onClick={() => void waitlistAction(eventId)}
          className={styles.actionButton}
          disabled={isLoading || (!userId && !alreadyJoined)}
        >
          {isLoading ? (
            <>
              <FaSpinner className={styles.buttonSpinner} /> Processing...
            </>
          ) : (
            buttonLabel
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.eventActions}>
      {Object.keys(NAVIGATION_ACTIONS).map(action => (
        <NavigationActionButton
          key={action}
          eventId={eventId}
          action={action}
          isLoading={actionLoading[`${action}-${eventId}`]}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

function DatabaseDesignEventCard({
  event,
  userId,
  actionLoading,
  isAlreadyInWaitlist,
  onNavigate,
  onJoinWaitlist,
  onLeaveWaitlist,
}) {
  const alreadyJoined = isAlreadyInWaitlist(event);
  const formattedDate = event.date ? moment(event.date).format('dddd, MMM D, YYYY') : 'Date TBD';
  const formattedStartTime = event.startTime ? moment(event.startTime).format('h:mm A') : '';
  const formattedEndTime = event.endTime ? moment(event.endTime).format('h:mm A') : '';
  const timeRange =
    formattedStartTime && formattedEndTime
      ? `${formattedStartTime} - ${formattedEndTime}`
      : event.time || 'Time TBD';
  const location = getEventLocation(event);
  const isVirtual = getEventFormat(event) === 'Virtual';
  const FormatIcon = isVirtual ? FaVideo : FaBuilding;
  const organizer = event.resources?.[0]?.name || 'Organizer TBD';
  const capacity = Number(event.maxAttendees) || 0;
  const currentAttendees = Number(event.currentAttendees) || 0;
  const hasCapacity = capacity > 0;
  const isFull =
    event.status?.toLowerCase() === 'full' || (hasCapacity && currentAttendees >= capacity);
  const statusClass = styles[`status${event.status?.replace(/\s+/g, '')}`];

  return (
    <article
      className={`${styles.eventCard} ${isVirtual ? styles.virtualEvent : styles.inPersonEvent}`}
    >
      <div className={styles.eventHeader}>
        <h3>{event.title}</h3>
        {event.waitlistEnabled && <span className={styles.waitlistBadge}>Waitlist</span>}
        <span className={`${styles.statusBadge} ${statusClass}`}>
          {event.status || 'Status TBD'}
        </span>
      </div>

      <div className={styles.eventFormatIndicator}>
        <span className={styles.formatBadge}>
          <FormatIcon className={styles.formatIcon} />
          {isVirtual ? 'Virtual Event' : 'In-Person Event'}
        </span>
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
          <span>{location || 'Location TBD'}</span>
        </div>
        <div className={styles.eventDetailRow}>
          <FaUsers className={styles.detailIcon} />
          <span>
            {hasCapacity
              ? `${currentAttendees} / ${capacity} attendees`
              : `${currentAttendees} attendees`}
            {event.waitlistCount > 0 && <> • {event.waitlistCount} on waitlist</>}
            {event.waitlistEnabled && !event.userWaitlistPosition && (
              <div className={styles.waitlistAvailable}>Waitlist available</div>
            )}
          </span>
        </div>
      </div>

      <div className={styles.eventMeta}>
        <span className={styles.eventType}>{getEventType(event) || 'Event'}</span>
        <span className={styles.organizer}>Organized by: {organizer}</span>
      </div>
      {event.description && <p className={styles.eventDescription}>{event.description}</p>}
      {event.userWaitlistPosition && (
        <div className={styles.waitlistPosition}>
          You&apos;re on the waitlist (Position #{event.userWaitlistPosition})
        </div>
      )}

      <EventActions
        event={event}
        isFull={isFull}
        alreadyJoined={alreadyJoined}
        userId={userId}
        actionLoading={actionLoading}
        onNavigate={onNavigate}
        onJoinWaitlist={onJoinWaitlist}
        onLeaveWaitlist={onLeaveWaitlist}
      />
    </article>
  );
}

function EventResults({
  loading,
  events,
  userId,
  actionLoading,
  isAlreadyInWaitlist,
  onNavigate,
  onJoinWaitlist,
  onLeaveWaitlist,
}) {
  if (loading) {
    return (
      <output className={styles.refreshing} aria-live="polite">
        <FaSpinner className={styles.buttonSpinner} /> Updating events…
      </output>
    );
  }

  if (events.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No events found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className={styles.eventsGrid}>
      {events.map(event => (
        <DatabaseDesignEventCard
          key={event._id || event.id}
          event={event}
          userId={userId}
          actionLoading={actionLoading}
          isAlreadyInWaitlist={isAlreadyInWaitlist}
          onNavigate={onNavigate}
          onJoinWaitlist={onJoinWaitlist}
          onLeaveWaitlist={onLeaveWaitlist}
        />
      ))}
    </div>
  );
}

function DatabaseDesign() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const previousEventsRef = useRef([]);
  const eventFetchSequenceRef = useRef(0);
  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.userid || payload?.userId || payload?._id || payload?.sub;
    } catch {
      return null;
    }
  };
  const userProfile = useSelector(state => state.userProfile);
  const userId = getUserIdFromToken() || userProfile?._id || userProfile?.userId;
  const history = useHistory();
  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [eventLocations, setEventLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    format: '',
    hasCapacity: false,
    sortDate: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [typesResponse, locationsResponse] = await Promise.allSettled([
          getEventTypes(),
          getEventLocations(),
        ]);
        const types =
          typesResponse.status === 'fulfilled' ? typesResponse.value?.data?.types : null;
        const locations =
          locationsResponse.status === 'fulfilled'
            ? locationsResponse.value?.data?.locations
            : null;
        setEventTypes(
          Array.isArray(types) && types.length
            ? types.filter(type => typeof type === 'string' && type.trim())
            : DEFAULT_EVENT_TYPES,
        );
        setEventLocations(
          Array.isArray(locations) && locations.length
            ? locations.filter(location => typeof location === 'string' && location.trim())
            : DEFAULT_EVENT_LOCATIONS,
        );
      } catch (err) {
        setError(err.message || 'An error occurred while loading data');
      }
    };

    void fetchData();
  }, []);

  const fetchEvents = async () => {
    const requestSequence = eventFetchSequenceRef.current + 1;
    eventFetchSequenceRef.current = requestSequence;
    setLoading(true);
    try {
      setError(null);
      const response = await getEvents({
        type: filters.type,
        location: filters.location,
        page: 1,
        limit: 50,
        userId,
      });
      if (requestSequence !== eventFetchSequenceRef.current) return;

      if (response.data && Array.isArray(response.data.events)) {
        let sortedEvents = response.data.events.filter(event => {
          const matchesType = matchesValue(getEventType(event), filters.type);
          const location = getEventLocation(event);
          const matchesLocation = matchesValue(location, filters.location);
          const matchesFormat = matchesValue(getEventFormat(event), filters.format);
          return matchesType && matchesLocation && matchesFormat;
        });

        if (filters.sortDate === 'earliest') {
          sortedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        } else if (filters.sortDate === 'latest') {
          sortedEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        const previousEvents = previousEventsRef.current;

        setEvents(sortedEvents);
        previousEventsRef.current = sortedEvents;

        // Detect spot opening
        sortedEvents.forEach(event => {
          const prev = previousEvents.find(e => (e._id || e.id) === (event._id || event.id));

          const wasFull = prev?.currentAttendees >= prev?.maxAttendees;
          const isNowAvailable = event.currentAttendees < event.maxAttendees;

          if (wasFull && isNowAvailable && event.userWaitlistPosition) {
            toast.info(`A spot opened for "${event.title}"! You can now join.`);
          }
        });
      } else {
        throw new Error(response.message || 'Failed to fetch events');
      }
    } catch (err) {
      if (requestSequence !== eventFetchSequenceRef.current) return;
      setError(err.message || 'An error occurred while fetching events');
      toast.error(err.message || 'Failed to load events');
    } finally {
      if (requestSequence === eventFetchSequenceRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    void fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (filterType, value) => {
    setLoading(true);
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleClearFilters = () => {
    setLoading(true);
    setFilters({
      type: '',
      location: '',
      format: '',
      hasCapacity: false,
      sortDate: '',
    });
  };

  const handleRetry = () => {
    setError(null);
    void fetchEvents();
  };

  const handleNavigation = (eventId, action) => {
    const { path, error: message } = NAVIGATION_ACTIONS[action];
    const actionKey = `${action}-${eventId}`;
    setActionError('');
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    try {
      history.push(path(eventId));
    } catch (err) {
      setActionError(message);
      toast.error(message);
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleJoinWaitlist = async eventId => {
    setActionLoading(prev => ({ ...prev, [`waitlist-${eventId}`]: true }));

    try {
      const userId = userProfile?._id || userProfile?.userId || getUserIdFromToken();
      if (!userId) {
        toast.error('User not logged in');
        return;
      }

      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await joinWaitlist(eventId, userId, token);

      if (response.data) {
        toast.success(`Added to waitlist (Position ${response.data.position})`);
        await fetchEvents();
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.details ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message;
      toast.error(errorMsg);
    } finally {
      setActionLoading(prev => ({ ...prev, [`waitlist-${eventId}`]: false }));
    }
  };

  const isAlreadyInWaitlist = event => {
    if (!event.waitlist || !userId) return false;

    return event.waitlist.some(entry => entry?.userId === userId || entry?.userId?._id === userId);
  };

  const handleLeaveWaitlist = async eventId => {
    setActionLoading(prev => ({ ...prev, [`waitlist-${eventId}`]: true }));

    try {
      if (!userId) {
        toast.error('User not logged in');
        return;
      }

      const token = localStorage.getItem('token');

      await leaveWaitlist(eventId, userId, token);

      toast.success('Removed from waitlist');

      await fetchEvents();
    } catch (err) {
      const errorMsg =
        err.response?.data?.details ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message;

      toast.error(errorMsg);
    } finally {
      setActionLoading(prev => ({ ...prev, [`waitlist-${eventId}`]: false }));
    }
  };

  if (loading && events.length === 0) {
    return (
      <main className={`${styles.page} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.loadingContainer}>
          <FaSpinner className={styles.spinner} />
          <p>Loading events...</p>
        </div>
      </main>
    );
  }

  if (error && events.length === 0) {
    return (
      <main className={`${styles.page} ${darkMode ? styles.darkMode : ''}`}>
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
      </main>
    );
  }

  const visibleEvents = events.filter(event => {
    if (!filters.hasCapacity) return true;
    const capacity = Number(event.maxAttendees) || 0;
    const currentAttendees = event.currentAttendees || 0;
    return capacity === 0 || currentAttendees < capacity;
  });

  return (
    <main className={`${styles.page} ${darkMode ? styles.darkMode : ''}`}>
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
          <label htmlFor="eventFormat">Format</label>
          <select
            id="eventFormat"
            value={filters.format}
            onChange={e => handleFilterChange('format', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Formats</option>
            {DEFAULT_EVENT_LOCATIONS.map(format => (
              <option key={format} value={format}>
                {format}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.checkboxWrapper}>
            <input
              id="availability"
              type="checkbox"
              checked={filters.hasCapacity}
              onChange={e => handleFilterChange('hasCapacity', e.target.checked)}
            />
            Only show events with available capacity
          </label>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="sortDate">Sort by Date</label>
          <select
            id="sortDate"
            value={filters.sortDate}
            onChange={e => handleFilterChange('sortDate', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">None</option>
            <option value="earliest">Earliest to Latest</option>
            <option value="latest">Latest to Earliest</option>
          </select>
        </div>

        <div className={styles.filtersGroup}>
          {(filters.type ||
            filters.location ||
            filters.format ||
            filters.hasCapacity ||
            filters.sortDate) && (
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

      {actionError && (
        <div className={styles.errorBanner} role="alert">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className={styles.retryButtonSmall}>
            Dismiss
          </button>
        </div>
      )}

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
          Showing {visibleEvents.length} event{visibleEvents.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className={styles.eventsSection}>
        <EventResults
          loading={loading}
          events={visibleEvents}
          userId={userId}
          actionLoading={actionLoading}
          isAlreadyInWaitlist={isAlreadyInWaitlist}
          onNavigate={handleNavigation}
          onJoinWaitlist={handleJoinWaitlist}
          onLeaveWaitlist={handleLeaveWaitlist}
        />
      </div>
    </main>
  );
}

export default DatabaseDesign;
