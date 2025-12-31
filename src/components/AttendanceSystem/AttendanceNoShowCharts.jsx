/* eslint-disable react/jsx-one-expression-per-line */

'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ENDPOINTS } from '~/utils/URL';
import { events as mockEvents } from './mockData';

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
  const [events, setEvents] = useState(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch events data from backend
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(ENDPOINTS.EVENT_ATTENDANCE_STATS);

        // Check if response has data in expected format
        if (response.data && Array.isArray(response.data)) {
          // Transform API data to match mock data format if needed
          const transformedEvents = response.data.map(event => ({
            id: event.id || event._id || String(event.id || event._id),
            name: event.name || event.eventName || 'Unnamed Event',
            registrations: event.registrations || event.totalRegistrations || 0,
            attendees: event.attendees || event.totalAttendees || 0,
            completed: event.completed || event.totalCompleted || 0,
            walkouts: event.walkouts || event.totalWalkouts || 0,
            date: event.date || event.eventDate || event.startDate || '',
            time:
              event.time || event.eventTime || `${event.startTime || ''} - ${event.endTime || ''}`,
            link: event.link || event.eventLink || event.url || '#',
            organizer: event.organizer || event.organizerName || 'Unknown',
            capacity: event.capacity || event.maxCapacity || 0,
            overallRating: event.overallRating || event.rating || 0,
            status: event.status || event.eventStatus || 'Unknown',
          }));

          setEvents(transformedEvents);
          if (transformedEvents.length > 0) {
            setSelectedEvent(transformedEvents[0]);
          }
        } else if (response.data && response.data.events && Array.isArray(response.data.events)) {
          // Handle nested response structure
          const transformedEvents = response.data.events.map(event => ({
            id: event.id || event._id || String(event.id || event._id),
            name: event.name || event.eventName || 'Unnamed Event',
            registrations: event.registrations || event.totalRegistrations || 0,
            attendees: event.attendees || event.totalAttendees || 0,
            completed: event.completed || event.totalCompleted || 0,
            walkouts: event.walkouts || event.totalWalkouts || 0,
            date: event.date || event.eventDate || event.startDate || '',
            time:
              event.time || event.eventTime || `${event.startTime || ''} - ${event.endTime || ''}`,
            link: event.link || event.eventLink || event.url || '#',
            organizer: event.organizer || event.organizerName || 'Unknown',
            capacity: event.capacity || event.maxCapacity || 0,
            overallRating: event.overallRating || event.rating || 0,
            status: event.status || event.eventStatus || 'Unknown',
          }));

          setEvents(transformedEvents);
          if (transformedEvents.length > 0) {
            setSelectedEvent(transformedEvents[0]);
          }
        } else {
          // If data format doesn't match, fall back to mock data
          throw new Error('Unexpected data format from API');
        }
      } catch (err) {
        // Fall back to mock data if API is unavailable or returns error
        // eslint-disable-next-line no-console
        console.warn('Failed to fetch events from API, using mock data:', err.message);
        setEvents(mockEvents);
        if (mockEvents.length > 0) {
          setSelectedEvent(mockEvents[0]);
        }
        setError('Using mock data - API endpoint not available');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Update selectedEvent when events change
  useEffect(() => {
    if (events.length > 0 && !selectedEvent) {
      setSelectedEvent(events[0]);
    }
  }, [events, selectedEvent]);

  const handleEventChange = e => {
    const selectedEventId = e.target.value;
    const newSelectedEvent = events.find(event => event.id === selectedEventId);
    if (newSelectedEvent) {
      setSelectedEvent(newSelectedEvent);
    }
  };

  const calculatePercentage = (value, total) => {
    if (!total || total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  // Show loading state
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f9fafb',
          padding: '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading event data...</p>
        </div>
      </div>
    );
  }

  // Show error or no data state
  if (!selectedEvent || events.length === 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f9fafb',
          padding: '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>No event data available</p>
          {error && <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>{error}</p>}
        </div>
      </div>
    );
  }

  const attendanceData = [
    { name: 'Completed', value: selectedEvent.completed },
    { name: 'Walkouts', value: selectedEvent.walkouts },
  ];

  const noShowData = [
    { name: 'Attendees', value: selectedEvent.attendees },
    { name: 'No-Shows', value: selectedEvent.registrations - selectedEvent.attendees },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '16px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.6,
        color: '#333',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#111827',
            marginBottom: '24px',
          }}
        >
          Event-wise Attendance Statistics
        </h1>
        {error && (
          <div
            style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '24px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Event Selector */}
        <div style={{ marginBottom: '24px' }}>
          <select
            onChange={handleEventChange}
            value={selectedEvent.id}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              outline: 'none',
            }}
          >
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        {/* Event Details Card */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '24px',
            }}
          >
            {selectedEvent.name}
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '4px',
                }}
              >
                Date
              </p>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                }}
              >
                {selectedEvent.date}
              </p>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '4px',
                }}
              >
                Time
              </p>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                }}
              >
                {selectedEvent.time}
              </p>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '4px',
                }}
              >
                Event Link
              </p>
              <a
                href={selectedEvent.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#2563eb',
                  textDecoration: 'none',
                  wordBreak: 'break-all',
                }}
                onMouseOver={e => {
                  e.target.style.textDecoration = 'underline';
                }}
                onMouseOut={e => {
                  e.target.style.textDecoration = 'none';
                }}
                onFocus={e => {
                  e.target.style.textDecoration = 'underline';
                }}
                onBlur={e => {
                  e.target.style.textDecoration = 'none';
                }}
              >
                {selectedEvent.link}
              </a>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '4px',
                }}
              >
                Organizer
              </p>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                }}
              >
                {selectedEvent.organizer}
              </p>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '4px',
                }}
              >
                Capacity
              </p>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                }}
              >
                {selectedEvent.capacity}
              </p>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '4px',
                }}
              >
                Overall Rating
              </p>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                }}
              >
                <p>
                  {selectedEvent.overallRating}
                  {' / 5'}
                </p>
              </p>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '4px',
                }}
              >
                Status
              </p>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                }}
              >
                {selectedEvent.status}
              </p>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '4px',
                }}
              >
                Total Registrations
              </p>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                }}
              >
                {selectedEvent.registrations}
              </p>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '4px',
                }}
              >
                Total Attendees
              </p>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                }}
              >
                {selectedEvent.attendees} (
                {calculatePercentage(selectedEvent.attendees, selectedEvent.registrations)})
              </p>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '4px',
                }}
              >
                Completed
              </p>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                }}
              >
                {selectedEvent.completed} (
                {calculatePercentage(selectedEvent.completed, selectedEvent.attendees)})
              </p>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '4px',
                }}
              >
                Walkouts
              </p>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                }}
              >
                {selectedEvent.walkouts} (
                {calculatePercentage(selectedEvent.walkouts, selectedEvent.attendees)})
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '24px',
          }}
        >
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '24px',
            }}
          >
            Attendance and No-Show Breakdown
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
            }}
            className="charts-container"
          >
            {/* Attendance Chart */}
            <div style={{ width: '100%' }}>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#111827',
                  marginBottom: '12px',
                  textAlign: 'center',
                }}
              >
                Attendance Breakdown
              </h3>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius="70%"
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {attendanceData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}`}
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
            <div style={{ width: '100%' }}>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#111827',
                  marginBottom: '12px',
                  textAlign: 'center',
                }}
              >
                Registration vs Attendance
              </h3>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={noShowData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius="70%"
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {noShowData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={noShowColors[index % noShowColors.length]}
                        />
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

      <style>
        {`
        @media (min-width: 768px) {
          .charts-container {
            flex-direction: row !important;
            justify-content: space-between;
          }
          .charts-container > div {
            width: 48% !important;
          }
        }

        @media (max-width: 480px) {
          h1 {
            font-size: 20px !important;
          }
          h2 {
            font-size: 20px !important;
          }
          h3 {
            font-size: 16px !important;
          }
        }
      `}
      </style>
    </div>
  );
}

export default AttendanceNoShowCharts;
