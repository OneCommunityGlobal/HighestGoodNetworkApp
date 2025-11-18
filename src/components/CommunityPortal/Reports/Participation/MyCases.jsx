import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './MyCases.module.css';
import mockEvents from './mockData';
import { useHistory } from 'react-router-dom';

function MyCases() {
  const [view, setView] = useState('card');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(false);
  const history = useHistory();

  const darkMode = useSelector(state => state.theme.darkMode);

  const isExporting =
    typeof document !== 'undefined' && document.documentElement?.dataset?.exporting === 'true';

  const filterEvents = events => {
    const now = new Date();

    if (filter === 'today') {
      return events.filter(event => {
        const d = new Date(event.eventTime);
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      });
    }

    if (filter === 'thisWeek') {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      return events.filter(e => {
        const d = new Date(e.eventTime);
        return d >= start && d <= end;
      });
    }

    if (filter === 'thisMonth') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      return events.filter(e => {
        const d = new Date(e.eventTime);
        return d >= start && d <= end;
      });
    }

    return events;
  };

  const filteredEvents = filterEvents(mockEvents);

  let visibleEvents = filteredEvents;
  if (!isExporting) {
    visibleEvents = expanded ? filteredEvents.slice(0, 40) : filteredEvents.slice(0, 10);
  }

  const placeholderAvatar = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  const renderCardView = () => (
    <div className={`${styles.caseCards} ${expanded || isExporting ? styles.expanded : ''}`}>
      {visibleEvents.map(event => (
        <div key={event.id} className={`${styles.caseCard} ${darkMode ? styles.caseCardDark : ''}`}>
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
                loading="lazy"
              />
            </div>

            <span
              className={`${styles.attendeesCount} ${darkMode ? styles.attendeesCountDark : ''}`}
            >
              +{event.attendees}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <ul className={`${styles.caseList} ${expanded || isExporting ? styles.expanded : ''}`}>
      {visibleEvents.map(event => (
        <li
          key={event.id}
          className={`${styles.caseListItem} ${darkMode ? styles.caseListItemDark : ''}`}
        >
          <span className={styles.eventType}>{event.eventType}</span>
          <span className={styles.eventTime}>{event.eventTime}</span>
          <span className={styles.eventName}>{event.eventName}</span>
          <span className={styles.attendeesCount}>+{event.attendees}</span>
        </li>
      ))}
    </ul>
  );

  const renderCalendarView = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push({ empty: true });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = new Date(year, month, day).toDateString();
      const eventsForDay = mockEvents.filter(ev => {
        const evDate = new Date(ev.eventDate).toDateString();
        return evDate === dateString;
      });

      days.push({
        day,
        events: eventsForDay.slice(0, 2),
        moreCount: eventsForDay.length > 2 ? eventsForDay.length - 2 : 0,
      });
    }

    return (
      <div
        className={`${styles.calendarContainer} ${darkMode ? styles.calendarContainerDark : ''}`}
      >
        <div className={`${styles.calendarHeader} ${darkMode ? styles.calendarHeaderDark : ''}`}>
          {now.toLocaleString('default', { month: 'long' })} {year}
        </div>

        <div className={styles.calendarGrid}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className={styles.calendarHeaderDark}>
              {d}
            </div>
          ))}

          {days.map((cell, i) =>
            cell.empty ? (
              <div key={i}></div>
            ) : (
              <div
                key={i}
                className={`${styles.calendarCell} ${darkMode ? styles.calendarCellDark : ''}`}
              >
                <div
                  className={`${styles.calendarDate} ${darkMode ? styles.calendarDateDark : ''}`}
                >
                  {cell.day}
                </div>

                {cell.events.map(ev => (
                  <div
                    key={ev.id}
                    className={`${styles.calendarEvent} ${
                      darkMode ? styles.calendarEventDark : ''
                    }`}
                  >
                    {ev.eventType}
                  </div>
                ))}

                {cell.moreCount > 0 && (
                  <div className={`${styles.moreEvents} ${darkMode ? styles.moreEventsDark : ''}`}>
                    +{cell.moreCount} more
                  </div>
                )}
              </div>
            ),
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.myCasesPage} ${darkMode ? styles.myCasesPageDark : ''}`}>
      <header className={styles.header}>
        <h2 className={`${styles.sectionTitle} ${darkMode ? styles.sectionTitleDark : ''}`}>
          Upcoming Events
        </h2>

        <div className={styles.headerActions}>
          <div className={styles.viewSwitcher}>
            <button
              type="button"
              className={`${
                view === 'calendar' ? (darkMode ? styles.activeDark : styles.active) : ''
              }`}
              onClick={() => setView('calendar')}
            >
              Calendar
            </button>
            <button
              type="button"
              className={`${view === 'card' ? (darkMode ? styles.activeDark : styles.active) : ''}`}
              onClick={() => setView('card')}
            >
              Card
            </button>

            <button
              type="button"
              className={`${view === 'list' ? (darkMode ? styles.activeDark : styles.active) : ''}`}
              onClick={() => setView('list')}
            >
              List
            </button>
          </div>

          <div className={styles.filterWrapper}>
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
            onClick={() => history.push('/communityportal/events/create')}
            className={styles.createNew}
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
    </div>
  );
}

export default MyCases;
