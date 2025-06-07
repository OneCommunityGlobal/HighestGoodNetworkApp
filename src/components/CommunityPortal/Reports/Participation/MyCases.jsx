import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './MyCases.module.css';
import mockEvents from './mockData';

function MyCases() {
  const [view, setView] = useState('card');
  const [filter, setFilter] = useState('all');

  const filterEvents = events => {
    const now = new Date();
    if (filter === 'today') {
      return events.filter(event => {
        const eventDate = new Date(event.eventTime);
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
      return events.filter(event => {
        const eventDate = new Date(event.eventTime);
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      });
    }
    if (filter === 'thisMonth') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return events.filter(event => {
        const eventDate = new Date(event.eventTime);
        return eventDate >= startOfMonth && eventDate <= endOfMonth;
      });
    }
    return events;
  };

  const darkMode = useSelector(state => state.theme.darkMode);

  const filteredEvents = filterEvents(mockEvents);

  const renderCardView = () => (
    <div className={`${styles.caseCards}`}>
      {filteredEvents.map(event => (
        <div className={`case-card ${darkMode ? 'case-card-dark' : ''}`} key={event.id}>
          <span className={`${styles.eventBadge}`}>{event.eventType}</span>
          <span className={`event-time ${darkMode ? 'event-time-dark' : ''}`}>
            {event.eventTime}
          </span>
          <span className={`event-name ${darkMode ? 'event-name-dark' : ''}`}>
            {event.eventName}
          </span>
          <div className={`attendees-info ${darkMode ? 'attendees-info-dark' : ''}`}>
            <div className={`${styles.avatars}`}>
              <img alt="profile img" />
            </div>
            <span
              className={`attendees-count ${darkMode ? 'attendees-count-dark' : ''}`}
            >{`+${event.attendees}`}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <ul className={`${styles.caseList}`}>
      {filteredEvents.map(event => (
        <li className={`case-list-item ${darkMode ? 'case-list-item-dark' : ''}`} key={event.id}>
          <span className={`${styles.eventType}`}>{event.eventType}</span>
          <span className={`${styles.eventTime}`}>{event.eventTime}</span>
          <span className={`${styles.eventName}`}>{event.eventName}</span>
          <span className={`${styles.attendeesCount}`}>{`+${event.attendees}`}</span>
        </li>
      ))}
    </ul>
  );

  const renderCalendarView = () => (
    <div className={`calendar-view ${darkMode ? 'calendar-view-dark' : ''}`}>
      <p>Calendar View is under construction...</p>
    </div>
  );

  return (
    <div className={`my-cases-page ${darkMode ? 'my-cases-page-dark' : ''}`}>
      <header className={`${styles.header}`}>
        <h2 className={`section-title ${darkMode ? 'section-title-dark' : ''}`}>My Cases</h2>
        <div className={`${styles.headerActions}`}>
          <div className={`${styles.viewSwitcher}`}>
            <button
              type="button"
              className={view === 'calendar' ? 'active' : ''}
              onClick={() => setView('calendar')}
            >
              Calendar
            </button>
            <button
              type="button"
              className={view === 'card' ? 'active' : ''}
              onClick={() => setView('card')}
            >
              Card
            </button>
            <button
              type="button"
              className={view === 'list' ? 'active' : ''}
              onClick={() => setView('list')}
            >
              List
            </button>
          </div>
          <div className={`${styles.filterWrapper}`}>
            <select
              className={`${styles.filterDropdown}`}
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
            </select>
          </div>
          <button type="button" className={`${styles.createNew}`}>
            + Create New
          </button>
        </div>
      </header>
      <main className={`${styles.content}`}>
        {view === 'card' && renderCardView()}
        {view === 'list' && renderListView()}
        {view === 'calendar' && renderCalendarView()}
      </main>
    </div>
  );
}

export default MyCases;
