import { useState } from 'react';
import styles from './styles.module.css';

function MyEvent() {
  const mockEvents = [
    {
      date: '2024-08-08',
      day: 'Thu',
      event: 'Event Name',
      time: '9:00 AM - 11:30 AM',
      status: 'Active',
      registration: '12/15',
      resource: 'Pending',
      location: '2908, HGN bld',
    },
    {
      date: '2024-08-09',
      day: 'Fri',
      event: 'Event Name',
      time: '1:00 PM - 3:00 PM',
      status: 'Closed',
      registration: '15/15',
      resource: 'Completed',
      location: '2908, HGN bld',
    },
    {
      date: '2024-08-10',
      day: 'Sat',
      event: 'Event Name',
      time: '10:00 AM - 12:00 PM',
      status: 'Cancelled',
      registration: '10/15',
      resource: 'Pending',
      location: '2908, HGN bld',
    },
  ];

  const [filters, setFilters] = useState({
    date: '',
    eventType: '',
    location: '',
  });

  const [filteredEvents, setFilteredEvents] = useState(mockEvents);
  const [view, setView] = useState('list');

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    const filtered = mockEvents.filter(event => {
      return (
        (!filters.date || event.date === filters.date) &&
        (!filters.eventType ||
          event.event.toLowerCase().includes(filters.eventType.toLowerCase())) &&
        (!filters.location || event.location.toLowerCase().includes(filters.location.toLowerCase()))
      );
    });
    setFilteredEvents(filtered);
  };

  const displayListView = () => (
    <table className={`${styles.myEventsTable}`}>
      <thead>
        <tr>
          <th>Date</th>
          <th>Event</th>
          <th>Status</th>
          <th>Registration</th>
          <th>Resources</th>
          <th>Location</th>
        </tr>
      </thead>
      <tbody>
        {filteredEvents.map(event => (
          <tr key={event.date}>
            {' '}
            {/* Use event.date as the key */}
            <td>
              <div className={`${styles.dateBox}`}>
                <span className={`${styles.day}`}>{event.day}</span>
                <span className={`${styles.date}`}>{event.date.split('-')[2]}</span>
              </div>
            </td>
            <td>
              {event.event}
              <div className={`${styles.eventTime}`}>{event.time}</div>
            </td>
            <td className={`${styles.status} ${styles[event.status.toLowerCase()]}`}>
              {event.status}
            </td>
            <td>{event.registration}</td>
            <td className={`${styles.resource} ${styles[event.resource.toLowerCase()]}`}>
              {event.resource}
            </td>
            <td>{event.location}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const displayCalendarView = () => (
    <div className="calendarView">
      <h3>Calendar View</h3>
      <p>Events displayed in a calendar format will go here.</p>
    </div>
  );

  return (
    <div className={`${styles.myEvent}`}>
      <h2 className={styles.headerTitle}>My Event</h2>
      <div className={`${styles.eventControls}`}>
        <div className={`${styles.viewToggle}`}>
          <button
            type="button"
            className={view === 'list' ? styles.activeView : styles.inactiveView}
            onClick={() => setView('list')}
          >
            List
          </button>
          <button
            type="button"
            className={view === 'calendar' ? styles.activeView : styles.inactiveView}
            onClick={() => setView('calendar')}
          >
            Calendar
          </button>
        </div>
        <div className={`${styles.filterControls}`}>
          <select name="date" onChange={handleFilterChange} value={filters.date}>
            <option value="">Select Date</option>
            <option value="2024-08-08">Thu 08</option>
            <option value="2024-08-09">Fri 09</option>
            <option value="2024-08-10">Sat 10</option>
          </select>
          <select name="eventType" onChange={handleFilterChange} value={filters.eventType}>
            <option value="">Select Event Type</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
            <option value="Conference">Conference</option>
          </select>
          <select name="location" onChange={handleFilterChange} value={filters.location}>
            <option value="">Select Location</option>
            <option value="2908, HGN bld">2908, HGN bld</option>
            <option value="1234, ABC Center">1234, ABC Center</option>
          </select>
          <button
            type="button"
            onClick={handleApplyFilters}
            className={`${styles.applyFiltersBtn}`}
          >
            Apply Filters
          </button>
          <button type="button" className={`${styles.createNewBtn}`}>
            + Create New
          </button>
        </div>
      </div>
      <div className="eventDisplayOption">
        {view === 'list' ? displayListView() : displayCalendarView()}
      </div>
    </div>
  );
}

export default MyEvent;
