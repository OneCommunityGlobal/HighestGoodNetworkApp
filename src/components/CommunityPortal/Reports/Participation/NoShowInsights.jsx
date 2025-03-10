import { useState } from 'react';
import mockEvents from './mockData'; // Import mock data
import './Participation.css';

function NoShowInsights() {
  // State for the selected date filter and tab
  const [dateFilter, setDateFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('Event type');

  // Function to filter events based on the date filter
  const filterByDate = events => {
    const today = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.eventTime.split(' pm ')[1]);
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
          return true; // All Time
      }
    });
  };

  // Function to aggregate stats based on the active tab
  const calculateStats = filteredEvents => {
    const statsMap = new Map();

    filteredEvents.forEach(event => {
      let key; // Initialize the key variable

      // Determine the key based on activeTab
      if (activeTab === 'Event type') {
        key = event.eventType;
      } else if (activeTab === 'Time') {
        const [timeRange] = event.eventTime.split(' ');
        key = activeTab === 'Time' ? timeRange : event.location;
      } else if (activeTab === 'Location') {
        key = event.location;
      }

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

    // Transform the map into an array of stats
    return Array.from(statsMap.entries()).map(([key, value]) => ({
      label: key,
      percentage: Math.round(value.totalPercentage / value.count),
    }));
  };

  // Function to render stats dynamically for the active tab
  const renderStats = () => {
    const filteredEvents = filterByDate(mockEvents);
    const stats = calculateStats(filteredEvents);

    return stats.map(item => (
      <div key={item.label} className="insight-item">
        <div className="insight-label">{item.label}</div>
        <div className="insight-bar">
          <div className="insight-fill" style={{ width: `${item.percentage}%` }} />
        </div>
        <div className="insight-percentage">{item.percentage}%</div>
      </div>
    ));
  };

  return (
    <div className="insights">
      <div className="insights-header">
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
            type="button"
            key={tab}
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
