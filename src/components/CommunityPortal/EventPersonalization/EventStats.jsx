import { useState } from 'react';
import styles from './EventStats.module.css';
import { useSelector } from 'react-redux';
import { current } from '@reduxjs/toolkit';

const dummyData = [
  {
    id: 1,
    type: 'Type of Event 1',
    attended: 20,
    enrolled: 25,
    time: 'Morning',
    location: 'Offline',
    previousAttended: 18,
    previousEnrolled: 25,
  },
  {
    id: 2,
    type: 'Type of Event 2',
    attended: 19,
    enrolled: 20,
    time: 'Afternoon',
    location: 'Online',
    previousAttended: 20,
    previousEnrolled: 20,
  },
  {
    id: 3,
    type: 'Type of Event 3',
    attended: 12,
    enrolled: 18,
    time: 'Night',
    location: 'Offline',
    previousAttended: 14,
    previousEnrolled: 18,
  },
  {
    id: 4,
    type: 'Type of Event 4',
    attended: 11,
    enrolled: 20,
    time: 'Morning',
    location: 'Online',
    previousAttended: 8,
    previousEnrolled: 20,
  },
  {
    id: 5,
    type: 'Type of Event 5',
    attended: 8,
    enrolled: 20,
    time: 'Afternoon',
    location: 'Offline',
    previousAttended: 10,
    previousEnrolled: 20,
  },
  {
    id: 6,
    type: 'Type of Event 6',
    attended: 7,
    enrolled: 22,
    time: 'Night',
    location: 'Offline',
    previousAttended: 7,
    previousEnrolled: 22,
  },
  {
    id: 7,
    type: 'Type of Event 7',
    attended: 4,
    enrolled: 20,
    time: 'Morning',
    location: 'Online',
    previousAttended: 5,
    previousEnrolled: 20,
  },
];

export default function PopularEvents() {
  const [timeFilter, setTimeFilter] = useState('All day');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortOption, setSortOption] = useState('HighToLow');


  const getTrendIndicator = (currentPercentage, previousPercentage) => {
    if (currentPercentage > previousPercentage) {
      return {
        icon: '↑',
        label: 'Increasing',
        className: styles.pETrendUp,
      };
    }
    if (currentPercentage < previousPercentage) {
      return {
        label: 'Decreasing',
        icon: '↓',
        className: styles.pETrendDown,
      };
    }
    return {
      icon: '-',
      label: 'Stable',
      className: styles.pETrendStable,
    };
  };
  const darkMode = useSelector(state => state.theme.darkMode);

  // ✅ KEEP YOUR SAFE FIX
  const calculatePercentage = (attended, enrolled) =>
    enrolled === 0 ? 0 : Math.round((attended / enrolled) * 100);

  const getBarColor = percentage => {
    if (percentage > 60) return styles.pEBarGreen;
    if (percentage > 40) return styles.pEBarOrange;
    return styles.pEBarRed;
  };

  let filteredData = dummyData.filter(event => {
    const timeMatch = timeFilter === 'All day' || event.time === timeFilter;
    const typeMatch = typeFilter === 'All' || event.location === typeFilter;
    return timeMatch && typeMatch;
  });

  const sortedFilteredData = [...filteredData].sort((a, b) => {
    const percentageA = calculatePercentage(a.attended, a.enrolled);
    const percentageB = calculatePercentage(b.attended, b.enrolled);

    if (sortOption === 'HighToLow') {
      return percentageB - percentageA;
    } else if (sortOption === 'LowToHigh') {
      return percentageA - percentageB;
    }
    return 0;
  });

  const mostPopularEvent =
    filteredData.length > 0
      ? filteredData.reduce(
          (max, event) =>
            calculatePercentage(event.attended, event.enrolled) >
            calculatePercentage(max.attended, max.enrolled)
              ? event
              : max,
          filteredData[0],
        )
      : null;

  const leastPopularEvent =
    filteredData.length > 0
      ? filteredData.reduce(
          (min, event) =>
            calculatePercentage(event.attended, event.enrolled) <
            calculatePercentage(min.attended, min.enrolled)
              ? event
              : min,
          filteredData[0],
        )
      : null;


  return (
    <div
      className={`${styles.popularEventsContainer} ${
        darkMode ? styles.popularEventsContainerDark : ''
      }`}
    >
      <div
        className={`${styles.pEHeaderContainer} ${darkMode ? styles.pEHeaderContainerDark : ''}`}
      >
        <h2
          className={`${styles.popularEventsHeader} ${
            darkMode ? styles.popularEventsHeaderDark : ''
          }`}
        >
          Most Popular Event
        </h2>
        <div className={`${styles.pEfilters} ${darkMode ? styles.pEfiltersDark : ''}`}>
          <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)}>
            <option value="All day">All day</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Night">Night</option>
          </select>

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
          <select value={sortOption} onChange={e => setSortOption(e.target.value)}>
            <option value="HighToLow">Sort by Popularity: High → Low</option>
            <option value="LowToHigh">Sort by Popularity: Low → High</option>
          </select>
        </div>
      </div>

      <div className={`${styles.pEYAxisLabel} ${darkMode ? styles.pEYAxisLabelDark : ''}`}>
        <p className={`${styles.pEYAxisText} ${darkMode ? styles.pEYAxisTextDark : ''}`}>
          <strong>Note:</strong> (x/y) = number of participants attended out of total enrollments
        </p>
      </div>

      <div className={`${styles.pEStats} ${darkMode ? styles.pEStatsDark : ''}`}>
        {sortedFilteredData.map(event => {
          const currentPercentage = calculatePercentage(event.attended, event.enrolled);
          const previousPercentage = calculatePercentage(
            event.previousAttended,
            event.previousEnrolled,
          );
          const trend = getTrendIndicator(currentPercentage, previousPercentage);

          return (
            <div key={event.id} className={`${styles.pEStatItem}`}>
              <div
                className={`${styles.pEStatLabelWithTrend} ${
                  darkMode ? styles.pEStatLabelWithTrendDark : ''
                }`}
              >
                <span className={`${styles.pEStatLabel} ${darkMode ? styles.pEStatLabelDark : ''}`}>
                  {event.type}
                </span>
                <span
                  className={`${styles.pETrendIndicator} ${trend.className}`}
                  title={trend.label}
                >
                  {trend.icon}
                </span>
              </div>
              <div className={`${styles.pEStatBar}`}>
                <div
                  className={`${styles.pEBar} ${getBarColor(currentPercentage)}`}
                  style={{ width: `${currentPercentage}%` }}
                />
              </div>
              <div className={`${styles.pEStatValue} ${darkMode ? styles.pEStatValueDark : ''}`}>
                {`${currentPercentage}% (${event.attended}/${event.enrolled})`}
              </div>
            </div>
          );
        })}
      </div>

      <div className={`${styles.pEEventSummary}`}>
        <div className={`${styles.pESummaryItem} ${darkMode ? styles.pESummaryItemDark : ''}`}>
          <div className={`${styles.pESummaryTitle} ${darkMode ? styles.pESummaryTitleDark : ''}`}>
            Total Number of Events
          </div>
          <div className={`${styles.pESummaryValue} ${darkMode ? styles.pESummaryValueDark : ''}`}>
            {filteredData.length}
          </div>
        </div>
        <div className={`${styles.pESummaryItem} ${darkMode ? styles.pESummaryItemDark : ''}`}>
          <div className={`${styles.pESummaryTitle} ${darkMode ? styles.pESummaryTitleDark : ''}`}>
            Total Number of Event Enrollments
          </div>
          <div className={`${styles.pESummaryValue} ${darkMode ? styles.pESummaryValueDark : ''}`}>
            {filteredData.reduce((acc, event) => acc + event.enrolled, 0)}
          </div>
        </div>

        {filteredData.length > 0 && (
          <>
            <div className={`${styles.pESummaryItem} ${darkMode ? styles.pESummaryItemDark : ''}`}>
              <div
                className={`${styles.pESummaryTitle} ${darkMode ? styles.pESummaryTitleDark : ''}`}
              >
                Most Popular Event
              </div>
              <div
                className={`${styles.pESummaryValue} ${darkMode ? styles.pESummaryValueDark : ''}`}
              >
                {mostPopularEvent.type || 'N/A'}
              </div>
            </div>
            <div className={`${styles.pESummaryItem} ${darkMode ? styles.pESummaryItemDark : ''}`}>
              <div
                className={`${styles.pESummaryTitle} ${darkMode ? styles.pESummaryTitleDark : ''}`}
              >
                Least Popular Event
              </div>
              <div
                className={`${styles.pESummaryValue} ${darkMode ? styles.pESummaryValueDark : ''}`}
              >
                {leastPopularEvent.type || 'N/A'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
