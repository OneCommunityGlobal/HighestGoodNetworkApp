import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Row,
  Alert,
  Col,
  Card,
  CardBody,
  Button,
  Input,
  FormGroup,
  Label,
} from 'reactstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserAlt, FaSearch, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';
import { getUserTimezone, formatEventTimeWithTimezone } from '../../utils/timezoneUtils';
import styles from './CPDashboard.module.css';
import { ENDPOINTS } from '../../utils/URL';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { el } from 'date-fns/locale';
import { fuzzySearch } from '../../utils/fuzzySearch';

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

export function CPDashboard() {
  const [events, setEvents] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [error, setError] = useState(null);
  const [failedLogos, setFailedLogos] = useState(new Set());
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
    setSelectedDate(date);
  };

  const FALLBACK_IMG =
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=60';

  const normalizeOrganizer = organizer => {
    if (!organizer || typeof organizer !== 'string') return null;
    const trimmed = organizer.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const handleLogoError = eventId => {
    setFailedLogos(prev => new Set([...prev, eventId]));
  };

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
        console.error('Failed to load events:', err);
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
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const handleSearchClick = () => {
    const trimmed = searchInput.trim();
    setSearchQuery(trimmed);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const BASE_HEIGHT = 36;

  const autoGrow = el => {
    if (!el) return;
    el.style.height = `${BASE_HEIGHT}px`;
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const searchRef = useRef(null);
  useEffect(() => {
    autoGrow(searchRef.current);
  }, [searchInput]);

  const handleSearchKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
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
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Date TBD';
    }
  };

  const formatTime = (eventDate, timeStr) => {
    if (!timeStr) return 'Time TBD';
    try {
      const userTimezone = getUserTimezone();
      return formatEventTimeWithTimezone(eventDate, timeStr, userTimezone);
    } catch (err) {
      console.error('Error formatting time:', err);
      return 'Time TBD';
    }
  };

  const getDisplayLocation = location => {
    if (
      location == null ||
      String(location).trim() === '' ||
      String(location).toLowerCase() === 'tbd'
    ) {
      return 'Location TBD';
    }
    return location;
  };

  const parseEventDate = dateString => {
    if (!dateString) return null;

    try {
      const parsedDate = new Date(dateString);
      if (!Number.isNaN(parsedDate.getTime())) {
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (err) {
      console.error('Error parsing event date:', err);
    }
    return null;
  };

  const filteredEvents = events.filter(event => {
    if (onlineOnly) {
      const isOnlineEvent = event.location?.toLowerCase() === 'virtual';
      if (!isOnlineEvent) return false;
    }

    if (dateFilter === 'tomorrow') {
      if (!isTomorrow(event.date)) return false;
    } else if (dateFilter === 'weekend') {
      if (!isComingWeekend(event.date)) return false;
    }

    const eventDate = event.date ? parseEventDate(event.date) : null;
    if (selectedDate && eventDate !== selectedDate) {
      return false;
    }

    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();

    return (
      fuzzySearch(event.title, term, 0.6) ||
      fuzzySearch(event.location, term, 0.6) ||
      fuzzySearch(event.organizer, term, 0.6)
    );
  });

  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [searchQuery, selectedDate, onlineOnly, dateFilter]);

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

  let eventsContent;

  if (displayedEvents.length > 0) {
    eventsContent = displayedEvents.map(event => (
      <Col md={4} key={event.id} className={styles.eventCardCol}>
        <Card className={styles.eventCard}>
          <div className={styles.eventCardImgContainer}>
            <FixedRatioImage src={event.image} alt={event.title} fallback={FALLBACK_IMG} />
          </div>
          <CardBody>
            <h5 className={styles.eventTitle}>{event.title}</h5>
            <div className={styles.eventDate}>
              <FaCalendarAlt className={styles.eventIcon} />
              <div>
                <div>{formatDate(event.date)}</div>
                {event.startTime && (
                  <div className={styles.eventTime}>{formatTime(event.date, event.startTime)}</div>
                )}
              </div>
            </div>
            <p className={styles.eventLocation}>
              <FaMapMarkerAlt className={styles.eventIcon} /> {getDisplayLocation(event.location)}
            </p>
            <p className={styles.eventOrganizer}>
              {event.organizerLogo && !failedLogos.has(event._id) ? (
                <img
                  src={event.organizerLogo}
                  alt={normalizeOrganizer(event.organizer) || 'Organizer'}
                  className={styles.organizerLogo}
                  onError={() => handleLogoError(event._id)}
                  loading="lazy"
                />
              ) : (
                <FaUserAlt className={styles.eventIcon} aria-hidden="true" />
              )}{' '}
              <span>{normalizeOrganizer(event.organizer) || 'Organizer TBD'}</span>
            </p>
          </CardBody>
        </Card>
      </Col>
    ));
  } else {
    eventsContent = <div className={styles.noEvents}>No events available</div>;
  }

  return (
    <Container className={styles.dashboardContainer}>
      <header className={`${styles.dashboardHeader} ${darkMode ? styles.darkHeader : ''}`}>
        <h1>All Events</h1>
        <div>
          <div
            className={`${styles.dashboardSearchContainer} ${
              darkMode ? styles.darkSearchContainer : ''
            }`}
          >
            <textarea
              ref={searchRef}
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
      </header>

      <Row>
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
                  <Button
                    color="primary"
                    onClick={() => {
                      setDateFilter('');
                      setSelectedDate('');
                    }}
                  >
                    Clear date filter
                  </Button>
                </div>
                <div className={styles.filterItem}>
                  <div className={styles.dateFilterContainer}>
                    <DatePicker
                      type="date"
                      selected={selectedDate ? new Date(selectedDate) : null}
                      onChange={handleDateChange}
                      placeholderText="Ending After"
                      id="ending-after"
                      className={styles.dateFilter}
                      dateFormat="yyyy-MM-dd"
                      isClearable
                    />
                  </div>
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
                <Input id="branches" type="select">
                  <option>Select branches</option>
                </Input>
              </div>

              <div className={styles.filterItem}>
                <label htmlFor="themes">Themes</label>
                <Input id="themes" type="select">
                  <option>Select themes</option>
                </Input>
              </div>

              <div className={styles.filterItem}>
                <label htmlFor="categories">Categories</label>
                <Input id="categories" type="select">
                  <option>Select categories</option>
                </Input>
              </div>
            </div>
          </div>
        </Col>

        <Col md={9} className={`${styles.dashboardMain} ${darkMode ? styles.darkMain : ''}`}>
          <div className={styles.eventsHeader}>
            <h2 className={styles.sectionTitle}>Events</h2>
            <Button color="primary" className={styles.showPastEventsBtn}>
              Show Past Events
            </Button>
          </div>

          <p className={styles['event-count-text']}>
            {isFiltered
              ? totalFilteredCount > 0
                ? `Showing ${totalFilteredCount} event${totalFilteredCount !== 1 ? 's' : ''}`
                : 'No events found'
              : 'Showing all events'}
          </p>

          <Row>{eventsContent}</Row>

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
