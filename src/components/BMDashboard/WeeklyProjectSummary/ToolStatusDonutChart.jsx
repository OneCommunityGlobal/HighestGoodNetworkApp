import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import './WeeklyProjectSummary.css';

const COLORS = {
  AVAILABLE: '#220F57',
  USED: '#2B73B6',
  MAINTENANCE: '#6DC5DA',
};

const rawData = [
  { name: 'AVAILABLE', value: 5 },
  { name: 'USED', value: 20 },
  { name: 'MAINTENANCE', value: 5 },
];

const total = rawData.reduce((sum, d) => sum + d.value, 0);
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, width }) => {
  const isSmall = width <= 768;
  if (isSmall) return null;

  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="var(--donut-text-color)"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="12"
    >
      {(percent * 100).toFixed(1)}%
    </text>
  );
};

export default function ToolStatusDonutChart() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isXS = windowWidth <= 480;

  let innerRadius;
  let outerRadius;
  let chartHeight;

  if (windowWidth <= 480) {
    innerRadius = 35;
    outerRadius = 60;
    chartHeight = 240;
  } else if (windowWidth <= 768) {
    innerRadius = 45;
    outerRadius = 75;
    chartHeight = 260;
  } else {
    innerRadius = 70;
    outerRadius = 100;
    chartHeight = 320;
  }

  return (
    <div className="tool-donut-wrapper">
      <h3 className="tool-donut-title">Proportion of Tools/Equipment</h3>

      <div className="tool-donut-filters">
        <div className="filter-item">
          <div className="filter-label">
            <span className="dropdown-arrow">⌄</span>
            <span>Tool/Equipment Name</span>
          </div>
          <div className="filter-value">4” Bristle Brush</div>
        </div>
        <div className="filter-item">
          <div className="filter-label">
            <span className="dropdown-arrow">⌄</span>
            <span>Project</span>
          </div>
          <div className="filter-value">ALL</div>
        </div>
        <div className="filter-item">
          <div className="filter-label">
            <span className="dropdown-arrow">⌄</span>
            <span>Dates</span>
          </div>
          <div className="filter-value">ALL</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <PieChart
          margin={{
            top: 30,
            bottom: 30,
            left: isXS ? 30 : 40,
            right: isXS ? 30 : 40,
          }}
        >
          <Pie
            data={rawData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            labelLine={false}
            label={props => renderCustomizedLabel({ ...props, width: windowWidth })}
            dataKey="value"
            isAnimationActive={false}
          >
            {rawData.map(entry => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--donut-text-color)"
            fontSize={14}
            fontWeight="bold"
          >
            TOTAL: {total}
          </text>

          <Tooltip
            formatter={(value, name) => `${((value / total) * 100).toFixed(1)}%`}
            contentStyle={{ fontSize: '14px' }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="tool-donut-legend">
        {rawData.map(entry => (
          <div
            key={entry.name}
            className="tool-donut-legend-item"
            style={{
              backgroundColor: COLORS[entry.name],
            }}
          >
            {entry.name}
          </div>
        ))}
      </div>
    </div>
  );
}
