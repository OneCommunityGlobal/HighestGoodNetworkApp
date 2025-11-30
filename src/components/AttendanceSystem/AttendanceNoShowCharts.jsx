/* eslint-disable react/jsx-one-expression-per-line */

'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Header from '../Header/Header';
import styles from './AttendanceNoShowCharts.module.css';

const events = [
  {
    id: '1',
    name: 'Conference A',
    registrations: 100,
    attendees: 78,
    completed: 75,
    walkouts: 5,
    date: '2023-06-15',
    time: '09:00 AM - 05:00 PM',
    link: 'https://conferencea.com',
    organizer: 'Tech Events Inc.',
    capacity: 150,
    overallRating: 4.5,
    status: 'Completed',
  },
  {
    id: '2',
    name: 'Workshop B',
    registrations: 50,
    attendees: 44,
    completed: 38,
    walkouts: 2,
    date: '2023-07-22',
    time: '10:00 AM - 02:00 PM',
    link: 'https://workshopb.com',
    organizer: 'Skill Builders LLC',
    capacity: 50,
    overallRating: 4.8,
    status: 'Upcoming',
  },
  {
    id: '3',
    name: 'Seminar C',
    registrations: 75,
    attendees: 63,
    completed: 55,
    walkouts: 5,
    date: '2023-08-05',
    time: '02:00 PM - 06:00 PM',
    link: 'https://seminarc.com',
    organizer: 'Knowledge Share Co.',
    capacity: 100,
    overallRating: 4.2,
    status: 'In Progress',
  },
];

const attendanceColors = ['#0088FE', '#FF8042'];
const noShowColors = ['#00C49F', '#FF0000'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="black"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize="12"
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

function AttendanceNoShowCharts() {
  const [selectedEvent, setSelectedEvent] = useState(events[0]);

  const handleEventChange = e => {
    const newEvt = events.find(evt => evt.id === e.target.value);
    setSelectedEvent(newEvt);
  };

  const calculatePercentage = (value, total) => `${((value / total) * 100).toFixed(1)}%`;

  const attendanceData = [
    { name: 'Completed', value: selectedEvent.completed },
    { name: 'Walkouts', value: selectedEvent.walkouts },
  ];

  const noShowData = [
    { name: 'Attendees', value: selectedEvent.attendees },
    { name: 'No-Shows', value: selectedEvent.registrations - selectedEvent.attendees },
  ];

  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Event-wise Attendance Statistics</h1>

          {/* Event Selector */}
          <select onChange={handleEventChange} value={selectedEvent.id} className={styles.select}>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>

          {/* Event Details Card */}
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>{selectedEvent.name}</h2>

            <div className={styles.detailsGrid}>
              <div>
                <p className={styles.detailLabel}>Date</p>
                <p className={styles.detailValue}>{selectedEvent.date}</p>
              </div>

              <div>
                <p className={styles.detailLabel}>Time</p>
                <p className={styles.detailValue}>{selectedEvent.time}</p>
              </div>

              <div>
                <p className={styles.detailLabel}>Event Link</p>
                <a
                  href={selectedEvent.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.eventLink}
                >
                  {selectedEvent.link}
                </a>
              </div>

              <div>
                <p className={styles.detailLabel}>Organizer</p>
                <p className={styles.detailValue}>{selectedEvent.organizer}</p>
              </div>

              <div>
                <p className={styles.detailLabel}>Capacity</p>
                <p className={styles.detailValue}>{selectedEvent.capacity}</p>
              </div>

              <div>
                <p className={styles.detailLabel}>Overall Rating</p>
                <p className={styles.detailValue}>{selectedEvent.overallRating} / 5</p>
              </div>

              <div>
                <p className={styles.detailLabel}>Status</p>
                <p className={styles.detailValue}>{selectedEvent.status}</p>
              </div>

              <div>
                <p className={styles.detailLabel}>Total Registrations</p>
                <p className={styles.detailValue}>{selectedEvent.registrations}</p>
              </div>

              <div>
                <p className={styles.detailLabel}>Total Attendees</p>
                <p className={styles.detailValue}>
                  {selectedEvent.attendees} (
                  {calculatePercentage(selectedEvent.attendees, selectedEvent.registrations)})
                </p>
              </div>

              <div>
                <p className={styles.detailLabel}>Completed</p>
                <p className={styles.detailValue}>
                  {selectedEvent.completed} (
                  {calculatePercentage(selectedEvent.completed, selectedEvent.attendees)})
                </p>
              </div>

              <div>
                <p className={styles.detailLabel}>Walkouts</p>
                <p className={styles.detailValue}>
                  {selectedEvent.walkouts} (
                  {calculatePercentage(selectedEvent.walkouts, selectedEvent.attendees)})
                </p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Attendance and No-Show Breakdown</h2>

            <div className={styles.chartsContainer}>
              {/* Attendance Chart */}
              <div className={styles.chartBlock}>
                <h3 className={styles.chartTitle}>Attendance Breakdown</h3>
                <div className={styles.chartArea}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius="70%"
                        dataKey="value"
                      >
                        {attendanceData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={attendanceColors[index % attendanceColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* No-Show Chart */}
              <div className={styles.chartBlock}>
                <h3 className={styles.chartTitle}>Registration vs Attendance</h3>
                <div className={styles.chartArea}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={noShowData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius="70%"
                        dataKey="value"
                      >
                        {noShowData.map((entry, index) => (
                          <Cell key={entry.name} fill={noShowColors[index % noShowColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AttendanceNoShowCharts;
