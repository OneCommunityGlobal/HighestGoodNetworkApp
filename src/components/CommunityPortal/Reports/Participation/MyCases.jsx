import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Calendar from 'react-calendar';
import styles from './MyCases.module.css';
import mockEvents from './mockData';
import CreateEventModal from './CreateEventModal';
import { filterEventsByDate } from './FilterByDate';

function MyCases() {
  const [view, setView] = useState('card');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const isExporting =
    typeof document !== 'undefined' && document.documentElement?.dataset?.exporting === 'true';

  const darkMode = useSelector(state => state.theme.darkMode);

  const filteredEvents = filterEventsByDate(mockEvents, filter);

  const filteredEventsByEventType = filteredEvents.filter(event => {
    if (event.eventType === 'all') {
      return true; // Simplified: just return true to keep the item
    } else {
      return event.eventType === filter;
    }
  });

  // Sonar: extract nested ternary into independent statement
  let visibleEvents = filteredEventsByEventType;
  if (!isExporting) {
    // Limt to 10 events by default, but show all if when user clicks "More" or when exporting
    visibleEvents = expanded
      ? filteredEvents.slice(0, filteredEvents.length)
      : filteredEvents.slice(0, 10);
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
      {visibleEvents?.map(event => (
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
      {visibleEvents?.map(event => (
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

  const renderCalendarTileContent = ({ date, view: tileView }) => {
    if (tileView !== 'month') return null;

    const tileKey = date.toISOString().slice(0, 10);
    const dayEvents = eventsByDate[tileKey];

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
              onChange={e => setFilter(e.target.value)}
            >
              <option value="All Time">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>

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
      <main className={`${styles.content}`}>
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
