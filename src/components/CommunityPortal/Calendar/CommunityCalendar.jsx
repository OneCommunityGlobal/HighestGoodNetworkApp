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
  const [overflowDate, setOverflowDate] = useState(null);
  
  const darkMode = useSelector(state => state.theme.darkMode);
  const popupRef = useRef(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(ENDPOINTS.EVENTS);
        const apiEvents = response.data?.events || response.data || [];
        setEvents(apiEvents.length === 0 ? MOCK_EVENTS : apiEvents);
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

  const filteredEvents = useMemo(() =>
    mappedEvents.filter(e =>
      (filter.type === 'all' || e.type === filter.type) &&
      (filter.location === 'all' || e.location === filter.location) &&
      (filter.status === 'all' || e.status === filter.status)
    ), [mappedEvents, filter]
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

  const handleFilterChange = useCallback(filterType => e => {
    setFilter(prev => ({ ...prev, [filterType]: e.target.value }));
  }, []);

  const getEventsForDate = useCallback(date => {
    if (!date) return [];
    return eventCache.get(new Date(date).toDateString()) || [];
  }, [eventCache]);

  const selectedDateEvents = useMemo(() => {
    const dateKey = selectedDate?.toDateString();
    return dateKey ? (eventCache.get(dateKey) || []) : [];
  }, [eventCache, selectedDate]);

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return '';
    return selectedDate.toLocaleDateString(undefined, {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  }, [selectedDate]);

  const handleDateSelect = useCallback(date => {
    setSelectedDate(date);
    const eventsForDate = getEventsForDate(date);
    setSelectedEvent(eventsForDate.length > 0 ? eventsForDate[0] : null);
    setShowEventModal(false);
  }, [getEventsForDate]);

  const handleEventClick = useCallback(event => {
    setSelectedDate(new Date(event.date));
    setSelectedEvent(event);
    setShowEventModal(true);
  }, []);

  const closeEventModal = useCallback(() => {
    setShowEventModal(false);
    setSelectedEvent(null);
  }, []);

  // ESC key and Outside Click handling
  useEffect(() => {
    const esc = e => { if (e.key === 'Escape') { closeEventModal(); setOverflowDate(null); } };
    const handleClickOutside = e => { if (popupRef.current && !popupRef.current.contains(e.target)) setOverflowDate(null); };
    document.addEventListener('keydown', esc);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', esc);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeEventModal]);

  const statusMap = {
    New: 'statusNew',
    'Needs Attendees': 'statusNeedsAttendees',
    'Filling Fast': 'statusFillingFast',
    'Full Event': 'statusFull',
  };

  const statusIconMap = {
    New: '⭐', 'Needs Attendees': '🙋', 'Filling Fast': '⚡', 'Full Event': '⛔',
  };

  const tileContent = useCallback(({ date, view }) => {
    if (view !== 'month') return null;
    const dayEvents = getEventsForDate(date);
    if (!dayEvents.length) return null;
    const visible = dayEvents.slice(0, 3);
    const hiddenCount = dayEvents.length - 3;

    return (
      <div className={styles.tileEvents}>
        {visible.map(e => (
          <button
            key={e.id}
            type="button"
            className={`${styles.eventItem} ${styles[statusMap[e.status]] || ''}`}
            onClick={obj => { obj.stopPropagation(); handleEventClick(e); }}
            onMouseEnter={() => setHoveredEventId(e.id)}
            onMouseLeave={() => setHoveredEventId(null)}
          >
            <span className={styles.eventContent}>
              <span className={styles.eventIcon}>{statusIconMap[e.status] || '⭐'}</span>
              <span className={styles.eventTitleText}>{e.title}</span>
            </span>
          </button>
        ))}
        {hiddenCount > 0 && (
          <button type="button" className={styles.moreEvents} onClick={() => setOverflowDate(date)}>
            +{hiddenCount} more
          </button>
        )}
      </div>
    );
  }, [getEventsForDate, handleEventClick]);

  const tileClassName = useCallback(({ date, view }) => {
    const classes = [];
    if (view === 'month' && eventCountByDate.has(date.toDateString())) classes.push(styles.hasEvents);
    if (view === 'month' && selectedDate && date.toDateString() === selectedDate.toDateString()) classes.push(styles.selectedDate);
    return classes.join(' ');
  }, [eventCountByDate, selectedDate]);

  const uniqueFilterValues = useMemo(() => ({
    types: [...new Set(mappedEvents.map(e => e.type))],
    locations: [...new Set(mappedEvents.map(e => e.location))],
    statuses: [...new Set(mappedEvents.map(e => e.status))],
  }), [mappedEvents]);

  const calendarClasses = useMemo(() => ({
    container: `${styles.communityCalendar} ${darkMode ? styles.communityCalendarDarkMode : ''}`,
    header: `${styles.calendarHeader} ${darkMode ? styles.calendarHeaderDarkMode : ''}`,
    filters: `${styles.calendarFilters} ${darkMode ? styles.calendarFiltersDarkMode : ''}`,
    select: `${styles.filterSelect} ${darkMode ? styles.filterSelectDarkMode : ''}`,
    main: styles.calendarMain,
    calendarContainer: `${styles.calendarContainer} ${darkMode ? styles.calendarContainerDarkMode : ''}`,
    calendarSection: `${styles.calendarSection} ${darkMode ? styles.calendarSectionDarkMode : ''}`,
    reactCalendar: `${styles.reactCalendar} ${darkMode ? styles.reactCalendarDarkMode : ''}`,
  }), [darkMode]);

  return (
    <div className={calendarClasses.container}>
      {/* Global Style Overrides for Dark Mode */}
      {darkMode && (
        <style>{`
          .react-calendar__tile.selectedDate { background-color: #1a2332 !important; color: white !important; }
          .react-calendar__tile.selectedDate abbr { text-shadow: 0 0 8px rgba(255,255,255,1) !important; font-weight: 900 !important; }
          .react-calendar__navigation button:enabled:hover { background-color: #e6e6e6 !important; color: black !important; }
        `}</style>
      )}

      <header className={calendarClasses.header}>
        <h1>Community Calendar</h1>
        <div className={calendarClasses.filters}>
          <select className={calendarClasses.select} value={filter.type} onChange={handleFilterChange('type')}>
            <option value="all">All Types</option>
            {uniqueFilterValues.types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className={calendarClasses.select} value={filter.location} onChange={handleFilterChange('location')}>
            <option value="all">All Locations</option>
            {uniqueFilterValues.locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select className={calendarClasses.select} value={filter.status} onChange={handleFilterChange('status')}>
            <option value="all">All Statuses</option>
            {uniqueFilterValues.statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </header>

      <main className={calendarClasses.main}>
        <div className={calendarClasses.calendarContainer}>
          <div className={styles.activitySection}>
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
            
            <section className={`${styles.selectedDatePanel} ${darkMode ? styles.selectedDatePanelDarkMode : ''}`}>
              <div className={styles.selectedDateHeader}>
                <h2>{formattedSelectedDate || 'Select a date'}</h2>
                <p>{selectedDateEvents.length} events scheduled</p>
              </div>

              {selectedDateEvents.map(event => (
                <article key={event.id} className={`${styles.selectedEventCard} ${darkMode ? styles.selectedEventCardDarkMode : ''}`}>
                  <h3>{event.title}</h3>
                  <ul className={styles.selectedEventMeta}>
                    <li><FontAwesomeIcon icon={faClock} /> {event.time}</li>
                    <li><FontAwesomeIcon icon={faLocationDot} /> {event.location}</li>
                  </ul>
                  <button className={styles.eventDetailButton} onClick={() => handleEventClick(event)}>
                    View details
                  </button>
                </article>
              ))}
            </section>
          </div>
        </div>
      </main>

      {/* Overflow & Modal - kept consistent with your existing logic */}
      {showEventModal && selectedEvent && (
         <div className={styles.eventModalOverlay} onClick={e => e.target === e.currentTarget && closeEventModal()}>
            <div className={`${styles.eventModal} ${darkMode ? styles.eventModalDark : ''}`}>
               <div className={styles.modalHeader}>
                  <h2>{selectedEvent.title}</h2>
                  <button onClick={closeEventModal}>×</button>
               </div>
               <div className={styles.modalContent}>
                  <p>{selectedEvent.description}</p>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}