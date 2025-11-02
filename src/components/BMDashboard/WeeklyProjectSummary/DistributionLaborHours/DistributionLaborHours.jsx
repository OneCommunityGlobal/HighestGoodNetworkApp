import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './DistributionLaborHours.module.css';

const COLORS = ['#f9f3e3', '#2a647c', '#2e8ea3', '#ffab91', '#ffccbb', '#bbbbbbff'];

const CustomTooltip = ({ active, payload, total, darkMode }) => {
  if (active && payload && payload.length) {
    const category = payload[0].name;
    const value = payload[0].value;
    const percent = ((value / total) * 100).toFixed(1);
    return (
      <div className={`${styles.tooltip} ${darkMode ? styles.darkMode : ''}`}>
        <p className={darkMode ? 'text-light' : ''}>{category}</p>
        <p className={darkMode ? 'text-light' : ''}>{`Hours: ${value} hrs`}</p>
        <p className={darkMode ? 'text-light' : ''}>{`Percentage: ${percent}%`}</p>
      </div>
    );
  }
  return null;
};

export default function DistributionLaborHours({ darkMode }) {
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [projectFilter, setProjectFilter] = useState('');
  const [memberFilter, setMemberFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const mockData = [
        { name: 'Stud Wall Construction', value: 25.9 },
        { name: 'Foundation Concreting', value: 18.5 },
        { name: 'Task A', value: 22.2 },
        { name: 'Task B', value: 18.5 },
        { name: 'Task C', value: 14.8 },
        { name: 'Electrical', value: 12 },
        { name: 'Plumbing', value: 8 },
        { name: 'Welding', value: 6 },
      ];
      setOriginalData(mockData);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const top5 = originalData.slice(0, 5);
    const othersTotal = originalData.slice(5).reduce((sum, item) => sum + item.value, 0);
    if (othersTotal > 0) {
      top5.push({ name: 'Others', value: othersTotal });
    }
    setFilteredData(top5);
  }, [originalData, dateRange, projectFilter, memberFilter]);

  const totalHours = filteredData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={styles.container}>
      <h3 className={`${styles.title} ${darkMode ? 'text-light' : ''}`}>
        Distribution of Labor Hours
      </h3>

      <div className={styles.filters}>
        <label className={`${darkMode ? 'text-light' : ''}`}>
          From:
          <input
            type="date"
            value={dateRange.from}
            onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
            className={`${styles.toolsHorizontalBarChartDatePicker} ${
              darkMode ? styles.darkDate : ''
            }`}
          />
        </label>
        <label className={`${darkMode ? 'text-light' : ''}`}>
          To:
          <input
            type="date"
            value={dateRange.to}
            onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
            className={`${styles.toolsHorizontalBarChartDatePicker} ${
              darkMode ? styles.darkDate : ''
            }`}
          />
        </label>
        <label className={`${darkMode ? 'text-light' : ''}`}>
          Project:
          <select
            onChange={e => setProjectFilter(e.target.value)}
            value={projectFilter}
            className={darkMode ? styles.selectDarkMode : styles.selectLightMode}
          >
            <option value="">All</option>
            <option value="Project A">Project A</option>
            <option value="Project B">Project B</option>
          </select>
        </label>
        <label className={`${darkMode ? 'text-light' : ''}`}>
          Member:
          <select
            onChange={e => setMemberFilter(e.target.value)}
            value={memberFilter}
            className={darkMode ? styles.selectDarkMode : styles.selectLightMode}
          >
            <option value="">All</option>
            <option value="Member 1">Member 1</option>
            <option value="Member 2">Member 2</option>
          </select>
        </label>
        <button
          className={`${styles.button} ${darkMode ? 'bg-azure text-light' : ''}`}
          onClick={() => window.location.reload()}
        >
          Submit
        </button>
      </div>

      <div className={styles.chartWrapper}>
        <div className={styles.legend}>
          {filteredData.map((entry, index) => (
            <div key={index} className={styles.legendItem}>
              <span
                className={styles.colorBox}
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              {entry.name}: {entry.value} hrs
            </div>
          ))}
        </div>

        <div className={styles.pieChartContainer}>
          <ResponsiveContainer width={300} height={300}>
            <PieChart>
              <Pie
                data={filteredData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                onClick={data => alert(`Drilldown for: ${data.name}`)}
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip total={totalHours} darkMode={darkMode} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
