import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import CalendarActivitySection from './CalendarActivitySection';
import './CommunityCalendar.css';

function CommunityCalendar() {
  const [filter, setFilter] = useState({ type: 'all', location: 'all', status: 'all' });

  const mockEvents = [
    {
      id: 1,
      title: 'Event 1',
      type: 'Workshop',
      location: 'Virtual',
      time: '10:00 AM',
      date: new Date(2025, 0, 27),
      status: 'New',
      description: 'Detailed description of Event 1.',
    },
    {
      id: 2,
      title: 'Event 2',
      type: 'Meeting',
      location: 'In person',
      time: '2:00 PM',
      date: new Date(2025, 0, 31),
      status: 'Needs Attendees',
      description: 'Detailed description of Event 2.',
    },
    {
      id: 3,
      title: 'Event 3',
      type: 'Workshop',
      location: 'Virtual',
      time: '12:00 PM',
      date: new Date(2025, 0, 28),
      status: 'New',
      description: 'Detailed description of Event 3.',
    },
    {
      id: 4,
      title: 'Event 4',
      type: 'Webinar',
      location: 'Virtual',
      time: '3:00 AM',
      date: new Date(2025, 0, 3),
      status: 'Full',
      description: 'Detailed description of Event 4.',
    },
    {
      id: 5,
      title: 'Event 5',
      type: 'Social Gathering',
      location: 'In person',
      time: '11:00 AM',
      date: new Date(2025, 0, 28),
      status: 'Filling Fast',
      description: 'Detailed description of Event 5.',
    },
  ];

  const filteredEvents = mockEvents.filter(
    event =>
      (filter.type === 'all' || event.type === filter.type) &&
      (filter.location === 'all' || event.location === filter.location) &&
      (filter.status === 'all' || event.status === filter.status),
  );

  // Helper function: Render events for a specific date
  const getEventsForDate = date => {
    return filteredEvents.filter(
      event =>
        event.date.getFullYear() === date.getFullYear() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getDate() === date.getDate(),
    );
  };

  // Define tileContent outside the component's render logic
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const eventsForTile = getEventsForDate(date).map(event => (
        <div key={event.id} className="event-item">
          {event.title}
        </div>
      ));
      return eventsForTile.length > 0 ? <div className="tile-events">{eventsForTile}</div> : null;
    }
    return null;
  };

  // Define tileClassName outside the component's render logic
  const tileClassName = ({ date, view }) => {
    if (
      view === 'month' &&
      filteredEvents.some(
        event =>
          event.date.getFullYear() === date.getFullYear() &&
          event.date.getMonth() === date.getMonth() &&
          event.date.getDate() === date.getDate(),
      )
    ) {
      return 'has-events';
    }
    return null;
  };

  return (
    <div className="community-calendar">
      <header className="calendar-header">
        <h1>Community Calendar</h1>
        <div className="filters">
          <select
            value={filter.type}
            onChange={e => setFilter({ ...filter, type: e.target.value })}
          >
            <option value="all">All Types</option>
            <option value="Workshop">Workshop</option>
            <option value="Meeting">Meeting</option>
            <option value="Webinar">Webinar</option>
            <option value="Social Gathering">Social Gathering</option>
          </select>

          <select
            value={filter.location}
            onChange={e => setFilter({ ...filter, location: e.target.value })}
          >
            <option value="all">All Locations</option>
            <option value="Virtual">Virtual</option>
            <option value="In person">In person</option>
          </select>

          <select
            value={filter.status}
            onChange={e => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Needs Attendees">Needs Attendees</option>
            <option value="Filling Fast">Filling Fast</option>
            <option value="Full">Full</option>
          </select>
        </div>
      </header>
      <main className="calendar-main">
        <div className="calendar-container">
          <div className="calendar-activity-section">
            <CalendarActivitySection />
          </div>
          <div className="calendar-section">
            <Calendar
              className="react-calendar"
              tileContent={tileContent}
              tileClassName={tileClassName}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default CommunityCalendar;
