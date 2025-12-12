import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './Participation.module.css';

function EventPerformance() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const getPerformanceData = filter => {
    const dataByFilter = {
      all: {
        totalEvents: 24,
        activeEvents: 20,
        completedEvents: 4,
        averageRating: 4.2,
        totalParticipants: 840,
        averageAttendance: 35,
      },
      completed: {
        totalEvents: 4,
        activeEvents: 0,
        completedEvents: 4,
        averageRating: 4.5,
        totalParticipants: 160,
        averageAttendance: 40,
      },
      upcoming: {
        totalEvents: 20,
        activeEvents: 20,
        completedEvents: 0,
        averageRating: 4.0,
        totalParticipants: 680,
        averageAttendance: 34,
      },
      'high-rated': {
        totalEvents: 8,
        activeEvents: 6,
        completedEvents: 2,
        averageRating: 4.7,
        totalParticipants: 320,
        averageAttendance: 40,
      },
    };
    return dataByFilter[filter] || dataByFilter['all'];
  };

  const performanceData = getPerformanceData(selectedFilter);

  const getAllEventPerformance = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate dates relative to today
    const getDateString = daysFromToday => {
      const date = new Date(today);
      date.setDate(date.getDate() + daysFromToday);
      return date.toISOString().split('T')[0];
    };

    return [
      {
        id: 1,
        name: 'Morning Yoga Flow',
        type: 'Yoga Class',
        date: getDateString(-5), // 5 days ago
        attendance: 45,
        capacity: 50,
        rating: 4.8,
        engagement: 92,
        status: 'completed',
        value: 3600,
      },
      {
        id: 2,
        name: 'High-Intensity Bootcamp',
        type: 'Fitness Bootcamp',
        date: getDateString(-7), // 7 days ago
        attendance: 55,
        capacity: 60,
        rating: 4.6,
        engagement: 88,
        status: 'completed',
        value: 4500,
      },
      {
        id: 3,
        name: 'Italian Cooking Workshop',
        type: 'Cooking Workshop',
        date: getDateString(3), // 3 days from now
        attendance: 25,
        capacity: 30,
        rating: 4.4,
        engagement: 85,
        status: 'upcoming',
        value: 3000,
      },
      {
        id: 4,
        name: 'Salsa Dance Class',
        type: 'Dance Class',
        date: getDateString(6), // 6 days from now
        attendance: 40,
        capacity: 45,
        rating: 4.2,
        engagement: 78,
        status: 'upcoming',
        value: 2400,
      },
      {
        id: 5,
        name: 'Meditation & Mindfulness',
        type: 'Yoga Class',
        date: getDateString(-10), // 10 days ago
        attendance: 35,
        capacity: 40,
        rating: 4.7,
        engagement: 90,
        status: 'completed',
        value: 2800,
      },
      {
        id: 6,
        name: 'Advanced Yoga Workshop',
        type: 'Yoga Class',
        date: getDateString(13), // 13 days from now
        attendance: 30,
        capacity: 35,
        rating: 4.9,
        engagement: 95,
        status: 'upcoming',
        value: 2400,
      },
      {
        id: 7,
        name: 'CrossFit Challenge',
        type: 'Fitness Bootcamp',
        date: getDateString(17), // 17 days from now
        attendance: 50,
        capacity: 55,
        rating: 4.5,
        engagement: 87,
        status: 'upcoming',
        value: 4000,
      },
      {
        id: 8,
        name: 'French Pastry Class',
        type: 'Cooking Workshop',
        date: getDateString(20), // 20 days from now
        attendance: 20,
        capacity: 25,
        rating: 4.6,
        engagement: 89,
        status: 'upcoming',
        value: 2500,
      },
    ];
  };

  const allEventPerformance = getAllEventPerformance();

  const filteredEvents = allEventPerformance.filter(event => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'completed') {
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate < today;
    }
    if (selectedFilter === 'upcoming') {
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }
    if (selectedFilter === 'high-rated') return event.rating >= 4.5;
    return true;
  });

  return (
    <div className={`${styles.analyticsPage} ${darkMode ? styles.analyticsPageDark : ''}`}>
      <div className={styles.headerNavigation}>
        <div className={styles.navLinks}>
          <a href="/communityportal/reports/participation" className={styles.navLink}>
            ← Back to Participation
          </a>
        </div>
      </div>
      <div className={styles.pageHeader}>
        <h1 className={`${styles.pageTitle} ${darkMode ? styles.pageTitleDark : ''}`}>
          Event Performance Metrics
        </h1>
        <p className={`${styles.pageSubtitle} ${darkMode ? styles.pageSubtitleDark : ''}`}>
          Detailed performance metrics for individual events
        </p>

        <div className={styles.filterSelector}>
          <label htmlFor="filter">Filter Events:</label>
          <select
            id="filter"
            value={selectedFilter}
            onChange={e => setSelectedFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Events</option>
            <option value="completed">Completed Events</option>
            <option value="upcoming">Upcoming Events</option>
            <option value="high-rated">High-Rated Events (4.5+)</option>
          </select>
        </div>
      </div>

      <div className={styles.performanceSummaryCards}>
        <div className={`${styles.performanceCard} ${darkMode ? styles.performanceCardDark : ''}`}>
          <div className={styles.cardIcon}>📊</div>
          <div className={styles.cardContent}>
            <div className={styles.cardValue}>{performanceData.totalEvents}</div>
            <div className={styles.cardLabel}>Total Events</div>
            <div className={styles.cardSubtext}>All time</div>
          </div>
        </div>

        <div className={`${styles.performanceCard} ${darkMode ? styles.performanceCardDark : ''}`}>
          <div className={styles.cardIcon}>⭐</div>
          <div className={styles.cardContent}>
            <div className={styles.cardValue}>{performanceData.averageRating}</div>
            <div className={styles.cardLabel}>Average Rating</div>
            <div className={styles.cardSubtext}>Out of 5.0</div>
          </div>
        </div>

        <div className={`${styles.performanceCard} ${darkMode ? styles.performanceCardDark : ''}`}>
          <div className={styles.cardIcon}>👥</div>
          <div className={styles.cardContent}>
            <div className={styles.cardValue}>{performanceData.totalParticipants}</div>
            <div className={styles.cardLabel}>Total Participants</div>
            <div className={styles.cardSubtext}>All events</div>
          </div>
        </div>

        <div className={`${styles.performanceCard} ${darkMode ? styles.performanceCardDark : ''}`}>
          <div className={styles.cardIcon}>📈</div>
          <div className={styles.cardContent}>
            <div className={styles.cardValue}>{performanceData.averageAttendance}</div>
            <div className={styles.cardLabel}>Avg Attendance</div>
            <div className={styles.cardSubtext}>Per event</div>
          </div>
        </div>
      </div>

      <div className={`${styles.eventsTable} ${darkMode ? styles.eventsTableDark : ''}`}>
        <h3>Event Performance Details</h3>
        <div className={styles.tableContainer}>
          <table>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Type</th>
                <th>Date</th>
                <th>Attendance</th>
                <th>Rating</th>
                <th>Engagement</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map(event => (
                <tr key={event.id}>
                  <td className={styles.eventName}>{event.name}</td>
                  <td className={styles.eventType}>{event.type}</td>
                  <td className={styles.eventDate}>{event.date}</td>
                  <td className={styles.attendance}>
                    {event.attendance}/{event.capacity}
                    <div className={styles.attendanceBar}>
                      <div
                        className={styles.attendanceFill}
                        style={{
                          width: `${(event.attendance / event.capacity) * 100}%`,
                          backgroundColor:
                            event.attendance / event.capacity >= 0.8
                              ? '#4CAF50'
                              : event.attendance / event.capacity >= 0.6
                              ? '#FF9800'
                              : '#F44336',
                        }}
                      />
                    </div>
                  </td>
                  <td className={styles.rating}>
                    <span className={styles.ratingValue}>{event.rating}</span>
                    <span className={styles.ratingStars}>
                      {'★'.repeat(Math.floor(event.rating))}
                      {'☆'.repeat(5 - Math.floor(event.rating))}
                    </span>
                  </td>
                  <td className={styles.engagement}>
                    {event.engagement}%
                    <div className={styles.engagementBar}>
                      <div
                        className={styles.engagementFill}
                        style={{
                          width: `${event.engagement}%`,
                          backgroundColor:
                            event.engagement >= 85
                              ? '#4CAF50'
                              : event.engagement >= 70
                              ? '#FF9800'
                              : '#F44336',
                        }}
                      />
                    </div>
                  </td>
                  <td className={styles.value}>${event.value.toLocaleString()}</td>
                  <td className={styles.status}>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[
                          `status${event.status.charAt(0).toUpperCase() + event.status.slice(1)}`
                        ]
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className={`${styles.performanceInsights} ${
          darkMode ? styles.performanceInsightsDark : ''
        }`}
      >
        <h3>Performance Insights</h3>
        <div className={styles.insightsGrid}>
          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>🏆</div>
            <div className={styles.insightContent}>
              <h4>Top Performer</h4>
              <p>Morning Yoga Flow leads with 4.8 rating and 92% engagement</p>
            </div>
          </div>

          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>📊</div>
            <div className={styles.insightContent}>
              <h4>Capacity Utilization</h4>
              <p>Average 87% capacity utilization across all events</p>
            </div>
          </div>

          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>💰</div>
            <div className={styles.insightContent}>
              <h4>Value Generation</h4>
              <p>High-Intensity Bootcamp generates highest value at $4,500</p>
            </div>
          </div>

          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>🎯</div>
            <div className={styles.insightContent}>
              <h4>Recommendation</h4>
              <p>Focus on expanding successful event formats and improving underperformers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventPerformance;
