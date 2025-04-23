import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './EducationalStatusChart.css';

const COLORS = ['#0088FE', '#FF8042', '#FFBB28'];

const dummyData = [
  { name: "High School/Associate's", value: 100, trend: '0%' },
  { name: "Bachelor's", value: 150, trend: '5% less', trendType: 'decrease' },
  { name: "Master's", value: 250, trend: '10% more', trendType: 'increase' },
];

const renderCustomizedLabel = ({ percent, x, y, name, value }) => {
  const percentText = `${(percent * 100).toFixed(0)}%`;
  return (
    <text x={x} y={y} fill="black" textAnchor="middle" dominantBaseline="central">
      {`${name}: ${value} (${percentText})`}
    </text>
  );
};

function EducationalStatusChart() {
  const [timeFilter, setTimeFilter] = useState('Weekly');
  const [selectedRoles, setSelectedRoles] = useState([]);

  const handleTimeChange = e => {
    setTimeFilter(e.target.value);
  };

  const handleRoleChange = e => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedRoles(prev => [...prev, value]);
    } else {
      setSelectedRoles(prev => prev.filter(role => role !== value));
    }
  };

  const renderCustomTooltip = ({ active, payload }) => {
    if (active && payload?.length > 0 && timeFilter !== 'Custom') {
      const { name, value, percent, payload: item } = payload[0];
      const percentText = `${(percent * 100).toFixed(0)}%`;
      const trendText = item.trend;
      const trendColor = item.trendType === 'increase' ? 'green' : 'red';

      return (
        <div className="custom-tooltip">
          <p>
            <strong>{name}</strong>
          </p>
          <p>
            Applicants: {value} ({percentText})
          </p>
          <p style={{ color: trendColor }}>
            {trendText} than last {timeFilter.toLowerCase()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <h2>Educational Status of Applicants</h2>

      <div className="filters">
        <label>
          Time Filter:
          <select value={timeFilter} onChange={handleTimeChange}>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Yearly</option>
            <option>Custom</option>
          </select>
        </label>

        <div className="role-filter">
          <label>Select Roles:</label>
          {['Designer', 'Developer', 'Manager'].map(role => (
            <label key={role}>
              <input
                type="checkbox"
                value={role}
                checked={selectedRoles.includes(role)}
                onChange={handleRoleChange}
              />
              {role}
            </label>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={dummyData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={150}
            dataKey="value"
          >
            {dummyData.map(entry => (
              <Cell key={entry.name} fill={COLORS[dummyData.indexOf(entry) % COLORS.length]} />
            ))}
          </Pie>
          {timeFilter !== 'Custom' && <Tooltip content={renderCustomTooltip} />}
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EducationalStatusChart;
