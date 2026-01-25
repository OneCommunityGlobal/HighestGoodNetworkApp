import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Card, CardBody, Button, Input } from 'reactstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserAlt, FaSearch, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';
import { getUserTimezone, formatDateTimeWithTimezone } from '../../utils/timezoneUtils';
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

export function CPDashboard() {
  const [events, setEvents] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const darkMode = useSelector(state => state.theme.darkMode);
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
    try {
      const date = new Date(dateStr);
      if (Number.isNaN(date.getTime())) {
        return 'Invalid date';
      }
      // Format: "Saturday, February 15"
      return format(date, 'EEEE, MMMM d');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date TBD';
    }
  };

  const formatTime = timeStr => {
    if (!timeStr) return 'Time TBD';
    try {
      const userTimezone = getUserTimezone();
      return formatDateTimeWithTimezone(timeStr, userTimezone);
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Time TBD';
    }
  };

  const getDisplayLocation = location => {
    if (!location || location.trim() === '') {
      return 'Location TBD';
    }
    return location;
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
      <Container className={styles.dashboardContainer}>
        <p>Loading events...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={styles.dashboardContainer}>
        <p className={styles.errorText}>{error}</p>
      </Container>
    );
  }

  return (
    <Container className={`${styles.dashboardContainer} ${darkMode ? styles.darkContainer : ''}`}>
      <header className={`${styles.dashboardHeader} ${darkMode ? styles.darkHeader : ''}`}>
        <h1>All Events</h1>

        <div>
          <div className={styles.dashboardSearchContainer}>
            <Input
              id="search"
              type="search"
              placeholder="Search events..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className={styles.dashboardSearchInput}
            />

            {searchInput && (
              <button
                type="button"
                className={styles.dashboardClearBtn}
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
              className={styles.dashboardSearchIconBtn}
              onClick={handleSearchClick}
              aria-label="Search events"
            >
              <FaSearch />
            </button>
          </div>
        </div>
      </header>

      <Row className={styles.centeredRow}>
        <Col md={3} className={`${styles.dashboardSidebar} ${darkMode ? styles.darkSidebar : ''}`}>
          <div className={styles.filterSection}>
            <h4>Search Filters</h4>
            <div className={styles.filterSectionDivider}>
              <div className={styles.filterItem}>
                <label htmlFor="date-tomorrow"> Dates</label>
                <div>
                  <div>
                    <Input type="radio" name="dates" /> Tomorrow
                  </div>
                  <div>
                    <Input type="radio" name="dates" /> This Weekend
                  </div>
                </div>
                <Input type="date" placeholder="Ending After" className={styles['date-filter']} />
              </div>

              <div className={styles.filterItem}>
                <label htmlFor="online-only">Online</label>
                <div>
                  <Input type="checkbox" /> Online Only
                </div>
              </div>

              <div className={styles.filterItem}>
                <label htmlFor="branches">Branches</label>
                <Input type="select">
                  <option>Select branches</option>
                </Input>
              </div>

              <div className={styles.filterItem}>
                <label htmlFor="themes">Themes</label>
                <Input type="select">
                  <option>Select themes</option>
                </Input>
              </div>

              <div className={styles.filterItem}>
                <label htmlFor="categories">Categories</label>
                <Input type="select">
                  <option>Select categories</option>
                </Input>
              </div>
            </div>
          </div>
        </Col>

        <Col md={9} className={`${styles.dashboardMain} ${darkMode ? styles.darkMain : ''}`}>
          <h2 className={styles.sectionTitle}>Events</h2>

          <Row>
            {displayedEvents.length > 0 ? (
              displayedEvents.map(event => (
                <Col md={4} key={event.id} className={styles.eventCardCol}>
                  <Card className={styles.eventCard}>
                    <div className={styles.eventCardImgContainer}>
                      <FixedRatioImage
                        src={event.image}
                        alt={event.title}
                        fallback={FALLBACK_IMG}
                      />
                    </div>
                    <CardBody>
                      <h5 className={styles.eventTitle}>{event.title}</h5>
                      <div className={styles.eventDate}>
                        <FaCalendarAlt />
                        <div>
                          <div>{formatDate(event.date)}</div>
                          {event.startTime && (
                            <div className={styles.eventTime}>{formatTime(event.startTime)}</div>
                          )}
                        </div>
                      </div>
                      <p className={styles.eventLocation}>
                        <FaMapMarkerAlt /> {getDisplayLocation(event.location)}
                      </p>
                      <p className={styles.eventOrganizer}>
                        <FaUserAlt /> {event.organizer}
                      </p>
                    </CardBody>
                  </Card>
                </Col>
              ))
            ) : (
              <div className={styles.noEvents}>No events available</div>
            )}
          </Row>

          {/* Simple pagination controls if needed */}
          {totalPages > 1 && (
            <div className={styles.paginationContainer}>
              <Button
                color="secondary"
                disabled={pagination.currentPage === 1}
                onClick={() => goToPage(pagination.currentPage - 1)}
              >
                Previous
              </Button>
              <span className={styles.paginationInfo}>
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

          <div className={styles.dashboardActions}>
            <Button color="primary">Show Past Events</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default CPDashboard;
