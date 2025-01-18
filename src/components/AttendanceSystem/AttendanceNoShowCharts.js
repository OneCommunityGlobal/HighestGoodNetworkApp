import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const events = [
  { id: "1", name: "Conference A", registrations: 100, attendees: 78, present: 75, absent: 5 },
  { id: "2", name: "Workshop B", registrations: 50, attendees: 44, present: 38, absent: 2 },
  { id: "3", name: "Seminar C", registrations: 75, attendees: 63, present: 55, absent: 5 },
];

const attendanceColors = ["#0088FE", "#FF8042"];
const noShowColors = ["#82ca9d", "#FF6347"];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

const AttendanceNoShowCharts = () => {
  const [selectedEvent, setSelectedEvent] = useState(events[0]);

  const handleEventChange = (e) => {
    const selectedEventId = e.target.value;
    const newSelectedEvent = events.find(event => event.id === selectedEventId);
    setSelectedEvent(newSelectedEvent);
  };

  const calculatePercentage = (value, total) => {
    return ((value / total) * 100).toFixed(1) + '%';
  };

  const attendanceData = [
    { name: 'Present', value: selectedEvent.present },
    { name: 'Absent', value: selectedEvent.absent },
  ];

  const noShowData = [
    { name: 'Attendees', value: selectedEvent.attendees },
    { name: 'No-Shows', value: selectedEvent.registrations - selectedEvent.attendees },
  ];

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.6,
      color: '#333',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Event-wise Attendance Statistics</h1>
      <div style={{ marginBottom: '20px' }}>
        <select 
          onChange={handleEventChange} 
          value={selectedEvent.id} 
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
          }}
        >
          {events.map(event => (
            <option key={event.id} value={event.id}>{event.name}</option>
          ))}
        </select>
      </div>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '20px',
        marginBottom: '20px',
      }}>
        <h2 style={{ fontSize: '1.5em', marginBottom: '10px' }}>{selectedEvent.name} Summary</h2>
        <p style={{ fontSize: '1em', color: '#666', marginBottom: '20px' }}>Key statistics for the selected event</p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
        }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Total Registrations</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedEvent.registrations}</p>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Total Attendees</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {selectedEvent.attendees} ({calculatePercentage(selectedEvent.attendees, selectedEvent.registrations)})
            </p>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Present</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {selectedEvent.present} ({calculatePercentage(selectedEvent.present, selectedEvent.attendees)})
            </p>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Absent</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {selectedEvent.absent} ({calculatePercentage(selectedEvent.absent, selectedEvent.attendees)})
            </p>
          </div>
        </div>
      </div>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '20px',
        marginBottom: '20px',
      }}>
        <h2 style={{ fontSize: '1.5em', marginBottom: '20px' }}>Attendance and No-Show Breakdown</h2>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
          gap: '20px',
        }}>
          <div style={{ flexGrow: 1, height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={attendanceColors[index % attendanceColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flexGrow: 1, height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={noShowData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {noShowData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={noShowColors[index % noShowColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <style>
        {`
          @media (max-width: 768px) {
            div > div:last-child > div {
              flex-direction: column;
            }
            div > div:last-child > div > div {
              max-width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AttendanceNoShowCharts;

