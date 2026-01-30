import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import CalendarActivitySection from './CalendarActivitySection';
import styles from './CommunityCalendar.module.css';
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaTag,
  FaAlignLeft,
  FaVideo,
  FaUsers,
  FaGlassCheers,
} from 'react-icons/fa';
import { GrWorkshop } from 'react-icons/gr';

const STATUSES = ['New', 'Needs Attendees', 'Filling Fast', 'Full Event'];
const EVENT_TYPES = ['Workshop', 'Webinar', 'Meeting', 'Social Gathering'];
const LOCATIONS = ['Virtual', 'In person'];
const TIMES = ['10:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'];

function CommunityCalendar() {
  const [filter, setFilter] = useState({ type: 'all', location: 'all', status: 'all' });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [overflowDate, setOverflowDate] = useState(null);
  const popupRef = useRef(null);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const mockEvents = useMemo(() => {
    const events = [];
    for (let i = 0; i < 6; i++) {
      STATUSES.forEach((status, idx) => {
        events.push({
          id: i * 10 + idx + 1,
          title: `Event ${idx + 1}`,
          type: EVENT_TYPES[idx % 4],
          location: LOCATIONS[idx % 2],
          time: TIMES[idx % 4],
          date: new Date(currentYear, currentMonth + i, 5 + idx * 5),
          status,
          description: `Details about ${status.toLowerCase()} - ${i + 1}`,
        });
      });
    }
    return events;
  }, [currentMonth, currentYear]);

  const filteredEvents = useMemo(
    () =>
      mockEvents.filter(
        e =>
          (filter.type === 'all' || e.type === filter.type) &&
          (filter.location === 'all' || e.location === filter.location) &&
          (filter.status === 'all' || e.status === filter.status),
      ),
    [mockEvents, filter],
  );

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

  const getEventsForDate = useCallback(date => eventCache.get(date.toDateString()) || [], [
    eventCache,
  ]);

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
            const statusKey = statusMap[e.status];
            return (
              <button
                key={e.id}
                type="button"
                className={`${styles.eventItem} ${styles[statusKey] || ''}`}
                onClick={() => handleEventClick(e)}
                title={e.title}
              >
                {e.title}
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
    [getEventsForDate, handleEventClick],
  );

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

  const handleFilterChange = field => e =>
    setFilter(prev => ({ ...prev, [field]: e.target.value }));

  const uniqueFilterValues = useMemo(
    () => ({
      types: [...new Set(mockEvents.map(e => e.type))],
      locations: [...new Set(mockEvents.map(e => e.location))],
      statuses: [...new Set(mockEvents.map(e => e.status))],
    }),
    [mockEvents],
  );

  const darkMode = useSelector(s => s.theme.darkMode);

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

  const getTypeIcon = type => {
    switch (type) {
      case 'Workshop':
        return <GrWorkshop />;
      case 'Webinar':
        return <FaVideo />;
      case 'Meeting':
        return <FaUsers />;
      case 'Social Gathering':
        return <FaGlassCheers />;
      default:
        return null;
    }
  };

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

              <div className={styles.eventDetailsGrid}>
                {[
                  [FaTag, 'Type', selectedEvent.type],
                  [FaMapMarkerAlt, 'Location', selectedEvent.location],
                  [FaCalendarAlt, 'Date', selectedEvent.date.toLocaleDateString()],
                  [FaClock, 'Time', selectedEvent.time],
                ].map(([Icon, label, value]) => (
                  <div key={label} className={styles.detailItem}>
                    <span className={styles.detailLabel}>
                      <Icon className={styles.detailIcon} />
                      {label}:
                    </span>
                    <span>
                      {label === 'Type' ? getTypeIcon(selectedEvent.type) : null} {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.eventDescription}>
                <span className={styles.detailLabel}>
                  <FaAlignLeft className={styles.detailIcon} />
                  Description:
                </span>
                <p>{selectedEvent.description}</p>
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
