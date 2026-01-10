import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import styles from './ReviewVolumeOverTimeChart.module.css';

function ReviewVolumeOverTimeChart() {
  const darkMode = useSelector(state => state.theme.darkMode);
  
  // State for filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [category, setCategory] = useState('By Village'); // 'By Village' or 'By Property'
  const [selectedVillages, setSelectedVillages] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  
  // Mock data - replace with actual API call
  const [chartData, setChartData] = useState([
    {
      month: 'Apr 2023',
      Negative: 12,
      Neutral: 15,
      Positive: 25,
    },
    {
      month: 'Jun 2023',
      Negative: 15,
      Neutral: 23,
      Positive: 38,
    },
    {
      month: 'Sep 2023',
      Negative: 23,
      Neutral: 33,
      Positive: 40,
    },
    {
      month: 'Oct 2023',
      Negative: 23,
      Neutral: 37,
      Positive: 48,
    },
    {
      month: 'Nov 2023',
      Negative: 25,
      Neutral: 42,
      Positive: 45,
    },
    {
      month: 'Dec 2023',
      Negative: 22,
      Neutral: 33,
      Positive: 48,
    },
    {
      month: 'Jan 2024',
      Negative: 19,
      Neutral: 30,
      Positive: 42,
    },
    {
      month: 'Feb 2024',
      Negative: 18,
      Neutral: 23,
      Positive: 42,
    },
  ]);

  // Mock options - replace with actual API data
  const villageOptions = [
    { value: 'All', label: 'All Villages' },
    { value: 'Village1', label: 'Village 1' },
    { value: 'Village2', label: 'Village 2' },
    { value: 'Village3', label: 'Village 3' },
  ];

  const propertyOptions = [
    { value: 'All', label: 'All Properties' },
    { value: 'Property1', label: 'Property 1' },
    { value: 'Property2', label: 'Property 2' },
    { value: 'Property3', label: 'Property 3' },
  ];

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    // Clear selections when category changes
    setSelectedVillages([]);
    setSelectedProperties([]);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = (data.Negative || 0) + (data.Neutral || 0) + (data.Positive || 0);
      return (
        <div className={`${styles.customTooltip} ${darkMode ? styles.darkTooltip : ''}`}>
          <p className={styles.tooltipLabel}>{data.month}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
          <p className={styles.tooltipTotal}>Total: {total}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`${styles.chartContainer} ${darkMode ? styles.darkContainer : ''}`}>
      <h2 className={`${styles.chartTitle} ${darkMode ? styles.darkText : ''}`}>
        Review Volume Over Time
      </h2>

      {/* Filters Section */}
      <div className={`${styles.filtersContainer} ${darkMode ? styles.darkFilters : ''}`}>
        {/* Dates Filter */}
        <div className={styles.filterGroup}>
          <label className={`${styles.filterLabel} ${darkMode ? styles.darkText : ''}`}>
            Dates:
          </label>
          <div className={styles.dateRangeContainer}>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              max={toDate || undefined}
              className={`${styles.dateInput} ${darkMode ? styles.darkInput : ''}`}
            />
            <span className={`${styles.dateSeparator} ${darkMode ? styles.darkText : ''}`}>
              to
            </span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate || undefined}
              className={`${styles.dateInput} ${darkMode ? styles.darkInput : ''}`}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className={styles.filterGroup}>
          <label className={`${styles.filterLabel} ${darkMode ? styles.darkText : ''}`}>
            Category:
          </label>
          <select
            value={category}
            onChange={handleCategoryChange}
            className={`${styles.categorySelect} ${darkMode ? styles.darkSelect : ''}`}
          >
            <option value="By Village">By Village</option>
            <option value="By Property">By Property</option>
          </select>
        </div>

        {/* Villages Multi-select (active when Category = "By Village") */}
        {category === 'By Village' && (
          <div className={styles.filterGroup}>
            <label className={`${styles.filterLabel} ${darkMode ? styles.darkText : ''}`}>
              Villages:
            </label>
            <Select
              isMulti
              options={villageOptions}
              value={selectedVillages}
              onChange={setSelectedVillages}
              placeholder="Select villages..."
              className={styles.multiSelect}
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#1c2541' : '#fff',
                  borderColor: darkMode ? '#34495e' : '#d9d9d9',
                  boxShadow: '2px 2px 4px 1px rgba(0,0,0,0.1)',
                  minHeight: '40px',
                  '&:hover': {
                    borderColor: darkMode ? '#4a5568' : '#40a9ff',
                  },
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#1c2541' : '#fff',
                  zIndex: 9999,
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? darkMode
                      ? '#34495e'
                      : '#e6f7ff'
                    : darkMode
                    ? '#1c2541'
                    : '#fff',
                  color: darkMode ? '#f1f1f1' : '#000',
                  '&:active': {
                    backgroundColor: darkMode ? '#4a5568' : '#bae7ff',
                  },
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#34495e' : '#e6f7ff',
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: darkMode ? '#f1f1f1' : '#000',
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: darkMode ? '#f1f1f1' : '#000',
                  '&:hover': {
                    backgroundColor: '#dc3545',
                    color: '#fff',
                  },
                }),
                placeholder: (base) => ({
                  ...base,
                  color: darkMode ? '#888' : '#999',
                }),
                input: (base) => ({
                  ...base,
                  color: darkMode ? '#f1f1f1' : '#000',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: darkMode ? '#f1f1f1' : '#000',
                }),
              }}
            />
          </div>
        )}

        {/* Properties Multi-select (active when Category = "By Property") */}
        {category === 'By Property' && (
          <div className={styles.filterGroup}>
            <label className={`${styles.filterLabel} ${darkMode ? styles.darkText : ''}`}>
              Properties:
            </label>
            <Select
              isMulti
              options={propertyOptions}
              value={selectedProperties}
              onChange={setSelectedProperties}
              placeholder="Select properties..."
              className={styles.multiSelect}
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#1c2541' : '#fff',
                  borderColor: darkMode ? '#34495e' : '#d9d9d9',
                  boxShadow: '2px 2px 4px 1px rgba(0,0,0,0.1)',
                  minHeight: '40px',
                  '&:hover': {
                    borderColor: darkMode ? '#4a5568' : '#40a9ff',
                  },
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#1c2541' : '#fff',
                  zIndex: 9999,
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? darkMode
                      ? '#34495e'
                      : '#e6f7ff'
                    : darkMode
                    ? '#1c2541'
                    : '#fff',
                  color: darkMode ? '#f1f1f1' : '#000',
                  '&:active': {
                    backgroundColor: darkMode ? '#4a5568' : '#bae7ff',
                  },
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#34495e' : '#e6f7ff',
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: darkMode ? '#f1f1f1' : '#000',
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: darkMode ? '#f1f1f1' : '#000',
                  '&:hover': {
                    backgroundColor: '#dc3545',
                    color: '#fff',
                  },
                }),
                placeholder: (base) => ({
                  ...base,
                  color: darkMode ? '#888' : '#999',
                }),
                input: (base) => ({
                  ...base,
                  color: darkMode ? '#f1f1f1' : '#000',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: darkMode ? '#f1f1f1' : '#000',
                }),
              }}
            />
          </div>
        )}
      </div>

      {/* Chart Display */}
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#e0e0e0'} />
            <XAxis
              dataKey="month"
              tick={{ fill: darkMode ? '#f1f1f1' : '#666', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
              label={{
                value: 'Time',
                position: 'insideBottom',
                offset: -10,
                style: { textAnchor: 'middle', fill: darkMode ? '#f1f1f1' : '#666', fontSize: 14 },
              }}
            />
            <YAxis
              tick={{ fill: darkMode ? '#f1f1f1' : '#666', fontSize: 12 }}
              label={{
                value: 'Review Volume',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: darkMode ? '#f1f1f1' : '#666', fontSize: 14 },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
              formatter={(value) => {
                // Fix typo: "Negagative" -> "Negative"
                if (value === 'Negative') return 'Negative';
                return value;
              }}
            />
            <Bar dataKey="Negative" stackId="a" fill="#DC3545" name="Negative" />
            <Bar dataKey="Neutral" stackId="a" fill="#6C757D" name="Neutral" />
            <Bar dataKey="Positive" stackId="a" fill="#28A745" name="Positive" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ReviewVolumeOverTimeChart;
