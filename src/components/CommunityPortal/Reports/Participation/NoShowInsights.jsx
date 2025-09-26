import { useState } from 'react';
import { useSelector } from 'react-redux';
import mockEvents from './mockData';
import './Participation.css';

function NoShowInsights() {
  const [dateFilter, setDateFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('Event type');
  const darkMode = useSelector(state => state.theme.darkMode);

  const filterByDate = events => {
    const today = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.eventDate);
      switch (dateFilter) {
        case 'Today':
          return eventDate.toDateString() === today.toDateString();
        case 'This Week': {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          return eventDate >= startOfWeek && eventDate <= endOfWeek;
        }
        case 'This Month':
          return (
            eventDate.getMonth() === today.getMonth() &&
            eventDate.getFullYear() === today.getFullYear()
          );
        default:
          return true;
      }
    });
  };

  const calculateStats = filteredEvents => {
    const statsMap = new Map();

    filteredEvents.forEach(event => {
      let key;
      if (activeTab === 'Event type') key = event.eventType;
      else if (activeTab === 'Time') key = event.eventTime.split(' ')[0];
      else if (activeTab === 'Location') key = event.location;

      const percentage = parseInt(event.noShowRate, 10);

      if (statsMap.has(key)) {
        const existing = statsMap.get(key);
        statsMap.set(key, {
          totalPercentage: existing.totalPercentage + percentage,
          count: existing.count + 1,
        });
      } else {
        statsMap.set(key, { totalPercentage: percentage, count: 1 });
      }
    });

    return Array.from(statsMap.entries()).map(([key, value]) => ({
      label: key,
      percentage: Math.round(value.totalPercentage / value.count),
    }));
  };

  const renderStats = () => {
    const filteredEvents = filterByDate(mockEvents);
    const stats = calculateStats(filteredEvents);

    return stats.map(item => (
      <div key={item.label} className="insight-item">
        <div className={`insights-label ${darkMode ? 'insights-label-dark' : ''}`}>
          {item.label}
        </div>
        <div className="insight-bar">
          <div className="insight-fill" style={{ width: `${item.percentage}%` }} />
        </div>
        <div className={`insights-percentage ${darkMode ? 'insights-percentage-dark' : ''}`}>
          {item.percentage}%
        </div>
      </div>
    ));
  };

  return (
    <div className={`insights ${darkMode ? 'insights-dark' : ''}`}>
      <div className={`insights-header ${darkMode ? 'insights-header-dark' : ''}`}>
        <h3>No-show rate insights</h3>
        <div className="insights-filters">
          <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
          </select>
        </div>
      </div>

      <div className="insights-tabs">
        {['Event type', 'Time', 'Location'].map(tab => (
          <button
            key={tab}
            type="button"
            className={`insights-tab ${activeTab === tab ? 'active-tab' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="insights-content">{renderStats()}</div>
    </div>
  );
}

export default NoShowInsights;
