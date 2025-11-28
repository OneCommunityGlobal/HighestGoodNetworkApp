import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import CalendarActivitySection from './CalendarActivitySection';
import styles from './CommunityCalendar.module.css';
import { and } from 'ajv/dist/compile/codegen';

const mockEvents = [
  {
    id: 1,
    title: 'Event 1',
    type: 'Workshop',
    location: 'Virtual',
    time: '10:00 AM',
    date: new Date(2025, 0, 27),
    status: 'New',
    description: 'Detailed description of Event 1.',
    registeredCount: 1,
    capacity: 20,
  },
  {
    id: 2,
    title: 'Event 2',
    type: 'Meeting',
    location: 'In person',
    time: '2:00 PM',
    date: new Date(2025, 0, 31),
    status: 'Needs Attendees',
    description: 'Detailed description of Event 2.',
    registeredCount: 2,
    capacity: 10,
  },
  {
    id: 3,
    title: 'Event 3',
    type: 'Workshop',
    location: 'Virtual',
    time: '12:00 PM',
    date: new Date(2025, 0, 28),
    status: 'New',
    description: 'Detailed description of Event 3.',
    registeredCount: 1,
    capacity: 100,
  },
  {
    id: 4,
    title: 'Event 4 (Full)',
    type: 'Webinar',
    location: 'Virtual',
    time: '3:00 AM',
    date: new Date(2025, 0, 3),
    status: 'Full',
    description: 'Detailed description of Event 4.',
    registeredCount: 10,
    capacity: 10,
  },
  {
    id: 5,
    title: 'Event 5',
    type: 'Social Gathering',
    location: 'In person',
    time: '11:00 AM',
    date: new Date(2025, 0, 28),
    status: 'Filling Fast',
    description: 'Detailed description of Event 5.',
    registeredCount: 49,
    capacity: 50,
  },
];

function CommunityCalendar() {
  const [filter, setFilter] = useState({ type: 'all', location: 'all', status: 'all' });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState(mockEvents);

  // Derive status from count/capacity
  const getDerivedStatus = useCallback(event => {
    if (event.registeredCount === undefined || !event.capacity) {
      return event.status;
    }

    const count = event.registeredCount;
    const capacity = event.capacity;

    if (count >= capacity) return 'Full';
    if (count >= capacity * 0.7) return 'Filling Fast'; // 70% threshold
    if (capacity * 0.1 < count && count <= capacity * 0.2) return 'Needs Attendees'; // between 10% and 20% of capacity

    return 'New';
  }, []);

  // Function to determine the CSS class based on the derived status
  const getEventStatusClass = useCallback(dynamicStatus => {
    let statusClassName;

    switch (dynamicStatus) {
      case 'Full':
        statusClassName = styles.statusFull;
        break;
      case 'Filling Fast':
        statusClassName = styles.statusFillingFast;
        break;
      case 'New':
        statusClassName = styles.statusNew;
        break;
      case 'Needs Attendees':
        statusClassName = styles.statusNeedsAttendees;
        break;
      default:
        statusClassName = '';
    }
    return statusClassName;
  }, []);

  // Handler for registration button click
  const handleRegister = useCallback(
    eventToRegister => {
      if (getDerivedStatus(eventToRegister) === 'Full') {
        alert('This event is full!');
        return;
      }

      const updatedEvent = {
        ...eventToRegister,
        registeredCount: (eventToRegister.registeredCount || 0) + 1,
      };

      setEvents(prevEvents =>
        prevEvents.map(ev => (ev.id === eventToRegister.id ? updatedEvent : ev)),
      );

      setSelectedEvent(updatedEvent);

      console.log(
        `Registered for ${updatedEvent.title}! Count updated to ${updatedEvent.registeredCount}.`,
      );
    },
    [getDerivedStatus],
  );

  // Memoized filtered events - only recalculates when filter or events change
  const filteredEvents = useMemo(() => {
    return events.filter(
      event =>
        (filter.type === 'all' || event.type === filter.type) &&
        (filter.location === 'all' || event.location === filter.location) &&
        (filter.status === 'all' || getDerivedStatus(event) === filter.status),
    );
  }, [filter, events, getDerivedStatus]);

  // Enhanced event caching by date - memoized for performance
  const eventCache = useMemo(() => {
    const cache = new Map();
    filteredEvents.forEach(event => {
      const dateKey = event.date.toDateString();
      if (!cache.has(dateKey)) {
        cache.set(dateKey, []);
      }
      cache.get(dateKey).push(event);
    });
    return cache;
  }, [filteredEvents]);

  // Memoized event count by date for quick lookups
  const eventCountByDate = useMemo(() => {
    const countMap = new Map();
    filteredEvents.forEach(event => {
      const dateKey = event.date.toDateString();
      countMap.set(dateKey, (countMap.get(dateKey) || 0) + 1);
    });
    return countMap;
  }, [filteredEvents]);

  // Memoized unique filter values for dropdowns
  const uniqueFilterValues = useMemo(() => {
    const types = [...new Set(events.map(event => event.type))];
    const locations = [...new Set(events.map(event => event.location))];

    // Use the dynamic statuses for the filter dropdown
    const dynamicStatuses = ['Full', 'Filling Fast', 'Open', 'New', 'Needs Attendees'];
    const statuses = [...new Set(dynamicStatuses)];

    return { types, locations, statuses };
  }, [events]);

  // Memoized helper function to get events for a specific date
  const getEventsForDate = useCallback(
    date => {
      return eventCache.get(date.toDateString()) || [];
    },
    [eventCache],
  );

  // Handle event click
  const handleEventClick = useCallback(event => {
    setSelectedEvent(event);
    setShowEventModal(true);
  }, []);

  // Handle event key press
  const handleEventKeyPress = useCallback(
    (event, calendarEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleEventClick(calendarEvent);
      }
    },
    [handleEventClick],
  );

  // Close modal
  const closeEventModal = useCallback(() => {
    setShowEventModal(false);
    setSelectedEvent(null);
  }, []);

  // Handle escape key globally when modal is open
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape' && showEventModal) {
        closeEventModal();
      }
    };

    if (showEventModal) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [showEventModal, closeEventModal]);

  // Memoized tile content function
  const tileContent = useCallback(
    ({ date, view }) => {
      if (view === 'month') {
        const eventsForTile = getEventsForDate(date).map(event => {
          const statusClass = getEventStatusClass(getDerivedStatus(event));

          return (
            <div
              key={event.id}
              className={`${styles.eventItem} ${styles.clickable} ${statusClass}`}
              onClick={() => handleEventClick(event)}
              onKeyDown={e => handleEventKeyPress(e, event)}
              role="button"
              tabIndex={0}
              aria-label={`Click to view details for ${event.title}`}
            >
              {event.title}
            </div>
          );
        });
        return eventsForTile.length > 0 ? (
          <div className={styles.tileEvents}>{eventsForTile}</div>
        ) : null;
      }
      return null;
    },
    [
      getEventsForDate,
      handleEventClick,
      handleEventKeyPress,
      getEventStatusClass,
      getDerivedStatus,
    ],
  );

  // Memoized tile class name function
  const tileClassName = useCallback(
    ({ date, view }) => {
      if (view === 'month' && eventCountByDate.has(date.toDateString())) {
        return styles.hasEvents;
      }
      return null;
    },
    [eventCountByDate],
  );

  // Memoized filter change handlers
  const handleTypeFilterChange = useCallback(e => {
    setFilter(prev => ({ ...prev, type: e.target.value }));
  }, []);

  const handleLocationFilterChange = useCallback(e => {
    setFilter(prev => ({ ...prev, location: e.target.value }));
  }, []);

  const handleStatusFilterChange = useCallback(e => {
    setFilter(prev => ({ ...prev, status: e.target.value }));
  }, []);

  // Memoized dark mode selector
  const darkMode = useSelector(state => state.theme.darkMode);

  // Memoized CSS classes
  const calendarClasses = useMemo(
    () => ({
      container: `${styles.communityCalendar} ${darkMode ? styles.communityCalendarDarkMode : ''}`,
      header: `${styles.calendarHeader} ${darkMode ? styles.calendarHeaderDarkMode : ''}`,
      filters: `${styles.calendarFilters} ${darkMode ? styles.calendarFiltersDarkMode : ''}`,
      main: styles.calendarMain,
      calendarContainer: `${styles.calendarContainer} ${
        darkMode ? styles.calendarContainerDarkMode : ''
      }`,
      activitySection: `${styles.calendarActivitySection} ${
        darkMode ? styles.calendarActivitySectionDarkMode : ''
      }`,
      calendarSection: `${styles.calendarSection} ${
        darkMode ? styles.calendarSectionDarkMode : ''
      }`,
      reactCalendar: `${styles.reactCalendar} ${darkMode ? styles.reactCalendarDarkMode : ''}`,
    }),
    [darkMode],
  );

  return (
    <div className={calendarClasses.container}>
      <header className={calendarClasses.header}>
        <h1>Community Calendar</h1>
        <div className={calendarClasses.filters}>
          <select id="type-filter" value={filter.type} onChange={handleTypeFilterChange}>
            <option value="all">All Types</option>
            {uniqueFilterValues.types.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            id="location-filter"
            value={filter.location}
            onChange={handleLocationFilterChange}
          >
            <option value="all">All Locations</option>
            {uniqueFilterValues.locations.map(location => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          <select id="status-filter" value={filter.status} onChange={handleStatusFilterChange}>
            <option value="all">All Statuses</option>
            {uniqueFilterValues.statuses.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </header>
      <main className={calendarClasses.main}>
        <div className={calendarClasses.calendarContainer}>
          <div className={calendarClasses.activitySection}>
            <CalendarActivitySection />
          </div>
          <div className={calendarClasses.calendarSection}>
            <ReactCalendar
              className={calendarClasses.reactCalendar}
              tileContent={tileContent}
              tileClassName={tileClassName}
            />
          </div>
        </div>
      </main>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <>
          <div
            className={styles.eventModalOverlay}
            role="button"
            tabIndex={0}
            aria-label="Close event details (click backdrop or press Enter/Space)"
            onClick={e => {
              if (e.target === e.currentTarget) {
                closeEventModal();
              }
            }}
            onKeyDown={e => {
              if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
                e.preventDefault();
                closeEventModal();
              }
            }}
          >
            <div
              className={`${styles.eventModal} ${darkMode ? styles.eventModalDark : ''}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="event-modal-title"
            >
              <div className={styles.modalHeader}>
                <h2 id="event-modal-title">{selectedEvent.title}</h2>
                <button
                  className={styles.modalClose}
                  onClick={closeEventModal}
                  aria-label="Close event details"
                >
                  ×
                </button>
              </div>

              <div className={styles.modalContent}>
                <div className={styles.eventStatus}>
                  <span
                    className={`${styles.statusBadge} ${getEventStatusClass(
                      getDerivedStatus(selectedEvent),
                      selectedEvent.status,
                    )}`}
                  >
                    {/* Display Dynamic Status */}
                    {getDerivedStatus(selectedEvent)}
                  </span>
                </div>

                <div className={styles.eventDetailsGrid}>
                  <div className={styles.detailItem}>
                    <label htmlFor="event-type">Type:</label>
                    <span id="event-type">{selectedEvent.type}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label htmlFor="event-location">Location:</label>
                    <span id="event-location">{selectedEvent.location}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label htmlFor="event-date">Date:</label>
                    <span id="event-date">{selectedEvent.date.toLocaleDateString()}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label htmlFor="event-time">Time:</label>
                    <span id="event-time">{selectedEvent.time}</span>
                  </div>
                  {/* Display count/capacity for context */}
                  <div className={styles.detailItem}>
                    <label htmlFor="event-registrations">Attendees:</label>
                    <span id="event-registrations">
                      {selectedEvent.registeredCount || 0} / {selectedEvent.capacity || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className={styles.eventDescription}>
                  <label htmlFor="event-description">Description:</label>
                  <p id="event-description">{selectedEvent.description}</p>
                </div>
              </div>

              <div className={styles.modalActions}>
                {/* Attach the handler and disable if full */}
                <button
                  className={styles.btnPrimary}
                  onClick={() => handleRegister(selectedEvent)}
                  disabled={getDerivedStatus(selectedEvent) === 'Full'}
                >
                  {getDerivedStatus(selectedEvent) === 'Full' ? 'Event Full' : 'Register for Event'}
                </button>
                <button className={styles.btnSecondary}>Add to Calendar</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CommunityCalendar;
