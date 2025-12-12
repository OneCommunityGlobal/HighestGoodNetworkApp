import { useSelector } from 'react-redux';
import styles from './Participation.module.css';

function EngagementBarChart() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const engagementData = [
    { month: 'Jan', attendance: 35, engagement: 78, events: 6 },
    { month: 'Feb', attendance: 42, engagement: 82, events: 8 },
    { month: 'Mar', attendance: 38, engagement: 75, events: 7 },
    { month: 'Apr', attendance: 45, engagement: 85, events: 9 },
    { month: 'May', attendance: 40, engagement: 80, events: 8 },
    { month: 'Jun', attendance: 48, engagement: 88, events: 10 },
  ];

  const maxAttendance = Math.max(...engagementData.map(item => item.attendance));
  const maxEngagement = Math.max(...engagementData.map(item => item.engagement));

  return (
    <div className={`${styles.barChartSection} ${darkMode ? styles.barChartSectionDark : ''}`}>
      <h3 className={`${styles.chartTitle} ${darkMode ? styles.chartTitleDark : ''}`}>
        Monthly Engagement Trends
      </h3>

      <div className={styles.barChartContainer}>
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
            {engagementData.map((item, index) => (
              <div key={item.month} className={styles.barGroup}>
                <div className={styles.barWrapper}>
                  <div
                    className={`${styles.bar} ${styles.attendanceBar}`}
                    style={{
                      height: `${(item.attendance / maxAttendance) * 100}%`,
                      backgroundColor: darkMode ? '#4CAF50' : '#2196F3',
                    }}
                  />
                  <div
                    className={`${styles.bar} ${styles.engagementBar}`}
                    style={{
                      height: `${(item.engagement / maxEngagement) * 100}%`,
                      backgroundColor: darkMode ? '#FF9800' : '#4CAF50',
                    }}
                  />
                </div>
                <div className={styles.barLabel}>{item.month}</div>
                <div className={styles.barValues}>
                  <div className={styles.barValue}>{item.attendance}</div>
                  <div className={styles.barValue}>{item.engagement}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartLegend}>
          <div className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ backgroundColor: darkMode ? '#4CAF50' : '#2196F3' }}
            />
            <span className={styles.legendLabel}>Average Attendance</span>
          </div>
          <div className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ backgroundColor: darkMode ? '#FF9800' : '#4CAF50' }}
            />
            <span className={styles.legendLabel}>Engagement Rate (%)</span>
          </div>
        </div>
      </div>

      <div className={styles.chartInsights}>
        <div className={styles.insightItem}>
          <span className={styles.insightLabel}>Peak Month:</span>
          <span className={styles.insightValue}>June (48 avg attendance)</span>
        </div>
        <div className={styles.insightItem}>
          <span className={styles.insightLabel}>Growth Trend:</span>
          <span className={styles.insightValue}>+37% from Jan to Jun</span>
        </div>
      </div>
    </div>
  );
}

export default EngagementBarChart;
