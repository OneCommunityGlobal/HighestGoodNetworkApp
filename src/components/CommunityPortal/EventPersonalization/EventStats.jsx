import { useState } from 'react';
import styles from './EventStats.module.css';
import { useSelector } from 'react-redux';

const dummyData = [
  {
    id: 1,
    type: 'Type of Event 1',
    attended: 20,
    enrolled: 25,
    time: 'Morning',
    location: 'Offline',
  },
  {
    id: 2,
    type: 'Type of Event 2',
    attended: 19,
    enrolled: 20,
    time: 'Afternoon',
    location: 'Online',
  },
  {
    id: 3,
    type: 'Type of Event 3',
    attended: 12,
    enrolled: 18,
    time: 'Night',
    location: 'Offline',
  },
  {
    id: 4,
    type: 'Type of Event 4',
    attended: 11,
    enrolled: 20,
    time: 'Morning',
    location: 'Online',
  },
  {
    id: 5,
    type: 'Type of Event 5',
    attended: 8,
    enrolled: 20,
    time: 'Afternoon',
    location: 'Offline',
  },
  { id: 6, type: 'Type of Event 6', attended: 7, enrolled: 22, time: 'Night', location: 'Offline' },
  {
    id: 7,
    type: 'Type of Event 7',
    attended: 4,
    enrolled: 20,
    time: 'Morning',
    location: 'Online',
  },
];

export default function PopularEvents() {
  const [timeFilter, setTimeFilter] = useState('All day');
  const [typeFilter, setTypeFilter] = useState('All');

  const darkMode = useSelector(state => state.theme.darkMode);

  const calculatePercentage = (attended, enrolled) => Math.round((attended / enrolled) * 100);

  const getBarColor = percentage => {
    if (percentage > 60) return 'green';
    if (percentage > 40) return 'orange';
    return 'red';
  };

  const filteredData = dummyData.filter(event => {
    const timeMatch = timeFilter === 'All day' || event.time === timeFilter;
    const typeMatch = typeFilter === 'All' || event.location === typeFilter;
    return timeMatch && typeMatch;
  });

  const mostPopularEvent = filteredData.reduce(
    (max, event) =>
      calculatePercentage(event.attended, event.enrolled) >
      calculatePercentage(max.attended, max.enrolled)
        ? event
        : max,
    filteredData[0] || {},
  );

  const leastPopularEvent = filteredData.reduce(
    (min, event) =>
      calculatePercentage(event.attended, event.enrolled) <
      calculatePercentage(min.attended, min.enrolled)
        ? event
        : min,
    filteredData[0] || {},
  );

  return (
    <div
      className={`
        ${styles['popular-events-container']}
        ${darkMode ? 'bg-oxford-blue text-light' : ''}
      `}
    >
      {/* Header */}
      <div
        className={`
          ${styles['header-container']}
          ${darkMode ? 'text-light' : ''}
        `}
      >
        <h2
          className={`
            ${styles['popular-events-header']}
            ${darkMode ? 'text-light' : ''}
          `}
        >
          Most Popular Event
        </h2>

        {/* Filters */}
        <div className={styles.filters}>
          {/* Time Filter */}
          <select
            value={timeFilter}
            onChange={e => setTimeFilter(e.target.value)}
            className={`
              ${styles.selectBase}
              ${darkMode ? 'bg-space-cadet text-light border-light' : ''}
            `}
          >
            <option className={darkMode ? 'bg-space-cadet text-light' : ''} value="All day">
              All day
            </option>
            <option className={darkMode ? 'bg-space-cadet text-light' : ''} value="Morning">
              Morning
            </option>
            <option className={darkMode ? 'bg-space-cadet text-light' : ''} value="Afternoon">
              Afternoon
            </option>
            <option className={darkMode ? 'bg-space-cadet text-light' : ''} value="Night">
              Night
            </option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className={`
              ${styles.selectBase}
              ${darkMode ? 'bg-space-cadet text-light border-light' : ''}
            `}
          >
            <option className={darkMode ? 'bg-space-cadet text-light' : ''} value="All">
              All
            </option>
            <option className={darkMode ? 'bg-space-cadet text-light' : ''} value="Offline">
              Offline
            </option>
            <option className={darkMode ? 'bg-space-cadet text-light' : ''} value="Online">
              Online
            </option>
          </select>
        </div>
      </div>

      {/* Stats Section */}
      <div
        className={`
          ${styles.stats}
          ${darkMode ? 'bg-space-cadet text-light box-shadow-dark' : 'box-shadow-light'}
        `}
      >
        {filteredData.map(event => (
          <div key={event.id} className={styles['stat-item']}>
            <div
              className={`
                ${styles['stat-label']}
                ${darkMode ? 'text-light' : ''}
              `}
              data-testid="stat-label"
            >
              {event.type}
            </div>

            <div className={styles['stat-bar']} data-testid="stat-bar">
              <div
                data-testid="stat-bar-inner"
                className={`
                  ${styles.bar}
                  ${styles[getBarColor(calculatePercentage(event.attended, event.enrolled))]}
                `}
                style={{
                  width: `${calculatePercentage(event.attended, event.enrolled)}%`,
                }}
              />
            </div>

            <div
              className={`
                ${styles['stat-value']}
                ${darkMode ? 'text-light' : ''}
              `}
            >
              {`${calculatePercentage(event.attended, event.enrolled)}% (${event.attended}/${
                event.enrolled
              })`}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className={styles['event-summary']}>
        <div
          className={`
            ${styles['summary-item']}
            ${darkMode ? 'bg-yinmn-blue text-light box-shadow-dark' : 'box-shadow-light'}
          `}
          data-testid="summary-total-events"
        >
          <div className={styles['summary-title']}>Total Number of Events</div>
          <div className={styles['summary-value']}>{filteredData.length}</div>
        </div>

        <div
          className={`
            ${styles['summary-item']}
            ${darkMode ? 'bg-yinmn-blue text-light box-shadow-dark' : 'box-shadow-light'}
          `}
          data-testid="summary-total-enrollments"
        >
          <div className={styles['summary-title']}>Total Number of Event Enrollments</div>
          <div className={styles['summary-value']}>
            {filteredData.reduce((acc, e) => acc + e.enrolled, 0)}
          </div>
        </div>

        {/* Most + Least Popular */}
        {filteredData.length > 0 && (
          <>
            <div
              className={`
                ${styles['summary-item']}
                ${darkMode ? 'bg-yinmn-blue text-light box-shadow-dark' : 'box-shadow-light'}
              `}
              data-testid="summary-most"
            >
              <div className={styles['summary-title']}>Most Popular Event</div>
              <div className={styles['summary-value']}>{mostPopularEvent.type}</div>
            </div>

            <div
              className={`
                ${styles['summary-item']}
                ${darkMode ? 'bg-yinmn-blue text-light box-shadow-dark' : 'box-shadow-light'}
              `}
              data-testid="summary-least"
            >
              <div className={styles['summary-title']}>Least Popular Event</div>
              <div className={styles['summary-value']}>{leastPopularEvent.type}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
