import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './MyCases.module.css';
import mockEvents from './mockData';
import CreateEventModal from './CreateEventModal';

function MyCases() {
  const [view, setView] = useState('card');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isExporting =
    typeof document !== 'undefined' && document.documentElement?.dataset?.exporting === 'true'; // Sonar: prefer .dataset
  const filterEvents = events => {
    const now = new Date();
    // Create a clean "today" at midnight to avoid hour/minute comparison issues
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // First, only take events that haven't happened yet (Today or later)
    const upcomingEvents = events.filter(event => {
      const eventDate = new Date(event.eventDate);
      return eventDate >= startOfToday;
    });

    if (filter === 'today') {
      return upcomingEvents.filter(event => {
        const eDate = new Date(event.eventDate);
        return eDate.toDateString() === startOfToday.toDateString();
      });
    }

    if (filter === 'thisWeek') {
      // 1. Calculate days to subtract to get to Monday
      // (now.getDay() || 7) treats Sun as 7 instead of 0
      // Week starts from Monday(0) and ends on Sunday(7)
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfToday.getDate() - diffToMonday);

      // 2. Calculate Sunday (Monday + 6 days)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999); // End of Sunday

      return upcomingEvents.filter(event => {
        const eDate = new Date(event.eventDate);
        // Because we use 'upcomingEvents', this naturally returns [Today -> Sunday]
        return eDate >= startOfWeek && eDate <= endOfWeek;
      });
    }

    if (filter === 'thisMonth') {
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      return upcomingEvents.filter(event => {
        const eDate = new Date(event.eventDate);
        return eDate <= endOfMonth;
      });
    }

    return upcomingEvents; // 'all' returns all future events
  };

  const darkMode = useSelector(state => state.theme.darkMode);
  const filteredEvents = filterEvents(mockEvents);

  filteredEvents.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  // Sonar: extract nested ternary into independent statement
  let visibleEvents = filteredEvents;
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

  const renderCalendarView = () => (
    <div className={`${styles.calendarView} ${darkMode ? styles.calendarViewDark : ''}`}>
      <p>Calendar View is under construction...</p>
    </div>
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

          <div className={`filter-wrapper-global ${styles.filterWrapper}`}>
            <select
              className={`${styles.filterDropdown} ${
                darkMode ? styles.filterDropdownDarkMode : ''
              }`}
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
