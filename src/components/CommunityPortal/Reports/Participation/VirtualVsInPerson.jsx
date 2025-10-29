import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './Participation.module.css';

function VirtualVsInPerson() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');

  const getAttendanceData = timeframe => {
    const dataByTimeframe = {
      '3months': {
        virtual: {
          totalEvents: 8,
          totalAttendance: 280,
          averageAttendance: 35,
          growth: '+12%',
          topEvent: 'Yoga Class',
          engagement: 80,
        },
        inPerson: {
          totalEvents: 4,
          totalAttendance: 140,
          averageAttendance: 35,
          growth: '+5%',
          topEvent: 'Fitness Bootcamp',
          engagement: 72,
        },
      },
      '6months': {
        virtual: {
          totalEvents: 15,
          totalAttendance: 525,
          averageAttendance: 35,
          growth: '+18%',
          topEvent: 'Yoga Class',
          engagement: 82,
        },
        inPerson: {
          totalEvents: 9,
          totalAttendance: 315,
          averageAttendance: 35,
          growth: '+8%',
          topEvent: 'Fitness Bootcamp',
          engagement: 75,
        },
      },
      '1year': {
        virtual: {
          totalEvents: 28,
          totalAttendance: 980,
          averageAttendance: 35,
          growth: '+25%',
          topEvent: 'Yoga Class',
          engagement: 85,
        },
        inPerson: {
          totalEvents: 18,
          totalAttendance: 630,
          averageAttendance: 35,
          growth: '+12%',
          topEvent: 'Fitness Bootcamp',
          engagement: 78,
        },
      },
      all: {
        virtual: {
          totalEvents: 45,
          totalAttendance: 1575,
          averageAttendance: 35,
          growth: '+30%',
          topEvent: 'Yoga Class',
          engagement: 87,
        },
        inPerson: {
          totalEvents: 32,
          totalAttendance: 1120,
          averageAttendance: 35,
          growth: '+15%',
          topEvent: 'Fitness Bootcamp',
          engagement: 80,
        },
      },
    };
    return dataByTimeframe[timeframe] || dataByTimeframe['6months'];
  };

  const attendanceData = getAttendanceData(selectedTimeframe);

  const comparisonData = [
    {
      metric: 'Total Events',
      virtual: attendanceData.virtual.totalEvents,
      inPerson: attendanceData.inPerson.totalEvents,
      winner:
        attendanceData.virtual.totalEvents > attendanceData.inPerson.totalEvents
          ? 'virtual'
          : attendanceData.virtual.totalEvents < attendanceData.inPerson.totalEvents
          ? 'inPerson'
          : 'tie',
    },
    {
      metric: 'Total Attendance',
      virtual: attendanceData.virtual.totalAttendance,
      inPerson: attendanceData.inPerson.totalAttendance,
      winner:
        attendanceData.virtual.totalAttendance > attendanceData.inPerson.totalAttendance
          ? 'virtual'
          : attendanceData.virtual.totalAttendance < attendanceData.inPerson.totalAttendance
          ? 'inPerson'
          : 'tie',
    },
    {
      metric: 'Avg Attendance',
      virtual: attendanceData.virtual.averageAttendance,
      inPerson: attendanceData.inPerson.averageAttendance,
      winner: 'tie',
    },
    {
      metric: 'Growth Rate',
      virtual: attendanceData.virtual.growth,
      inPerson: attendanceData.inPerson.growth,
      winner:
        attendanceData.virtual.growth > attendanceData.inPerson.growth
          ? 'virtual'
          : attendanceData.virtual.growth < attendanceData.inPerson.growth
          ? 'inPerson'
          : 'tie',
    },
    {
      metric: 'Engagement Rate',
      virtual: `${attendanceData.virtual.engagement}%`,
      inPerson: `${attendanceData.inPerson.engagement}%`,
      winner:
        attendanceData.virtual.engagement > attendanceData.inPerson.engagement
          ? 'virtual'
          : attendanceData.virtual.engagement < attendanceData.inPerson.engagement
          ? 'inPerson'
          : 'tie',
    },
  ];

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
          Virtual vs. In-Person Attendance Analysis
        </h1>
        <p className={`${styles.pageSubtitle} ${darkMode ? styles.pageSubtitleDark : ''}`}>
          Compare attendance patterns between virtual and in-person events
        </p>

        <div className={styles.timeframeSelector}>
          <label htmlFor="timeframe">Time Period:</label>
          <select
            id="timeframe"
            value={selectedTimeframe}
            onChange={e => setSelectedTimeframe(e.target.value)}
            className={styles.timeframeSelect}
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className={styles.comparisonCards}>
        <div
          className={`${styles.comparisonCard} ${styles.virtualCard} ${
            darkMode ? styles.virtualCardDark : ''
          }`}
        >
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>💻</div>
            <h3>Virtual Events</h3>
          </div>
          <div className={styles.cardStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{attendanceData.virtual.totalEvents}</span>
              <span className={styles.statLabel}>Total Events</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{attendanceData.virtual.totalAttendance}</span>
              <span className={styles.statLabel}>Total Attendance</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{attendanceData.virtual.averageAttendance}</span>
              <span className={styles.statLabel}>Avg Attendance</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{attendanceData.virtual.growth}</span>
              <span className={styles.statLabel}>Growth Rate</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{attendanceData.virtual.engagement}%</span>
              <span className={styles.statLabel}>Engagement</span>
            </div>
          </div>
          <div className={styles.topEvent}>
            <strong>Top Event:</strong> {attendanceData.virtual.topEvent}
          </div>
        </div>

        <div
          className={`${styles.comparisonCard} ${styles.inPersonCard} ${
            darkMode ? styles.inPersonCardDark : ''
          }`}
        >
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>🏢</div>
            <h3>In-Person Events</h3>
          </div>
          <div className={styles.cardStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{attendanceData.inPerson.totalEvents}</span>
              <span className={styles.statLabel}>Total Events</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{attendanceData.inPerson.totalAttendance}</span>
              <span className={styles.statLabel}>Total Attendance</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{attendanceData.inPerson.averageAttendance}</span>
              <span className={styles.statLabel}>Avg Attendance</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{attendanceData.inPerson.growth}</span>
              <span className={styles.statLabel}>Growth Rate</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{attendanceData.inPerson.engagement}%</span>
              <span className={styles.statLabel}>Engagement</span>
            </div>
          </div>
          <div className={styles.topEvent}>
            <strong>Top Event:</strong> {attendanceData.inPerson.topEvent}
          </div>
        </div>
      </div>

      <div className={`${styles.comparisonTable} ${darkMode ? styles.comparisonTableDark : ''}`}>
        <h3>Detailed Comparison</h3>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Virtual Events</th>
              <th>In-Person Events</th>
              <th>Winner</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((item, index) => (
              <tr key={index}>
                <td className={styles.metricName}>{item.metric}</td>
                <td className={styles.virtualValue}>{item.virtual}</td>
                <td className={styles.inPersonValue}>{item.inPerson}</td>
                <td className={styles.winner}>
                  {item.winner === 'virtual' && '💻 Virtual'}
                  {item.winner === 'inPerson' && '🏢 In-Person'}
                  {item.winner === 'tie' && '🤝 Tie'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`${styles.insightsSection} ${darkMode ? styles.insightsSectionDark : ''}`}>
        <h3>Key Insights</h3>
        <div className={styles.insightsList}>
          <div className={styles.insightItem}>
            <span className={styles.insightIcon}>📈</span>
            <span>Virtual events show 18% growth vs 8% for in-person events</span>
          </div>
          <div className={styles.insightItem}>
            <span className={styles.insightIcon}>🎯</span>
            <span>Virtual events have higher engagement rates (82% vs 75%)</span>
          </div>
          <div className={styles.insightItem}>
            <span className={styles.insightIcon}>📊</span>
            <span>Both formats maintain similar average attendance (35 participants)</span>
          </div>
          <div className={styles.insightItem}>
            <span className={styles.insightIcon}>💡</span>
            <span>Recommendation: Continue hybrid approach with focus on virtual growth</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VirtualVsInPerson;
