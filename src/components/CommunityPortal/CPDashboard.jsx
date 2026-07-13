import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Container, Row, Alert, Col, Card, CardBody, Button, Input } from 'reactstrap';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserAlt,
  FaSearch,
  FaTimes,
  FaHistory,
} from 'react-icons/fa';
import styles from './CPDashboard.module.css';
import { ENDPOINTS } from '../../utils/URL';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { isTomorrow, isComingWeekend } from './utils';

const RECENT_SEARCHES_KEY = 'cp_recent_searches';
const MAX_RECENT_SEARCHES = 10;

function useRecentSearches(key = RECENT_SEARCHES_KEY, maxItems = MAX_RECENT_SEARCHES) {
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addSearch = useCallback(
    query => {
      const trimmed = query.trim();
      if (!trimmed) return;
      setRecentSearches(prev => {
        const updated = [trimmed, ...prev.filter(s => s !== trimmed)].slice(0, maxItems);
        localStorage.setItem(key, JSON.stringify(updated));
        return updated;
      });
    },
    [key, maxItems],
  );

  const removeSearch = useCallback(
    query => {
      setRecentSearches(prev => {
        const updated = prev.filter(s => s !== query);
        localStorage.setItem(key, JSON.stringify(updated));
        return updated;
      });
    },
    [key],
  );

  return { recentSearches, addSearch, removeSearch };
}

function RecentSearchDropdown({ searches, onSelect, onRemove, darkMode }) {
  if (!searches.length) return null;
  return (
    <div
      className={`${styles.recentSearchDropdown} ${
        darkMode ? styles.darkRecentSearchDropdown : ''
      }`}
    >
      <div className={styles.recentSearchHeader}>
        <FaHistory className={darkMode ? styles.recentIconDark : styles.recentIcon} />
        <span>Recently Searched</span>
      </div>
      {searches.map(term => (
        <div key={term} className={styles.recentSearchItem}>
          <button
            type="button"
            className={`${styles.recentSearchTerm} ${darkMode ? styles.darkRecentSearchTerm : ''}`}
            onClick={() => onSelect(term)}
          >
            <FaSearch className={darkMode ? styles.recentIconDark : styles.recentIcon} />
            {term}
          </button>
          <button
            type="button"
            className={`${styles.recentSearchRemove} ${
              darkMode ? styles.darkRecentSearchRemove : ''
            }`}
            onClick={() => onRemove(term)}
            aria-label={`Remove ${term}`}
          >
            <FaTimes />
          </button>
        </div>
      ))}
    </div>
  );
}

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

// Default filter values
const DEFAULT_FILTERS = {
  dateFilter: '',
  onlineOnly: false,
  branches: '',
  themes: '',
  categories: '',
};

function passesFilters(
  event,
  { showPastEvents, isPastEvent, onlineOnly, dateFilter, searchQuery },
) {
  if (!showPastEvents && isPastEvent(event)) return false;
  if (onlineOnly && event.location?.toLowerCase() !== 'virtual') return false;
  if (dateFilter === 'tomorrow') return isTomorrow(event.date);
  if (dateFilter === 'weekend') return isComingWeekend(event.date);
  if (!searchQuery) return true;
  const term = searchQuery.toLowerCase();
  return (
    event.title?.toLowerCase().includes(term) ||
    event.location?.toLowerCase().includes(term) ||
    event.organizer?.toLowerCase().includes(term)
  );
}

export function CPDashboard() {
  const [events, setEvents] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [onlineOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);
  const { recentSearches, addSearch, removeSearch } = useRecentSearches();

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
    addSearch(trimmed);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setShowRecentSearches(false);
  };

  // keep this near your refs/functions
  const BASE_HEIGHT = 32;

  const autoGrow = el => {
    if (!el) return;
    el.style.height = `${BASE_HEIGHT}px`; // reset to base
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const searchRef = useRef(null);
  const recentDropdownRef = useRef(null);
  const blurTimeoutRef = useRef(null);

  useEffect(() => {
    autoGrow(searchRef.current); // ✅ runs even when you clear via button
  }, [searchInput]);

  const handleSearchKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault(); // ✅ stops newline
      const trimmed = searchInput.trim();
      setSearchQuery(trimmed);
      addSearch(trimmed);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      setShowRecentSearches(false);
    }
  };

  const handleSearchFocus = () => {
    setShowRecentSearches(true);
  };

  const handleSearchBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setShowRecentSearches(false);
    }, 200);
  };

  const handleRecentDropdownMouseDown = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
  };

  const handleSelectRecent = term => {
    setSearchInput(term);
    setSearchQuery(term);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setShowRecentSearches(false);
    if (searchRef.current) searchRef.current.focus();
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

  // Handler to update pending filter values
  const handleFilterChange = (filterName, value) => {
    setPendingFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
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

  const filteredEvents = events.filter(event =>
    passesFilters(event, {
      showPastEvents,
      isPastEvent,
      onlineOnly: appliedFilters.onlineOnly,
      dateFilter: appliedFilters.dateFilter,
      searchQuery,
    }),
  );

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
              <h5 className={styles.eventTitle} data-event-title={event.title || 'Untitled event'}>
                <span className={styles.eventTitleText}>{event.title}</span>
              </h5>
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
                      onFocus={handleSearchFocus}
                      onBlur={handleSearchBlur}
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
                  {showRecentSearches && (
                    <div
                      ref={recentDropdownRef}
                      onMouseDown={handleRecentDropdownMouseDown}
                      role="menu"
                      aria-label="Recent searches"
                      tabIndex={-1}
                    >
                      <RecentSearchDropdown
                        searches={recentSearches}
                        onSelect={handleSelectRecent}
                        onRemove={removeSearch}
                        darkMode={darkMode}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Date Filter */}
              <div className={styles.filterItem}>
                <label htmlFor="date-tomorrow">Dates</label>
                <div className={styles.radioRow}>
                  <div className={styles.radioGroup}>
                    <input
                      id="date-tomorrow"
                      type="radio"
                      name="dates"
                      checked={pendingFilters.dateFilter === 'tomorrow'}
                      onChange={() => handleFilterChange('dateFilter', 'tomorrow')}
                      className={styles.radioInput}
                    />
                    <label htmlFor="date-tomorrow" className={styles.radioLabel}>
                      Tomorrow
                    </label>
                  </div>
                  <div className={styles.radioGroup}>
                    <input
                      id="date-weekend"
                      type="radio"
                      name="dates"
                      checked={pendingFilters.dateFilter === 'weekend'}
                      onChange={() => handleFilterChange('dateFilter', 'weekend')}
                      className={styles.radioInput}
                    />
                    <label htmlFor="date-weekend" className={styles.radioLabel}>
                      This Weekend
                    </label>
                  </div>
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
                <div className={styles.radioRow}>
                  <div className={styles.radioGroup}>
                    <input
                      type="checkbox"
                      id="online-only"
                      checked={pendingFilters.onlineOnly}
                      onChange={e => handleFilterChange('onlineOnly', e.target.checked)}
                      className={styles.radioInput}
                    />
                    <label htmlFor="online-only" className={styles.radioLabel}>
                      Online Only
                    </label>
                  </div>
                </div>
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
