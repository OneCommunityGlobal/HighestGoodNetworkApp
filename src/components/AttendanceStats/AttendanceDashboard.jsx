'use client';

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
  Legend,
} from 'recharts';

export default function AttendanceStatistics() {
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
      events: [
        {
          name: 'Tech Conference',
          inPerson: 50,
          virtual: 70,
          rating: 4.5,
          location: 'Convention Center',
          startTime: '09:00',
          endTime: '17:00',
          date: '2023-01-15',
        },
        {
          name: 'Leadership Workshop',
          inPerson: 30,
          virtual: 40,
          rating: 4.2,
          location: 'Downtown Hotel',
          startTime: '13:00',
          endTime: '16:00',
          date: '2023-01-22',
        },
        {
          name: 'Networking Night',
          inPerson: 60,
          virtual: 10,
          rating: 4.8,
          location: 'Rooftop Lounge',
          startTime: '19:00',
          endTime: '22:00',
          date: '2023-01-29',
        },
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
      events: [
        {
          name: 'AI Summit',
          inPerson: 40,
          virtual: 60,
          rating: 4.0,
          location: 'University Campus',
          startTime: '10:00',
          endTime: '18:00',
          date: '2023-02-10',
        },
        {
          name: 'Product Launch',
          inPerson: 50,
          virtual: 50,
          rating: 4.7,
          location: 'Company Office',
          startTime: '14:00',
          endTime: '17:00',
          date: '2023-02-18',
        },
        {
          name: 'Cybersecurity Panel',
          inPerson: 70,
          virtual: 30,
          rating: 4.3,
          location: 'Conference Hall',
          startTime: '19:00',
          endTime: '21:00',
          date: '2023-02-25',
        },
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
      events: [
        {
          name: 'Cloud Expo',
          inPerson: 60,
          virtual: 50,
          rating: 4.6,
          location: 'Exhibition Center',
          startTime: '10:00',
          endTime: '18:00',
          date: '2023-03-05',
        },
        {
          name: 'Marketing Webinar',
          inPerson: 20,
          virtual: 90,
          rating: 4.1,
          location: 'Online',
          startTime: '14:00',
          endTime: '15:00',
          date: '2023-03-12',
        },
        {
          name: 'Startup Pitch Competition',
          inPerson: 40,
          virtual: 70,
          rating: 4.4,
          location: 'Incubator Space',
          startTime: '18:00',
          endTime: '21:00',
          date: '2023-03-19',
        },
      ],
    },
  };

  const [expandedEvents, setExpandedEvents] = useState({});

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
    name: currentData.events[0].name,
    virtual: currentData.virtual,
    inPerson: currentData.inPerson,
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
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={currentData.breakdown}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {currentData.breakdown.map(entry => (
                  <Cell key={`cell-${entry}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ margin: '20px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', color: '#666' }}>Total Number of Attendees</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{totalValue}</div>
          </div>
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
                {barData.map(entry => (
                  <Cell key={`cell-${entry}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
          Event Name: <strong>{mostPopularEvent.name}</strong>
        </p>
        <p>
          Virtual Attendance: <strong>{mostPopularEvent.virtual}</strong>
        </p>
        <p>
          In-Person Attendance: <strong>{mostPopularEvent.inPerson}</strong>
        </p>
        <p>
          Total Attendance: <strong>{mostPopularEvent.total}</strong>
        </p>
      </div>
      <div
        style={{
          marginTop: '20px',
          padding: '10px',
          border: '2px solid #ddd',
          borderRadius: '8px',
          background: '#fff',
        }}
      >
        <h3>Events in {selectedMonth}</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {currentData.events.map((event, index) => (
            <li
              key={event}
              style={{
                padding: '10px',
                marginBottom: '5px',
                borderRadius: '8px',
                background: '#f1f1f1',
              }}
            >
              <div
                style={{ fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => setExpandedEvents(prev => ({ ...prev, [index]: !prev[index] }))}
              >
                {event.name} {expandedEvents[index] ? '▲' : '▼'}
              </div>
              {expandedEvents[index] && (
                <div style={{ marginTop: '10px', fontSize: '0.9em' }}>
                  <p>Date: {event.date}</p>
                  <p>
                    Time: {event.startTime} - {event.endTime}
                  </p>
                  <p>Location: {event.location}</p>
                  <p>In-Person Attendance: {event.inPerson}</p>
                  <p>Virtual Attendance: {event.virtual}</p>
                  <p>Rating: {event.rating}/5</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
