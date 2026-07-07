import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Container, Row, Alert, Col, Card, CardBody, Button, Input } from 'reactstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserAlt, FaSearch, FaTimes } from 'react-icons/fa';
import styles from './CPDashboard.module.css';
import { ENDPOINTS } from '../../utils/URL';
import { Link } from 'react-router-dom';
import axios from 'axios';

const FixedRatioImage = ({ src = '', alt = '', fallback }) => (
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

FixedRatioImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  fallback: PropTypes.string.isRequired,
};

// Default filter values
const DEFAULT_FILTERS = {
  dateFilter: '',
  onlineOnly: false,
  branches: '',
  themes: '',
  categories: '',
};

export function CPDashboard() {
  const [events, setEvents] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);

  // Darken the page body in dark mode (app-wide pattern) so the area around the
  // dashboard isn't left white.
  useEffect(() => {
    document.body.classList.toggle('dark-mode-body', darkMode);
    return () => document.body.classList.remove('dark-mode-body');
  }, [darkMode]);

  // Hide the global back-to-top button — not needed on this page
  useEffect(() => {
    const scrollBtn = document.querySelector('.back-to-top');
    if (!scrollBtn) return;
    const prevDisplay = scrollBtn.style.display;
    scrollBtn.style.display = 'none';
    return () => {
      scrollBtn.style.display = prevDisplay;
    };
  }, []);

  // Consolidated filter states
  const [pendingFilters, setPendingFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
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

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, 300); // debounce delay (300ms feels natural)

    return () => clearTimeout(handler);
  }, [searchInput]);

  const handleSearchClick = () => {
    const trimmed = searchInput.trim();
    setSearchQuery(trimmed);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // keep this near your refs/functions
  const BASE_HEIGHT = 36;

  const autoGrow = el => {
    if (!el) return;
    el.style.height = `${BASE_HEIGHT}px`; // reset to base
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const searchRef = useRef(null);
  useEffect(() => {
    autoGrow(searchRef.current); // ✅ runs even when you clear via button
  }, [searchInput]);

  const handleSearchKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault(); // ✅ stops newline
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
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const isTomorrow = dateString => {
    const input = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return input >= tomorrow && input < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
  };

  const isComingWeekend = dateString => {
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
  };

  // Handler to update pending filter values
  const handleFilterChange = (filterName, value) => {
    setPendingFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Toggle the date radio: clicking the active option clears it; clicking another switches.
  // Applies immediately (bypasses the Apply Filters button) so the user sees instant feedback.
  const handleDateToggle = value => {
    const next = appliedFilters.dateFilter === value ? '' : value;
    setPendingFilters(prev => ({ ...prev, dateFilter: next }));
    setAppliedFilters(prev => ({ ...prev, dateFilter: next }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Apply all pending filters
  const handleApplyFilters = () => {
    setAppliedFilters(pendingFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setPendingFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const now = new Date();

  const isPastEvent = event => {
    const ref = event.startTime || event.date;
    if (!ref) return false;
    return new Date(ref) < now;
  };
  // Filter events based on applied filters
  const filteredEvents = events.filter(event => {
    if (!showPastEvents && isPastEvent(event)) return false;
    // Filter by online only
    if (appliedFilters.onlineOnly) {
      const isOnlineEvent = event.location?.toLowerCase() === 'virtual';
      if (!isOnlineEvent) return false;
    }

    // Filter by date
    if (appliedFilters.dateFilter === 'tomorrow') {
      return isTomorrow(event.date);
    } else if (appliedFilters.dateFilter === 'weekend') {
      return isComingWeekend(event.date);
    }

    // Filter by search query
    if (!searchQuery) return true;

    const term = searchQuery.toLowerCase();
    return (
      event.title?.toLowerCase().includes(term) ||
      event.location?.toLowerCase().includes(term) ||
      event.organizer?.toLowerCase().includes(term)
    );
  });

  // Reset pagination to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [searchQuery, selectedDate, onlineOnly, appliedFilters.dateFilter, showPastEvents]);

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
      <Container className={`${styles.dashboardContainer} ${darkMode ? styles.darkContainer : ''}`}>
        <p>Loading events...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={`${styles.dashboardContainer} ${darkMode ? styles.darkContainer : ''}`}>
        <p className={styles.errorText}>{error}</p>
      </Container>
    );
  }

  // isLoading and error are already handled by the early returns above.
  let eventsContent;

  if (displayedEvents.length > 0) {
    eventsContent = displayedEvents.map(event => (
      <Col md={4} key={event.id} className={`${styles.eventCardCol}`}>
        <Link
          className={styles.eventCardLink}
          to={`/communityportal/Activities/Register/${event._id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Card className={`${styles.eventCard} ${darkMode ? styles.darkEventCard : ''}`}>
            <div className={styles.eventCardImgContainer}>
              <FixedRatioImage src={event.coverImage} alt={event.title} fallback={FALLBACK_IMG} />
            </div>
            <CardBody className={`${styles.eventCardBody} ${darkMode ? styles.darkEventCard : ''}`}>
              <h5 className={styles.eventTitle}>{event.title}</h5>
              <p className={styles.eventDate}>
                <FaCalendarAlt
                  className={`${darkMode ? styles.eventIconDark : styles.eventIcon}`}
                />{' '}
                {formatDate(event.date)}
              </p>
              <p className={styles.eventLocation}>
                <FaMapMarkerAlt
                  className={`${darkMode ? styles.eventIconDark : styles.eventIcon}`}
                />{' '}
                {event.location || 'Location TBD'}
              </p>
              <p className={styles.eventOrganizer}>
                <FaUserAlt className={`${darkMode ? styles.eventIconDark : styles.eventIcon}`} />{' '}
                {event.organizer || 'Organizer TBD'}
              </p>
            </CardBody>
          </Card>
        </Link>
      </Col>
    ));
  } else {
    eventsContent = <div className={styles.noEvents}>No events available</div>;
  }

  return (
    <Container className={`${styles.dashboardContainer} ${darkMode ? styles.darkContainer : ''}`}>
      <header className={`${styles.dashboardHeader} ${darkMode ? styles.darkHeader : ''}`}>
        <h1>All Events</h1>
      </header>

      <Row className={styles.centeredRow}>
        <Col md={3} className={`${styles.dashboardSidebar} ${darkMode ? styles.darkSidebar : ''}`}>
          <div className={styles.filterSection}>
            <h4 className={styles.filterSectionHeader}>Filters</h4>

            <div className={styles.filterSectionDivider}>
              {/* Search */}
              <div className={styles.filterItem}>
                <label htmlFor="sidebar-search">Search Events</label>
                <div className={styles.sidebarSearchWrapper}>
                  <div
                    className={`${styles.dashboardSearchContainer} ${
                      darkMode ? styles.darkSearchContainer : ''
                    }`}
                  >
                    <textarea
                      ref={searchRef}
                      id="sidebar-search"
                      rows={1}
                      maxLength={100}
                      placeholder="Search events..."
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      className={`${styles.dashboardSearchTextarea} ${
                        darkMode ? styles.darkSearchTextarea : ''
                      }`}
                    />
                    <div className={styles.dashboardSearchButtons}>
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
                  {searchInput.length >= 100 && (
                    <Alert className={styles.charCountWarning}>Max 100 characters</Alert>
                  )}
                </div>
              </div>

              {/* Date Filter */}
              <div className={styles.filterItem}>
                <label htmlFor="date-tomorrow">Dates</label>
                <div className={styles.radioRow}>
                  <label className={styles.radioOption} htmlFor="date-tomorrow">
                    <input
                      id="date-tomorrow"
                      type="radio"
                      name="dates"
                      checked={appliedFilters.dateFilter === 'tomorrow'}
                      onChange={() => {}}
                      onClick={() => handleDateToggle('tomorrow')}
                      className={styles.radioInput}
                    />
                    <span>Tomorrow</span>
                  </label>
                  <label className={styles.radioOption} htmlFor="date-weekend">
                    <input
                      id="date-weekend"
                      type="radio"
                      name="dates"
                      checked={appliedFilters.dateFilter === 'weekend'}
                      onChange={() => {}}
                      onClick={() => handleDateToggle('weekend')}
                      className={styles.radioInput}
                    />
                    <span>This Weekend</span>
                  </label>
                </div>

                <Input
                  type="date"
                  placeholder="Select Date"
                  className={styles.dateFilter}
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  style={{ marginTop: '10px' }}
                />
              </div>

              {/* Online Only Filter */}
              <div className={styles.filterItem}>
                <label htmlFor="online-only">Online</label>
                <label className={styles.checkboxOption} htmlFor="online-only">
                  <input
                    id="online-only"
                    type="checkbox"
                    checked={onlineOnly}
                    onChange={e => {
                      setOnlineOnly(e.target.checked);
                      setPagination(prev => ({ ...prev, currentPage: 1 }));
                    }}
                  />
                  <span>Online Only</span>
                </label>
              </div>

              {/* Branches Filter */}
              <div className={styles.filterItem}>
                <label htmlFor="branches">Branches</label>
                <Input
                  type="select"
                  id="branches"
                  value={pendingFilters.branches}
                  onChange={e => handleFilterChange('branches', e.target.value)}
                >
                  <option value="">Select branches</option>
                </Input>
              </div>

              {/* Themes Filter */}
              <div className={styles.filterItem}>
                <label htmlFor="themes">Themes</label>
                <Input
                  type="select"
                  id="themes"
                  value={pendingFilters.themes}
                  onChange={e => handleFilterChange('themes', e.target.value)}
                >
                  <option value="">Select themes</option>
                </Input>
              </div>

              {/* Categories Filter */}
              <div className={styles.filterItem}>
                <label htmlFor="categories">Categories</label>
                <Input
                  type="select"
                  id="categories"
                  value={pendingFilters.categories}
                  onChange={e => handleFilterChange('categories', e.target.value)}
                >
                  <option value="">Select categories</option>
                </Input>
              </div>

              {/* Apply and Clear Buttons */}
              <div className={styles.filterActions}>
                <Button color="success" onClick={handleApplyFilters} className={styles.applyBtn}>
                  Apply Filters
                </Button>
                <Button color="secondary" onClick={handleClearFilters} className={styles.clearBtn}>
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </Col>

        <Col md={9} className={`${styles.dashboardMain} ${darkMode ? styles.darkMain : ''}`}>
          <div className={styles.eventsHeader}>
            <h2 className={styles.sectionTitle}>Events</h2>
            <Button
              className={styles.showPastEventsBtn}
              onClick={() => setShowPastEvents(prev => !prev)}
            >
              {showPastEvents ? 'Hide Past Events' : 'Show Past Events'}
            </Button>
          </div>

          <Row>{eventsContent}</Row>

          {/* Pagination controls */}
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
        </Col>
      </Row>
    </Container>
  );
}
export default CPDashboard;
