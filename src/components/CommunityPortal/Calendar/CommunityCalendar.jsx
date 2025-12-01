import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const darkMode = useSelector(s => s.theme.darkMode);

  const [filter, setFilter] = useState({
    type: 'all',
    location: 'all',
    status: 'all',
  });

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [activeStatusPopup, setActiveStatusPopup] = useState(null);

  const popupRef = useRef(null);
  const floatLayerRef = useRef(null);

  /* Floating layer creation */
  useEffect(() => {
    let layer = document.getElementById('calendar-floating-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'calendar-floating-layer';
      document.body.appendChild(layer);
    }
    floatLayerRef.current = layer;
  }, []);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  /* Mock events */
  const mockEvents = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 6; i++) {
      for (const [idx, status] of STATUSES.entries()) {
        const capacity = 20;

        const getSecureRandomInt = max => {
          const array = new Uint32Array(1);
          window.crypto.getRandomValues(array);
          return array[0] % max;
        };

        const registered = getSecureRandomInt(capacity);
        arr.push({
          id: i * 10 + idx + 1,
          title: `Event ${idx + 1}`,
          type: EVENT_TYPES[idx % 4],
          location: LOCATIONS[idx % 2],
          time: TIMES[idx % 4],
          status,
          capacity,
          registered,
          description: `Details about ${status.toLowerCase()} - ${i + 1}`,
          date: new Date(currentYear, currentMonth + i, 5 + idx * 5),
        });
      }
    }
    return arr;
  }, [currentMonth, currentYear]);

  /* Filtering */
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

  /* Cache events per day */
  const eventCache = useMemo(() => {
    const map = new Map();
    for (const e of filteredEvents) {
      const key = e.date.toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    }
    return map;
  }, [filteredEvents]);

  const getEventsForDate = useCallback(date => eventCache.get(date.toDateString()) || [], [
    eventCache,
  ]);

  /* Event modal controls */
  const handleEventClick = useCallback(event => {
    setHoveredEvent(null);
    setActiveStatusPopup(null);
    setSelectedEvent(event);
    setShowEventModal(true);
  }, []);

  const closeEventModal = useCallback(() => {
    setSelectedEvent(null);
    setShowEventModal(false);
  }, []);

  /* ESC key close */
  useEffect(() => {
    const escListener = e => {
      if (e.key === 'Escape') {
        setHoveredEvent(null);
        setActiveStatusPopup(null);
        closeEventModal();
      }
    };
    document.addEventListener('keydown', escListener);
    return () => document.removeEventListener('keydown', escListener);
  }, [closeEventModal]);

  /* Outside click close */
  useEffect(() => {
    const clickListener = e => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setActiveStatusPopup(null);
      }
    };
    document.addEventListener('mousedown', clickListener);
    return () => document.removeEventListener('mousedown', clickListener);
  }, []);

  const statusIcons = {
    New: '✨',
    'Needs Attendees': '🫂',
    'Filling Fast': '⚡',
    'Full Event': '⛔',
  };

  const statusColors = {
    New: '#b5f5b3',
    'Needs Attendees': '#c7dfff',
    'Filling Fast': '#ffe3b3',
    'Full Event': '#ffcdd2',
  };

  const statusMap = {
    New: 'statusNew',
    'Needs Attendees': 'statusNeedsAttendees',
    'Filling Fast': 'statusFillingFast',
    'Full Event': 'statusFull',
  };

  /* Tooltip Hover */
  const TooltipPortal =
    hoveredEvent && !showEventModal && floatLayerRef.current
      ? createPortal(
          <div
            className={styles.floatTooltip}
            style={{
              top: hoveredEvent.position.top,
              left: hoveredEvent.position.left,
              backgroundColor: statusColors[hoveredEvent.event.status],
            }}
          >
            <strong>
              {statusIcons[hoveredEvent.event.status]} {hoveredEvent.event.status}
            </strong>
            <div>
              Registered: {hoveredEvent.event.registered} / {hoveredEvent.event.capacity}
            </div>
            <div>Spots Left: {hoveredEvent.event.capacity - hoveredEvent.event.registered}</div>
            <div>Type: {hoveredEvent.event.type}</div>
            <div>Location: {hoveredEvent.event.location}</div>
            <div>Time: {hoveredEvent.event.time}</div>
          </div>,
          floatLayerRef.current,
        )
      : null;

  /* Popup Click */
  const PopupPortal =
    activeStatusPopup && !showEventModal && floatLayerRef.current
      ? createPortal(
          <div
            className={styles.floatPopup}
            ref={popupRef}
            style={{
              top: activeStatusPopup.position.top,
              left: activeStatusPopup.position.left,
              backgroundColor: statusColors[activeStatusPopup.event.status],
            }}
          >
            <h4>
              {statusIcons[activeStatusPopup.event.status]} {activeStatusPopup.event.status}
            </h4>
            <p>
              <strong>Registered:</strong> {activeStatusPopup.event.registered}
            </p>
            <p>
              <strong>Capacity:</strong> {activeStatusPopup.event.capacity}
            </p>
            <p>
              <strong>Spots Left:</strong>{' '}
              {activeStatusPopup.event.capacity - activeStatusPopup.event.registered}
            </p>
            <button
              type="button"
              className={styles.closePopupBtn}
              onClick={() => setActiveStatusPopup(null)}
            >
              Close
            </button>
          </div>,
          floatLayerRef.current,
        )
      : null;

  /* Tile rendering */
  const tileContent = useCallback(
    ({ date, view }) => {
      if (view !== 'month') return null;

      const events = getEventsForDate(date);
      if (!events.length) return null;

      return (
        <div className={styles.tileEvents}>
          {events.slice(0, 3).map(event => (
            <div
              key={event.id}
              className={styles.eventItemWrapper}
              role="button"
              tabIndex={0}
              onMouseEnter={e => {
                if (showEventModal || activeStatusPopup) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const top = rect.top < 140 ? rect.bottom + 6 : rect.top - 110;

                setHoveredEvent({
                  event,
                  position: { top, left: rect.left + rect.width / 2 },
                });
              }}
              onMouseLeave={() => setHoveredEvent(null)}
              onClick={e => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                setActiveStatusPopup({
                  event,
                  position: { top: rect.top - 10, left: rect.left + rect.width / 2 },
                });
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleEventClick(event);
                }
              }}
            >
              <button
                type="button"
                className={`${styles.eventItem} ${styles[statusMap[event.status]]}`}
                onClick={() => handleEventClick(event)}
              >
                <div className={styles.eventItemHeader}>
                  <span className={styles.statusIcon}>{statusIcons[event.status]}</span>
                  <span className={styles.eventTitle}>{event.title}</span>
                </div>
              </button>
            </div>
          ))}
        </div>
      );
    },
    [activeStatusPopup, showEventModal, getEventsForDate, handleEventClick],
  );

  return (
    <div className={darkMode ? styles.communityCalendarDarkModeWrapper : ''}>
      <div
        className={`${styles.communityCalendar} ${
          darkMode ? styles.communityCalendarDarkMode : ''
        }`}
      >
        {/* HEADER */}
        <header
          className={`${styles.calendarHeader} ${darkMode ? styles.calendarHeaderDarkMode : ''}`}
        >
          <h1>Community Calendar</h1>

          <div className={styles.calendarFilters}>
            <select
              value={filter.type}
              onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
            >
              <option value="all">All Types</option>
              {EVENT_TYPES.map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>

            <select
              value={filter.location}
              onChange={e => setFilter(f => ({ ...f, location: e.target.value }))}
            >
              <option value="all">All Locations</option>
              {LOCATIONS.map(l => (
                <option key={l}>{l}</option>
              ))}
            </select>

            <select
              value={filter.status}
              onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
            >
              <option value="all">All Statuses</option>
              {STATUSES.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </header>

        {/* MAIN */}
        <main className={styles.calendarMain}>
          <div
            className={`${styles.calendarContainer} ${
              darkMode ? styles.calendarContainerDarkMode : ''
            }`}
          >
            <div
              className={`${styles.calendarActivitySection} ${
                darkMode ? styles.calendarActivitySectionDarkMode : ''
              }`}
            >
              <CalendarActivitySection />
            </div>

            <div
              className={`${styles.calendarSection} ${
                darkMode ? styles.calendarSectionDarkMode : ''
              }`}
            >
              <ReactCalendar
                className={`${styles.reactCalendar} ${
                  darkMode ? styles.reactCalendarDarkMode : ''
                }`}
                tileContent={tileContent}
              />
            </div>
          </div>
        </main>

        {TooltipPortal}
        {PopupPortal}

        {/* MODAL */}
        {showEventModal && selectedEvent && (
          <div className={styles.eventModalOverlay}>
            <div className={`${styles.eventModal} ${darkMode ? styles.eventModalDark : ''}`}>
              <div className={styles.modalHeader}>
                <h2>{selectedEvent.title}</h2>
                <button type="button" className={styles.modalClose} onClick={closeEventModal}>
                  ×
                </button>
              </div>

              <div className={styles.modalContent}>
                <div className={styles.eventStatus}>
                  <span className={styles.statusBadge}>{selectedEvent.status}</span>
                </div>

                <div className={styles.eventDetailsGrid}>
                  {[
                    ['Type', selectedEvent.type],
                    ['Location', selectedEvent.location],
                    ['Date', selectedEvent.date.toLocaleDateString()],
                    ['Time', selectedEvent.time],
                  ].map(([label, value]) => (
                    <div className={styles.detailItem} key={label}>
                      <span className={styles.detailLabel}>{label}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.eventDescription}>
                  <span className={styles.detailLabel}>Description</span>
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
    </div>
  );
}

export default CommunityCalendar;
