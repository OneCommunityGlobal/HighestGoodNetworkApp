import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './Participation.module.css';

function EventValue() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [selectedMetric, setSelectedMetric] = useState('total');

  const getEventValueData = metric => {
    const dataByMetric = {
      total: {
        totalValue: 57600,
        averageValue: 2400,
        highestValue: 4500,
        lowestValue: 1200,
        growth: '+22%',
      },
      average: {
        totalValue: 57600,
        averageValue: 2400,
        highestValue: 4500,
        lowestValue: 1200,
        growth: '+15%',
      },
      roi: {
        totalValue: 57600,
        averageValue: 2400,
        highestValue: 4500,
        lowestValue: 1200,
        growth: '+28%',
      },
      trends: {
        totalValue: 57600,
        averageValue: 2400,
        highestValue: 4500,
        lowestValue: 1200,
        growth: '+35%',
      },
    };
    return dataByMetric[metric] || dataByMetric['total'];
  };

  const eventValueData = getEventValueData(selectedMetric);

  const eventTypeValues = [
    { type: 'Fitness Bootcamp', value: 4500, participants: 55, costPerPerson: 82, roi: 340 },
    { type: 'Yoga Class', value: 3600, participants: 45, costPerPerson: 80, roi: 320 },
    { type: 'Cooking Workshop', value: 3000, participants: 25, costPerPerson: 120, roi: 280 },
    { type: 'Dance Class', value: 2400, participants: 40, costPerPerson: 60, roi: 240 },
  ];

  const monthlyTrends = [
    { month: 'Jan', value: 18000, events: 6 },
    { month: 'Feb', value: 22000, events: 8 },
    { month: 'Mar', value: 19500, events: 7 },
    { month: 'Apr', value: 25000, events: 9 },
    { month: 'May', value: 21000, events: 8 },
    { month: 'Jun', value: 24000, events: 10 },
  ];

  const maxValue = Math.max(...monthlyTrends.map(item => item.value));

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
          Estimated Event Value Analysis
        </h1>
        <p className={`${styles.pageSubtitle} ${darkMode ? styles.pageSubtitleDark : ''}`}>
          Calculate and analyze the estimated value of different event types
        </p>

        <div className={styles.metricSelector}>
          <label htmlFor="metric">View Metric:</label>
          <select
            id="metric"
            value={selectedMetric}
            onChange={e => setSelectedMetric(e.target.value)}
            className={styles.metricSelect}
          >
            <option value="total">Total Value</option>
            <option value="average">Average Value</option>
            <option value="roi">ROI Analysis</option>
            <option value="trends">Value Trends</option>
          </select>
        </div>
      </div>

      <div className={styles.valueSummaryCards}>
        <div className={`${styles.valueCard} ${darkMode ? styles.valueCardDark : ''}`}>
          <div className={styles.cardIcon}>💰</div>
          <div className={styles.cardContent}>
            <div className={styles.cardValue}>${eventValueData.totalValue.toLocaleString()}</div>
            <div className={styles.cardLabel}>Total Event Value</div>
            <div className={styles.cardSubtext}>All events combined</div>
          </div>
        </div>

        <div className={`${styles.valueCard} ${darkMode ? styles.valueCardDark : ''}`}>
          <div className={styles.cardIcon}>📊</div>
          <div className={styles.cardContent}>
            <div className={styles.cardValue}>${eventValueData.averageValue.toLocaleString()}</div>
            <div className={styles.cardLabel}>Average Event Value</div>
            <div className={styles.cardSubtext}>Per event</div>
          </div>
        </div>

        <div className={`${styles.valueCard} ${darkMode ? styles.valueCardDark : ''}`}>
          <div className={styles.cardIcon}>🏆</div>
          <div className={styles.cardContent}>
            <div className={styles.cardValue}>${eventValueData.highestValue.toLocaleString()}</div>
            <div className={styles.cardLabel}>Highest Value Event</div>
            <div className={styles.cardSubtext}>Fitness Bootcamp</div>
          </div>
        </div>

        <div className={`${styles.valueCard} ${darkMode ? styles.valueCardDark : ''}`}>
          <div className={styles.cardIcon}>📈</div>
          <div className={styles.cardContent}>
            <div className={styles.cardValue}>{eventValueData.growth}</div>
            <div className={styles.cardLabel}>Value Growth</div>
            <div className={styles.cardSubtext}>This quarter</div>
          </div>
        </div>
      </div>

      <div className={`${styles.eventTypeValues} ${darkMode ? styles.eventTypeValuesDark : ''}`}>
        <h3>Event Type Value Breakdown</h3>
        <div className={styles.valueTable}>
          <table>
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Estimated Value</th>
                <th>Participants</th>
                <th>Cost per Person</th>
                <th>ROI</th>
              </tr>
            </thead>
            <tbody>
              {eventTypeValues.map((event, index) => (
                <tr key={index}>
                  <td className={styles.eventType}>{event.type}</td>
                  <td className={styles.value}>${event.value.toLocaleString()}</td>
                  <td className={styles.participants}>{event.participants}</td>
                  <td className={styles.costPerPerson}>${event.costPerPerson}</td>
                  <td className={styles.roi}>{event.roi}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`${styles.valueTrends} ${darkMode ? styles.valueTrendsDark : ''}`}>
        <h3>Monthly Value Trends</h3>
        <div className={styles.trendsChart}>
          <div className={styles.chartArea}>
            <div className={styles.yAxis}>
              <div className={styles.yAxisValues}>
                {[0, 10000, 20000, 30000].map(value => (
                  <div key={value} className={styles.yAxisValue}>
                    ${value / 1000}k
                  </div>
                ))}
              </div>
              <div className={styles.yAxisLabel}>Value ($)</div>
            </div>

            <div className={styles.barsContainer}>
              {monthlyTrends.map((item, index) => (
                <div key={item.month} className={styles.trendBarGroup}>
                  <div
                    className={styles.trendBar}
                    style={{
                      height: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: darkMode ? '#4CAF50' : '#2196F3',
                    }}
                  />
                  <div className={styles.barLabel}>{item.month}</div>
                  <div className={styles.barValue}>${item.value / 1000}k</div>
                  <div className={styles.barEvents}>{item.events} events</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.valueInsights} ${darkMode ? styles.valueInsightsDark : ''}`}>
        <h3>Value Analysis Insights</h3>
        <div className={styles.insightsGrid}>
          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>💡</div>
            <div className={styles.insightContent}>
              <h4>Highest ROI Event</h4>
              <p>Fitness Bootcamp generates the highest return on investment at 340%</p>
            </div>
          </div>

          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>📊</div>
            <div className={styles.insightContent}>
              <h4>Cost Efficiency</h4>
              <p>Dance Class offers the best cost per person at $60 with 240% ROI</p>
            </div>
          </div>

          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>🎯</div>
            <div className={styles.insightContent}>
              <h4>Growth Opportunity</h4>
              <p>Focus on expanding high-value events like Fitness Bootcamp</p>
            </div>
          </div>

          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>📈</div>
            <div className={styles.insightContent}>
              <h4>Trend Analysis</h4>
              <p>Event values are trending upward with 22% quarterly growth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventValue;
