import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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

const STATUSES = ['New', 'Needs Attendees', 'Filling Fast', 'Full Event'];
const EVENT_TYPES = ['Workshop', 'Webinar', 'Meeting', 'Social Gathering'];
const LOCATIONS = ['Virtual', 'In person'];
const TIMES = ['10:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'];

function CommunityCalendar() {
  const [filter, setFilter] = useState({ type: 'all', location: 'all', status: 'all' });
  const [selectedDate, setSelectedDate] = useState(new Date());
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
    const map = new Map();
    filteredEvents.forEach(e => {
      const key = e.date.toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    });
    return map;
  }, [filteredEvents]);

  const eventCountByDate = useMemo(() => {
    const map = new Map();
    filteredEvents.forEach(e => {
      const key = e.date.toDateString();
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
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

  const selectedDateEvents = useMemo(() => {
    const dateKey = selectedDate?.toDateString();
    if (!dateKey) {
      return [];
    }
    return filteredEvents.filter(event => event.date.toDateString() === dateKey);
  }, [filteredEvents, selectedDate]);

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) {
      return '';
    }
    return selectedDate.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDate]);

  const handleDateSelect = useCallback(
    date => {
      setSelectedDate(date);
      const eventsForDate = getEventsForDate(date);
      if (eventsForDate.length > 0) {
        setSelectedEvent(eventsForDate[0]);
      } else {
        setSelectedEvent(null);
      }
      setShowEventModal(false);
    },
    [getEventsForDate],
  );

  const handleEventClick = useCallback(event => {
    setSelectedEvent(event);
    setShowEventModal(true);
  }, []);

  const closeEventModal = useCallback(() => {
    setShowEventModal(false);
    setSelectedEvent(null);
  }, []);

  // Close on ESC
  useEffect(() => {
    const esc = e => {
      if (e.key === 'Escape') {
        closeEventModal();
        setOverflowDate(null);
      }
    };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [closeEventModal]);

  // Close overflow popup on outside click
  useEffect(() => {
    const handleClickOutside = e => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setOverflowDate(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const eventsForDate = getEventsForDate(selectedDate);
    if (eventsForDate.length === 0) {
      if (selectedEvent !== null) {
        setSelectedEvent(null);
      }
      if (showEventModal) {
        setShowEventModal(false);
      }
      return;
    }

    const hasSelectedEvent = eventsForDate.some(event => event.id === selectedEvent?.id);
    if (!hasSelectedEvent) {
      setSelectedEvent(eventsForDate[0]);
      if (showEventModal) {
        setShowEventModal(false);
      }
    }
  }, [getEventsForDate, selectedDate, selectedEvent, showEventModal]);

  const statusMap = {
    New: 'statusNew',
    'Needs Attendees': 'statusNeedsAttendees',
    'Filling Fast': 'statusFillingFast',
    'Full Event': 'statusFull',
  };

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
      const classNames = [];
      if (view === 'month' && eventCountByDate.has(date.toDateString())) {
        classNames.push(styles.hasEvents);
      }
      if (view === 'month' && selectedDate && date.toDateString() === selectedDate.toDateString()) {
        classNames.push(styles.selectedDate);
      }
      return classNames.join(' ') || null;
    },
    [eventCountByDate, selectedDate],
  );

  // Memoized filter change handlers
  const handleTypeFilterChange = useCallback(e => {
    setFilter(prev => ({ ...prev, type: e.target.value }));
  }, []);

  const handleLocationFilterChange = useCallback(e => {
    setFilter(prev => ({ ...prev, location: e.target.value }));
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
      {/* Inline styles to ensure selected date number is visible in dark mode - force dark background */}
      {darkMode && (
        <style>
          {`
            /* CRITICAL: Force dark background on selected date in dark mode - override ALL react-calendar defaults */
            .react-calendar__tile.selectedDate,
            .react-calendar__tile.selectedDate.react-calendar__tile--active,
            .react-calendar__tile.react-calendar__tile--active.selectedDate {
              background-color: #1a2332 !important;
              background: #1a2332 !important;
              color: #ffffff !important;
            }
            .react-calendar__tile.selectedDate:hover,
            .react-calendar__tile.selectedDate.react-calendar__tile--active:hover,
            .react-calendar__tile.react-calendar__tile--active.selectedDate:hover {
              background-color: #1a2332 !important;
              background: #1a2332 !important;
              color: #ffffff !important;
            }
            /* Force white text on dark background */
            .react-calendar__tile.selectedDate abbr,
            .react-calendar__tile.selectedDate abbr[title],
            .react-calendar__tile.selectedDate > abbr,
            .react-calendar__tile.selectedDate.react-calendar__tile--active abbr,
            .react-calendar__tile.react-calendar__tile--active.selectedDate abbr {
              color: #ffffff !important;
              font-weight: 900 !important;
              font-size: 1.2em !important;
              text-shadow: 
                0 0 8px rgba(255, 255, 255, 1),
                0 0 10px rgba(255, 255, 255, 0.9),
                0 2px 4px rgba(0, 0, 0, 1),
                0 4px 8px rgba(0, 0, 0, 0.9) !important;
              -webkit-text-stroke: 0.6px rgba(255, 255, 255, 1) !important;
              filter: brightness(1.8) contrast(1.5) !important;
              opacity: 1 !important;
            }
            .react-calendar__tile.selectedDate:hover abbr,
            .react-calendar__tile.selectedDate:hover abbr[title],
            .react-calendar__tile.selectedDate.react-calendar__tile--active:hover abbr {
              color: #ffffff !important;
              filter: brightness(1.8) contrast(1.5) !important;
              opacity: 1 !important;
            }
            /* But preserve event item colors */
            .react-calendar__tile.selectedDate .eventItem {
              color: inherit !important;
            }
          `}
        </style>
      )}
      <header className={calendarClasses.header}>
        <h1>Community Calendar</h1>
        <div className={calendarClasses.filters}>
          <select value={filter.type} onChange={handleFilterChange('type')}>
            <option value="all">All Types</option>
            {uniqueFilterValues.types.map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>

          <select value={filter.location} onChange={handleFilterChange('location')}>
            <option value="all">All Locations</option>
            {uniqueFilterValues.locations.map(l => (
              <option key={l}>{l}</option>
            ))}
          </select>

          <select value={filter.status} onChange={handleFilterChange('status')}>
            <option value="all">All Statuses</option>
            {uniqueFilterValues.statuses.map(s => (
              <option key={s}>{s}</option>
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
              onClickDay={handleDateSelect}
              value={selectedDate}
            />
            <section
              className={`${styles.selectedDatePanel} ${
                darkMode ? styles.selectedDatePanelDarkMode : ''
              }`}
              aria-live="polite"
            >
              <div className={styles.selectedDateHeader}>
                <div>
                  <h2>{formattedSelectedDate || 'Select a date'}</h2>
                  <p className={styles.selectedDateSummary}>
                    {(() => {
                      if (selectedDateEvents.length === 0) {
                        return 'No events scheduled for this date';
                      }
                      const eventText = selectedDateEvents.length === 1 ? 'event' : 'events';
                      return `${selectedDateEvents.length} ${eventText} scheduled`;
                    })()}
                  </p>
                </div>
              </div>

              {selectedDateEvents.length > 0 ? (
                <ul className={styles.selectedEventList}>
                  {selectedDateEvents.map(event => {
                    const isActive = selectedEvent?.id === event.id;
                    return (
                      <li key={event.id}>
                        <article
                          className={`${styles.selectedEventCard} ${
                            darkMode ? styles.selectedEventCardDarkMode : ''
                          } ${isActive ? styles.selectedEventCardActive : ''}`}
                        >
                          <header className={styles.selectedEventHeader}>
                            <div>
                              <h3>{event.title}</h3>
                              <div className={styles.selectedEventMeta}>
                                <span>{event.time}</span>
                                <span>{event.location}</span>
                                <span>{event.type}</span>
                                <span>{event.status}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className={styles.eventDetailButton}
                              onClick={() => handleEventClick(event)}
                            >
                              View full details
                            </button>
                          </header>
                          <p className={styles.selectedEventDescription}>{event.description}</p>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className={styles.noEventsMessage}>
                  <p>Select a different date or adjust the filters to see scheduled events.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Overflow popup */}
      {overflowDate && (
        <div
          ref={popupRef}
          className={`${styles.overflowPopup} ${darkMode ? styles.overflowPopupDark : ''}`}
        >
          <div className={styles.overflowPopupInner}>
            <h4>{overflowDate.toDateString()}</h4>
            {getEventsForDate(overflowDate).map(e => (
              <button
                key={e.id}
                type="button"
                className={`${styles.eventItem} ${styles[statusMap[e.status]]}`}
                onClick={() => handleEventClick(e)}
                title={e.title}
              >
                {e.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Event modal */}
      {showEventModal && selectedEvent && (
        <div
          className={styles.eventModalOverlay}
          role="presentation"
          onClick={e => e.target === e.currentTarget && closeEventModal()}
        >
          <div
            className={`${styles.eventModal} ${darkMode ? styles.eventModalDark : ''}`}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <h2>{selectedEvent.title}</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={closeEventModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.eventStatus}>
                <span
                  className={`${styles.statusBadge} ${styles[statusMap[selectedEvent.status]] ||
                    ''}`}
                >
                  {selectedEvent.status}
                </span>
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

            <div className={styles.modalActions}>
              <button type="button" className={styles.btnPrimary}>
                Register for Event
              </button>
              <button type="button" className={styles.btnSecondary}>
                Add to Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunityCalendar;
