import { useState, Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './MyCases.module.css';
import { AddEventDetailsPopup } from './AddEventDetailsPopup';
import {
  createEvent,
  fetchEventDetails,
} from '../../../../actions/communityPortal/EventActivityActions';
import {
  constructQueryParams,
  formateDate,
  formatEventDisplay,
  transformEvents,
} from './HelperFunctions';
import { EventsCalendar } from './EventsCalendar';

function MyCases() {
  const [view, setView] = useState('card');
  const [filter, setFilter] = useState('all');
  const [addEventDetailsPopup, setAddEventDetailsPopup] = useState(false);
  const fetchEventState = useSelector(state => state.fetchEvent);
  const createEventState = useSelector(state => state.createEvent);
  const [eventsData, setEventsData] = useState([]);
  const [events, setEvents] = useState([]);
  const [more, setMore] = useState(false);
  const dispatch = useDispatch();
  const token = localStorage.getItem('token');
  const darkMode = useSelector(state => state.theme.darkMode);
  const placeholderAvatar = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  useEffect(() => {
    if (!fetchEventState.loading) {
      if (fetchEventState.data === null && fetchEventState.error === null) {
        const params = {
          limit: 16,
        };
        const queryParams = constructQueryParams(params);
        dispatch(fetchEventDetails(token, queryParams));
      } else if (fetchEventState.data && fetchEventState.data.events) {
        setEventsData(transformEvents(fetchEventState.data.events));
      } /*else if (error) {

      }*/
    }
  }, [fetchEventState]);

  useEffect(() => {
    const now = new Date();
    if (filter === 'today') {
      setEvents(
        eventsData.filter(event => {
          const eventDate = new Date(event.eventTime);
          return (
            eventDate.getDate() === now.getDate() &&
            eventDate.getMonth() === now.getMonth() &&
            eventDate.getFullYear() === now.getFullYear()
          );
        }),
      );
    } else if (filter === 'thisWeek') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      setEvents(
        eventsData.filter(event => {
          const eventDate = new Date(event.eventTime);
          return eventDate >= startOfWeek && eventDate <= endOfWeek;
        }),
      );
    } else if (filter === 'thisMonth') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setEvents(
        eventsData.filter(event => {
          const eventDate = new Date(event.eventTime);
          return eventDate >= startOfMonth && eventDate <= endOfMonth;
        }),
      );
    } else setEvents(eventsData);
  }, [filter]);

  useEffect(() => {
    setEvents(eventsData);
  }, [eventsData]);

  useEffect(() => {
    if (
      !createEventState.loading &&
      createEventState.status &&
      createEventState.status.status === 'success'
    ) {
      const params = {
        limit: 16,
      };
      const queryParams = constructQueryParams(params);
      dispatch(fetchEventDetails(token, queryParams));
      setAddEventDetailsPopup(false);
    }
  }, [createEventState]);

  useEffect(() => {
    if (more) {
      const queryParams = constructQueryParams({});
      dispatch(fetchEventDetails(token, queryParams));
    }
  }, [more]);

  const handlePopup = () => {
    setAddEventDetailsPopup(!addEventDetailsPopup);
  };

  const addEventDetails = eventDetails => {
    dispatch(createEvent(token, eventDetails));
  };

  const renderCardView = () => (
    <Fragment>
      {more ? (
        <div className={`case-cards-global ${styles.caseCards}`}>
          {events.map(event => (
            <div
              className={`case-card-global ${styles.caseCard} ${
                darkMode ? styles.caseCardDark : ''
              }`}
              key={event._id}
            >
              <span className={styles.eventBadge} data-type={event.type}>
                {event.type}
              </span>
              <span className={`${styles.eventTime} ${darkMode ? styles.eventTimeDark : ''}`}>
                {event.date}
              </span>
              <span className={`${styles.eventName} ${darkMode ? styles.eventNameDark : ''}`}>
                {event.title}
              </span>
              <div
                className={`${styles.attendeesInfo} ${darkMode ? styles.attendeesInfoDark : ''}`}
              >
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
                  className={`${styles.attendeesCount} ${
                    darkMode ? styles.attendeesCountDark : ''
                  }`}
                >{`+${event.resources.length}`}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`case-cards-global ${styles.caseCards} ${styles.shrink}`}>
          {events.map(event => (
            <div
              className={`case-card-global ${styles.caseCard} ${
                darkMode ? styles.caseCardDark : ''
              }`}
              key={event._id}
            >
              <span className={styles.eventBadge} data-type={event.type}>
                {event.type}
              </span>
              <span className={`${styles.eventTime} ${darkMode ? styles.eventTimeDark : ''}`}>
                {event.date}
              </span>
              <span className={`${styles.eventName} ${darkMode ? styles.eventNameDark : ''}`}>
                {event.title}
              </span>
              <div
                className={`${styles.attendeesInfo} ${darkMode ? styles.attendeesInfoDark : ''}`}
              >
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
                  className={`${styles.attendeesCount} ${
                    darkMode ? styles.attendeesCountDark : ''
                  }`}
                >{`+${event.resources.length}`}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Fragment>
  );

  const renderListView = () => (
    <ul className={`case-list-global ${styles.caseList}`}>
      {events.map(event => (
        <li
          className={`case-list-item-global ${styles.caseListItem} ${
            darkMode ? styles.caseListItemDark : ''
          }`}
          key={event._id}
        >
          <span className={styles.eventType}>{event.type}</span>
          <span className={styles.eventTime}>{event.date}</span>
          <span className={styles.eventName}>{event.title}</span>
          <span className={styles.attendeesCount}>{`+${event.resources.length}`}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <Fragment>
      <div
        className={`my-cases-global ${styles.myCasesPage} ${
          darkMode ? styles.myCasesPageDark : ''
        }`}
      >
        <header className={styles.header}>
          <div className={styles.eventsTitle}>
            <h2 className={`${styles.sectionTitle} ${darkMode ? styles.sectionTitleDark : ''}`}>
              Upcoming Events
            </h2>
            {view === 'card' &&
              (more ? (
                <button className={styles.moreBtn} onClick={() => setMore(false)}>
                  Less ˄
                </button>
              ) : (
                <button className={styles.moreBtn} onClick={() => setMore(true)}>
                  More ˅
                </button>
              ))}
          </div>
          <div className={styles.headerActions}>
            <div className={`view-switcher-global ${styles.viewSwitcher}`}>
              <div>
                <button
                  type="button"
                  className={view === 'calendar' ? styles.active : ''}
                  onClick={() => setView('calendar')}
                >
                  Calendar
                </button>
                <button
                  type="button"
                  className={`${styles.cardBtn} ${view === 'card' ? styles.active : ''}`}
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
              className={`create-new-global ${styles.createNew}`}
              onClick={() => setAddEventDetailsPopup(true)}
            >
              + Create New
            </button>
            {addEventDetailsPopup && (
              <AddEventDetailsPopup handlePopup={handlePopup} addEventDetails={addEventDetails} />
            )}
          </div>
        </header>
        <main className={styles.content}>
          {events.length === 0 && !fetchEventState.loading && (
            <div className={styles.retrievalStatus}>No events found</div>
          )}
          {fetchEventState.loading && (
            <div className={styles.retrievalStatus}>Loading events...</div>
          )}
          {view === 'calendar' && <EventsCalendar />}
          {view === 'card' && renderCardView()}
          {view === 'list' && renderListView()}
        </main>
      </div>
    </Fragment>
  );
}

export default MyCases;
