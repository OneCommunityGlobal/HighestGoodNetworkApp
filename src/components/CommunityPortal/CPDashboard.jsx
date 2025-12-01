import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Input } from 'reactstrap';
import styles from './CPDashboard.module.css';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserAlt } from 'react-icons/fa';
import { ENDPOINTS } from '../../utils/URL';
import axios from 'axios';

export function CPDashboard() {
  const [allEvents, setAllEvents] = useState([]);
  const [search, setSearch] = useState('');
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
        setEvents(response.data.events);
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

  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase().includes(search.toLowerCase()),
  );

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
                <Input type="date" placeholder="Ending After" className={styles['date-filter']} />
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
            {events.length > 0 ? (
              events.map(event => (
                <Col md={4} key={event.id} className={styles['event-card-col']}>
                  <Card className={styles['event-card']}>
                    <div className={styles['event-card-img-container']}>
                      <img
                        src={event.image}
                        alt={event.title}
                        className={styles['event-card-img']}
                      />
                    </div>
                    <CardBody>
                      <h5 className={styles['event-title']}>{event.title}</h5>
                      <p className={styles['event-date']}>
                        <FaCalendarAlt className={styles['event-icon']} /> {event.date}
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
