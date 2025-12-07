import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Input } from 'reactstrap';
import styles from './CPDashboard.module.css';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserAlt } from 'react-icons/fa';
import { ENDPOINTS } from '../../utils/URL';
import axios from 'axios';

export function CPDashboard() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    const mockEvents = [
      {
        id: 1,
        title: 'PGSA Lunch Talks',
        date: '2025-11-08T12:00:00',
        location: 'Disque 919',
        organizer: 'Physics Graduate Student Association',
        image: 'https://via.placeholder.com/300',
      },
      {
        id: 2,
        title: 'Hot Chocolate/Bake Sale',
        date: '2025-11-15T12:00:00',
        location: 'G.C LeBow - Lobby Tabling Space 2',
        organizer: 'Kappa Phi Gamma, Sorority Inc.',
        image: 'https://via.placeholder.com/300',
      },
      {
        id: 3,
        title: 'Holiday Lunch',
        date: '2025-11-22T12:00:00',
        location: 'Hill Conference Room',
        organizer: 'Chemical and Biological Engineering Graduate Society',
        image: 'https://via.placeholder.com/300',
      },
    ];
    setEvents(mockEvents);
    setFilteredEvents(mockEvents);
  }, []);

  useEffect(() => {
    let filtered = [...events];
    const today = new Date();

    if (selectedDateFilter === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      filtered = events.filter(event => isSameDay(new Date(event.date), tomorrow));
    } else if (selectedDateFilter === 'weekend') {
      const today = new Date();
      const dayOfWeek = today.getDay();

      const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
      const saturday = new Date(today);
      saturday.setDate(today.getDate() + daysUntilSaturday);

      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);

      filtered = events.filter(event => {
        const eventDate = parseToLocalDate(event.date);
        return eventDate >= parseToLocalDate(saturday) && eventDate <= parseToLocalDate(sunday);
      });
    } else if (customDate) {
      filtered = events.filter(event => isSameDay(event.date, customDate));
    }

    setFilteredEvents(filtered);
  }, [selectedDateFilter, customDate, events]);

  function parseToLocalDate(dateInput) {
    if (!dateInput) return null;

    if (dateInput instanceof Date)
      return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [year, month, day] = dateInput.split('-').map(Number);
      return new Date(year, month - 1, day);
    }

    const d = new Date(dateInput);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function isSameDay(date1, date2) {
    const d1 = parseToLocalDate(date1);
    const d2 = parseToLocalDate(date2);
    return d1 && d2 && d1.getTime() === d2.getTime();
  }

  const formatDateForUI = dateString => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Container className={styles['dashboard-container']}>
      <header className={styles['dashboard-header']}>
        <h1>All Events</h1>
        <div className={styles['dashboard-controls']}>
          <div className={styles['dashboard-search-container']}>
            <Input
              type="search"
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles['dashboard-search']}
            />
          </div>
        </div>
      </header>

      <Row>
        <Col md={3} className={styles['dashboard-sidebar']}>
          <div className={styles['filter-section']}>
            <h4>Search Filters</h4>
            <div className="filter-item">
              <label htmlFor="date-tomorrow"> Dates</label>
              <div className="filter-options-horizontal">
                <div>
                  <Input
                    type="radio"
                    name="dates"
                    checked={selectedDateFilter === 'tomorrow'}
                    onClick={() => {
                      setSelectedDateFilter(prev => (prev === 'tomorrow' ? '' : 'tomorrow'));
                      setCustomDate('');
                    }}
                  />{' '}
                  Tomorrow
                </div>
                <Input type="date" placeholder="Ending After" className={styles['date-filter']} />
              </div>
              <div className={styles['filter-item']}>
                <label htmlFor="online-only">Online</label>
                <div>
                  <Input
                    type="radio"
                    name="dates"
                    checked={selectedDateFilter === 'weekend'}
                    onClick={() => {
                      setSelectedDateFilter(prev => (prev === 'weekend' ? '' : 'weekend'));
                      setCustomDate('');
                    }}
                  />{' '}
                  This Weekend
                </div>
              </div>
              <Input
                type="date"
                value={customDate}
                onChange={e => {
                  setSelectedDateFilter('');
                  setCustomDate(e.target.value);
                }}
                className="date-filter"
              />
            </div>
            <div className="filter-item">
              <label htmlFor="online-only">Online</label>
              <div>
                <Input type="checkbox" /> Online Only
              </div>
            </div>
          </div>
        </Col>

        <Col md={9} className={styles['dashboard-main']}>
          <h2 className={styles['section-title']}>Events</h2>
          <Row>
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <Col md={4} key={event.id} className="event-card-col">
                  <Card className="event-card">
                    <div className="event-card-img-container">
                      <img src={event.image} alt={event.title} className="event-card-img" />
                    </div>
                    <CardBody>
                      <h5 className="event-title">{event.title}</h5>
                      <p className="event-date">
                        <FaCalendarAlt className="event-icon" /> {formatDateForUI(event.date)}
                      </p>
                      <p className={styles['event-location']}>
                        <FaMapMarkerAlt className={styles['event-icon']} /> {event.location}
                      </p>
                      <p className={styles['event-organizer']}>
                        <FaUserAlt className={styles['event-icon']} /> {event.organizer}
                      </p>
                    </CardBody>
                  </Card>
                </Col>
              ))
            ) : (
              <div className={styles['no-events']}>No events available</div>
            )}
          </Row>
          <div className={styles['dashboard-actions']}>
            <Button color="primary">Show Past Events</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default CPDashboard;
