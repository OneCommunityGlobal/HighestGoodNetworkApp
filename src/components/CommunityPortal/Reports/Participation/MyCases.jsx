import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './MyCases.module.css';
import CreateEventModal from './CreateEventModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { filterEventsByDate } from './FilterByDate';
import { fetchEventDetails } from '../../../../actions/communityPortal/EventActivityActions';
import { constructQueryParams, transformEvents } from './HelperFunctions';
import { EventsCalendar } from './EventsCalendar';

function MyCases() {
  const [view, setView] = useState('card');
  const [filter, setFilter] = useState('All Time');
  const [expanded, setExpanded] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [eventsData, setEventsData] = useState([]);

  const fetchEventState = useSelector(state => state.fetchEvent);
  const dispatch = useDispatch();
  const token = localStorage.getItem('token');

  const isExporting =
    typeof document !== 'undefined' && document.documentElement?.dataset?.exporting === 'true';

  const now = new Date();

  const darkMode = useSelector(state => state.theme.darkMode);

  const filteredEvents = filterEventsByDate(eventsData, filter).filter(
    event => new Date(event.eventDate).getTime() >= now.getTime(),
  );

  let visibleEvents = filteredEvents;

  if (!isExporting) {
    visibleEvents = expanded ? filteredEvents : filteredEvents.slice(0, 10);
  }

  const placeholderAvatar = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  // Bridges the backend event shape (from transformEvents: _id, type, title,
  // resources, startTime/endTime/date) onto the field names the rendering and
  // filterEventsByDate/isEventToday logic below expect (id, eventType,
  // eventName, eventTime, eventDate, attendees).
  const adaptEventForDisplay = event => ({
    ...event,
    id: event._id,
    eventType: event.type,
    eventName: event.title,
    eventTime: event.date,
    eventDate: event.startTime,
    attendees: Array.isArray(event.resources) ? event.resources.length : 0,
  });

  const fetchEvents = () => {
    const params = expanded ? {} : { limit: 16 };
    const queryParams = constructQueryParams(params);
    dispatch(fetchEventDetails(token, queryParams));
  };

  // Fetch events from the backend; re-fetch without a limit once expanded ("More").
  useEffect(() => {
    if (!fetchEventState.loading) {
      if (fetchEventState.data === null && fetchEventState.error === null) {
        fetchEvents();
      } else if (fetchEventState.data?.events) {
        setEventsData(transformEvents(fetchEventState.data.events).map(adaptEventForDisplay));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchEventState]);

  useEffect(() => {
    if (expanded) {
      fetchEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const isEventToday = dateString => {
    const eventDate = new Date(dateString);
    const nowDate = new Date();

    return (
      eventDate.getDate() === nowDate.getDate() &&
      eventDate.getMonth() === nowDate.getMonth() &&
      eventDate.getFullYear() === nowDate.getFullYear()
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

  return (
    <div
      className={`my-cases-global ${styles.myCasesPage} ${darkMode ? styles.myCasesPageDark : ''}`}
    >
      <header className={styles.header}>
        <h2 className={`${styles.sectionTitle} ${darkMode ? styles.sectionTitleDark : ''}`}>
          Upcoming Events
        </h2>

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

          {view !== 'calendar' && (
            <div className={`filter-wrapper-global ${styles.filterWrapper}`}>
              <select
                className={`${styles.filterDropdown} ${
                  darkMode ? styles.filterDropdownDarkMode : ''
                }`}
                value={filter}
                onChange={e => setFilter(e.target.value)}
              >
                <option value="All Time">All Time</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
              </select>
            </div>
          )}

          <button
            type="button"
            className={`${styles.createNew} ${darkMode ? styles.createNewDarkMode : ''}`}
            onClick={() => setIsCreateModalOpen(true)}
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
        {eventsData.length === 0 && !fetchEventState.loading && (
          <div className={styles.retrievalStatus}>No events found</div>
        )}
        {fetchEventState.loading && <div className={styles.retrievalStatus}>Loading events...</div>}
        {view === 'card' && renderCardView()}
        {view === 'list' && renderListView()}
        {view === 'calendar' && <EventsCalendar />}
      </main>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        toggle={() => setIsCreateModalOpen(!isCreateModalOpen)}
        onEventCreated={fetchEvents}
      />
    </div>
  );
}

export default MyCases;