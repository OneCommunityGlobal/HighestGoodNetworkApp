import { useState } from 'react';
import { useSelector } from 'react-redux';
import './MyCases.css';
import mockEvents from './mockData';

function MyCases() {
  const [view, setView] = useState('card');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(false);

  // Detect print/export mode from <html data-exporting="true">
  const isExporting =
    typeof document !== 'undefined' &&
    document.documentElement.getAttribute('data-exporting') === 'true';

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

  // During export, show a lot more items to avoid truncation
  const maxDuringExport = 200;
  const visibleEvents = isExporting
    ? filteredEvents.slice(0, maxDuringExport)
    : expanded
    ? filteredEvents.slice(0, 40)
    : filteredEvents.slice(0, 10);

  // 1x1 transparent data URI to avoid network/CORS for avatars (no console html2canvas errors)
  const placeholderAvatar = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  const renderCardView = () => (
    <div className={`case-cards ${expanded || isExporting ? 'expanded' : ''}`}>
      {visibleEvents.map(event => (
        <div className={`case-card ${darkMode ? 'case-card-dark' : ''}`} key={event.id}>
          <span className="event-badge" data-type={event.eventType}>
            {event.eventType}
          </span>
          <span className={`event-time ${darkMode ? 'event-time-dark' : ''}`}>
            {event.eventTime}
          </span>
          <span className={`event-name ${darkMode ? 'event-name-dark' : ''}`}>
            {event.eventName}
          </span>
          <div className={`attendees-info ${darkMode ? 'attendees-info-dark' : ''}`}>
            <div className="avatars">
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
              className={`attendees-count ${darkMode ? 'attendees-count-dark' : ''}`}
            >{`+${event.attendees}`}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <ul className={`case-list ${expanded || isExporting ? 'expanded' : ''}`}>
      {visibleEvents.map(event => (
        <li className={`case-list-item ${darkMode ? 'case-list-item-dark' : ''}`} key={event.id}>
          <span className="event-type">{event.eventType}</span>
          <span className="event-time">{event.eventTime}</span>
          <span className="event-name">{event.eventName}</span>
          <span className="attendees-count">{`+${event.attendees}`}</span>
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
      <header className="header">
        <h2 className={`section-title ${darkMode ? 'section-title-dark' : ''}`}>Upcoming Events</h2>
        <div className="header-actions">
          <div className="view-switcher">
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
          <div className="filter-wrapper">
            <select
              className="filter-dropdown"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
            </select>
          </div>
          <button type="button" className="create-new">
            + Create New
          </button>
          {filteredEvents.length > 10 && (
            <button type="button" className="more-btn" onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Show Less' : 'More'}
            </button>
          )}
        </div>
      </header>
      <main className="content">
        {view === 'card' && renderCardView()}
        {view === 'list' && renderListView()}
        {view === 'calendar' && renderCalendarView()}
      </main>
    </div>
  );
}

export default MyCases;
