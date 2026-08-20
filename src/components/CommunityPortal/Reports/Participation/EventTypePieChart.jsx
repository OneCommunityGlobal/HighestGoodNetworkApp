import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './Participation.module.css';

const CHART_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'];

function EventTypePieChart({ events = [] }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  const eventTypeData = useMemo(() => {
    if (!events.length) return [];

    const countsByType = events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {});

    const total = events.length;

    return Object.entries(countsByType)
      .map(([type, count], index) => ({
        type,
        count,
        percentage: Math.round((count / total) * 100),
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [events]);

  const totalEvents = eventTypeData.reduce((sum, item) => sum + item.count, 0);

  const tooltipStyle = {
    backgroundColor: darkMode ? '#1C2541' : '#ffffff',
    border: `1px solid ${darkMode ? '#3a4a6b' : '#e0e0e0'}`,
    borderRadius: '6px',
    color: darkMode ? '#e5e7eb' : '#1a1a1a',
  };

  return (
    <div className={`${styles.pieChartSection} ${darkMode ? styles.pieChartSectionDark : ''}`}>
      <h3 className={`${styles.chartTitle} ${darkMode ? styles.chartTitleDark : ''}`}>
        Event Type Popularity
      </h3>

      {eventTypeData.length === 0 ? (
        <p className={darkMode ? styles.chartTitleDark : ''}>No event data available.</p>
      ) : (
        <>
          <div className={styles.pieChartContainer}>
            <div className={styles.pieChart}>
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={eventTypeData}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    isAnimationActive={false}
                    label={({ percent }) => `${Math.round(percent * 100)}%`}
                  >
                    {eventTypeData.map((item, index) => (
                      <Cell
                        key={item.type}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        stroke={darkMode ? '#1C2541' : '#ffffff'}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: tooltipStyle.color }}
                    formatter={(value, name, tooltipProps) => [
                      `${value} events (${tooltipProps.payload.percentage}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
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
        </>
      )}
    </div>
  );
}

export default EventTypePieChart;
