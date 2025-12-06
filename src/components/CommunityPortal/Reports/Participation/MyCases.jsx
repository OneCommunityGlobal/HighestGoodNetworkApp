import { useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './MyCases.module.css';
import mockEvents from './mockData';

function MyCases() {
  const [view, setView] = useState('card');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const history = useHistory();

  const isExporting =
    typeof document !== 'undefined' && document.documentElement?.dataset?.exporting === 'true'; // Sonar: prefer .dataset

  const filterEvents = events => {
    const now = new Date();

    const nowTime = now.getTime();

    const upcomingEvents = events.filter(event => {
      const eventTime = new Date(event.eventDate).getTime();
      return eventTime >= nowTime;
    });

    if (filter === 'today') {
      return upcomingEvents.filter(event => {
        const eventDate = new Date(event.eventDate);
        return (
          eventDate.getDate() === now.getDate() &&
          eventDate.getMonth() === now.getMonth() &&
          eventDate.getFullYear() === now.getFullYear()
        );
      });
    }
    if (filter === 'thisWeek') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      return upcomingEvents.filter(event => {
        const eventDate = new Date(event.eventTime);
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      });
    }
    if (filter === 'thisMonth') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return upcomingEvents.filter(event => {
        const eventDate = new Date(event.eventTime);
        return eventDate >= startOfMonth && eventDate <= endOfMonth;
      });
    }
    return upcomingEvents;
  };

  const darkMode = useSelector(state => state.theme.darkMode);
  const filteredEvents = filterEvents(mockEvents);

  filteredEvents.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  // Sonar: extract nested ternary into independent statement
  let visibleEvents = filteredEvents;
  if (!isExporting) {
    visibleEvents = expanded ? filteredEvents.slice(0, 40) : filteredEvents.slice(0, 10);
  }

  const FALLBACK_IMG =
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=60';

  // Memoized event cache by date for calendar
  const eventCacheByDate = useMemo(() => {
    const cache = new Map();
    filteredEvents.forEach(event => {
      const eventDate = new Date(event.eventDate);
      const dateKey = eventDate.toDateString();
      if (!cache.has(dateKey)) {
        cache.set(dateKey, []);
      }
      cache.get(dateKey).push(event);
    });
    return cache;
  }, [filteredEvents]);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    const dateKey = selectedDate.toDateString();
    return eventCacheByDate.get(dateKey) || [];
  }, [selectedDate, eventCacheByDate]);

  // Handle date selection in calendar
  const handleDateSelect = useCallback(date => {
    setSelectedDate(date);
  }, []);

  // Handle Create New button
  const handleCreateNew = useCallback(() => {
    // Navigate to activities page or show a modal
    // For now, navigate to the community portal dashboard where events can be created
    history.push('/communityportal');
  }, [history]);

  // Get event image or fallback
  const getEventImage = useCallback(event => {
    // Check if event has image property, otherwise use fallback
    return event.image || event.imageUrl || FALLBACK_IMG;
  }, []);

  const renderCardView = () => (
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
            {event.eventName}
          </span>
          {event.image || event.imageUrl ? (
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
          ) : null}
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
            >{`+${event.attendees}`}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
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
          <span className={`${styles.attendeesCount} ${darkMode ? styles.attendeesCountDark : ''}`}>
            {`+${event.attendees}`}
          </span>
        </li>
      ))}
    </ul>
  );

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
                eventsForDate
                  .slice(0, 3)
                  .map((event, idx) => (
                    <div
                      key={event.id}
                      className={`${styles.calendarEventDot} ${styles[`eventType${idx}`]}`}
                      title={event.eventName}
                    />
                  ))
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
        if (date.toDateString() === selectedDate.toDateString()) {
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
          value={selectedDate}
          tileContent={tileContent}
          tileClassName={tileClassName}
          className={darkMode ? styles.calendarDark : styles.calendar}
        />
      </div>
      {selectedDateEvents.length > 0 && (
        <div className={styles.selectedDateEvents}>
          <h3
            className={`${styles.selectedDateTitle} ${
              darkMode ? styles.selectedDateTitleDark : ''
            }`}
          >
            Events on{' '}
            {selectedDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
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
        <h2 className={`${styles.sectionTitle} ${darkMode ? styles.sectionTitleDark : ''}`}>
          Upcoming Events
        </h2>
        <div className={styles.headerActions}>
          <div className={`view-switcher-global ${styles.viewSwitcher}`}>
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
              className={styles.filterDropdown}
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
            </select>
          </div>
          <button
            type="button"
            className={`create-new-global ${styles.createNew} ${
              darkMode ? styles.createNewDark : ''
            }`}
            onClick={handleCreateNew}
          >
            + Create New
          </button>
          {filteredEvents.length > 10 && !isExporting && (
            <button
              type="button"
              className={`more-btn-global ${styles.moreBtn}`}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Show Less' : 'More'}
            </button>
          )}
        </div>
      </header>
      <main className={styles.content}>
        {view === 'card' && renderCardView()}
        {view === 'list' && renderListView()}
        {view === 'calendar' && renderCalendarView()}
      </main>
    </div>
  );
}

export default MyCases;
