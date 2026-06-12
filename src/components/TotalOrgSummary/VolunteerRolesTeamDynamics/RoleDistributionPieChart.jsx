import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import Loading from '~/components/common/Loading';
import CustomTooltip from '../../CustomTooltip';

const COLORS = [
  '#2F80ED',
  '#56CCF2',
  '#27AE60',
  '#6FCF97',
  '#F2994A',
  '#F2C94C',
  '#E14848',
  '#9B51E0',
  '#F765A3',
  '#4F4F4F',
  '#828282',
];

const ROLE_COLOR_MAP = {
  Volunteer: '#8ebfff',
  Manager: '#27AE60',
  Administrator: '#fb0505',
  'Core Team': '#8100fa',
  Owner: '#f68d42',
  Mentor: '#f2ff00',
};

const RADIAN = Math.PI / 180;

const getContrastTextColor = hexColor => {
  const hex = hexColor.replace('#', '');

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 160 ? '#000000' : '#FFFFFF';
};

const RoleDistributionPieChart = ({ roleDistributionStats = [], isLoading, darkMode }) => {
  // Reusable function to sort data and assign colors.
  const sortDataAndAssignColors = statsData => {
    statsData?.sort((a, b) => b.count - a.count);
    const mappedData = statsData?.map((item, index) => ({
      name: item._id,
      value: item.count,
      // Use a stable role mapping first, otherwise fallback by index.
      color: ROLE_COLOR_MAP[item._id] || COLORS[index % COLORS.length],
    }));
    return mappedData;
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="w-100vh">
          <Loading />
        </div>
      </div>
    );
  }

  const sortedStats = [...roleDistributionStats].sort((a, b) => b.count - a.count);

  const data = sortedStats.map((item, index) => ({
    name: item._id,
    value: item.count,
    color: ROLE_COLOR_MAP[item._id] || COLORS[index % COLORS.length],
  }));

  const totalValue = data.reduce((sum, entry) => sum + entry.value, 0);

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    if (percent <= 0.01 || !data[index]) return null;

    const slice = data[index];

    const isSmallSlice = percent < 0.1;

    const labelColor = getContrastTextColor(slice.color);

    const labelClass =
      labelColor === '#000000' ? 'role-distribution-label-dark' : 'role-distribution-label-light';

    const radius =
      innerRadius + (outerRadius - innerRadius) * (slice.name === 'Mentor' ? 0.34 : 0.52);

    const x = cx + radius * Math.cos(-midAngle * RADIAN);

    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (isSmallSlice) {
      return (
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fill={labelColor}
          stroke="none"
          className={labelClass}
          style={{
            fontSize: '11px',
            fontWeight: 700,
            pointerEvents: 'none',
          }}
        >
          {`${slice.value} (${(percent * 100).toFixed(0)}%)`}
        </text>
      );
    }

    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={labelColor}
        stroke="none"
        className={labelClass}
        style={{ pointerEvents: 'none' }}
      >
        <tspan
          x={x}
          y={y - 6}
          fill={labelColor}
          style={{
            fontSize: '0.7em',
            fontWeight: 700,
          }}
        >
          {slice.value}
        </tspan>

        <tspan
          x={x}
          y={y + 10}
          fill={labelColor}
          style={{
            fontSize: '0.5em',
            fontWeight: 700,
          }}
        >
          {`(${(percent * 100).toFixed(0)}%)`}
        </tspan>
      </text>
    );
  };

  const renderCustomLegend = ({ payload }) => (
    <ul
      style={{
        listStyle: 'none',
        margin: 0,
        paddingLeft: '20px',
        textAlign: 'left',
        maxHeight: '400px',
        overflowY: 'auto',
      }}
    >
      {payload.map(entry => {
        const itemName = entry.value;

        const itemData = data.find(d => d.name === itemName);

        if (!itemData) return null;

        const { value, color } = itemData;

        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

        return (
          <li
            key={`item-${itemName}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '5px',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: color,
                marginRight: '5px',
                flexShrink: 0,
              }}
            />

            <span
              style={{
                color: darkMode ? 'white' : 'grey',
                fontSize: '12px',
              }}
            >
              {`${itemName}: ${value} (${percentage.toFixed(1)}%)`}
            </span>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div style={{ margin: '15px 10px 10px 10px', overflowX: 'auto' }}>
      <div style={{ minWidth: 500, width: '100%', height: 430 }}>
        <ResponsiveContainer width="100%" height={430}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="100%"
              legendType="square"
              labelLine={false}
              label={renderLabel}
              startAngle={-270}
              endAngle={90}
              stroke="none"
              dataKey="value"
              isAnimationActive={false}
            >
              {data.map(entry => (
                <Cell key={`cell-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>

            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              content={renderCustomLegend}
            />

            <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RoleDistributionPieChart;
