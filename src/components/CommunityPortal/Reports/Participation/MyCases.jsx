import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import styles from './MyCases.module.css';
import upcomingStyles from './UpcomingEvents.module.css';
import { getEvents } from '../../../../actions/eventActions';
import CreateEventModal from './CreateEventModal';
import {
  formatDayLabel,
  getCalendarDay,
  getEmptyMessage,
  getEventDayKeys,
  getVisibleEvents,
} from './eventDayUtils';

const MAX_COLLAPSED_EVENTS = 10;

// Adds the dark-mode class when dark mode is on
const withDark = (darkMode, base, dark) => (darkMode ? `${base} ${dark}` : base);

// More only applies to the capped Card and List views
const shouldShowMore = (view, eventCount, isExporting) =>
  view !== 'calendar' && eventCount > MAX_COLLAPSED_EVENTS && !isExporting;

// Card and List show which calendar day they are filtered to
const shouldShowDayBar = (selectedDate, view) => Boolean(selectedDate) && view !== 'calendar';

function MyCases() {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('card');
  const [filter, setFilter] = useState('All Time');
  const [expanded, setExpanded] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // Day picked on the calendar; shared by all three views. null = use the dropdown range.
  const [selectedDate, setSelectedDate] = useState(null);

  const isExporting =
    typeof document !== 'undefined' && document.documentElement?.dataset?.exporting === 'true';

  const darkMode = useSelector(state => state.theme.darkMode);
  const loadEvents = useCallback(async () => {
    try {
      const response = await getEvents({
        page: 1,
        limit: 200,
        sortBy: 'date',
        sortOrder: 'desc',
      });

      if (response?.status && response.status >= 400) {
        throw new Error(response.message || 'Failed to fetch events');
      }

      const backendEvents = response?.data?.events || [];

      const formattedEvents = backendEvents.map(event => ({
        id: event._id,
        eventName: event.title,
        eventType: event.type,
        eventDate: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        eventTime: new Date(event.startTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        attendees: event.currentAttendees || 0,
        image: event.coverImage,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('loadEvents error:', error);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const filteredEvents = useMemo(() => getVisibleEvents(events, { filter, selectedDate }), [
    events,
    filter,
    selectedDate,
  ]);

  const handleFilterChange = value => {
    // The dropdown range replaces any day picked on the calendar
    setFilter(value);
    setSelectedDate(null);
    setExpanded(false);
  };

  const clearSelectedDate = () => {
    setSelectedDate(null);
    setExpanded(false);
  };

  const emptyMessage = getEmptyMessage(selectedDate, filter);

  const handleEventCreated = createdEvent => {
    if (!createdEvent) return;

    const eventDate = createdEvent.startTime || createdEvent.date || Date.now();

    setEvents(prev => [
      {
        id: createdEvent._id || createdEvent.id || `local-${Date.now()}`,
        isNew: true,
        eventType: createdEvent.type || 'all',
        eventDate: new Date(eventDate).toISOString(),
        startTime: eventDate,
        endTime: createdEvent.endTime,
        eventTime: new Date(eventDate).toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        eventName: createdEvent.title,
        attendees: 0,
        location: createdEvent.location,
      },
      ...prev,
    ]);
  };

  let visibleEvents = filteredEvents;

  if (!isExporting) {
    visibleEvents = expanded ? filteredEvents : filteredEvents.slice(0, MAX_COLLAPSED_EVENTS);
  }

  const FALLBACK_IMG =
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=60';

  // Memoized event cache by date for calendar
  const eventCacheByDate = useMemo(() => {
    const cache = new Map();
    events.forEach(event => {
      // Multi-day events appear on every day they cover
      getEventDayKeys(event).forEach(dateKey => {
        if (!cache.has(dateKey)) {
          cache.set(dateKey, []);
        }
        cache.get(dateKey).push(event);
      });
    });
    return cache;
  }, [events]);

  // The calendar shows today until a day is picked
  const calendarDay = getCalendarDay(selectedDate);
  const selectedDateEvents = eventCacheByDate.get(calendarDay.toDateString()) || [];

  // Handle date selection in calendar
  const handleDateSelect = useCallback(date => {
    setSelectedDate(date);
    setExpanded(false);
  }, []);

  // Handle Create New button
  // Get event image or fallback
  const getEventImage = useCallback(event => {
    // Check if event has image property, otherwise use fallback
    return event.image || event.imageUrl || FALLBACK_IMG;
  }, []);

  const isEventToday = dateString => {
    const eventDate = new Date(dateString);
    const now = new Date();

    return (
      eventDate.getDate() === now.getDate() &&
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getFullYear() === now.getFullYear()
    );
  };

  const renderCardView = () => {
    if (visibleEvents.length === 0) {
      return <div className={styles.noEventsMessage}>{emptyMessage}</div>;
    }

    return (
      <div
        className={`case-cards-global ${styles.caseCards} ${
          expanded || isExporting ? styles.expanded : ''
        }`}
      >
        {visibleEvents.map(event => (
          <div
            className={`case-card-global ${styles.caseCard} ${darkMode ? styles.caseCardDark : ''}`}
            key={event.id}
          >
            <span className={styles.eventBadge} data-type={event.eventType}>
              {event.eventType}
            </span>

            <span className={`${styles.eventTime} ${darkMode ? styles.eventTimeDark : ''}`}>
              {event.eventTime}
            </span>

            <span className={`${styles.eventName} ${darkMode ? styles.eventNameDark : ''}`}>
              {isEventToday(event.eventDate) ? "Today's " : ''}
              {event.eventName}
            </span>

            <div className={styles.eventImageContainer}>
              <img
                src={getEventImage(event)}
                alt={event.eventName}
                className={styles.eventImage}
                onError={e => {
                  if (e.currentTarget.src !== FALLBACK_IMG) {
                    e.currentTarget.src = FALLBACK_IMG;
                  }
                }}
              />
            </div>
            <div className={`${styles.attendeesInfo} ${darkMode ? styles.attendeesInfoDark : ''}`}>
              <div className={styles.avatars}>
                <img
                  alt="profile img"
                  src="/pfp-default-header.png"
                  width="24"
                  height="24"
                  crossOrigin="anonymous"
                  loading="lazy"
                  onError={e => {
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />
              </div>

              <span
                className={`${styles.attendeesCount} ${darkMode ? styles.attendeesCountDark : ''}`}
                title="Number of members who attended this event"
                data-tooltip="Members Attended"
              >
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                {`+${event.attendees}`} Attendees
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderListView = () => {
    if (visibleEvents.length === 0) {
      return <div className={styles.noEventsMessage}>{emptyMessage}</div>;
    }

    return (
      <ul
        className={`case-list-global ${styles.caseList} ${
          expanded || isExporting ? styles.expanded : ''
        }`}
      >
        {visibleEvents.map(event => (
          <li
            className={`case-list-item-global ${styles.caseListItem} ${
              darkMode ? styles.caseListItemDark : ''
            }`}
            key={event.id}
          >
            <span className={`${styles.eventType} ${darkMode ? styles.eventTypeDark : ''}`}>
              {event.eventType}
            </span>
            <span className={`${styles.eventTime} ${darkMode ? styles.eventTimeDark : ''}`}>
              {event.eventTime}
            </span>
            <span className={`${styles.eventName} ${darkMode ? styles.eventNameDark : ''}`}>
              {event.eventName}
            </span>

            <span
              className={`${styles.attendeesCount} ${darkMode ? styles.attendeesCountDark : ''}`}
              title="Number of members who attended this event"
              data-tooltip="Members Attended"
            >
              <FontAwesomeIcon icon={faUsers} className="me-2" />
              {`+${event.attendees}`} Attendees
            </span>
          </li>
        ))}
      </ul>
    );
  };

  // Memoized tile content for calendar
  const tileContent = useCallback(
    ({ date, view }) => {
      if (view === 'month') {
        const dateKey = date.toDateString();
        const eventsForDate = eventCacheByDate.get(dateKey) || [];
        if (eventsForDate.length > 0) {
          return (
            <div className={styles.calendarEventIndicator}>
              {eventsForDate.length > 3 ? (
                <span className={styles.eventCountBadge}>+{eventsForDate.length}</span>
              ) : (
                eventsForDate.slice(0, 3).map((event, idx) => {
                  const eventTypeClass = styles[`eventType${idx}`];
                  return (
                    <div
                      key={event.id}
                      className={`${styles.calendarEventDot} ${eventTypeClass}`}
                      title={event.eventName}
                    />
                  );
                })
              )}
            </div>
          );
        }
      }
      return null;
    },
    [eventCacheByDate],
  );

  // Memoized tile class name
  const tileClassName = useCallback(
    ({ date, view }) => {
      if (view === 'month') {
        const dateKey = date.toDateString();
        const classes = [];
        if (eventCacheByDate.has(dateKey)) {
          classes.push(styles.hasEvents);
        }
        // Today stays highlighted until a day is picked
        if (date.toDateString() === getCalendarDay(selectedDate).toDateString()) {
          classes.push(styles.selectedDate);
        }
        return classes.join(' ');
      }
      return null;
    },
    [eventCacheByDate, selectedDate],
  );

  const renderCalendarView = () => (
    <div className={`${styles.calendarView} ${darkMode ? styles.calendarViewDark : ''}`}>
      <div className={styles.calendarContainer}>
        <ReactCalendar
          onChange={handleDateSelect}
          value={calendarDay}
          tileContent={tileContent}
          tileClassName={tileClassName}
          className={
            darkMode
              ? `${styles.calendarDark} ${upcomingStyles.calendarDarkHover}`
              : styles.calendar
          }
        />
      </div>
      {selectedDateEvents.length > 0 && (
        <div className={styles.selectedDateEvents}>
          <h3
            className={`${styles.selectedDateTitle} ${
              darkMode ? styles.selectedDateTitleDark : ''
            }`}
          >
            Events on {formatDayLabel(calendarDay)}
          </h3>
          <div className={styles.selectedEventsList}>
            {selectedDateEvents.map(event => (
              <div
                key={event.id}
                className={`${styles.selectedEventCard} ${
                  darkMode ? styles.selectedEventCardDark : ''
                }`}
              >
                <span className={styles.eventBadge} data-type={event.eventType}>
                  {event.eventType}
                </span>
                <h4
                  className={`${styles.selectedEventName} ${
                    darkMode ? styles.selectedEventNameDark : ''
                  }`}
                >
                  {event.eventName}
                </h4>
                <p
                  className={`${styles.selectedEventTime} ${
                    darkMode ? styles.selectedEventTimeDark : ''
                  }`}
                >
                  {event.eventTime}
                </p>
                <p
                  className={`${styles.selectedEventAttendees} ${
                    darkMode ? styles.selectedEventAttendeesDark : ''
                  }`}
                >
                  {event.attendees} attendees
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedDateEvents.length === 0 && (
        <div className={styles.noEventsMessage}>
          <p>No events scheduled for this date.</p>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`my-cases-global ${styles.myCasesPage} ${darkMode ? styles.myCasesPageDark : ''}`}
    >
      <header className={styles.header}>
        {/* Figma: "More" sits beside the section title, not with the header actions */}
        <div className={upcomingStyles.titleGroup}>
          <h2 className={`${styles.sectionTitle} ${darkMode ? styles.sectionTitleDark : ''}`}>
            Upcoming Events
          </h2>
          {shouldShowMore(view, filteredEvents.length, isExporting) && (
            <button
              type="button"
              className={`more-btn-global ${withDark(
                darkMode,
                upcomingStyles.moreBtn,
                upcomingStyles.moreBtnDark,
              )}`}
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
            >
              {expanded ? 'Show Less' : 'More'}
            </button>
          )}
        </div>

        <div className={styles.headerActions}>
          <div className={`${styles.viewSwitcher} ${darkMode ? styles.viewSwitcherDarkMode : ''}`}>
            <button
              type="button"
              className={view === 'calendar' ? styles.active : ''}
              onClick={() => setView('calendar')}
            >
              Calendar
            </button>

            <button
              type="button"
              className={view === 'card' ? styles.active : ''}
              onClick={() => setView('card')}
            >
              Card
            </button>

            <button
              type="button"
              className={view === 'list' ? styles.active : ''}
              onClick={() => setView('list')}
            >
              List
            </button>
          </div>

          <div className={`filter-wrapper-global ${styles.filterWrapper}`}>
            <select
              className={`${styles.filterDropdown} ${
                darkMode ? styles.filterDropdownDarkMode : ''
              }`}
              value={filter}
              onChange={e => handleFilterChange(e.target.value)}
            >
              <option value="All Time">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>

          <button
            type="button"
            className={`${styles.createNew} ${darkMode ? styles.createNewDarkMode : ''}`}
            onClick={() => setIsCreateModalOpen(true)}
          >
            + Create New
          </button>
        </div>
      </header>

      <main className={styles.content}>
        {shouldShowDayBar(selectedDate, view) && (
          <div
            className={withDark(
              darkMode,
              upcomingStyles.selectedDayBar,
              upcomingStyles.selectedDayBarDark,
            )}
          >
            <span>Showing events on {formatDayLabel(selectedDate)}</span>
            <button
              type="button"
              className={upcomingStyles.clearDayBtn}
              onClick={clearSelectedDate}
            >
              Show all upcoming
            </button>
          </div>
        )}
        {view === 'card' && renderCardView()}
        {view === 'list' && renderListView()}
        {view === 'calendar' && renderCalendarView()}
      </main>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        toggle={() => setIsCreateModalOpen(!isCreateModalOpen)}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
}

export default MyCases;
