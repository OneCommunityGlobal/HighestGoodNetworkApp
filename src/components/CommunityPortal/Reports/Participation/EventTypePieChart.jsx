import { useSelector } from 'react-redux';
import styles from './Participation.module.css';

function EventTypePieChart() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const eventTypeData = [
    { type: 'Yoga Class', count: 8, percentage: 33, color: '#4CAF50' },
    { type: 'Fitness Bootcamp', count: 6, percentage: 25, color: '#2196F3' },
    { type: 'Cooking Workshop', count: 5, percentage: 21, color: '#FF9800' },
    { type: 'Dance Class', count: 5, percentage: 21, color: '#9C27B0' },
  ];

  const totalEvents = eventTypeData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className={`${styles.pieChartSection} ${darkMode ? styles.pieChartSectionDark : ''}`}>
      <h3 className={`${styles.chartTitle} ${darkMode ? styles.chartTitleDark : ''}`}>
        Event Type Popularity
      </h3>

      <div className={styles.pieChartContainer}>
        <div className={styles.pieChart}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="none" stroke="#e0e0e0" strokeWidth="40" />
            {eventTypeData.map((item, index) => {
              const startAngle = eventTypeData
                .slice(0, index)
                .reduce((sum, prev) => sum + prev.percentage * 3.6, 0);
              const endAngle = startAngle + item.percentage * 3.6;

              const startAngleRad = (startAngle - 90) * (Math.PI / 180);
              const endAngleRad = (endAngle - 90) * (Math.PI / 180);

              const x1 = 100 + 80 * Math.cos(startAngleRad);
              const y1 = 100 + 80 * Math.sin(startAngleRad);
              const x2 = 100 + 80 * Math.cos(endAngleRad);
              const y2 = 100 + 80 * Math.sin(endAngleRad);

              const largeArcFlag = item.percentage > 50 ? 1 : 0;

              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z',
              ].join(' ');

              return (
                <path
                  key={item.type}
                  d={pathData}
                  fill={item.color}
                  stroke={darkMode ? '#1C2541' : '#ffffff'}
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>

        <div className={styles.pieChartLegend}>
          {eventTypeData.map(item => (
            <div key={item.type} className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: item.color }} />
              <div className={styles.legendText}>
                <span className={styles.legendLabel}>{item.type}</span>
                <span className={styles.legendValue}>
                  {item.count} events ({item.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.chartSummary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Events:</span>
          <span className={styles.summaryValue}>{totalEvents}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Most Popular:</span>
          <span className={styles.summaryValue}>{eventTypeData[0].type}</span>
        </div>
      </div>
    </div>
  );
}

export default EventTypePieChart;
