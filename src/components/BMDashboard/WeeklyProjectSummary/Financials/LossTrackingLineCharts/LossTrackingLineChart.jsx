// LossTrackingLineChart.jsx (uses Recharts, dark mode–friendly, styled via CSS, with reset functionality and no-data handling)
import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './LossTrackingLineChart.css';

const colors = {
  2022: '#008080', // Teal
  2023: '#ff69b4', // Pink
  2024: '#ffd700', // Yellow
};

const rawData = [
  {
    year: 2022,
    material: 'Metal',
    data: [
      { date: '2022-01', month: 'Jan', value: 10 },
      { date: '2022-02', month: 'Feb', value: 15 },
      { date: '2022-03', month: 'Mar', value: 20 },
      { date: '2022-04', month: 'Apr', value: 18 },
      { date: '2022-05', month: 'May', value: 12 },
      { date: '2022-06', month: 'Jun', value: 9 },
    ],
  },
  {
    year: 2023,
    material: 'Plastic',
    data: [
      { date: '2023-01', month: 'Jan', value: 5 },
      { date: '2023-02', month: 'Feb', value: 8 },
      { date: '2023-03', month: 'Mar', value: 13 },
      { date: '2023-04', month: 'Apr', value: 14 },
      { date: '2023-05', month: 'May', value: 10 },
      { date: '2023-06', month: 'Jun', value: 6 },
    ],
  },
  {
    year: 2024,
    material: 'Glass',
    data: [
      { date: '2024-01', month: 'Jan', value: 12 },
      { date: '2024-02', month: 'Feb', value: 18 },
      { date: '2024-03', month: 'Mar', value: 17 },
      { date: '2024-04', month: 'Apr', value: 16 },
      { date: '2024-05', month: 'May', value: 14 },
      { date: '2024-06', month: 'Jun', value: 11 },
    ],
  },
];

const LossTrackingLineChart = () => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [material, setMaterial] = useState('All');
  const [year, setYear] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredLines = rawData.filter(line => {
    const yearMatch = year === 'All' || line.year.toString() === year;
    const materialMatch = material === 'All' || line.material === material;
    return yearMatch && materialMatch;
  });

  const mergedData = {};

  filteredLines.forEach(line => {
    line.data.forEach(({ date, month, value }) => {
      const withinRange = (!startDate || date >= startDate) && (!endDate || date <= endDate);

      if (withinRange) {
        if (!mergedData[month]) mergedData[month] = { month };
        mergedData[month][line.year] = value;
      }
    });
  });

  const chartData = Object.values(mergedData);

  return (
    <div className={`loss-tracking-chart-container ${darkMode ? 'dark-mode' : ''}`}>
      <h1 className={`chart-title ${darkMode ? 'dark-mode' : ''}`}>Loss Tracking Line Chart</h1>
      <div className={`filters ${darkMode ? 'dark-mode' : ''}`}>
        <label>
          <span>Material</span>
          <select value={material} onChange={e => setMaterial(e.target.value)}>
            <option value="All">All</option>
            <option value="Metal">Metal</option>
            <option value="Plastic">Plastic</option>
            <option value="Glass">Glass</option>
          </select>
        </label>

        <label>
          <span>Year</span>
          <select value={year} onChange={e => setYear(e.target.value)}>
            <option value="All">All</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
          </select>
        </label>

        <label>
          <span>From</span>
          <input type="month" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </label>

        <label>
          <span>To</span>
          <input type="month" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </label>

        <button
          className="reset-btn"
          onClick={() => {
            setMaterial('All');
            setYear('All');
            setStartDate('');
            setEndDate('');
          }}
        >
          Reset Filters
        </button>
      </div>

      <div className={`chart-wrapper ${darkMode ? 'dark-mode' : ''}`}>
        {chartData.length === 0 ? (
          <div className="no-data-message">No data available for the selected filters.</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="grid" />
              <XAxis
                dataKey="month"
                className="axis"
                label={{
                  value: 'Time (months)',
                  position: 'insideBottom',
                  offset: -5,
                  style: { fill: darkMode ? 'white' : 'black' },
                }}
              />
              <YAxis
                label={{
                  value: 'Loss (%)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: darkMode ? 'white' : 'black' },
                }}
                className="axis"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg)',
                  color: 'var(--text-color)',
                }}
              />
              <Legend wrapperStyle={{ color: 'var(--text-color)' }} />
              {filteredLines.map(line => (
                <Line
                  key={line.year}
                  type="monotone"
                  dataKey={line.year}
                  stroke={colors[line.year]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default LossTrackingLineChart;
