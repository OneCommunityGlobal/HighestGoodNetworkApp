import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import CalendarActivitySection from './CalendarActivitySection';
import styles from './CommunityCalendar.module.css';

function CommunityCalendar() {
  const [filter, setFilter] = useState({ type: 'all', location: 'all', status: 'all' });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

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
    },
    {
      id: 4,
      title: 'Event 4',
      type: 'Webinar',
      location: 'Virtual',
      time: '3:00 AM',
      date: new Date(2025, 0, 3),
      status: 'Full',
      description: 'Detailed description of Event 4.',
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
    },
  ];

  // Memoized filtered events - only recalculates when filter changes
  const filteredEvents = useMemo(() => {
    return mockEvents.filter(
      event =>
        (filter.type === 'all' || event.type === filter.type) &&
        (filter.location === 'all' || event.location === filter.location) &&
        (filter.status === 'all' || event.status === filter.status),
    );
  }, [filter, mockEvents]);

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
    const types = [...new Set(mockEvents.map(event => event.type))];
    const locations = [...new Set(mockEvents.map(event => event.location))];
    const statuses = [...new Set(mockEvents.map(event => event.status))];

    return { types, locations, statuses };
  }, [mockEvents]);

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

  // Memoized tile content function - prevents unnecessary re-renders
  const tileContent = useCallback(
    ({ date, view }) => {
      if (view === 'month') {
        const eventsForTile = getEventsForDate(date).map(event => (
          <div
            key={event.id}
            className={`${styles.eventItem} ${styles.clickable}`}
            onClick={() => handleEventClick(event)}
            onKeyDown={e => handleEventKeyPress(e, event)}
            role="button"
            tabIndex={0}
            aria-label={`Click to view details for ${event.title}`}
          >
            {event.title}
          </div>
        ));
        return eventsForTile.length > 0 ? (
          <div className={styles.tileEvents}>{eventsForTile}</div>
        ) : null;
      }
      return null;
    },
    [getEventsForDate, handleEventClick, handleEventKeyPress],
  );

  // Memoized tile class name function - optimized for performance
  const tileClassName = useCallback(
    ({ date, view }) => {
      if (view === 'month' && eventCountByDate.has(date.toDateString())) {
        return styles.hasEvents;
      }
      return null;
    },
    [eventCountByDate],
  );

  // Memoized filter change handlers to prevent unnecessary re-renders
  const handleTypeFilterChange = useCallback(e => {
    setFilter(prev => ({ ...prev, type: e.target.value }));
  }, []);

  const handleLocationFilterChange = useCallback(e => {
    setFilter(prev => ({ ...prev, location: e.target.value }));
  }, []);

  const handleStatusFilterChange = useCallback(e => {
    setFilter(prev => ({ ...prev, status: e.target.value }));
  }, []);

  // Memoized dark mode selector to prevent unnecessary re-renders
  const darkMode = useSelector(state => state.theme.darkMode);

  // Memoized CSS classes to prevent string concatenation on every render
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
                    className={`${styles.statusBadge} ${(() => {
                      const statusKey = selectedEvent.status
                        .toLowerCase()
                        .replace(/\s+/g, '')
                        .replace(/^(.)/, match => `status${match.toUpperCase()}`);
                      return styles[statusKey] || '';
                    })()}`}
                  >
                    {selectedEvent.status}
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
                </div>

                <div className={styles.eventDescription}>
                  <label htmlFor="event-description">Description:</label>
                  <p id="event-description">{selectedEvent.description}</p>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.btnPrimary}>Register for Event</button>
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
