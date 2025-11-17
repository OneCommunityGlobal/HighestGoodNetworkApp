import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LabelList,
} from 'recharts';
import styles from './WeeklyProgress.module.css';

const formatWeekLabel = isoDate => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const WeeklyProgressChart = ({ data, loading, error, weeks, startDate, endDate }) => {
  const hasData = data && data.length > 0;

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.chartHeader}>
        <h3>Weekly Progress</h3>
        {startDate && endDate && (
          <span className={styles.chartSubheader}>This Week trend over last {weeks} weeks</span>
        )}
      </div>

      {loading && !hasData && !error && (
        <div className={styles.chartPlaceholder}>Loading weekly progress…</div>
      )}

      {!loading && !hasData && !error && (
        <div className={styles.chartPlaceholder}>No data available for this range.</div>
      )}

      {error && <div className={styles.chartPlaceholder}>{error}</div>}

      {hasData && (
        <div className={styles.chartInner}>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tickFormatter={formatWeekLabel} tick={{ fontSize: 12 }} />
              <YAxis
                label={{
                  value: 'Tasks Completed',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  style: { fontSize: 12 },
                }}
                allowDecimals={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={value => [`${value} tasks`, 'Completed']}
                labelFormatter={label => `Week of ${formatWeekLabel(label)}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="completed"
                name="This Week"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              >
                {/* Small value labels – optional, looks nice at peaks */}
                <LabelList
                  dataKey="completed"
                  position="top"
                  formatter={value => (value ? value : '')}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default WeeklyProgressChart;
