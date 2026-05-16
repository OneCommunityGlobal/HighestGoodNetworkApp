import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faLocationDot, faTag, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
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

function CommunityCalendar() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filter, setFilter] = useState({
    type: 'all',
    location: 'all',
    status: 'all',
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [hoveredEventId, setHoveredEventId] = useState(null);
  const [overflowDate, setOverflowDate] = useState(null);

  const popupRef = useRef(null);

  const darkMode = useSelector(state => state.theme.darkMode);

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
        setError('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const mappedEvents = useMemo(() => {
    return events.map(event => {
      const eventDateTime = new Date(event.startTime);

      const timeString = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }).format(eventDateTime);

      const eventEndTime = new Date(event.endTime);

      const endTimeString = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }).format(eventEndTime);

      const eventDate = new Date(
        new Intl.DateTimeFormat('en-US', {
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(eventDateTime),
      );

      return {
        ...event,
        id: event.id || `${event.title}-${eventDate.getTime()}`,
        date: eventDate,
        type: event.type || 'General',
        status: normalizeStatus(event.status),
        time: event.time || timeString,
        endTime: endTimeString || event.endTime,
        description: event.description || `Join us for ${event.title}`,
        location: event.location || 'Online',
        isOver: eventDate < new Date(),
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

  const eventCache = useMemo(() => {
    const map = new Map();

    filteredEvents.forEach(e => {
      const key = e.date.toDateString();

      if (!map.has(key)) {
        map.set(key, []);
      }

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

  const handleFilterChange = useCallback(
    filterType => e => {
      setFilter(prev => ({
        ...prev,
        [filterType]: e.target.value,
      }));
    },
    [],
  );

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
  }, [getEventsForDate, selectedDate, selectedEvent]);

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

  const tileContent = useCallback(
    ({ date, view }) => {
      if (view !== 'month') {
        return null;
      }

      const eventsForDate = getEventsForDate(date);

      if (!eventsForDate.length) {
        return null;
      }

      const visible = eventsForDate.slice(0, 3);
      const hiddenCount = eventsForDate.length - 3;

      return (
        <div className={styles.tileEvents}>
          {visible.map(e => {
            const statusKey = statusMap[e.status] || 'statusNew';

            return (
              <button
                key={e.id}
                type="button"
                className={`${styles.eventItem} ${styles[statusKey] || ''}`}
                onClick={eventObject => {
                  eventObject.stopPropagation();
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
    [getEventsForDate, handleEventClick, darkMode, hoveredEventId, statusMap, statusIconMap],
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

  const uniqueFilterValues = useMemo(
    () => ({
      types: [...new Set(mappedEvents.map(e => e.type))],
      locations: [...new Set(mappedEvents.map(e => e.location))],
      statuses: [...new Set(mappedEvents.map(e => e.status))],
    }),
    [mappedEvents],
  );

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

  if (isLoading) {
    return <div className={styles.loadingState}>Loading events...</div>;
  }

  if (error) {
    return <div className={styles.errorState}>{error}</div>;
  }

  return (
    <div className={calendarClasses.container}>
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
              selectedDate={selectedDateEvents.length > 0 ? selectedDate : null}
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
                    {selectedDateEvents.length === 0
                      ? 'No events scheduled for this date'
                      : `${selectedDateEvents.length} ${
                          selectedDateEvents.length === 1 ? 'event' : 'events'
                        } scheduled`}
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

                              <ul className={styles.selectedEventMeta}>
                                <li className={styles.metaItem}>
                                  <FontAwesomeIcon icon={faClock} className={styles.metaIcon} />

                                  <span>
                                    {event.time} - {event.endTime}
                                  </span>
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
              {selectedEvent.isOver ? (
                <button type="button" className={styles.btnDisabled} disabled>
                  Completed
                </button>
              ) : (
                <>
                  <button type="button" className={styles.btnPrimary}>
                    Register for Event
                  </button>

                  <button type="button" className={styles.btnSecondary}>
                    Add to Calendar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunityCalendar;
