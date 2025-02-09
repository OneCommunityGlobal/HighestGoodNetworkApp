import { useState } from 'react';
import './EventStats.css';

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
    <div className="popular-events-container">
      <div className="header-container">
        <h2 className="popular-events-header">Most Popular Event</h2>
        <div className="filters">
          <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)}>
            <option value="All day">All day</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Night">Night</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Offline">Offline</option>
            <option value="Online">Online</option>
          </select>
        </div>
      </div>

      <div className="stats">
        {filteredData.map(event => (
          <div key={event.id} className="stat-item">
            <div className="stat-label">{event.type}</div>
            <div className="stat-bar">
              <div
                className={`bar ${getBarColor(
                  calculatePercentage(event.attended, event.enrolled),
                )}`}
                style={{ width: `${calculatePercentage(event.attended, event.enrolled)}%` }}
              />
            </div>
            <div className="stat-value">
              {`${calculatePercentage(event.attended, event.enrolled)}% (${event.attended}/${
                event.enrolled
              })`}
            </div>
          </div>
        ))}
      </div>
      <div className="summary">
        <div className="summary-item">
          <div className="summary-title">Total Number of Events</div>
          <div className="summary-value">{filteredData.length}</div>
        </div>
        <div className="summary-item">
          <div className="summary-title">Total Number of Event Enrollments</div>
          <div className="summary-value">
            {filteredData.reduce((acc, event) => acc + event.enrolled, 0)}
          </div>
        </div>
        {filteredData.length > 0 && (
          <>
            <div className="summary-item">
              <div className="summary-title">Most Popular Event</div>
              <div className="summary-value">{mostPopularEvent.type || 'N/A'}</div>
            </div>
            <div className="summary-item">
              <div className="summary-title">Least Popular Event</div>
              <div className="summary-value">{leastPopularEvent.type || 'N/A'}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
