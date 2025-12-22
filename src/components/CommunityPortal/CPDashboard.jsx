/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Card, CardBody, Button, Input, Label } from 'reactstrap';
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

function CPDashboard() {
  const darkMode = useSelector(state => state.theme.darkMode);
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

  const filteredEvents = events.filter(event => {
    if (!searchQuery) return true;
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

  const goToPage = newPage => {
    if (newPage < 1 || newPage > totalPages) return;
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  if (isLoading) {
    return (
      <Container
        className={`${styles['dashboard-container']} ${
          darkMode ? styles['dashboard-container-dark'] : ''
        }`}
      >
        <p className={darkMode ? styles['loading-text-dark'] : ''}>Loading events...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        className={`${styles['dashboard-container']} ${
          darkMode ? styles['dashboard-container-dark'] : ''
        }`}
      >
        <p className={`${styles['error-text']} ${darkMode ? styles['error-text-dark'] : ''}`}>
          {error}
        </p>
      </Container>
    );
  }

  return (
    <Container
      className={`${styles['dashboard-container']} ${
        darkMode ? styles['dashboard-container-dark'] : ''
      }`}
    >
      <header
        className={`${styles['dashboard-header']} ${
          darkMode ? styles['dashboard-header-dark'] : ''
        }`}
      >
        <h1 className={darkMode ? styles['dashboard-title-dark'] : ''}>All Events</h1>

        <div className={styles['dashboard-controls']}>
          <div className={styles['dashboard-search-container']}>
            <Input
              id="search"
              type="search"
              placeholder="Search events..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className={`${styles['dashboard-search-input']} ${
                darkMode ? styles['dashboard-search-input-dark'] : ''
              }`}
            />

            {searchInput && (
              <button
                type="button"
                className={`${styles['dashboard-clear-btn']} ${
                  darkMode ? styles['dashboard-clear-btn-dark'] : ''
                }`}
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
              className={`${styles['dashboard-search-icon-btn']} ${
                darkMode ? styles['dashboard-search-icon-btn-dark'] : ''
              }`}
              onClick={handleSearchClick}
              aria-label="Search events"
            >
              <FaSearch />
            </button>
          </div>
        </div>
      </header>

      <Row className={styles['dashboard-row']}>
        <Col md={3} className={styles['dashboard-sidebar']}>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <div
            className={`${styles['filter-section']} ${
              darkMode ? styles['filter-section-dark'] : ''
            }`}
          >
            <h4 className={darkMode ? styles['filter-section-title-dark'] : ''}>Search Filters</h4>
            <div className={styles['filter-section-divider']}>
              <div className={styles['filter-item']}>
                <label
                  htmlFor="date-filter-input"
                  className={darkMode ? styles['filter-label-dark'] : ''}
                >
                  Dates
                </label>
                <div className={styles['filter-options-horizontal']}>
                  <label className={styles['radio-label']}>
                    <Input
                      type="radio"
                      name="dates"
                      id="date-tomorrow"
                      className={darkMode ? styles['filter-radio-dark'] : ''}
                    />
                    <span className={darkMode ? styles['filter-option-text-dark'] : ''}>
                      Tomorrow
                    </span>
                  </label>
                  <label className={styles['radio-label']}>
                    <Input
                      type="radio"
                      name="dates"
                      id="date-weekend"
                      className={darkMode ? styles['filter-radio-dark'] : ''}
                    />
                    <span className={darkMode ? styles['filter-option-text-dark'] : ''}>
                      This Weekend
                    </span>
                  </label>
                </div>
                <Input
                  id="date-filter-input"
                  type="date"
                  placeholder="Ending After"
                  className={`${styles['date-filter']} ${
                    darkMode ? styles['date-filter-dark'] : ''
                  }`}
                />
              </div>

              <div className={styles['filter-item']}>
                <label
                  htmlFor="online-only"
                  className={darkMode ? styles['filter-label-dark'] : ''}
                >
                  Online
                </label>
                <label className={styles['checkbox-label']}>
                  <Input
                    type="checkbox"
                    id="online-only"
                    className={darkMode ? styles['filter-checkbox-dark'] : ''}
                  />
                  <span className={darkMode ? styles['filter-option-text-dark'] : ''}>
                    Online Only
                  </span>
                </label>
              </div>

              <div className={styles['filter-item']}>
                <Label for="branches" className={darkMode ? styles['filter-label-dark'] : ''}>
                  Branches
                </Label>
                <Input
                  type="select"
                  id="branches"
                  name="branches"
                  className={darkMode ? styles['filter-select-dark'] : ''}
                >
                  <option>Select branches</option>
                </Input>
              </div>

              <div className={styles['filter-item']}>
                <Label for="themes" className={darkMode ? styles['filter-label-dark'] : ''}>
                  Themes
                </Label>
                <Input
                  type="select"
                  id="themes"
                  name="themes"
                  className={darkMode ? styles['filter-select-dark'] : ''}
                >
                  <option>Select themes</option>
                </Input>
              </div>

              <div className={styles['filter-item']}>
                <Label for="categories" className={darkMode ? styles['filter-label-dark'] : ''}>
                  Categories
                </Label>
                <Input
                  type="select"
                  id="categories"
                  name="categories"
                  className={darkMode ? styles['filter-select-dark'] : ''}
                >
                  <option>Select categories</option>
                </Input>
              </div>
            </div>
          </div>
        </Col>

        <Col md={9} className={styles['dashboard-main']}>
          <h2
            className={`${styles['section-title']} ${darkMode ? styles['section-title-dark'] : ''}`}
          >
            Events
          </h2>

          <Row>
            {displayedEvents.length > 0 ? (
              displayedEvents.map(event => (
                <Col md={4} key={event.id} className={styles['event-card-col']}>
                  <Card
                    className={`${styles['event-card']} ${
                      darkMode ? styles['event-card-dark'] : ''
                    }`}
                  >
                    <div className={styles['event-card-img-container']}>
                      <FixedRatioImage
                        src={event.image}
                        alt={event.title}
                        fallback={FALLBACK_IMG}
                      />
                    </div>
                    <CardBody className={darkMode ? styles['event-card-body-dark'] : ''}>
                      <h5
                        className={`${styles['event-title']} ${
                          darkMode ? styles['event-title-dark'] : ''
                        }`}
                      >
                        {event.title}
                      </h5>
                      <p
                        className={`${styles['event-date']} ${
                          darkMode ? styles['event-text-dark'] : ''
                        }`}
                      >
                        <FaCalendarAlt className={styles['event-icon']} /> {formatDate(event.date)}
                      </p>
                      <p
                        className={`${styles['event-location']} ${
                          darkMode ? styles['event-text-dark'] : ''
                        }`}
                      >
                        <FaMapMarkerAlt className={styles['event-icon']} /> {event.location}
                      </p>
                      <p
                        className={`${styles['event-organizer']} ${
                          darkMode ? styles['event-text-dark'] : ''
                        }`}
                      >
                        <FaUserAlt className={styles['event-icon']} /> {event.organizer}
                      </p>
                    </CardBody>
                  </Card>
                </Col>
              ))
            ) : (
              <div className={`${styles['no-events']} ${darkMode ? styles['no-events-dark'] : ''}`}>
                No events available
              </div>
            )}
          </Row>

          {/* Simple pagination controls if needed */}
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
