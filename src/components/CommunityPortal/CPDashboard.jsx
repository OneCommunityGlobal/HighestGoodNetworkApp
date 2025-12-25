import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Input } from 'reactstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserAlt, FaSearch, FaTimes } from 'react-icons/fa';
import styles from './CPDashboard.module.css';
import { ENDPOINTS } from '../../utils/URL';
import axios from 'axios';

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
        if (e.currentTarget.src !== fallback) {
          e.currentTarget.src = fallback;
        }
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

export function CPDashboard() {
  const [events, setEvents] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);

      try {
        const response = await axios.get(ENDPOINTS.EVENTS);
        setEvents(response.data.events || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.events?.length || 0,
        }));
      } catch (err) {
        console.error('Failed to fetch events', err);
        setError('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSearchClick = () => {
    const trimmed = searchInput.trim();
    setSearchQuery(trimmed);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSearchKeyDown = e => {
    if (e.key === 'Enter') {
      const trimmed = searchInput.trim();
      setSearchQuery(trimmed);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }
  };

  const formatDate = dateStr => {
    if (!dateStr) {
      return 'Date TBD';
    }

    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const filteredEvents = events.filter(event => {
    if (searchQuery === '') {
      return true;
    }

    const term = searchQuery.toLowerCase();

    return (
      event.title?.toLowerCase().includes(term) ||
      event.location?.toLowerCase().includes(term) ||
      event.organizer?.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredEvents.length / pagination.limit) || 1;

  const displayedEvents = filteredEvents.slice(
    (pagination.currentPage - 1) * pagination.limit,
    pagination.currentPage * pagination.limit,
  );

  const isFiltered = Boolean(searchQuery);
  const totalFilteredCount = filteredEvents.length;

  let eventCountText = 'Showing all events';

  if (isFiltered) {
    if (totalFilteredCount > 0) {
      eventCountText = `Showing ${totalFilteredCount} event${totalFilteredCount !== 1 ? 's' : ''}`;
    } else {
      eventCountText = 'No events found';
    }
  }

  const goToPage = newPage => {
    if (newPage < 1 || newPage > totalPages) {
      return;
    }

    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  if (isLoading) {
    return (
      <Container className={styles['dashboard-container']}>
        <p>Loading events...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={styles['dashboard-container']}>
        <p className={styles['error-text']}>{error}</p>
      </Container>
    );
  }

  return (
    <Container className={styles['dashboard-container']}>
      <header className={styles['dashboard-header']}>
        <h1>All Events</h1>

        <div className={styles['dashboard-controls']}>
          <div className={styles['dashboard-search-container']}>
            <Input
              id="search"
              type="search"
              placeholder="Search events..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className={styles['dashboard-search-input']}
            />

            {searchInput && (
              <button
                type="button"
                className={styles['dashboard-clear-btn']}
                onClick={() => {
                  setSearchInput('');
                  setSearchQuery('');
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
              >
                <FaTimes />
              </button>
            )}

            <button
              type="button"
              className={styles['dashboard-search-icon-btn']}
              onClick={handleSearchClick}
              aria-label="Search events"
            >
              <FaSearch />
            </button>
          </div>
        </div>
      </header>

      <Row>
        <Col md={3} className={styles['dashboard-sidebar']}>
          <div className={styles['filter-section']}>
            <h4>Search Filters</h4>
            <div className={styles['filter-section-divider']}>
              <div className={styles['filter-item']}>
                <label htmlFor="date-filter">Dates</label>
                <div className={styles['filter-options-horizontal']}>
                  <div>
                    <Input id="date-tomorrow" type="radio" name="dates" />
                    <label htmlFor="date-tomorrow">Tomorrow</label>
                  </div>
                  <div>
                    <Input id="date-weekend" type="radio" name="dates" />
                    <label htmlFor="date-weekend">This Weekend</label>
                  </div>
                </div>
                <Input id="date-filter" type="date" className={styles['date-filter']} />
              </div>

              <div className={styles['filter-item']}>
                <label htmlFor="online-only">Online</label>
                <div>
                  <Input id="online-only" type="checkbox" /> Online Only
                </div>
              </div>

              <div className={styles['filter-item']}>
                <label htmlFor="branches">Branches</label>
                <Input id="branches" type="select">
                  <option>Select branches</option>
                </Input>
              </div>

              <div className={styles['filter-item']}>
                <label htmlFor="themes">Themes</label>
                <Input id="themes" type="select">
                  <option>Select themes</option>
                </Input>
              </div>

              <div className={styles['filter-item']}>
                <label htmlFor="categories">Categories</label>
                <Input id="categories" type="select">
                  <option>Select categories</option>
                </Input>
              </div>
            </div>
          </div>
        </Col>

        <Col md={9} className={styles['dashboard-main']}>
          <h2 className={styles['section-title']}>Events</h2>

          <p className={styles['event-count-text']}>{eventCountText}</p>

          <Row>
            {displayedEvents.length > 0 ? (
              displayedEvents.map(event => (
                <Col md={4} key={event.id} className={styles['event-card-col']}>
                  <Card className={styles['event-card']}>
                    <div className={styles['event-card-img-container']}>
                      <FixedRatioImage
                        src={event.image}
                        alt={event.title}
                        fallback={FALLBACK_IMG}
                      />
                    </div>
                    <CardBody>
                      <h5 className={styles['event-title']}>{event.title}</h5>
                      <p className={styles['event-date']}>
                        <FaCalendarAlt className={styles['event-icon']} /> {formatDate(event.date)}
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

          {totalPages > 1 && (
            <div className={styles['pagination-container']}>
              <Button
                color="secondary"
                disabled={pagination.currentPage === 1}
                onClick={() => goToPage(pagination.currentPage - 1)}
              >
                Previous
              </Button>
              <span className={styles['pagination-info']}>
                Page {pagination.currentPage} of {totalPages}
              </span>
              <Button
                color="secondary"
                disabled={pagination.currentPage === totalPages}
                onClick={() => goToPage(pagination.currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}

          <div className={styles['dashboard-actions']}>
            <Button color="primary">Show Past Events</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default CPDashboard;
