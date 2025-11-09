// ComparePieChart.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { Card, CardBody } from 'reactstrap';
import styles from '../LBDashboard.module.css';

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#FF6B35'];

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      style={{ fontSize: '18px', fontWeight: 'bold' }}
    >
      {value}
    </text>
  );
};

CustomLabel.propTypes = {
  cx: PropTypes.number,
  cy: PropTypes.number,
  midAngle: PropTypes.number,
  innerRadius: PropTypes.number,
  outerRadius: PropTypes.number,
  percent: PropTypes.number,
  value: PropTypes.number,
};

const CustomLegend = ({ payload }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
    {payload.map((entry, index) => (
      <div
        key={`legend-${index}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '16px',
              height: '16px',
              backgroundColor: entry.color,
              borderRadius: '2px',
            }}
          />
          <span style={{ fontSize: '14px' }}>{entry.value}</span>
        </div>
        <span style={{ fontSize: '14px', color: '#666' }}>{entry.payload.percent}%</span>
      </div>
    ))}
  </div>
);

CustomLegend.propTypes = {
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      color: PropTypes.string,
      payload: PropTypes.object,
    }),
  ),
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].name}</p>
        <p style={{ margin: '4px 0 0 0', color: '#666' }}>Value: {payload[0].value}</p>
        <p style={{ margin: '4px 0 0 0', color: '#666' }}>
          Percentage: {payload[0].payload.percent}%
        </p>
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
};

export function ComparePieChart({
  title,
  data,
  nameKey = 'name',
  valueKey = 'value',
  colors = COLORS,
  height = 400,
  darkMode = false,
  showMetricPill = false,
  metricLabel = '',
}) {
  const total = data.reduce((sum, item) => sum + item[valueKey], 0);

  const chartData = data.map(item => ({
    ...item,
    name: item[nameKey],
    value: item[valueKey],
    percent: ((item[valueKey] / total) * 100).toFixed(1),
  }));

  return (
    <Card className={`${styles.graphCard} ${darkMode ? styles.darkCard : ''}`}>
      <CardBody>
        <div className={styles.graphTitle}>
          <span className={darkMode ? styles.darkText : ''}>{title}</span>
          {showMetricPill && metricLabel && (
            <span className={`${styles.metricPill} ${darkMode ? styles.darkMetricPill : ''}`}>
              {metricLabel}
            </span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius="40%"
              outerRadius="70%"
              paddingAngle={2}
              dataKey="value"
              label={CustomLabel}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            <text
              x="50%"
              y="45%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: '14px', fill: '#666', fontWeight: 'bold' }}
            >
              Total:
            </text>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: '24px', fill: '#333', fontWeight: 'bold' }}
            >
              {total}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}

ComparePieChart.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
    }),
  ).isRequired,
  nameKey: PropTypes.string,
  valueKey: PropTypes.string,
  colors: PropTypes.arrayOf(PropTypes.string),
  height: PropTypes.number,
  darkMode: PropTypes.bool,
  showMetricPill: PropTypes.bool,
  metricLabel: PropTypes.string,
};
