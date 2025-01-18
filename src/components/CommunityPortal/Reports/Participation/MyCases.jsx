import { useState } from 'react';
import './MyCases.css';
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

  const filteredEvents = filterEvents(mockEvents);

  const renderCardView = () => (
    <div className="case-cards">
      {filteredEvents.map(event => (
        <div className="case-card" key={event.id}>
          <span className="event-badge">{event.eventType}</span>
          <span className="event-time">{event.eventTime}</span>
          <span className="event-name">{event.eventName}</span>
          <div className="attendees-info">
            <div className="avatars">
              <img alt="profile img" />
            </div>
            <span className="attendees-count">{`+${event.attendees}`}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <ul className="case-list">
      {filteredEvents.map(event => (
        <li className="case-list-item" key={event.id}>
          <span className="event-type">{event.eventType}</span>
          <span className="event-time">{event.eventTime}</span>
          <span className="event-name">{event.eventName}</span>
          <span className="attendees-count">{`+${event.attendees}`}</span>
        </li>
      ))}
    </ul>
  );

  const renderCalendarView = () => (
    <div className="calendar-view">
      <p>Calendar View is under construction...</p>
    </div>
  );

  return (
    <div className="my-cases-page">
      <header className="header">
        <h2 className="section-title">My Cases</h2>
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
