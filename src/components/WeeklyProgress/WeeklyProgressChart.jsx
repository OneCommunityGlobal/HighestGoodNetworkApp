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
} from 'recharts';
import styles from './WeeklyProgress.module.css';

const formatWeekLabel = isoDate => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const TOOLTIP_ID = 'weekly-progress-tooltip-root';

function CustomTooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  return (
    <div
      id={TOOLTIP_ID}
      data-weekly-progress-tooltip="true"
      className={styles.tooltipBox}
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        padding: '8px 12px',
        fontSize: 12,
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `#${TOOLTIP_ID},#${TOOLTIP_ID} *{color:#1f2937 !important;fill:#1f2937 !important;-webkit-text-fill-color:#1f2937 !important;}`,
        }}
      />
      <div className={styles.tooltipLabel}>Week of {formatWeekLabel(label)}</div>
      <div className={styles.tooltipValue}>Completed: {value} tasks</div>
    </div>
  );
}

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
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                label={{
                  value: 'Weeks',
                  position: 'bottom',
                  offset: 0,
                  dx: -20,
                  style: { fontSize: 14, fill: '#e5e7eb', fontWeight: 'bold' },
                }}
                dataKey="week"
                tickFormatter={formatWeekLabel}
                tick={{ fontSize: 14, fill: '#e5e7eb' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                label={{
                  value: 'Tasks Completed',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  dy: 58,
                  style: { fontSize: 13, fill: '#e5e7eb', fontWeight: 'bold' },
                }}
                allowDecimals={false}
                tick={{ fontSize: 12, fill: '#e5e7eb' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                content={props => <CustomTooltipContent {...props} />}
                contentStyle={{ backgroundColor: '#ffffff', color: '#1f2937' }}
                itemStyle={{ color: '#1f2937' }}
                labelStyle={{ color: '#1f2937' }}
              />
              <Legend verticalAlign="bottom" align="center" wrapperStyle={{ bottom: -10 }} />
              <Line
                type="linear"
                dataKey="completed"
                name="This Week"
                stroke="#2B7FFF"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              ></Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default WeeklyProgressChart;
