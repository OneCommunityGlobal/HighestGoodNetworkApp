import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faLocationDot, faTag, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import CalendarActivitySection from './CalendarActivitySection';
import GOVERNMENT_HOLIDAYS from './governmentHolidays';
import styles from './CommunityCalendar.module.css';

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
  const [overflowDate, setOverflowDate] = useState(null);

  const popupRef = useRef(null);

  const [tooltip, setTooltip] = useState(null);
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);

      try {
        const response = await axios.get(ENDPOINTS.EVENTS);
        const apiEvents = response.data?.events || response.data || [];
        setEvents(apiEvents);
      } catch (err) {
        setError('Error fetching Events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const mappedEvents = useMemo(() => {
    const holidayEvents = GOVERNMENT_HOLIDAYS.map(holiday => ({
      id: holiday.id,
      title: holiday.title,
      date: new Date(holiday.date),
      type: 'Government Holiday',
      status: 'Holiday',
      time: 'All Day',
      endTime: 'All Day',
      description: `${holiday.title} holiday`,
      location: 'National',
      isHoliday: true,
      isOver: new Date(holiday.date) < new Date(),
    }));

    const communityEvents = events.map(event => {
      const eventDateTime = new Date(event.startTime || event.date);

      const timeString = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }).format(eventDateTime);

      const eventEndTime = event.endTime ? new Date(event.endTime) : null;

      const endTimeString = eventEndTime
        ? new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }).format(eventEndTime)
        : event.endTime;

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

    return [...communityEvents, ...holidayEvents];
  }, [events]);

  const filteredEvents = useMemo(
    () =>
      mappedEvents.filter(e => {
        if (e.isHoliday) {
          return true;
        }

        return (
          (filter.type === 'all' || e.type === filter.type) &&
          (filter.location === 'all' || e.location === filter.location) &&
          (filter.status === 'all' || e.status === filter.status)
        );
      }),
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

  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [isRegistering, setIsRegistering] = useState(false);

  const closeEventModal = useCallback(() => {
    setShowEventModal(false);
    setSelectedEvent(null);
  }, []);

  const isEventInPast = useCallback(event => {
    if (!event) return false;

    const eventDateTime = new Date(event.date);

    const timeMatch = event.time?.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);

    if (timeMatch) {
      let hour = Number.parseInt(timeMatch[1], 10);
      const minute = Number.parseInt(timeMatch[2], 10);
      const meridian = timeMatch[3].toUpperCase();

      if (meridian === 'PM' && hour !== 12) hour += 12;
      if (meridian === 'AM' && hour === 12) hour = 0;

      eventDateTime.setHours(hour, minute, 0, 0);
    }

    return eventDateTime < new Date();
  }, []);

  const canRegisterForEvent = useCallback(
    event => {
      if (!event) return false;

      if (isEventInPast(event)) {
        toast.info('Registration is closed for past events.', {
          position: 'top-right',
          autoClose: 3000,
        });
        return false;
      }

      if (registeredEventIds.has(event.id)) {
        toast.info(`You are already registered for "${event.title}".`, {
          position: 'top-right',
          autoClose: 3000,
        });
        return false;
      }

      return true;
    },
    [registeredEventIds, isEventInPast],
  );

  const handleRegister = useCallback(async () => {
    if (!selectedEvent) return;

    if (!canRegisterForEvent(selectedEvent)) {
      return;
    }

    if (registeredEventIds.has(selectedEvent.id)) {
      toast.info(`You are already registered for "${selectedEvent.title}".`, {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    const confirmed = globalThis.confirm(
      `Register for "${
        selectedEvent.title
      }"?\n\nDate: ${selectedEvent.date.toDateString()}\nTime: ${selectedEvent.time}`,
    );

    if (!confirmed) return;

    setIsRegistering(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      setRegisteredEventIds(prev => {
        const nextSet = new Set(prev);
        nextSet.add(selectedEvent.id);
        return nextSet;
      });

      toast.success(`✓ Registered for "${selectedEvent.title}"!`, {
        position: 'top-right',
        autoClose: 4000,
      });

      setTimeout(() => {
        closeEventModal();
      }, 500);
    } catch (error) {
      console.error('Event registration failed:', error);

      toast.error('Registration failed. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsRegistering(false);
    }
  }, [selectedEvent, registeredEventIds, closeEventModal]);

  const eventHasEnded = selectedEvent && isEventInPast(selectedEvent);

  const handleAddToCalendar = useCallback(() => {
    if (!selectedEvent) return;

    const timeMatch = selectedEvent.time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/);
    const start = new Date(selectedEvent.date);

    if (timeMatch) {
      const hour = (Number(timeMatch[1]) % 12) + (timeMatch[3] === 'PM' ? 12 : 0);
      start.setHours(hour, Number(timeMatch[2]), 0, 0);
    }

    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    const formatDate = d =>
      d
        .toISOString()
        .replace(/[-:.]/g, '')
        .split('.')[0] + 'Z';

    const url =
      'https://www.google.com/calendar/render?action=TEMPLATE' +
      `&text=${encodeURIComponent(selectedEvent.title)}` +
      `&dates=${formatDate(start)}/${formatDate(end)}` +
      `&details=${encodeURIComponent(selectedEvent.description)}` +
      `&location=${encodeURIComponent(selectedEvent.location)}`;

    const opened = globalThis.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      toast.info('Please allow pop-ups to add this event to your calendar.');
    }
  }, [selectedEvent]);

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

  const registerButtonText = useMemo(() => {
    if (eventHasEnded) {
      return 'Event Ended';
    }

    if (registeredEventIds.has(selectedEvent?.id)) {
      return 'Already Registered';
    }

    if (isRegistering) {
      return 'Registering...';
    }

    return 'Register for Event';
  }, [eventHasEnded, registeredEventIds, selectedEvent, isRegistering]);

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
    Holiday: 'statusHoliday',
  };

  const statusIconMap = {
    New: '⭐',
    'Needs Attendees': '🙋',
    'Filling Fast': '⚡',
    'Full Event': '⛔',
    Holiday: '🎉',
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
                  let h = Number.parseInt(hStr, 10);
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

  const getEventLabel = useCallback(count => {
    return count === 1 ? 'event' : 'events';
  }, []);

  const renderSelectedDateSummary = useCallback(() => {
    const count = selectedDateEvents.length;

    if (count === 0) {
      return 'No events scheduled for this date';
    }

    return `${count} ${getEventLabel(count)} scheduled`;
  }, [selectedDateEvents.length, getEventLabel]);

  const getEventStatusKey = useCallback(status => {
    return statusMap[status] || 'statusNew';
  }, []);

  const getHiddenCount = (eventsForDate, limit = 3) => Math.max(0, eventsForDate.length - limit);

  const getVisibleEvents = (eventsForDate, limit = 3) => eventsForDate.slice(0, limit);

  // Render event tiles
  const tileContent = useCallback(
    ({ date, view }) => {
      if (view !== 'month') return null;

      const eventsForDate = getEventsForDate(date);
      if (!eventsForDate.length) return null;

      const visible = getVisibleEvents(eventsForDate);
      const hiddenCount = getHiddenCount(eventsForDate);

      return (
        <div className={styles.tileEvents}>
          {visible.map(e => {
            const statusKey = getEventStatusKey(e.status);

            return (
              <button
                key={e.id}
                type="button"
                className={`${styles.eventItem} ${styles[statusKey] || ''}`}
                onClick={eventObject => {
                  eventObject.stopPropagation();
                  handleEventClick(e);
                }}
                onMouseEnter={ev => {
                  const r = ev.currentTarget.getBoundingClientRect();
                  setTooltip({ event: e, x: r.right + 8, y: r.top });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <span className={styles.eventContent}>
                  <span className={styles.eventIcon}>{statusIconMap[e.status] || '⭐'}</span>
                  <span className={styles.eventTitleText}>{e.title}</span>
                </span>
              </button>
            );
          })}

          {hiddenCount > 0 && (
            <button
              type="button"
              className={styles.moreEvents}
              onClick={ev => {
                ev.stopPropagation();
                const r = ev.currentTarget.getBoundingClientRect();
                setOverflowDate({ date, x: r.right + 8, y: r.top });
                handleDateSelect(date);
              }}
            >
              +{hiddenCount} more
            </button>
          )}
        </div>
      );
    },
    [getEventsForDate, handleEventClick, handleDateSelect, statusIconMap],
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
              /* Navigation button hover/focus — dark mode */
            .react-calendar__navigation button:enabled:hover,
            .react-calendar__navigation button:enabled:hover *,
            .react-calendar__navigation button:enabled:focus,
            .react-calendar__navigation button:enabled:focus * {
              background-color: #2d3748 !important;
              color: #ffffff !important;
              text-shadow: none !important;
              -webkit-text-stroke: 0px transparent !important;
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

                  <p className={styles.selectedDateSummary}>{renderSelectedDateSummary()}</p>
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
                              View details
                            </button>
                          </header>

                          {/* Row 3: description */}
                          {event.description && (
                            <p className={styles.selectedEventDescription}>{event.description}</p>
                          )}
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

      {/* Overflow day-summary popup */}
      {overflowDate && (
        <div
          ref={popupRef}
          className={`${styles.overflowPopup} ${darkMode ? styles.overflowPopupDark : ''}`}
          style={{ left: overflowDate.x, top: overflowDate.y }}
        >
          <div
            className={`${styles.overflowPopupHeader} ${
              darkMode ? styles.overflowPopupHeaderDark : ''
            }`}
          >
            <span>
              {overflowDate.date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <button
              type="button"
              className={`${styles.overflowPopupClose} ${
                darkMode ? styles.overflowPopupCloseDark : ''
              }`}
              onClick={() => setOverflowDate(null)}
              aria-label="Close popup"
            >
              ×
            </button>
          </div>
          <div className={styles.overflowPopupList}>
            {getEventsForDate(overflowDate.date).map(e => (
              <button
                key={e.id}
                type="button"
                className={`${styles.overflowEventRow} ${
                  darkMode ? styles.overflowEventRowDark : ''
                }`}
                onClick={() => {
                  handleEventClick(e);
                  setOverflowDate(null);
                }}
              >
                <span className={styles.overflowEventTime}>{e.time}</span>

                <span className={styles.overflowEventTitle}>{e.title}</span>

                <span
                  className={`${styles.overflowEventBadge} ${styles[statusMap[e.status]] ||
                    styles.statusNew}`}
                >
                  {statusIconMap[e.status] || '⭐'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hover tooltip — fixed so it escapes overflow: hidden on tiles */}
      {tooltip && (
        <div
          className={`${styles.eventTooltip} ${darkMode ? styles.eventTooltipDark : ''}`}
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <strong>{tooltip.event.title}</strong>
          <span className={styles.tooltipDetail}>
            <strong>Time:</strong> {tooltip.event.time}
          </span>
          <span className={styles.tooltipDetail}>
            <strong>Location:</strong> {tooltip.event.location}
          </span>
          <span className={styles.tooltipDetail}>
            <strong>Status:</strong> {tooltip.event.status}
          </span>
          <small>Click for more details</small>
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
                  className={`${darkMode ? styles.darkModeStatusBadge : styles.statusBadge} ${
                    darkMode ? '' : styles[statusMap[selectedEvent.status]] || ''
                  }`}
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
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleRegister}
                disabled={
                  isRegistering || registeredEventIds.has(selectedEvent?.id) || eventHasEnded
                }
              >
                {registerButtonText}
              </button>

              <button type="button" className={styles.btnSecondary} onClick={handleAddToCalendar}>
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
