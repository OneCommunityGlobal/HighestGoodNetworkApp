import { useState } from 'react';
import { useSelector } from 'react-redux';
import mockEvents from './mockData';
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
          const start = new Date(today);
          start.setDate(today.getDate() - today.getDay());
          start.setHours(0, 0, 0, 0);

          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);

          return eventDate >= start && eventDate <= end;
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
      // date portion
      else if (activeTab === 'Location') key = event.location;

      const percent = parseInt(event.noShowRate, 10);

      if (statsMap.has(key)) {
        const current = statsMap.get(key);
        statsMap.set(key, {
          totalPercentage: current.totalPercentage + percent,
          count: current.count + 1,
        });
      } else {
        statsMap.set(key, { totalPercentage: percent, count: 1 });
      }
    });

    return Array.from(statsMap.entries()).map(([label, val]) => ({
      label,
      percentage: Math.round(val.totalPercentage / val.count),
    }));
  };

  const renderStats = () => {
    const stats = calculateStats(filterByDate(mockEvents));

    return stats.map(item => (
      <div key={item.label} className={styles.insightItem}>
        <div className={`${styles.insightsLabel} ${darkMode ? styles.insightsLabelDark : ''}`}>
          {item.label}
        </div>

        <div className={styles.insightBar}>
          <div className={styles.insightFill} style={{ width: `${item.percentage}%` }} />
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

        <div className={styles.insightsFilters}>
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className={darkMode ? 'darkSelect' : ''}
          >
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
          </select>
        </div>
      </div>

      <div className={`${styles.insightsTabs} ${darkMode ? styles.insightsTabsDark : ''}`}>
        {['Event type', 'Time', 'Location'].map(tab => (
          <button
            key={tab}
            type="button"
            className={`${styles.insightsTab} ${activeTab === tab ? styles.activeTab : ''}`}
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
