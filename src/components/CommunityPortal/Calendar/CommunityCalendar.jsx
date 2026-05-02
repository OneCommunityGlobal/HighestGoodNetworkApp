import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import CalendarActivitySection from './CalendarActivitySection';
import styles from './CommunityCalendar.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faLocationDot, faTag, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

const MOCK_EVENTS = [];

const normalizeStatus = status => {
  if (!status) return 'New';

  const s = status.toLowerCase();

  if (s.includes('need')) return 'Needs Attendees';
  if (s.includes('fill')) return 'Filling Fast';
  if (s.includes('full')) return 'Full Event';
  if (s.includes('new')) return 'New';

  return 'New';
};

export default function CommunityCalendar() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ type: 'all', location: 'all', status: 'all' });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [hoveredEventId, setHoveredEventId] = useState(null);
  const darkMode = useSelector(state => state.theme.darkMode);
  const currentDate = new Date();

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(ENDPOINTS.EVENTS);

        const apiEvents = response.data?.events || response.data || [];

        if (!apiEvents || apiEvents.length === 0) {
          console.warn('API returned empty → using mock events');
          setEvents(MOCK_EVENTS);
        } else {
          setEvents(apiEvents);
        }
      } catch (err) {
        console.warn('API failed → using mock events');
        setEvents(MOCK_EVENTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const mappedEvents = useMemo(() => {
    return events.map(event => {
      const eventDate = new Date(event.date);
      const timeString = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        ...event,
        id: event.id || `${event.title}-${eventDate.getTime()}`,
        date: eventDate,
        type: event.type || 'General',
        status: normalizeStatus(event.status),
        time: event.time || timeString,
        description: event.description || `Join us for ${event.title}`,
        location: event.location || 'Online',
      };
    });
  }, [events]);

  const filteredEvents = useMemo(
    () =>
      mappedEvents.filter(
        e =>
          (filter.type === 'all' || e.type === filter.type) &&
          (filter.location === 'all' || e.location === filter.location) &&
          (filter.status === 'all' || e.status === filter.status),
      ),
    [mappedEvents, filter],
  );

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

  const handleFilterChange = useCallback(
    filterType => e => {
      setFilter(prev => ({
        ...prev,
        [filterType]: e.target.value,
      }));
    },
    [],
  );

  const [overflowDate, setOverflowDate] = useState(false);

  // Memoized helper function to get events for a specific date
  const getEventsForDate = useCallback(
    date => {
      if (!date) return [];
      return eventCache.get(new Date(date).toDateString()) || [];
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
    setSelectedDate(new Date(event.date));

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

  const popupRef = useRef(null);
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
      return;
    }

    const hasSelectedEvent = eventsForDate.some(event => event.id === selectedEvent?.id);

    if (!hasSelectedEvent) {
      setSelectedEvent(eventsForDate[0]);
    }
  }, [getEventsForDate, selectedDate]);

  const statusMap = {
    New: 'statusNew',
    'Needs Attendees': 'statusNeedsAttendees',
    'Filling Fast': 'statusFillingFast',
    'Full Event': 'statusFull',
  };

  const statusIconMap = {
    New: '⭐',
    'Needs Attendees': '🙋',
    'Filling Fast': '⚡',
    'Full Event': '⛔',
    Full: '⛔',
  };

  function WeeklyTimeGrid({ events, selectedDate, onEventClick, darkMode }) {
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const startOfWeek = useMemo(() => {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - d.getDay());
      return d;
    }, [selectedDate]);

    const weekDays = useMemo(() => {
      return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        return day;
      });
    }, [startOfWeek]);

    return (
      <div
        className={`${styles.weekGridContainer} ${darkMode ? styles.weekGridContainerDark : ''}`}
      >
        <div className={`${styles.weekGridHeader} ${darkMode ? styles.weekGridHeaderDark : ''}`}>
          <div className={styles.timeGutter} />
          {weekDays.map(date => (
            <div key={date.toString()} className={styles.dayColumnHeader}>
              <div className={`${styles.dayLabel} ${darkMode ? styles.dayLabelDark : ''}`}>
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`${styles.dateLabel} ${darkMode ? styles.dateLabelDark : ''}`}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.weekGridBody}>
          {hours.map(hour => (
            <div key={hour} className={`${styles.hourRow} ${darkMode ? styles.hourRowDark : ''}`}>
              <div className={`${styles.timeLabel} ${darkMode ? styles.timeLabelDark : ''}`}>
                {hour === 0
                  ? '12 AM'
                  : hour > 12
                  ? `${hour - 12} PM`
                  : hour === 12
                  ? '12 PM'
                  : `${hour} AM`}
              </div>

              {weekDays.map(date => {
                const cellEvents = events.filter(e => {
                  const eventDate = new Date(e.date);
                  const [hStr] = e.time.split(':');
                  let h = parseInt(hStr, 10);
                  const isPM = e.time.toLowerCase().includes('pm');
                  const isAM = e.time.toLowerCase().includes('am');
                  if (isPM && h !== 12) h += 12;
                  if (isAM && h === 12) h = 0;

                  return eventDate.toDateString() === date.toDateString() && h === hour;
                });

                return (
                  <div
                    key={date.toString()}
                    className={`${styles.gridCell} ${darkMode ? styles.gridCellDark : ''}`}
                  >
                    {cellEvents.map(ev => (
                      <button
                        key={ev.id}
                        type="button"
                        className={`${styles.gridEvent} ${darkMode ? styles.gridEventDark : ''}`}
                        onClick={() => onEventClick(ev)}
                        aria-label={`Open event ${ev.title} at ${ev.time}`}
                      >
                        <div
                          className={`${styles.gridEventTime} ${
                            darkMode ? styles.gridEventTimeDark : ''
                          }`}
                        >
                          {ev.time}
                        </div>
                        <div
                          className={`${styles.gridEventTitle} ${
                            darkMode ? styles.gridEventTitleDark : ''
                          }`}
                        >
                          {ev.title}
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render event tiles
  const tileContent = useCallback(
    ({ date, view }) => {
      if (view !== 'month') return null;
      const events = getEventsForDate(date);
      if (!events.length) return null;

      const visible = events.slice(0, 3);
      const hiddenCount = events.length - 3;

      return (
        <div className={styles.tileEvents}>
          {visible.map(e => {
            const statusKey = statusMap[e.status] || 'statusNew';

            return (
              <button
                key={e.id}
                type="button"
                className={`${styles.eventItem} ${styles[statusKey] || ''}`}
                onClick={e_obj => {
                  e_obj.stopPropagation();
                  handleEventClick(e);
                }}
                onMouseEnter={() => setHoveredEventId(e.id)}
                onMouseLeave={() => setHoveredEventId(null)}
                aria-label={`Click to view details for ${e.title}`}
              >
                <span className={styles.eventContent}>
                  <span className={styles.eventIcon} aria-label={e.status} title={e.status}>
                    {statusIconMap[e.status] || '⭐'}
                  </span>
                  <span className={styles.eventTitleText}>{e.title}</span>
                </span>

                {hoveredEventId === e.id && (
                  <div
                    className={`${styles.eventTooltip} ${darkMode ? styles.eventTooltipDark : ''}`}
                  >
                    <strong>{e.title}</strong>
                    <span className={styles.tooltipDetail}>
                      <strong>Time:</strong> {e.time}
                    </span>
                    <span className={styles.tooltipDetail}>
                      <strong>Location:</strong> {e.location}
                    </span>
                    <span className={styles.tooltipDetail}>
                      <strong>Status:</strong> {e.status}
                    </span>
                    <small>Click for more details</small>
                  </div>
                )}
              </button>
            );
          })}
          {hiddenCount > 0 && (
            <button
              type="button"
              className={styles.moreEvents}
              onClick={() => setOverflowDate(date)}
              title="View all events"
            >
              +{hiddenCount} more
            </button>
          )}
        </div>
      );
    },
    [getEventsForDate, handleEventClick, darkMode, hoveredEventId],
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
  /*   const handleTypeFilterChange = useCallback(e => {
    setFilter(prev => ({ ...prev, type: e.target.value }));
  }, []); */

  const uniqueFilterValues = useMemo(
    () => ({
      types: [...new Set(mappedEvents.map(e => e.type))],
      locations: [...new Set(mappedEvents.map(e => e.location))],
      statuses: [...new Set(mappedEvents.map(e => e.status))],
    }),
    [mappedEvents],
  );

  // Memoized CSS classes
  const calendarClasses = useMemo(
    () => ({
      container: `${styles.communityCalendar} ${darkMode ? styles.communityCalendarDarkMode : ''}`,
      header: `${styles.calendarHeader} ${darkMode ? styles.calendarHeaderDarkMode : ''}`,
      filters: `${styles.calendarFilters} ${darkMode ? styles.calendarFiltersDarkMode : ''}`,
      select: `${styles.filterSelect} ${darkMode ? styles.filterSelectDarkMode : ''}`,
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
              /* 1. Target the button and any text inside it */
            .react-calendar__navigation button:enabled:hover,
            .react-calendar__navigation button:enabled:hover *,
            .react-calendar__navigation button:enabled:focus,
            .react-calendar__navigation button:enabled:focus * {
              background-color: #e6e6e6 !important;
              color: #000000 !important;
              /* This handles cases where they use text-shadows or strokes */
              text-shadow: none !important;
              -webkit-text-stroke: 0px transparent !important;
            }

            /* 2. Target the specific arrows (the << < > >> symbols) */
            .react-calendar__navigation__arrow:enabled:hover {
              color: #000000 !important;
            }

            /* 3. If they are using pseudo-elements (common in some versions) */
            .react-calendar__navigation button:enabled:hover::before,
            .react-calendar__navigation button:enabled:hover::after {
              color: #000000 !important;
            }
          `}
        </style>
      )}
      <header className={calendarClasses.header}>
        <h1>Community Calendar</h1>
        <div className={calendarClasses.filters}>
          <select
            className={calendarClasses.select}
            value={filter.type}
            onChange={handleFilterChange('type')}
          >
            <option value="all">All Types</option>
            {uniqueFilterValues.types.map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>

          <select
            className={calendarClasses.select}
            value={filter.location}
            onChange={handleFilterChange('location')}
          >
            <option value="all">All Locations</option>
            {uniqueFilterValues.locations.map(l => (
              <option key={l}>{l}</option>
            ))}
          </select>

          <select
            className={calendarClasses.select}
            value={filter.status}
            onChange={handleFilterChange('status')}
          >
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
            <CalendarActivitySection
              selectedDate={selectedDate}
              events={selectedDateEvents}
              onEventClick={handleEventClick}
            />
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
                              <div>
                                <ul className={styles.selectedEventMeta}>
                                  <li className={styles.metaItem}>
                                    <FontAwesomeIcon icon={faClock} className={styles.metaIcon} />
                                    <span>{event.time}</span>
                                  </li>

                                  <li className={styles.metaItem}>
                                    <FontAwesomeIcon
                                      icon={faLocationDot}
                                      className={styles.metaIcon}
                                    />
                                    <span>{event.location}</span>
                                  </li>

                                  <li className={styles.metaItem}>
                                    <FontAwesomeIcon icon={faTag} className={styles.metaIcon} />
                                    <span>{event.type}</span>
                                  </li>

                                  <li className={styles.metaItem}>
                                    <FontAwesomeIcon
                                      icon={faCircleCheck}
                                      className={styles.metaIcon}
                                    />
                                    <span className={styles.statusInline}>
                                      {statusIconMap[event.status] || ''} {event.status}
                                    </span>
                                  </li>
                                </ul>
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
                className={`${styles.eventItem} ${styles[statusMap[e.status]] || styles.statusNew}`}
                onClick={() => handleEventClick(e)}
                title={e.title}
              >
                <span className={styles.eventContent}>
                  <span className={styles.eventIcon} aria-label={e.status} title={e.status}>
                    {statusIconMap[e.status] || '⭐'}
                  </span>
                  <span className={styles.eventTitleText}>{e.title}</span>
                </span>
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
                    ''} ${darkMode ? styles.darkModeStatusBadge : ''}`}
                >
                  {statusIconMap[selectedEvent.status] || ''} {selectedEvent.status}
                </span>
              </div>

              <div className={styles.eventDetailsGrid}>
                <div className={styles.detailItem}>
                  <span>Type:</span>
                  <span>{selectedEvent.type}</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Location:</span>
                  <span>{selectedEvent.location}</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Date:</span>
                  <span>{selectedEvent.date.toLocaleDateString()}</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Time:</span>
                  <span>{selectedEvent.time}</span>
                </div>
              </div>

              <div className={styles.eventDescription}>
                <span>Description:</span>
                <p>{selectedEvent.description}</p>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnPrimary}>Register for Event</button>
              <button className={styles.btnSecondary}>Add to Calendar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
