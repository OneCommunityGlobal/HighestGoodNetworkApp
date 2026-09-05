import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import styles from './Participation.module.css';

const MONTH_COUNT = 6;

function buildLastMonths(count) {
  const months = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i -= 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
      label: monthDate.toLocaleString('en-US', { month: 'short' }),
      year: monthDate.getFullYear(),
      monthIndex: monthDate.getMonth(),
    });
  }

  return months;
}

function EngagementBarChart({ events = [] }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  const engagementData = useMemo(() => {
    const months = buildLastMonths(MONTH_COUNT);

    return months.map(({ key, label, year, monthIndex }) => {
      const monthEvents = events.filter(event => {
        const eventDate = new Date(event.eventDate);
        return eventDate.getFullYear() === year && eventDate.getMonth() === monthIndex;
      });

      const attendance = monthEvents.length
        ? Math.round(
            monthEvents.reduce((sum, event) => sum + (Number(event.attendees) || 0), 0) /
              monthEvents.length,
          )
        : 0;

      const eventsWithCapacity = monthEvents.filter(event => Number(event.maxAttendees) > 0);
      const fillRate = eventsWithCapacity.length
        ? Math.round(
            eventsWithCapacity.reduce(
              (sum, event) => sum + (Number(event.attendees) / Number(event.maxAttendees)) * 100,
              0,
            ) / eventsWithCapacity.length,
          )
        : 0;

      return { key, month: label, attendance, fillRate, events: monthEvents.length };
    });
  }, [events]);

  const peakMonth = engagementData.reduce(
    (peak, item) => (item.attendance > peak.attendance ? item : peak),
    engagementData[0] || { month: 'N/A', attendance: 0 },
  );

  const firstAttendance = engagementData[0]?.attendance || 0;
  const lastAttendance = engagementData[engagementData.length - 1]?.attendance || 0;
  const growthTrend = firstAttendance
    ? Math.round(((lastAttendance - firstAttendance) / firstAttendance) * 100)
    : null;

  let growthTrendLabel = 'N/A';
  if (growthTrend !== null) {
    const growthSign = growthTrend >= 0 ? '+' : '';
    const firstMonthLabel = engagementData[0]?.month;
    const lastMonthLabel = engagementData[engagementData.length - 1]?.month;
    growthTrendLabel = `${growthSign}${growthTrend}% from ${firstMonthLabel} to ${lastMonthLabel}`;
  }

  const tooltipStyle = {
    backgroundColor: darkMode ? '#1C2541' : '#ffffff',
    border: `1px solid ${darkMode ? '#3a4a6b' : '#e0e0e0'}`,
    borderRadius: '6px',
    color: darkMode ? '#e5e7eb' : '#1a1a1a',
  };
  const axisColor = darkMode ? '#b8c5d1' : '#4b5563';
  const gridColor = darkMode ? '#3a4a6b' : '#e0e0e0';

  return (
    <div className={`${styles.barChartSection} ${darkMode ? styles.barChartSectionDark : ''}`}>
      <h3 className={`${styles.chartTitle} ${darkMode ? styles.chartTitleDark : ''}`}>
        Monthly Engagement Trends
      </h3>

      <div className={styles.barChartContainer}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={engagementData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="month" stroke={axisColor} />
            <YAxis stroke={axisColor} />
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={{ color: tooltipStyle.color }}
              labelStyle={{ color: tooltipStyle.color }}
              formatter={(value, name) => [
                name === 'fillRate' ? `${value}%` : value,
                name === 'fillRate' ? 'Avg Fill Rate' : 'Avg Attendance',
              ]}
            />
            <Legend
              formatter={value =>
                value === 'fillRate' ? 'Avg Fill Rate (%)' : 'Average Attendance'
              }
            />
            <Bar
              dataKey="attendance"
              fill={darkMode ? '#4CAF50' : '#2196F3'}
              isAnimationActive={false}
            />
            <Bar
              dataKey="fillRate"
              fill={darkMode ? '#FF9800' : '#4CAF50'}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartInsights}>
        <div className={styles.insightItem}>
          <span className={styles.insightLabel}>Peak Month:</span>
          <span className={styles.insightValue}>
            {peakMonth.month} ({peakMonth.attendance} avg attendance)
          </span>
        </div>
        <div className={styles.insightItem}>
          <span className={styles.insightLabel}>Growth Trend:</span>
          <span className={styles.insightValue}>{growthTrendLabel}</span>
        </div>
      </div>
    </div>
  );
}

export default EngagementBarChart;
