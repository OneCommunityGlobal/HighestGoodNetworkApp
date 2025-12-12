import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import CalendarActivitySection from './CalendarActivitySection';
import styles from './CommunityCalendar.module.css';

const STATUSES = ['New', 'Needs Attendees', 'Filling Fast', 'Full Event'];
const EVENT_TYPES = ['Workshop', 'Webinar', 'Meeting', 'Social Gathering'];
const LOCATIONS = ['Virtual', 'In person'];
const TIMES = ['10:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'];

function CommunityCalendar() {
  const [filter, setFilter] = useState({ type: 'all', location: 'all', status: 'all' });
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
    ({ date, view }) =>
      view === 'month' && eventCountByDate.has(date.toDateString()) ? styles.hasEvents : null,
    [eventCountByDate],
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

  return (
    <div className={calendarClasses.container}>
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
            />
          </div>
        </div>
      </main>

      {/* Overflow popup */}
      {overflowDate && (
        <div ref={popupRef} className={styles.overflowPopup}>
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
                  ['Type', selectedEvent.type],
                  ['Location', selectedEvent.location],
                  ['Date', selectedEvent.date.toLocaleDateString()],
                  ['Time', selectedEvent.time],
                ].map(([label, value]) => (
                  <div key={label} className={styles.detailItem}>
                    <span className={styles.detailLabel}>{label}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>

              <div className={styles.eventDescription}>
                <span className={styles.detailLabel}>Description:</span>
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
