import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Calendar from 'react-calendar';
import styles from './MyCases.module.css';
import mockEvents from './mockData';

function MyCases() {
  const [view, setView] = useState('card');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const history = useHistory();

  const darkMode = useSelector(state => state.theme.darkMode);

  const isExporting =
    typeof document !== 'undefined' && document.documentElement?.dataset?.exporting === 'true';

  const filterEvents = events => {
    const now = new Date();

    if (filter === 'today') {
      return events.filter(event => {
        const eventDate = new Date(event.eventDate || event.eventTime);
        return (
          eventDate.getDate() === now.getDate() &&
          eventDate.getMonth() === now.getMonth() &&
          eventDate.getFullYear() === now.getFullYear()
        );
      });
    }

    if (filter === 'thisWeek') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return events.filter(event => {
        const eventDate = new Date(event.eventDate || event.eventTime);
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      });
    }

    if (filter === 'thisMonth') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      return events.filter(event => {
        const eventDate = new Date(event.eventDate || event.eventTime);
        return eventDate >= startOfMonth && eventDate <= endOfMonth;
      });
    }

    return events;
  };

  const filteredEvents = filterEvents(mockEvents);

  // Group events by YYYY-MM-DD for calendar view
  const eventsByDate = useMemo(() => {
    const map = {};
    filteredEvents.forEach(event => {
      const baseDate = new Date(event.eventDate || event.eventTime);
      const key = baseDate.toISOString().slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(event);
    });
    return map;
  }, [filteredEvents]);

  // Visible subset for card/list in non-export mode
  let visibleEvents = filteredEvents;
  if (!isExporting) {
    visibleEvents = expanded ? filteredEvents.slice(0, 40) : filteredEvents.slice(0, 10);
  }

  const placeholderAvatar = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

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
            >
              {`+${event.attendees}`}
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
          <span className={styles.attendeesCount}>{`+${event.attendees}`}</span>
        </li>
      ))}
    </ul>
  );

  // --- Calendar View ---

  const renderCalendarTileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    const key = date.toISOString().slice(0, 10);
    const dayEvents = eventsByDate[key];

    if (!dayEvents || dayEvents.length === 0) return null;

    return <div className={styles.calendarBubble}>{dayEvents.length}</div>;
  };

  const renderCalendarView = () => {
    const selectedKey = calendarDate.toISOString().slice(0, 10);
    const selectedEvents = eventsByDate[selectedKey] || [];

    const formattedSelectedDate = calendarDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <div className={`${styles.calendarView} ${darkMode ? styles.calendarViewDark : ''}`}>
        <div className={styles.calendarHeaderRow}>
          <span className={styles.calendarMonthLabel}>
            {calendarDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <Calendar
          onChange={setCalendarDate}
          value={calendarDate}
          tileContent={renderCalendarTileContent}
          className={styles.reactCalendar}
        />

        <div className={styles.calendarEventsList}>
          <h3 className={styles.calendarEventsTitle}>Events on {formattedSelectedDate}</h3>

          {selectedEvents.length === 0 && (
            <p className={styles.calendarEventsEmpty}>No events scheduled for this day.</p>
          )}

          {selectedEvents.map(event => (
            <div
              key={event.id}
              className={`${styles.calendarEventItem} ${
                darkMode ? styles.calendarEventItemDark : ''
              }`}
            >
              <div className={styles.calendarEventItemHeader}>
                <span className={styles.calendarEventName}>{event.eventName}</span>
                <span className={styles.calendarEventType}>{event.eventType}</span>
              </div>
              <div className={styles.calendarEventMeta}>
                <span>{event.eventTime}</span>
                <span>{event.location}</span>
                <span>{`+${event.attendees} attendees`}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
              className={`${styles.switchBtn} ${
                view === 'calendar' ? (darkMode ? styles.activeDark : styles.active) : ''
              }`}
              onClick={() => setView('calendar')}
            >
              Calendar
            </button>
            <button
              type="button"
              className={`${styles.switchBtn} ${
                view === 'card' ? (darkMode ? styles.activeDark : styles.active) : ''
              }`}
              onClick={() => setView('card')}
            >
              Card
            </button>
            <button
              type="button"
              className={`${styles.switchBtn} ${
                view === 'list' ? (darkMode ? styles.activeDark : styles.active) : ''
              }`}
              onClick={() => setView('list')}
            >
              List
            </button>
          </div>
          <div className={`filter-wrapper-global`}>
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
            onClick={() => history.push('/communityportal/events/create')}
            className={`create-new-global ${styles.createNew}`}
          >
            + Create New
          </button>
          {filteredEvents.length > 10 && !isExporting && view !== 'calendar' && (
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
