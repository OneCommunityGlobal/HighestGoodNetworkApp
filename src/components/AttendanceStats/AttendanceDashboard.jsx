import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function AttendanceStatistics() {
  const [selectedMonth, setSelectedMonth] = useState('January');
  const attendanceData = {
    January: {
      virtual: 120,
      inPerson: 80,
      recorded: 50,
      breakdown: [
        { label: 'Sat PM', value: 45, color: '#88c057' },
        { label: 'Sun AM', value: 42, color: '#f4c542' },
        { label: 'Fri PM', value: 28, color: '#5b9bd5' },
        { label: 'Thur PM', value: 28, color: '#d57b5b' },
        { label: 'Wed PM', value: 14, color: '#917fb3' },
        { label: 'Sun PM', value: 14, color: '#ff6384' },
      ],
    },
    February: {
      virtual: 100,
      inPerson: 90,
      recorded: 40,
      breakdown: [
        { label: 'Sat PM', value: 50, color: '#88c057' },
        { label: 'Sun AM', value: 38, color: '#f4c542' },
        { label: 'Fri PM', value: 30, color: '#5b9bd5' },
        { label: 'Thur PM', value: 25, color: '#d57b5b' },
        { label: 'Wed PM', value: 10, color: '#917fb3' },
        { label: 'Sun PM', value: 20, color: '#ff6384' },
      ],
    },
    March: {
      virtual: 110,
      inPerson: 85,
      recorded: 45,
      breakdown: [
        { label: 'Sat PM', value: 40, color: '#88c057' },
        { label: 'Sun AM', value: 45, color: '#f4c542' },
        { label: 'Fri PM', value: 20, color: '#5b9bd5' },
        { label: 'Thur PM', value: 30, color: '#d57b5b' },
        { label: 'Wed PM', value: 15, color: '#917fb3' },
        { label: 'Sun PM', value: 18, color: '#ff6384' },
      ],
    },
  };

  const currentData = attendanceData[selectedMonth];
  const totalValue = currentData.breakdown.reduce((sum, entry) => sum + entry.value, 0);

  const barData = [
    { name: 'Virtual', value: currentData.virtual, color: '#4caf50' },
    { name: 'In-Person', value: currentData.inPerson, color: '#3f51b5' },
    { name: 'Recorded', value: currentData.recorded, color: '#9c27b0' },
  ];

  const mostPopularEvent = {
    month: selectedMonth,
    total: currentData.virtual + currentData.inPerson + currentData.recorded,
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Attendance Statistics</h2>
      <label>Select Month: </label>
      <select onChange={e => setSelectedMonth(e.target.value)} value={selectedMonth}>
        {Object.keys(attendanceData).map(month => (
          <option key={month} value={month}>
            {month}
          </option>
        ))}
      </select>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
        {/* Peak Attendance Times */}
        <div
          style={{
            flex: 1,
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '10px',
            textAlign: 'center',
          }}
        >
          <h3>Peak attendance times</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={currentData.breakdown}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {currentData.breakdown.map((entry, index) => (
                  <Cell key={`cell-${index.label}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '20px 0' }}>{totalValue}</div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {currentData.breakdown.map((entry, index) => (
              <li key={index.label} style={{ color: entry.color }}>
                {entry.label} - {entry.value}
              </li>
            ))}
          </ul>
        </div>

        {/* Class Type Preferences */}
        <div style={{ flex: 1, padding: '20px', border: '1px solid #ddd', borderRadius: '10px' }}>
          <h3>Class type preferences</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index.label}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ textAlign: 'center', color: 'red', marginTop: '10px' }}>
            Recommend on...
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: '20px',
          padding: '10px',
          border: '2px solid #000',
          borderRadius: '8px',
          textAlign: 'center',
          background: '#f9f9f9',
        }}
      >
        <h3>Most Popular Event</h3>
        <p>
          Month: <strong>{mostPopularEvent.month}</strong>
        </p>
        <p>
          Total Attendance: <strong>{mostPopularEvent.total}</strong>
        </p>
      </div>
    </div>
  );
}

export default AttendanceStatistics;
