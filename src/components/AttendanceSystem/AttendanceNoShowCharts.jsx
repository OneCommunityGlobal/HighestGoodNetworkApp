/* eslint-disable react/jsx-one-expression-per-line */

'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ENDPOINTS } from '~/utils/URL';
import { events as mockEvents } from './mockData';
import styles from './AttendanceNoShowCharts.module.css';

const attendanceColors = ['#0088FE', '#FF8042'];
const noShowColors = ['#00C49F', '#FF0000'];

// Status color mapping
const statusColors = {
  Upcoming: '#6b7280', // gray
  'In Progress': '#3b82f6', // blue
  Completed: '#10b981', // green
};

const RADIAN = Math.PI / 180;

// Utility function to parse date and time string
const parseEventDateTime = (dateStr, timeStr) => {
  if (!dateStr) return null;

  try {
    // Parse date (format: YYYY-MM-DD)
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    // Parse time range (format: "HH:MM AM/PM - HH:MM AM/PM")
    if (timeStr) {
      const timeMatch = timeStr.match(
        /(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i,
      );
      if (timeMatch) {
        const [, startHour, startMin, startPeriod, endHour, endMin, endPeriod] = timeMatch;

        // Convert to 24-hour format
        const convertTo24Hour = (hour, period) => {
          let h = parseInt(hour, 10);
          if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
          if (period.toUpperCase() === 'AM' && h === 12) h = 0;
          return h;
        };

        const startHour24 = convertTo24Hour(startHour, startPeriod);
        const endHour24 = convertTo24Hour(endHour, endPeriod);

        const startDateTime = new Date(date);
        startDateTime.setHours(startHour24, parseInt(startMin, 10), 0, 0);

        const endDateTime = new Date(date);
        endDateTime.setHours(endHour24, parseInt(endMin, 10), 0, 0);

        return { startDateTime, endDateTime };
      }
    }

    // If no time, use start and end of day
    const startDateTime = new Date(date);
    startDateTime.setHours(0, 0, 0, 0);
    const endDateTime = new Date(date);
    endDateTime.setHours(23, 59, 59, 999);

    return { startDateTime, endDateTime };
  } catch (error) {
    return null;
  }
};

// Calculate event status based on current time and event timestamps
const calculateEventStatus = event => {
  const now = new Date();
  const dateTime = parseEventDateTime(event.date, event.time);

  // If we have explicit status and can't parse dates, use the provided status
  if (!dateTime && event.status) {
    return event.status;
  }

  if (!dateTime) {
    return 'Unknown';
  }

  const { startDateTime, endDateTime } = dateTime;

  if (now < startDateTime) {
    return 'Upcoming';
  }
  if (now >= startDateTime && now <= endDateTime) {
    return 'In Progress';
  }
  return 'Completed';
};
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
          const transformedEvents = response.data.map(event => {
            const date = event.date || event.eventDate || event.startDate || '';
            const time =
              event.time || event.eventTime || `${event.startTime || ''} - ${event.endTime || ''}`;
            const baseEvent = {
              id: event.id || event._id || String(event.id || event._id),
              name: event.name || event.eventName || 'Unnamed Event',
              registrations: event.registrations || event.totalRegistrations || 0,
              attendees: event.attendees || event.totalAttendees || 0,
              completed: event.completed || event.totalCompleted || 0,
              walkouts: event.walkouts || event.totalWalkouts || 0,
              date,
              time,
              link: event.link || event.eventLink || event.url || '#',
              organizer: event.organizer || event.organizerName || 'Unknown',
              capacity: event.capacity || event.maxCapacity || 0,
              overallRating: event.overallRating || event.rating || 0,
              startDate: event.startDate || date,
              endDate: event.endDate || date,
              startTime: event.startTime || '',
              endTime: event.endTime || '',
            };
            // Calculate status from timestamps if available, otherwise use provided status
            baseEvent.status =
              calculateEventStatus(baseEvent) || event.status || event.eventStatus || 'Unknown';
            return baseEvent;
          });

          setEvents(transformedEvents);
          if (transformedEvents.length > 0) {
            setSelectedEvent(transformedEvents[0]);
          }
        } else if (response.data && response.data.events && Array.isArray(response.data.events)) {
          // Handle nested response structure
          const transformedEvents = response.data.events.map(event => {
            const date = event.date || event.eventDate || event.startDate || '';
            const time =
              event.time || event.eventTime || `${event.startTime || ''} - ${event.endTime || ''}`;
            const baseEvent = {
              id: event.id || event._id || String(event.id || event._id),
              name: event.name || event.eventName || 'Unnamed Event',
              registrations: event.registrations || event.totalRegistrations || 0,
              attendees: event.attendees || event.totalAttendees || 0,
              completed: event.completed || event.totalCompleted || 0,
              walkouts: event.walkouts || event.totalWalkouts || 0,
              date,
              time,
              link: event.link || event.eventLink || event.url || '#',
              organizer: event.organizer || event.organizerName || 'Unknown',
              capacity: event.capacity || event.maxCapacity || 0,
              overallRating: event.overallRating || event.rating || 0,
              startDate: event.startDate || date,
              endDate: event.endDate || date,
              startTime: event.startTime || '',
              endTime: event.endTime || '',
            };
            // Calculate status from timestamps if available, otherwise use provided status
            baseEvent.status =
              calculateEventStatus(baseEvent) || event.status || event.eventStatus || 'Unknown';
            return baseEvent;
          });

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
        // Calculate status for mock events
        const mockEventsWithStatus = mockEvents.map(event => ({
          ...event,
          status: calculateEventStatus(event) || event.status,
        }));
        setEvents(mockEventsWithStatus);
        if (mockEventsWithStatus.length > 0) {
          setSelectedEvent(mockEventsWithStatus[0]);
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

  // Calculate current status for selected event (in case timestamps changed)
  const currentStatus = selectedEvent ? calculateEventStatus(selectedEvent) : 'Unknown';
  const statusColor = statusColors[currentStatus] || '#6b7280';

  // Determine which metrics to show based on status
  const showAttendanceMetrics = currentStatus === 'In Progress' || currentStatus === 'Completed';
  const showCompletionMetrics = currentStatus === 'Completed';
  const showCharts = currentStatus === 'In Progress' || currentStatus === 'Completed';

  // Show loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingTextContainer}>
          <p className={styles.loadingText}>Loading event data...</p>
        </div>
      </div>
    );
  }

  // Show error or no data state
  if (!selectedEvent || events.length === 0) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorTextContainer}>
          <p className={styles.errorText}>No event data available</p>
          {error && <p className={styles.errorMessage}>{error}</p>}
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
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.pageTitle}>Event-wise Attendance Statistics</h1>
        {error && (
          <div className={styles.alertContainer}>
            <p className={styles.alertText}>{error}</p>
          </div>
        )}

        {/* Event Selector */}
        <div className={styles.selectorContainer}>
          <select
            onChange={handleEventChange}
            value={selectedEvent.id}
            className={styles.eventSelect}
          >
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        {/* Event Details Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{selectedEvent.name}</h2>

          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <p className={styles.detailLabel}>Date</p>
              <p className={styles.detailValue}>{selectedEvent.date}</p>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <p className={styles.detailLabel}>Time</p>
              <p className={styles.detailValue}>{selectedEvent.time}</p>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <p className={styles.detailLabel}>Event Link</p>
              <a
                href={selectedEvent.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {selectedEvent.link}
              </a>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <p className={styles.detailLabel}>Organizer</p>
              <p className={styles.detailValue}>{selectedEvent.organizer}</p>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <p className={styles.detailLabel}>Capacity</p>
              <p className={styles.detailValue}>{selectedEvent.capacity}</p>
            </div>

            {showCompletionMetrics && (
              <div className={styles.detailItem}>
                <p className={styles.detailLabel}>Overall Rating</p>
                <p className={styles.detailValue}>{selectedEvent.overallRating} / 5</p>
              </div>
            )}

            <div style={{ marginBottom: '8px' }}>
              <p className={styles.detailLabel}>Status</p>
              <div className={styles.statusContainer}>
                <span
                  className={styles.statusDot}
                  style={{
                    backgroundColor: statusColor,
                  }}
                />
                <p
                  className={styles.statusValue}
                  style={{
                    color: statusColor,
                  }}
                >
                  {currentStatus}
                </p>
              </div>
              {currentStatus === 'In Progress' && (
                <p
                  className={styles.liveMetricsNote}
                  title="Metrics are live and subject to change as the event continues"
                >
                  Live metrics - subject to change
                </p>
              )}
            </div>

            <div className={styles.detailItem}>
              <p className={styles.detailLabel}>Total Registrations</p>
              <p className={styles.detailValue}>{selectedEvent.registrations}</p>
            </div>

            {showAttendanceMetrics && (
              <div className={styles.detailItem}>
                <p className={styles.detailLabel}>
                  Total Attendees
                  {currentStatus === 'In Progress' && (
                    <span
                      className={styles.liveBadge}
                      title="Live attendance count - subject to change"
                    >
                      (Live)
                    </span>
                  )}
                </p>
                <p className={styles.detailValue}>
                  {selectedEvent.attendees} (
                  {calculatePercentage(selectedEvent.attendees, selectedEvent.registrations)})
                </p>
              </div>
            )}

            {showCompletionMetrics && (
              <>
                <div className={styles.detailItem}>
                  <p className={styles.detailLabel}>Completed</p>
                  <p className={styles.detailValue}>
                    {selectedEvent.completed} (
                    {calculatePercentage(selectedEvent.completed, selectedEvent.attendees)})
                  </p>
                </div>

                <div className={styles.detailItem}>
                  <p className={styles.detailLabel}>Walkouts</p>
                  <p className={styles.detailValue}>
                    {selectedEvent.walkouts} (
                    {calculatePercentage(selectedEvent.walkouts, selectedEvent.attendees)})
                  </p>
                </div>
              </>
            )}

            {currentStatus === 'Upcoming' && (
              <div className={styles.upcomingContainer}>
                <p className={styles.upcomingText}>
                  Attendance metrics will be available once the event starts.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        {showCharts && (
          <div className={styles.chartsCard}>
            <h2 className={styles.cardTitle}>
              Attendance and No-Show Breakdown
              {currentStatus === 'In Progress' && (
                <span
                  className={styles.liveDataBadge}
                  title="Charts show live data that may change as the event continues"
                >
                  (Live Data)
                </span>
              )}
            </h2>

            <div className={styles.chartsContainer}>
              {/* Attendance Chart - Only show for In Progress or Completed */}
              {showCompletionMetrics && (
                <div className={styles.chartWrapper}>
                  <h3 className={styles.chartSectionTitle}>Attendance Breakdown</h3>
                  <div className={styles.chartContainer}>
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
              )}

              {/* No-Show Chart */}
              <div className={styles.chartWrapper}>
                <h3 className={styles.chartSectionTitle}>
                  Registration vs Attendance
                  {currentStatus === 'In Progress' && (
                    <span className={styles.chartLiveBadge}>(Live)</span>
                  )}
                </h3>
                <div className={styles.chartContainer}>
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
        )}

        {currentStatus === 'Upcoming' && (
          <div className={styles.upcomingChartsCard}>
            <p className={styles.upcomingChartsText}>
              Charts will be available once the event starts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceNoShowCharts;
