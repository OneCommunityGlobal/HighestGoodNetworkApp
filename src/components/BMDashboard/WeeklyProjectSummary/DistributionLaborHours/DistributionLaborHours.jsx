import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './DistributionLaborHours.module.css';

const COLORS = ['#2a647c', '#2e8ea3', '#ffab91', '#ffccbb', '#bbbbbb', '#f9f3e3'];

const CustomTooltip = ({ active, payload, total, darkMode }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    const percent = ((value / total) * 100).toFixed(1);
    return (
      <div
        className={styles.tooltip}
        style={{
          backgroundColor: darkMode ? '#2E3E5A' : '#fff',
          color: darkMode ? '#fff' : '#000',
          border: darkMode ? '1px solid #555' : '1px solid #ccc',
        }}
      >
        <p>{name}</p>
        <p>{`Hours: ${value} hrs`}</p>
        <p>{`Percentage: ${percent}%`}</p>
      </div>
    );
  }
  return null;
};

export default function DistributionLaborHours() {
  const darkMode = useSelector(state => state.theme.darkMode);

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
      <h3 className={styles.title}>Distribution of Labor Hours</h3>

      {/* Filters */}
      <div className={styles.filters}>
        <label>
          From:
          <input
            type="date"
            value={dateRange.from}
            onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
          />
        </label>
        <label>
          To:
          <input
            type="date"
            value={dateRange.to}
            onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
          />
        </label>
        <label>
          Project:
          <select onChange={e => setProjectFilter(e.target.value)} value={projectFilter}>
            <option value="">All</option>
            <option value="Project A">Project A</option>
            <option value="Project B">Project B</option>
          </select>
        </label>
        <label>
          Member:
          <select onChange={e => setMemberFilter(e.target.value)} value={memberFilter}>
            <option value="">All</option>
            <option value="Member 1">Member 1</option>
            <option value="Member 2">Member 2</option>
          </select>
        </label>
        <button className={styles.button} type="button">
          Submit
        </button>
      </div>

      {/* Chart + Legend */}
      <div className={styles.chartWrapper}>
        <div className={styles.legend}>
          {filteredData.map((entry, index) => (
            <div key={index} className={styles.legendItem}>
              <span
                className={styles.colorBox}
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span style={{ color: darkMode ? '#f5f5f5' : '#000' }}>
                {entry.name}: {entry.value} hrs
              </span>
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
                labelLine={false}
                label={({ value }) => `${((value / totalHours) * 100).toFixed(1)}%`}
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
