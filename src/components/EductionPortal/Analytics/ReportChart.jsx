import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useSelector } from 'react-redux';
import styles from './AnalyticsDashboard.module.css';

const ReportChart = ({ data, type = 'line', title, dataKey, xAxisKey = 'date' }) => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const chartColors = {
    primary: darkMode ? '#60a5fa' : '#3b82f6',
    secondary: darkMode ? '#34d399' : '#10b981',
    tertiary: darkMode ? '#fbbf24' : '#f59e0b',
    axis: darkMode ? '#d1d5db' : '#6b7280',
    tooltipText: darkMode ? '#f3f4f6' : '#111827',
  };

  const tooltipStyle = {
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    color: chartColors.tooltipText,
  };

  if (!data || data.length === 0) {
    return (
      <div className={styles.chartCard}>
        {title && <h3 className={styles.chartTitle}>{title}</h3>}
        <div
          className={styles.chartContainer}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>No data available</p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    if (type === 'bar') {
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
          <XAxis dataKey={xAxisKey} stroke={chartColors.axis} tick={{ fill: chartColors.axis }} />
          <YAxis stroke={chartColors.axis} tick={{ fill: chartColors.axis }} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: chartColors.tooltipText }}
            itemStyle={{ color: chartColors.tooltipText }}
          />
          <Legend wrapperStyle={{ color: chartColors.axis }} />
          <Bar dataKey={dataKey} fill={chartColors.primary} radius={[6, 6, 0, 0]} />
        </BarChart>
      );
    }

    return (
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
        <XAxis dataKey={xAxisKey} stroke={chartColors.axis} tick={{ fill: chartColors.axis }} />
        <YAxis stroke={chartColors.axis} tick={{ fill: chartColors.axis }} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: chartColors.tooltipText }}
          itemStyle={{ color: chartColors.tooltipText }}
        />
        <Legend wrapperStyle={{ color: chartColors.axis }} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={chartColors.primary}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    );
  };

  return (
    <div className={styles.chartCard}>
      {title && <h3 className={styles.chartTitle}>{title}</h3>}
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReportChart;
