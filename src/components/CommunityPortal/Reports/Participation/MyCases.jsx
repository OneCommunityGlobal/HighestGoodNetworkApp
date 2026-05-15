import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import styles from './MyCases.module.css';
import CreateEventModal from './CreateEventModal';
import { ENDPOINTS } from '../../../../utils/URL';

const INITIAL_DISPLAY = 10;

const normalizeEvent = e => ({
  id: e._id,
  eventType: e.type || 'Workshop',
  eventDate: e.startTime,
  eventTime: e.startTime
    ? new Date(e.startTime).toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '',
  eventName: e.title,
  attendees: e.currentAttendees ?? 0,
  location: e.location || 'TBD',
});

function MyCases() {
  const [view, setView] = useState('card');
  const [filter, setFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const [allEvents, setAllEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const isExporting =
    typeof document !== 'undefined' && document.documentElement?.dataset?.exporting === 'true';

  const darkMode = useSelector(state => state.theme.darkMode);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await axios.get(ENDPOINTS.EVENTS);
      const raw = response.data?.events || response.data || [];
      setAllEvents(raw.map(normalizeEvent));
    } catch {
      setFetchError('Failed to load events.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleFilterChange = e => {
    setFilter(e.target.value);
    setShowAll(false);
  };

  const handleEventCreated = () => {
    fetchEvents();
    setShowAll(false);
  };

  const applyFilter = allEvts => {
    const now = new Date();

    if (filter === 'today') {
      return allEvts.filter(e => {
        const d = new Date(e.eventDate);
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
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
      return allEvts.filter(e => {
        const d = new Date(e.eventDate);
        return d >= startOfWeek && d <= endOfWeek && d >= new Date();
      });
    }
    if (filter === 'thisMonth') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return allEvts.filter(e => {
        const d = new Date(e.eventDate);
        return d >= startOfMonth && d <= endOfMonth && d >= new Date();
      });
    }
    return allEvts.filter(e => {
      const d = new Date(e.eventDate);
      return d > new Date();
    });
  };

  const filteredSorted = applyFilter(allEvents).sort(
    (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
  );

  const displayEvents =
    isExporting || showAll ? filteredSorted : filteredSorted.slice(0, INITIAL_DISPLAY);

  const hasMore = !showAll && filteredSorted.length > INITIAL_DISPLAY;

  const placeholderAvatar = 'https://picsum.photos/id/201/200/300';

  const renderCardView = () => (
    <div className={`case-cards-global ${styles.caseCards} ${isExporting ? styles.expanded : ''}`}>
      {displayEvents.map(event => (
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
          <div className={`${styles.eventName} ${darkMode ? styles.eventNameDark : ''}`}>
            {event.eventName}
          </div>
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
    <ul className={`case-list-global ${styles.caseList} ${isExporting ? styles.expanded : ''}`}>
      {displayEvents.map(event => (
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

  if (isLoading) return <p>Loading events...</p>;
  if (fetchError) return <p>{fetchError}</p>;

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
              onChange={handleFilterChange}
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

          {!isExporting && view !== 'calendar' && (
            <>
              {hasMore && (
                <button
                  type="button"
                  className={`more-btn-global ${styles.moreBtn}`}
                  onClick={() => setShowAll(true)}
                >
                  More
                </button>
              )}
              {showAll && filteredSorted.length > INITIAL_DISPLAY && (
                <button
                  type="button"
                  className={`more-btn-global ${styles.moreBtn}`}
                  onClick={() => setShowAll(false)}
                >
                  Less
                </button>
              )}
            </>
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
        onEventCreated={handleEventCreated}
      />
    </div>
  );
}

export default MyCases;
