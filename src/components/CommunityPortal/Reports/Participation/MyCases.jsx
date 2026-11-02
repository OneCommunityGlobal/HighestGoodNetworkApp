import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './MyCases.module.css';
import CreateEventModal from './CreateEventModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { filterEventsByDate, getEventInterval } from './FilterByDate';
import { fetchEventDetails } from '../../../../actions/communityPortal/EventActivityActions';
import { transformEvents } from './HelperFunctions';
import { EventsCalendar } from './EventsCalendar';

function MyCases() {
  const [view, setView] = useState('card');
  const [filter, setFilter] = useState('All Time');
  const [selectedDate, setSelectedDate] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const dispatch = useDispatch();
  const fetchEventState = useSelector(state => state.fetchEvent);

  const [eventsData, setEventsData] = useState([]);
  const [eventsError, setEventsError] = useState('');

  const loadEvents = useCallback(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setEventsError('Please log in to view events.');
      return;
    }

    dispatch(fetchEventDetails(token));
  }, [dispatch]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (fetchEventState?.data?.events) {
      const events = transformEvents(fetchEventState.data.events);

      const adaptedEvents = events.map(event => ({
        ...event,
        id: event._id,
        eventType: event.type,
        eventName: event.title,
        eventTime: event.date,
        attendees: event.currentAttendees ?? 0,
      }));

      setEventsData(adaptedEvents);
      setEventsError('');
    }
  }, [fetchEventState?.data]);

  useEffect(() => {
    if (fetchEventState?.error) {
      setEventsError(fetchEventState.error);
    }
  }, [fetchEventState?.error]);

  const isExporting =
    typeof document !== 'undefined' && document.documentElement?.dataset?.exporting === 'true';

  const darkMode = useSelector(state => state.theme.darkMode);

  const now = new Date();
  const filteredEvents = filterEventsByDate(eventsData, filter, selectedDate).filter(event => {
    const interval = getEventInterval(event);
    return interval && interval.end >= now;
  });

  const handleEventCreated = () => {
    loadEvents();
  };

  useEffect(() => {
    setExpanded(false);
  }, [filter, selectedDate]);

  let visibleEvents = filteredEvents;

  if (!isExporting) {
    visibleEvents = expanded ? filteredEvents : filteredEvents.slice(0, 10);
  }

  const placeholderAvatar = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  const isEventToday = dateString => {
    const eventDate = new Date(dateString);
    const now = new Date();

    return (
      eventDate.getDate() === now.getDate() &&
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getFullYear() === now.getFullYear()
    );
  };

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
            {isEventToday(event.eventDate) ? "Today's " : ''}
            {event.eventName}
          </span>

          <div className={`${styles.attendeesInfo} ${darkMode ? styles.attendeesInfoDark : ''}`}>
            <div className={styles.avatars}>
              <img
                alt="profile img"
                src={placeholderAvatar}
                width="24"
                height="24"
                crossOrigin="anonymous"
                loading="lazy"
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
          <span className={styles.eventType}>{event.eventType}</span>
          <span className={styles.eventTime}>{event.eventTime}</span>
          <span className={styles.eventName}>{event.eventName}</span>

          <span
            className={styles.attendeesCount}
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

  const renderCalendarView = () => (
    <EventsCalendar events={filteredEvents} selectedDate={selectedDate} />
  );

  return (
    <div
      className={`my-cases-global ${styles.myCasesPage} ${darkMode ? styles.myCasesPageDark : ''}`}
    >
      <header className={styles.header}>
        <div className={styles.titleGroup} role="group" aria-label="Upcoming Events controls">
          <h2 className={`${styles.sectionTitle} ${darkMode ? styles.sectionTitleDark : ''}`}>
            Upcoming Events
          </h2>

          {view !== 'calendar' && filteredEvents.length > 10 && !isExporting && (
            <button
              type="button"
              className={`more-btn-global ${styles.moreBtn}`}
              onClick={() => setExpanded(!expanded)}
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
              aria-label="Filter upcoming events by date range"
              onChange={e => {
                const nextFilter = e.target.value;
                setFilter(nextFilter);
                if (nextFilter !== 'Specific Date') setSelectedDate('');
              }}
            >
              <option value="All Time">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="Specific Date">Specific Date</option>
            </select>

            {filter === 'Specific Date' && (
              <input
                type="date"
                className={`${styles.dateInput} ${darkMode ? styles.dateInputDarkMode : ''}`}
                value={selectedDate}
                aria-label="Select a specific event date"
                onChange={e => setSelectedDate(e.target.value)}
              />
            )}
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
        {fetchEventState?.loading && <p role="status">Loading events...</p>}

        {eventsError && <p role="alert">{eventsError}</p>}

        {!fetchEventState?.loading &&
          !eventsError &&
          view !== 'calendar' &&
          filteredEvents.length === 0 && (
            <p role="status">No upcoming events found for the selected date range.</p>
          )}

        {!fetchEventState?.loading && !eventsError && (
          <>
            {view === 'card' && renderCardView()}
            {view === 'list' && renderListView()}
            {view === 'calendar' && renderCalendarView()}
          </>
        )}
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
