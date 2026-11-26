import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './Participation.module.css';

function EngagementBarChart() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [tooltip, setTooltip] = useState(null);

  const engagementData = [
    { month: 'Jan', attendance: 35, engagement: 78, events: 6 },
    { month: 'Feb', attendance: 42, engagement: 82, events: 8 },
    { month: 'Mar', attendance: 38, engagement: 75, events: 7 },
    { month: 'Apr', attendance: 45, engagement: 85, events: 9 },
    { month: 'May', attendance: 40, engagement: 80, events: 8 },
    { month: 'Jun', attendance: 48, engagement: 88, events: 10 },
  ];

  const tickStep = 20;
  const highestValue = Math.max(
    ...engagementData.flatMap(({ attendance, engagement }) => [attendance, engagement]),
  );
  const tickCount = Math.max(1, Math.ceil(highestValue / tickStep));
  const maxValue = tickCount * tickStep;
  const ticks = Array.from({ length: tickCount + 1 }, (_, index) => maxValue - index * tickStep);

  return (
    <div className={`${styles.barChartSection} ${darkMode ? styles.barChartSectionDark : ''}`}>
      <h3 className={`${styles.chartTitle} ${darkMode ? styles.chartTitleDark : ''}`}>
        Monthly Engagement Trends
      </h3>

      <div className={styles.barChartContainer}>
        <div className={`${styles.chartArea} ${styles.engagementChartArea}`}>
          <div className={styles.yAxis}>
            <div className={styles.yAxisValues}>
              {ticks.map(value => (
                <div key={value} className={styles.yAxisValue}>
                  {value}
                </div>
              ))}
            </div>
            <div className={styles.yAxisLabel}>Value</div>
          </div>

          <div className={styles.barsContainer}>
            {tooltip && (
              <div
                style={{
                  position: 'absolute',
                  top: tooltip.y,
                  left: tooltip.x,
                  background: darkMode ? '#1b2a41' : '#fff',
                  color: darkMode ? '#fff' : '#333',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '0.8rem',
                  pointerEvents: 'none',
                  zIndex: 10,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                <div>
                  <strong>{tooltip.month}</strong>
                </div>
                <div>Attendance: {tooltip.attendance}</div>
                <div>Engagement: {tooltip.engagement}%</div>
                <div>Events: {tooltip.events}</div>
              </div>
            )}
            {engagementData.map(item => (
              <div
                key={item.month}
                className={styles.barGroup}
                onMouseEnter={e => {
                  const rect = e.currentTarget.parentElement.getBoundingClientRect();
                  const itemRect = e.currentTarget.getBoundingClientRect();
                  setTooltip({
                    month: item.month,
                    attendance: item.attendance,
                    engagement: item.engagement,
                    events: item.events,
                    x: itemRect.left - rect.left,
                    y: -80,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <div className={styles.barWrapper}>
                  <div
                    className={`${styles.bar} ${styles.attendanceBar}`}
                    style={{
                      height: `${(item.attendance / maxValue) * 100}%`,
                      backgroundColor: darkMode ? '#4CAF50' : '#2196F3',
                    }}
                  />
                  <div
                    className={`${styles.bar} ${styles.engagementBar}`}
                    style={{
                      height: `${(item.engagement / maxValue) * 100}%`,
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
