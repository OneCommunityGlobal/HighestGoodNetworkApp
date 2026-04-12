import { useState } from 'react';
import styles from './MyCases.module.css';
import mockEvents from './mockData';
import CreateEventModal from './CreateEventModal';

function MyCases({ darkMode }) {
  const [view, setView] = useState('card');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isExporting =
    typeof document !== 'undefined' && document.documentElement?.dataset?.exporting === 'true'; // Sonar: prefer .dataset

  const filterEvents = (events) => {
    const now = new Date();

    const nowTime = now.getTime();

    const upcomingEvents = events.filter((event) => {
      const eventTime = new Date(event.eventDate).getTime();
      return eventTime >= nowTime;
    });

    if (filter === 'today') {
      return upcomingEvents.filter((event) => {
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
      return upcomingEvents.filter((event) => {
        const eventDate = new Date(event.eventTime);
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      });
    }
    if (filter === 'thisMonth') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return upcomingEvents.filter((event) => {
        const eventDate = new Date(event.eventTime);
        return eventDate >= startOfMonth && eventDate <= endOfMonth;
      });
    }
    return upcomingEvents;
  };

  const filteredEvents = filterEvents(mockEvents);

  filteredEvents.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  // Sonar: extract nested ternary into independent statement
  let visibleEvents = filteredEvents;
  if (!isExporting) {
    visibleEvents = expanded ? filteredEvents.slice(0, 40) : filteredEvents.slice(0, 10);
  }

  const placeholderAvatar = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  const renderCardView = () => (
    <div className={`${styles.caseCards} ${expanded || isExporting ? styles.expanded : ''}`}>
      {visibleEvents.map((event) => (
        <div className={styles.caseCard} key={event.id}>
          <span className={styles.eventBadge} data-type={event.eventType}>
            {event.eventType}
          </span>
          <span className={styles.eventTime}>{event.eventTime}</span>
          <div className={styles.eventName}>{event.eventName}</div>
          <div className={styles.attendeesInfo}>
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
            <span className={styles.attendeesCount}>{`+${event.attendees}`}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <ul className={`${styles.caseList} ${expanded || isExporting ? styles.expanded : ''}`}>
      {visibleEvents.map((event) => (
        <li className={styles.caseListItem} key={event.id}>
          <span className={styles.eventType}>{event.eventType}</span>
          <span className={styles.eventTime}>{event.eventTime}</span>
          <span className={styles.eventName}>{event.eventName}</span>
          <span className={styles.attendeesCount}>{`+${event.attendees}`}</span>
        </li>
      ))}
    </ul>
  );

  const renderCalendarView = () => (
    <div className={styles.calendarView}>
      <p>Calendar View is under construction...</p>
    </div>
  );

  return (
    <div className={`${styles.myCasesPage} ${darkMode ? styles.darkMode : ''}`}>
      <header className={styles.header}>
        <h2 className={styles.sectionTitle}>Upcoming Events</h2>
        <div className={styles.headerActions}>
          <div className={styles.viewSwitcher}>
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

          <div className={styles.filterWrapper}>
            <select
              className={styles.filterDropdown}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
            </select>
          </div>
          <button
            type="button"
            className={styles.createNew}
            onClick={() => setIsCreateModalOpen(true)}
          >
            + Create New
          </button>
          {filteredEvents.length > 10 && !isExporting && (
            <button type="button" className={styles.moreBtn} onClick={() => setExpanded(!expanded)}>
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
      <CreateEventModal
        isOpen={isCreateModalOpen}
        toggle={() => setIsCreateModalOpen(!isCreateModalOpen)}
      />
    </div>
  );
}

export default MyCases;
