import { useState } from 'react';
import './Participation.css';
import mockEvents from './mockData';

function DropOffTracking() {
  const [selectedEvent, setSelectedEvent] = useState('All Events');
  const [selectedTime, setSelectedTime] = useState('All Time');

  const getDateRange = () => {
    const today = new Date();
    let startDate;
    let endDate;

    if (selectedTime === 'Today') {
      startDate = new Date(today);
      // Start of the day
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today);
      // End of the day
      endDate.setHours(23, 59, 59, 999);
    } else if (selectedTime === 'This Week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
      // Start of the week
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      // End of the week
      endDate.setHours(23, 59, 59, 999);
    } else if (selectedTime === 'This Month') {
      // Start of the month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      // End of the month
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  };

  // Filter events based on selected filters
  const filteredEvents = mockEvents.filter(event => {
    // Filter by event type
    if (selectedEvent !== 'All Events' && event.eventType !== selectedEvent) {
      return false;
    }

    // Filter by date range
    if (selectedTime !== 'All Time') {
      const { startDate, endDate } = getDateRange();
      const eventDate = new Date(event.eventTime.split(' pm ')[1]);
      if (startDate && endDate) {
        return eventDate >= startDate && eventDate <= endDate;
      }
    }

    return true;
  });

  return (
    <div className="tracking-container">
      <div className="tracking-header">
        <h3>Drop-off and no-show rate tracking</h3>
        <div className="tracking-filters">
          <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
            <option value="All Events">All Events</option>
            <option value="Yoga Class">Yoga Class</option>
            <option value="Cooking Workshop">Cooking Workshop</option>
            <option value="Dance Class">Dance Class</option>
            <option value="Fitness Bootcamp">Fitness Bootcamp</option>
          </select>
          <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)}>
            <option value="All Time">All Time</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
          </select>
        </div>
      </div>
      <div className="tracking-summary">
        <div className="tracking-rate">
          <p className="tracking-rate-value">
            +5% <span>Last week</span>
          </p>
          <p>Drop-off rate</p>
        </div>
        <div className="tracking-rate">
          <p className="tracking-rate-value">
            +5% <span>Last week</span>
          </p>
          <p>No-show rate</p>
        </div>
      </div>
      <div className="tracking-list-container">
        <table className="tracking-table">
          <thead>
            <tr>
              <th>Event name</th>
              <th>No-show rate</th>
              <th>Drop-off rate</th>
              <th>Attendees</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map(event => (
              <tr key={event.id}>
                <td>{event.eventName}</td>
                <td className="tracking-rate-green">{event.noShowRate}</td>
                <td className="tracking-rate-red">{event.dropOffRate}</td>
                <td>{event.attendees}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DropOffTracking;
