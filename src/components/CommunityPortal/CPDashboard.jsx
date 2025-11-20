import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Input } from 'reactstrap';
import './CPDashboard.css';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserAlt } from 'react-icons/fa';
import { ENDPOINTS } from '../../utils/URL';
import axios from 'axios';

export function CPDashboard() {
  const [events, setEvents] = useState([]);
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
    <Container fluid className="dashboard-container">
      <header className="dashboard-header">
        <h1>All Events</h1>
        <div className="dashboard-controls">
          <div className="dashboard-search-container">
            <Input
              type="search"
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="dashboard-search"
            />
          </div>
        </div>
      </header>

      <Row>
        <Col md={3} className="dashboard-sidebar">
          <div className="filter-section">
            <h4>Search Filters</h4>
            <div className="filter-item">
              <label htmlFor="date-tomorrow"> Dates</label>
              <div className="filter-options-horizontal">
                <div>
                  <Input type="radio" name="dates" /> Tomorrow
                </div>
                <div>
                  <Input type="radio" name="dates" /> This Weekend
                </div>
              </div>
              <Input type="date" placeholder="Ending After" className="date-filter" />
            </div>
            <div className="filter-item">
              <label htmlFor="online-only">Online</label>
              <div>
                <Input type="checkbox" /> Online Only
              </div>
            </div>
            <div className="filter-item">
              <label htmlFor="branches">Branches</label>
              <Input type="select">
                <option>Select branches</option>
              </Input>
            </div>
            <div className="filter-item">
              <label htmlFor="themes">Themes</label>
              <Input type="select">
                <option>Select themes</option>
              </Input>
            </div>
            <div className="filter-item">
              <label htmlFor="categories">Categories</label>
              <Input type="select">
                <option>Select categories</option>
              </Input>
            </div>
          </div>
        </Col>

        <Col md={9} className="dashboard-main">
          <h2 className="section-title">Events</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          {isLoading ? (
            <div className="d-flex justify-content-center mt-4"></div>
          ) : displayedEvents.length > 0 ? (
            <Row>
              {displayedEvents.map(event => (
                <Col md={4} key={event._id || event.id} className="event-card-col">
                  <Card
                    className="event-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 14,
                      overflow: 'hidden',
                    }}
                  >
                    <div className="event-card-img-container">
                      <FixedRatioImage
                        src={event.coverImage}
                        alt={event.title}
                        fallback={FALLBACK_IMG}
                      />
                    </div>
                    <CardBody style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h5 className="event-title">{event.title}</h5>
                      <p className="event-date">
                        <FaCalendarAlt className="event-icon" /> {formatDate(event.date)}
                      </p>
                      <p className="event-location">
                        <FaMapMarkerAlt className="event-icon" /> {event.location || 'TBD'}
                      </p>
                      <p className="event-organizer">
                        <FaUserAlt className="event-icon" /> {event.maxAttendees || 'No limit'}{' '}
                        Attendees limit
                      </p>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="no-events">No events available</div>
          )}

          <div className="d-flex justify-content-center mt-4">
            <div className="pagination-controls">
              <Button
                color="secondary"
                disabled={pagination.currentPage === 1}
                onClick={() =>
                  setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))
                }
              >
                Previous
              </Button>

              <span className="mx-3">
                Page {pagination.currentPage} of {totalPages}
              </span>

              <Button
                color="secondary"
                disabled={pagination.currentPage === totalPages}
                onClick={() =>
                  setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))
                }
              >
                Next
              </Button>
            </div>
          </div>

          <div className="dashboard-actions text-center mt-4">
            <Button color="primary">Show Past Events</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default CPDashboard;
