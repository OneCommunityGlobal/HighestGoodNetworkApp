import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './Participation.module.css';

function ParticipationTrends() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  const getTrendData = period => {
    const dataByPeriod = {
      '3months': {
        totalGrowth: '+8%',
        averageGrowth: '+4%',
        peakMonth: 'June',
        peakAttendance: 48,
        totalParticipants: 280,
      },
      '6months': {
        totalGrowth: '+15%',
        averageGrowth: '+8%',
        peakMonth: 'June',
        peakAttendance: 48,
        totalParticipants: 840,
      },
      '1year': {
        totalGrowth: '+25%',
        averageGrowth: '+12%',
        peakMonth: 'June',
        peakAttendance: 48,
        totalParticipants: 1680,
      },
      all: {
        totalGrowth: '+35%',
        averageGrowth: '+18%',
        peakMonth: 'June',
        peakAttendance: 48,
        totalParticipants: 2520,
      },
    };
    return dataByPeriod[period] || dataByPeriod['6months'];
  };

  const trendData = getTrendData(selectedPeriod);

  const getMonthlyTrends = period => {
    const trendsByPeriod = {
      '3months': [
        { month: 'Apr', attendance: 45, events: 9, growth: '+18%' },
        { month: 'May', attendance: 40, events: 8, growth: '-11%' },
        { month: 'Jun', attendance: 48, events: 10, growth: '+20%' },
      ],
      '6months': [
        { month: 'Jan', attendance: 35, events: 6, growth: '+5%' },
        { month: 'Feb', attendance: 42, events: 8, growth: '+20%' },
        { month: 'Mar', attendance: 38, events: 7, growth: '-10%' },
        { month: 'Apr', attendance: 45, events: 9, growth: '+18%' },
        { month: 'May', attendance: 40, events: 8, growth: '-11%' },
        { month: 'Jun', attendance: 48, events: 10, growth: '+20%' },
      ],
      '1year': [
        { month: 'Jul', attendance: 32, events: 5, growth: '-15%' },
        { month: 'Aug', attendance: 38, events: 7, growth: '+8%' },
        { month: 'Sep', attendance: 42, events: 8, growth: '+12%' },
        { month: 'Oct', attendance: 40, events: 7, growth: '-5%' },
        { month: 'Nov', attendance: 45, events: 9, growth: '+18%' },
        { month: 'Dec', attendance: 35, events: 6, growth: '-22%' },
        { month: 'Jan', attendance: 35, events: 6, growth: '+5%' },
        { month: 'Feb', attendance: 42, events: 8, growth: '+20%' },
        { month: 'Mar', attendance: 38, events: 7, growth: '-10%' },
        { month: 'Apr', attendance: 45, events: 9, growth: '+18%' },
        { month: 'May', attendance: 40, events: 8, growth: '-11%' },
        { month: 'Jun', attendance: 48, events: 10, growth: '+20%' },
      ],
      all: [
        { month: '2023-Q1', attendance: 30, events: 12, growth: '+5%' },
        { month: '2023-Q2', attendance: 35, events: 15, growth: '+17%' },
        { month: '2023-Q3', attendance: 32, events: 13, growth: '-9%' },
        { month: '2023-Q4', attendance: 38, events: 16, growth: '+19%' },
        { month: '2024-Q1', attendance: 42, events: 18, growth: '+11%' },
        { month: '2024-Q2', attendance: 45, events: 20, growth: '+7%' },
        { month: '2024-Q3', attendance: 48, events: 22, growth: '+7%' },
        { month: '2024-Q4', attendance: 50, events: 24, growth: '+4%' },
      ],
    };
    return trendsByPeriod[period] || trendsByPeriod['6months'];
  };

  const monthlyTrends = getMonthlyTrends(selectedPeriod);

  const eventTypeTrends = [
    { type: 'Yoga Class', trend: 'up', growth: '+25%', participants: 180 },
    { type: 'Fitness Bootcamp', trend: 'up', growth: '+18%', participants: 220 },
    { type: 'Cooking Workshop', trend: 'stable', growth: '+3%', participants: 125 },
    { type: 'Dance Class', trend: 'down', growth: '-5%', participants: 200 },
  ];

  const maxAttendance = Math.max(...monthlyTrends.map(item => item.attendance));

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
          Participation Trends Analysis
        </h1>
        <p className={`${styles.pageSubtitle} ${darkMode ? styles.pageSubtitleDark : ''}`}>
          Track participation trends over time and identify patterns
        </p>

        <div className={styles.periodSelector}>
          <label htmlFor="period">Time Period:</label>
          <select
            id="period"
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            className={styles.periodSelect}
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className={styles.trendsSummaryCards}>
        <div className={`${styles.trendCard} ${darkMode ? styles.trendCardDark : ''}`}>
          <div className={styles.cardIcon}>📈</div>
          <div className={styles.cardContent}>
            <div className={styles.cardValue}>{trendData.totalGrowth}</div>
            <div className={styles.cardLabel}>Total Growth</div>
            <div className={styles.cardSubtext}>Overall participation increase</div>
          </div>
        </div>

        <div className={`${styles.trendCard} ${darkMode ? styles.trendCardDark : ''}`}>
          <div className={styles.cardIcon}>📊</div>
          <div className={styles.cardContent}>
            <div className={styles.cardValue}>{trendData.averageGrowth}</div>
            <div className={styles.cardLabel}>Average Growth</div>
            <div className={styles.cardSubtext}>Monthly average</div>
          </div>
        </div>

        <div className={`${styles.trendCard} ${darkMode ? styles.trendCardDark : ''}`}>
          <div className={styles.cardIcon}>🏆</div>
          <div className={styles.cardContent}>
            <div className={styles.cardValue}>{trendData.peakAttendance}</div>
            <div className={styles.cardLabel}>Peak Attendance</div>
            <div className={styles.cardSubtext}>In {trendData.peakMonth}</div>
          </div>
        </div>

        <div className={`${styles.trendCard} ${darkMode ? styles.trendCardDark : ''}`}>
          <div className={styles.cardIcon}>👥</div>
          <div className={styles.cardContent}>
            <div className={styles.cardValue}>{trendData.totalParticipants}</div>
            <div className={styles.cardLabel}>Total Participants</div>
            <div className={styles.cardSubtext}>All events combined</div>
          </div>
        </div>
      </div>

      <div className={`${styles.monthlyTrends} ${darkMode ? styles.monthlyTrendsDark : ''}`}>
        <h3>Monthly Participation Trends</h3>
        <div className={styles.trendsChart}>
          <div className={styles.chartArea}>
            <div className={styles.yAxis}>
              <div className={styles.yAxisValues}>
                {[0, 20, 40, 60].map(value => (
                  <div key={value} className={styles.yAxisValue}>
                    {value}
                  </div>
                ))}
              </div>
              <div className={styles.yAxisLabel}>Attendance</div>
            </div>

            <div className={styles.barsContainer}>
              {monthlyTrends.map((item, index) => (
                <div key={item.month} className={styles.trendBarGroup}>
                  <div
                    className={styles.trendBar}
                    style={{
                      height: `${(item.attendance / maxAttendance) * 100}%`,
                      backgroundColor: darkMode ? '#4CAF50' : '#2196F3',
                    }}
                  />
                  <div className={styles.barLabel}>{item.month}</div>
                  <div className={styles.barValue}>{item.attendance}</div>
                  <div className={styles.barGrowth}>{item.growth}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.eventTypeTrends} ${darkMode ? styles.eventTypeTrendsDark : ''}`}>
        <h3>Event Type Participation Trends</h3>
        <div className={styles.trendsTable}>
          <table>
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Trend</th>
                <th>Growth</th>
                <th>Total Participants</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {eventTypeTrends.map((event, index) => (
                <tr key={index}>
                  <td className={styles.eventType}>{event.type}</td>
                  <td className={styles.trend}>
                    {event.trend === 'up' && '📈 Growing'}
                    {event.trend === 'stable' && '➡️ Stable'}
                    {event.trend === 'down' && '📉 Declining'}
                  </td>
                  <td className={styles.growth}>{event.growth}</td>
                  <td className={styles.participants}>{event.participants}</td>
                  <td className={styles.status}>
                    {event.trend === 'up' && <span className={styles.statusGood}>Excellent</span>}
                    {event.trend === 'stable' && <span className={styles.statusNeutral}>Good</span>}
                    {event.trend === 'down' && (
                      <span className={styles.statusWarning}>Needs Attention</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`${styles.trendInsights} ${darkMode ? styles.trendInsightsDark : ''}`}>
        <h3>Trend Analysis & Recommendations</h3>
        <div className={styles.insightsGrid}>
          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>📈</div>
            <div className={styles.insightContent}>
              <h4>Strong Growth Pattern</h4>
              <p>Overall participation shows consistent 15% growth with peak in June</p>
            </div>
          </div>

          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>🎯</div>
            <div className={styles.insightContent}>
              <h4>Top Performers</h4>
              <p>Yoga Class and Fitness Bootcamp show strongest growth trends</p>
            </div>
          </div>

          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>⚠️</div>
            <div className={styles.insightContent}>
              <h4>Attention Needed</h4>
              <p>Dance Class participation declining - review format and timing</p>
            </div>
          </div>

          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>💡</div>
            <div className={styles.insightContent}>
              <h4>Recommendation</h4>
              <p>Focus on expanding successful formats and revitalizing declining ones</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParticipationTrends;
