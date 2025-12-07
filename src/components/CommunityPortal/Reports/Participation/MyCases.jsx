import { useState, Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './MyCases.module.css';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { AddEventDetailsPopup } from './AddEventDetailsPopup';
import { fetchEventDetails } from '../../../../actions/communityPortal/EventActivityActions';
import { formateDate, formatEventDisplay } from './HelperFunctions';

function MyCases() {
  const [view, setView] = useState('card');
  const [filter, setFilter] = useState('all');
  const [addEventDetailsPopup, setAddEventDetailsPopup] = useState(false);
  const { data, loading, error } = useSelector(state => state.eventActivity);
  const [eventsData, setEventsData] = useState([]);
  const [events, setEvents] = useState([]);
  const dispatch = useDispatch();
  const token = localStorage.getItem('token');
  const darkMode = useSelector(state => state.theme.darkMode);
  const placeholderAvatar = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  useEffect(() => {
    if (data === null && loading === false && error === null) {
      dispatch(fetchEventDetails(token));
    } else if (data) {
      setEventsData(transformEvents(data.events));
    }
  }, [data, loading, error]);

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

  const transformEvents = events => {
    return events.map(event => {
      const startTime = formateDate(new Date(event.startTime));
      const endTime = formateDate(new Date(event.endTime));
      return {
        ...event,
        date: formatEventDisplay({ eventStartTime: startTime, eventEndTime: endTime }),
        startTime,
        endTime,
      };
    });
  };

  const renderCalendarView = () => (
    <div className={`${styles.calendarView} ${darkMode ? styles.calendarViewDark : ''}`}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={events[0]?.startTime}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events.map(event => ({
          title: event.type + ' ' + event.title,
          date: event.startTime.split('T')[0],
          start: event.startTime,
          end: event.endTime,
        }))}
        eventClick={info => {
          const calendar = info.view.calendar;
          calendar.changeView('timeGridDay', info.event.start);
        }}
      />
    </div>
  );

  const renderCardView = () => (
    <div className={`case-cards-global ${styles.caseCards}`}>
      {events.map(event => (
        <div
          className={`case-card-global ${styles.caseCard} ${darkMode ? styles.caseCardDark : ''}`}
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
            >{`+${event.resources.length}`}</span>
          </div>
        </div>
      ))}
    </div>
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

  const handlePopup = () => {
    setAddEventDetailsPopup(!addEventDetailsPopup);
  };

  const addEventDetails = eventDetails => {
    setAddEventDetailsPopup(false);
  };

  return (
    <Fragment>
      <div
        className={`my-cases-global ${styles.myCasesPage} ${
          darkMode ? styles.myCasesPageDark : ''
        }`}
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
          {events.length === 0 && !loading && (
            <div className={styles.retrievalStatus}>No events found</div>
          )}
          {loading && <div className={styles.retrievalStatus}>Loading events...</div>}
          {view === 'card' && renderCardView()}
          {view === 'list' && renderListView()}
          {view === 'calendar' && renderCalendarView()}
        </main>
      </div>
    </Fragment>
  );
}

export default MyCases;
