import { useState } from 'react';
import { useSelector } from 'react-redux';
import mockEvents from './mockData'; // Import mock data
import styles from './Participation.module.css';

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
      <div key={item.label} className={styles.insightItem}>
        <div className={`${styles.insightsLabel} ${darkMode ? styles.insightsLabelDark : ''}`}>
          {item.label}
        </div>
        <div className={`${styles.insightBar}`}>
          <div className={`${styles.insightFill}`} style={{ width: `${item.percentage}%` }} />
        </div>
        <div
          className={`${styles.insightsPercentage} ${
            darkMode ? styles.insightsPercentageDark : ''
          }`}
        >
          {item.percentage}%
        </div>
      </div>
    ));
  };

  return (
    <div className={`${styles.insights} ${darkMode ? styles.insightsDark : ''}`}>
      <div className={`${styles.insightsHeader} ${darkMode ? styles.insightsHeaderDark : ''}`}>
        <h3>No-show rate insights</h3>
        <div className={`${styles.insightsFilters} ${darkMode ? styles.insightsFiltersDark : ''}`}>
          <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
          </select>
        </div>
      </div>

      <div className={`${styles.insightsTabs} ${darkMode ? styles.insightsTabsDarkMode : ''}`}>
        {['Event type', 'Time', 'Location'].map(tab => (
          <button
            key={tab}
            type="button"
            className={`
            ${styles.insightsTab} 
            ${darkMode ? styles.insightsTabDarkMode : ''} 
            ${activeTab === tab ? (darkMode ? styles.activeTabDarkMode : styles.activeTab) : ''}
          `}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.insightsContent}>{renderStats()}</div>
    </div>
  );
}

export default NoShowInsights;
