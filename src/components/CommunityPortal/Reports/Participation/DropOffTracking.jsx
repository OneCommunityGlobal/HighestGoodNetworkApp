import { useState } from 'react';
import { useSelector } from 'react-redux';
import './Participation.css';
import mockEvents from './mockData';

function DropOffTracking() {
  const [selectedEvent, setSelectedEvent] = useState('All Events');
  const [selectedTime, setSelectedTime] = useState('All Time');

  const getDateRange = () => {
    const today = new Date();
    let startDate, endDate;

    if (selectedTime === 'Today') {
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    } else if (selectedTime === 'This Week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (selectedTime === 'This Month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  };

  const filteredEvents = mockEvents.filter(event => {
    if (selectedEvent !== 'All Events' && event.eventType !== selectedEvent) {
      return false;
    }
    if (selectedTime !== 'All Time') {
      const { startDate, endDate } = getDateRange();
      const eventDate = new Date(event.eventDate);
      return eventDate >= startDate && eventDate <= endDate;
    }
    return true;
  });

  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div className={`tracking-container ${darkMode ? 'tracking-container-dark' : ''}`}>
      <div className={`tracking-header ${darkMode ? 'tracking-header-dark' : ''}`}>
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
        <div className={`tracking-rate ${darkMode ? 'tracking-rate-dark' : ''}`}>
          <p className="tracking-rate-value">
            +5% <span>Last week</span>
          </p>
          <p className="tracking-rate-subheading">
            <span> Drop-off rate</span>
          </p>
        </div>
        <div className={`tracking-rate ${darkMode ? 'tracking-rate-dark' : ''}`}>
          <p className="tracking-rate-value">
            +5% <span>Last week</span>
          </p>
          <p className="tracking-rate-subheading">
            <span> No-show rate </span>
          </p>
        </div>
      </div>

      <div className={`tracking-list-container ${darkMode ? 'tracking-list-container-dark' : ''}`}>
        <table className={`tracking-table ${darkMode ? 'tracking-table-dark' : ''}`}>
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
