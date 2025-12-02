import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Input } from 'reactstrap';
import styles from './CPDashboard.module.css';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserAlt } from 'react-icons/fa';
import { ENDPOINTS } from '../../utils/URL';
import axios from 'axios';

export function CPDashboard() {
  const [allEvents, setAllEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 5,
    total: 0,
    limit: 6,
  });

  const FALLBACK_IMG =
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=60';

  const FixedRatioImage = ({ src, alt, fallback }) => (
    <div
      style={{
        width: '100%',
        aspectRatio: '4 / 3',
        overflow: 'hidden',
        background: '#f2f2f2',
      }}
    >
      <img
        src={src || fallback}
        alt={alt}
        loading="lazy"
        onError={e => {
          if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>
  );

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);

      try {
        const response = await axios.get(ENDPOINTS.EVENTS);
        console.log('Fetched events:', response.data.events);
        setAllEvents(response.data.events);
      } catch (err) {
        console.error('Here', err);
        setError('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = dateStr => {
    if (!dateStr) return 'Date TBD';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Helper function to extract date in YYYY-MM-DD format from event date
  const parseEventDate = dateString => {
    if (!dateString) return null;

    try {
      // Try to parse as ISO date string or standard date
      const parsedDate = new Date(dateString);
      if (!isNaN(parsedDate.getTime())) {
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (error) {
      console.error('Error parsing date:', error);
    }
    return null;
  };

  // Filter events based on search and date
  const filteredEvents = allEvents.filter(event => {
    // Filter by search text
    const matchesSearch =
      !search ||
      event.title?.toLowerCase().includes(search.toLowerCase()) ||
      event.location?.toLowerCase().includes(search.toLowerCase()) ||
      event.organizer?.toLowerCase().includes(search.toLowerCase());

    // Filter by date
    const eventDate = event.date ? parseEventDate(event.date) : null;
    const matchesDate = !selectedDate || eventDate === selectedDate;

    return matchesSearch && matchesDate;
  });

  // Reset pagination to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [search, selectedDate]);

  const totalPages = Math.ceil(filteredEvents.length / pagination.limit);

  const displayedEvents = filteredEvents.slice(
    (pagination.currentPage - 1) * pagination.limit,
    pagination.currentPage * pagination.limit,
  );

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
            <div className={styles['filter-section-divider']}>
              <div className={styles['filter-item']}>
                <label htmlFor="date-tomorrow"> Dates</label>
                <div className={styles['filter-options-horizontal']}>
                  <div>
                    <Input type="radio" name="dates" /> Tomorrow
                  </div>
                  <div>
                    <Input type="radio" name="dates" /> This Weekend
                  </div>
                </div>
                <Input
                  type="date"
                  placeholder="Select Date"
                  className={styles['date-filter']}
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
              </div>
              <div className={styles['filter-item']}>
                <label htmlFor="online-only">Online</label>
                <div>
                  <Input type="checkbox" /> Online Only
                </div>
              </div>
              <div className={styles['filter-item']}>
                <label htmlFor="branches">Branches</label>
                <Input type="select">
                  <option>Select branches</option>
                </Input>
              </div>
              <div className={styles['filter-item']}>
                <label htmlFor="themes">Themes</label>
                <Input type="select">
                  <option>Select themes</option>
                </Input>
              </div>
              <div className={styles['filter-item']}>
                <label htmlFor="categories">Categories</label>
                <Input type="select">
                  <option>Select categories</option>
                </Input>
              </div>
            </div>
          </div>
        </Col>

        <Col md={9} className={styles['dashboard-main']}>
          <h2 className={styles['section-title']}>Events</h2>
          <Row>
            {isLoading ? (
              <div className={styles['no-events']}>Loading events...</div>
            ) : error ? (
              <div className={styles['no-events']}>{error}</div>
            ) : displayedEvents.length > 0 ? (
              displayedEvents.map(event => (
                <Col md={4} key={event.id} className={styles['event-card-col']}>
                  <Card className={styles['event-card']}>
                    <div className={styles['event-card-img-container']}>
                      <img
                        src={event.image || FALLBACK_IMG}
                        alt={event.title}
                        className={styles['event-card-img']}
                        onError={e => {
                          if (e.currentTarget.src !== FALLBACK_IMG)
                            e.currentTarget.src = FALLBACK_IMG;
                        }}
                      />
                    </div>
                    <CardBody>
                      <h5 className={styles['event-title']}>{event.title}</h5>
                      <p className={styles['event-date']}>
                        <FaCalendarAlt className={styles['event-icon']} /> {formatDate(event.date)}
                      </p>
                      <p className={styles['event-location']}>
                        <FaMapMarkerAlt className={styles['event-icon']} />{' '}
                        {event.location || 'Location TBD'}
                      </p>
                      <p className={styles['event-organizer']}>
                        <FaUserAlt className={styles['event-icon']} />{' '}
                        {event.organizer || 'Organizer TBD'}
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
