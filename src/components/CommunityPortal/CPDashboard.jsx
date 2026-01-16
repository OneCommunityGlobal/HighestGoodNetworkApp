import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Card, CardBody, Button, Input, FormGroup, Label } from 'reactstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserAlt, FaSearch, FaTimes } from 'react-icons/fa';
import styles from './CPDashboard.module.css';
import { ENDPOINTS } from '../../utils/URL';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { el } from 'date-fns/locale';

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
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [dateError, setDateError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [error, setError] = useState(null);
  const darkMode = useSelector(state => state.theme.darkMode);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 5,
    total: 0,
    limit: 6,
  });

  const handleDateChange = date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // midnight today

    if (date < today) {
      toast.error('Past dates are not supported. Please select a future date.');
      setSelectedDate('');
      return;
    }
    setDateError('');
    setSelectedDate(date);
  };

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

  function isTomorrow(dateString) {
    const input = new Date(dateString);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return input >= tomorrow && input < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
  }

  function isComingWeekend(dateString) {
    const input = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = today.getDay();
    const daysUntilSaturday = (6 - day + 7) % 7 || 7;
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + daysUntilSaturday);
    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);
    sunday.setHours(23, 59, 59, 999);

    return input >= saturday && input <= sunday;
  }

  const filteredEvents = events.filter(event => {
    // Filter by online only if checkbox is checked
    if (onlineOnly) {
      const isOnlineEvent = event.location?.toLowerCase() === 'virtual';
      if (!isOnlineEvent) return false;
    }

    // Filter by date filter
    if (dateFilter === 'tomorrow') {
      return isTomorrow(event.date);
    } else if (dateFilter === 'weekend') {
      return isComingWeekend(event.date);
    }

    // Filter by search query if provided
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
    <Container className={styles.cp_dashboard_container}>
      <header className={styles.cp_dashboard_header}>
        <h1>All Events</h1>
        <div>
          <div className={styles.cp_dashboard_search_container}>
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
                <div className={styles.radioRow}>
                  <FormGroup check className={styles.radioGroup + ' d-flex align-items-center'}>
                    <Input
                      id="date-tomorrow"
                      type="radio"
                      name="dates"
                      checked={dateFilter === 'tomorrow'}
                      onChange={() => setDateFilter('tomorrow')}
                      className={styles.radioInput}
                    />
                    <Label
                      htmlFor="date-tomorrow"
                      check
                      className={styles.radioLabel + ' ms-2 mb-0'}
                    >
                      Tomorrow
                    </Label>
                  </FormGroup>
                  <FormGroup check className={styles.radioGroup + ' d-flex align-items-center'}>
                    <Input
                      id="date-weekend"
                      type="radio"
                      name="dates"
                      checked={dateFilter === 'weekend'}
                      onChange={() => setDateFilter('weekend')}
                      className={styles.radioInput}
                    />
                    <Label
                      htmlFor="date-weekend"
                      check
                      className={styles.radioLabel + ' ms-2 mb-0'}
                    >
                      This Weekend
                    </Label>
                  </FormGroup>
                </div>
                <div className={styles.dashboardActions}>
                  <Button color="primary" onClick={() => setDateFilter('')}>
                    Clear date filter
                  </Button>
                </div>
                <div className={styles['date-filter-container']}>
                  <DatePicker
                    selected={selectedDate}
                    onChange={date => handleDateChange(date)}
                    placeholderText="Ending After"
                    id="ending-after"
                    className={styles['date-filter']}
                  />
                  {dateError && <p className={styles['date-error-message']}>{dateError}</p>}
                </div>
                <div className={styles['date-filter-container']}>
                  <DatePicker
                    selected={selectedDate}
                    onChange={date => handleDateChange(date)}
                    placeholderText="Ending After"
                    id="ending-after"
                    className={styles['date-filter']}
                  />
                  {dateError && <p className={styles['date-error-message']}>{dateError}</p>}
                </div>
              </div>

              <div className={styles.filterItem}>
                <label htmlFor="online-only">Online</label>
                <div>
                  <Input
                    type="checkbox"
                    id="online-only"
                    checked={onlineOnly}
                    onChange={e => {
                      setOnlineOnly(e.target.checked);
                      setPagination(prev => ({ ...prev, currentPage: 1 }));
                    }}
                  />{' '}
                  Online Only
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
                      <p className={styles.eventDate}>
                        <FaCalendarAlt /> {formatDate(event.date)}
                      </p>
                      <p className={styles.eventLocation}>
                        <FaMapMarkerAlt /> {event.location}
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
