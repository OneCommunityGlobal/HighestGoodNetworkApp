import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ENDPOINTS } from '../../utils/URL';
import styles from './AnalyticsDashboard.module.css';

const useYAxisWidth = () => {
  const [yAxisWidth, setYAxisWidth] = useState(180);

  useEffect(() => {
    const updateWidth = () => {
      setYAxisWidth(window.innerWidth < 768 ? 110 : 180);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return yAxisWidth;
};

const COLORS = {
  exceptional: '#052C65',
  sufficient: '#4682B4',
  needsChanges: '#FF8C00',
  didNotReview: '#A9A9A9',
};

const getCount = (counts, key) => counts?.[key] || 0;

const normalizeReviewCounts = item => {
  const counts = item.counts || {};
  const exceptional = getCount(counts, 'Exceptional');
  const sufficient = getCount(counts, 'Sufficient');
  const needsChanges = getCount(counts, 'Needs Changes');
  const didNotReview = getCount(counts, 'Did Not Review');

  return {
    reviewer: item.reviewer,
    exceptional,
    sufficient,
    needsChanges,
    didNotReview,
    total: exceptional + sufficient + needsChanges + didNotReview,
  };
};

const CustomTooltip = ({ active, payload, label, darkMode }) => {
  if (!active || !payload?.length) return null;

  const textColor = darkMode ? '#f8fafc' : '#111827';

  return (
    <div
      className={styles.customTooltip}
      style={{
        background: darkMode ? '#2d3748' : '#ffffff',
        color: textColor,
        border: `1px solid ${darkMode ? '#4a5568' : '#e5e7eb'}`,
        borderRadius: 8,
        padding: '10px 12px',
        fontSize: 12,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
      }}
    >
      <strong style={{ display: 'block', marginBottom: 8, color: textColor }}>{label}</strong>
      {payload.map(entry => (
        <div
          key={entry.dataKey}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginTop: 4,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: textColor }}>
            <span
              aria-hidden="true"
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: entry.color,
                flexShrink: 0,
              }}
            />
            {entry.name}
          </span>
          <span style={{ color: textColor, fontWeight: 600 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const ReviewersRequirementChart = ({ duration, darkMode = false }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const yAxisWidth = useYAxisWidth();

  useEffect(() => {
    const fetchAPIData = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const token = window.localStorage.getItem('token');
        const response = await axios.get(ENDPOINTS.GITHUB_REVIEW_SUMMARY(duration), {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        });

        setData(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setData([]);
        setErrorMessage('Unable to load GitHub review data for the selected duration.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAPIData();
  }, [duration]);

  const sortedData = data
    .map(normalizeReviewCounts)
    .filter(item => item.reviewer)
    .sort((a, b) => b.total - a.total);

  if (isLoading) {
    return <p className={styles.statusMessage}>Loading review data...</p>;
  }

  if (errorMessage) {
    return <p className={styles.statusMessage}>{errorMessage}</p>;
  }

  if (!sortedData.length) {
    return <p className={styles.statusMessage}>No review data found for this duration.</p>;
  }

  const axisColor = darkMode ? '#e2e8f0' : '#374151';
  const gridColor = darkMode ? '#4a5568' : '#e5e7eb';
  const labelColor = darkMode ? '#f8fafc' : '#111827';
  const rowHeight = 34;
  const chartHeight = Math.max(sortedData.length * rowHeight + 80, 360);

  return (
    <div style={{ width: '100%', minWidth: 520 }}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          layout="vertical"
          data={sortedData}
          margin={{ top: 8, right: 48, left: 4, bottom: 8 }}
          barCategoryGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fill: axisColor, fontSize: 12 }}
            stroke={axisColor}
          />
          <YAxis
            dataKey="reviewer"
            type="category"
            interval={0}
            width={yAxisWidth}
            tick={{ fill: axisColor, fontSize: 11 }}
            stroke={axisColor}
            tickFormatter={value => (value?.length > 22 ? `${value.slice(0, 20)}…` : value)}
          />
          <Tooltip
            cursor={{ fill: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
            content={<CustomTooltip darkMode={darkMode} />}
          />
          <Legend wrapperStyle={{ color: axisColor, paddingTop: 8 }} />

          <Bar
            dataKey="exceptional"
            name="Exceptional"
            stackId="reviews"
            fill={COLORS.exceptional}
            maxBarSize={22}
            isAnimationActive={false}
          />
          <Bar
            dataKey="sufficient"
            name="Sufficient"
            stackId="reviews"
            fill={COLORS.sufficient}
            maxBarSize={22}
            isAnimationActive={false}
          />
          <Bar
            dataKey="needsChanges"
            name="Needs Changes"
            stackId="reviews"
            fill={COLORS.needsChanges}
            maxBarSize={22}
            isAnimationActive={false}
          />
          <Bar
            dataKey="didNotReview"
            name="Did Not Review"
            stackId="reviews"
            fill={COLORS.didNotReview}
            maxBarSize={22}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="total"
              position="right"
              style={{ fill: labelColor, fontSize: 12, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReviewersRequirementChart;
