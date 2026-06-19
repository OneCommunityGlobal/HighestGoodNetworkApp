/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Card, CardBody, Button, Input, Label } from 'reactstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserAlt, FaSearch, FaTimes } from 'react-icons/fa';
import styles from './CPDashboard.module.css';
import { ENDPOINTS } from '../../utils/URL';
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

// Shared shape for a community event
const eventShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  image: PropTypes.string,
  title: PropTypes.string,
  date: PropTypes.string,
  location: PropTypes.string,
  organizer: PropTypes.string,
});

// Helper: combine base and dark variant class names
const cx = (base, darkMode) =>
  darkMode ? `${styles[base]} ${styles[`${base}-dark`]}` : styles[base];

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

const LoadingView = ({ darkMode }) => (
  <Container className={cx('dashboard-container', darkMode)}>
    <p className={darkMode ? styles['loading-text-dark'] : ''}>Loading events...</p>
  </Container>
);

LoadingView.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

const ErrorView = ({ error, darkMode }) => (
  <Container className={cx('dashboard-container', darkMode)}>
    <p className={`${styles['error-text']} ${darkMode ? styles['error-text-dark'] : ''}`}>
      {error}
    </p>
  </Container>
);

ErrorView.propTypes = {
  error: PropTypes.string.isRequired,
  darkMode: PropTypes.bool.isRequired,
};

const SearchBar = ({ searchInput, setSearchInput, onSearch, onClear, onKeyDown, darkMode }) => (
  <div className={styles['dashboard-controls']}>
    <div className={styles['dashboard-search-container']}>
      <Input
        id="search"
        type="search"
        placeholder="Search events..."
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)}
        onKeyDown={onKeyDown}
        className={cx('dashboard-search-input', darkMode)}
      />

      {searchInput && (
        <button type="button" className={cx('dashboard-clear-btn', darkMode)} onClick={onClear}>
          <FaTimes />
        </button>
      )}

      <button
        type="button"
        className={cx('dashboard-search-icon-btn', darkMode)}
        onClick={onSearch}
        aria-label="Search events"
      >
        <FaSearch />
      </button>
    </div>
  </div>
);

SearchBar.propTypes = {
  searchInput: PropTypes.string.isRequired,
  setSearchInput: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
};

const FiltersSidebar = ({ darkMode }) => (
  <div className={cx('filter-section', darkMode)}>
    <h4 className={darkMode ? styles['filter-section-title-dark'] : ''}>Search Filters</h4>
    <div className={styles['filter-section-divider']}>
      <div className={styles['filter-item']}>
        <label htmlFor="date-filter-input" className={darkMode ? styles['filter-label-dark'] : ''}>
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
            <span className={darkMode ? styles['filter-option-text-dark'] : ''}>Tomorrow</span>
          </label>
          <label className={styles['radio-label']}>
            <Input
              type="radio"
              name="dates"
              id="date-weekend"
              className={darkMode ? styles['filter-radio-dark'] : ''}
            />
            <span className={darkMode ? styles['filter-option-text-dark'] : ''}>This Weekend</span>
          </label>
        </div>
        <Input
          id="date-filter-input"
          type="date"
          placeholder="Ending After"
          className={cx('date-filter', darkMode)}
        />
      </div>

      <div className={styles['filter-item']}>
        <label htmlFor="online-only" className={darkMode ? styles['filter-label-dark'] : ''}>
          Online
        </label>
        <label className={styles['checkbox-label']}>
          <Input
            type="checkbox"
            id="online-only"
            className={darkMode ? styles['filter-checkbox-dark'] : ''}
          />
          <span className={darkMode ? styles['filter-option-text-dark'] : ''}>Online Only</span>
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
);

FiltersSidebar.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

const EventCard = ({ event, darkMode, fallback }) => (
  <Col md={4} key={event.id} className={styles['event-card-col']}>
    <Card
      className={
        darkMode ? `${styles['event-card']} ${styles['event-card-dark']}` : styles['event-card']
      }
    >
      <div className={styles['event-card-img-container']}>
        <FixedRatioImage src={event.image} alt={event.title} fallback={fallback} />
      </div>
      <CardBody className={darkMode ? styles['event-card-body-dark'] : ''}>
        <h5 className={`${styles['event-title']} ${darkMode ? styles['event-title-dark'] : ''}`}>
          {event.title}
        </h5>
        <p className={`${styles['event-date']} ${darkMode ? styles['event-text-dark'] : ''}`}>
          <FaCalendarAlt className={styles['event-icon']} /> {formatDate(event.date)}
        </p>
        <p className={`${styles['event-location']} ${darkMode ? styles['event-text-dark'] : ''}`}>
          <FaMapMarkerAlt className={styles['event-icon']} /> {event.location}
        </p>
        <p className={`${styles['event-organizer']} ${darkMode ? styles['event-text-dark'] : ''}`}>
          <FaUserAlt className={styles['event-icon']} /> {event.organizer}
        </p>
      </CardBody>
    </Card>
  </Col>
);

EventCard.propTypes = {
  event: eventShape.isRequired,
  darkMode: PropTypes.bool.isRequired,
  fallback: PropTypes.string.isRequired,
};

const EventsGrid = ({ events, darkMode, fallback }) => (
  <Row>
    {events.length > 0 ? (
      events.map(ev => <EventCard key={ev.id} event={ev} darkMode={darkMode} fallback={fallback} />)
    ) : (
      <div className={`${styles['no-events']} ${darkMode ? styles['no-events-dark'] : ''}`}>
        No events available
      </div>
    )}
  </Row>
);

EventsGrid.propTypes = {
  events: PropTypes.arrayOf(eventShape).isRequired,
  darkMode: PropTypes.bool.isRequired,
  fallback: PropTypes.string.isRequired,
};

const PaginationControls = ({ pagination, totalPages, goToPage }) =>
  totalPages > 1 ? (
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
  ) : null;

PaginationControls.propTypes = {
  pagination: PropTypes.shape({
    currentPage: PropTypes.number,
    limit: PropTypes.number,
    total: PropTypes.number,
  }).isRequired,
  totalPages: PropTypes.number.isRequired,
  goToPage: PropTypes.func.isRequired,
};

function CPDashboard() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [events, setEvents] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, total: 0, limit: 6 });

  const FALLBACK_IMG =
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=60';

  useEffect(() => {
    let mounted = true;
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(ENDPOINTS.EVENTS);
        if (!mounted) return;
        const list = response.data.events || [];
        setEvents(list);
        setPagination(prev => ({ ...prev, total: list.length }));
      } catch (err) {
        if (!mounted) return;
        setError('Failed to load events');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchEvents();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSearch = () => {
    const trimmed = searchInput.trim();
    setSearchQuery(trimmed);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleClear = () => {
    setSearchInput('');
    setSearchQuery('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSearchKeyDown = e => {
    if (e.key === 'Enter') handleSearch();
  };

  const filteredEvents = useMemo(() => {
    if (!searchQuery) return events;
    const term = searchQuery.toLowerCase();
    return events.filter(
      ev =>
        (ev.title || '')?.toLowerCase().includes(term) ||
        (ev.location || '')?.toLowerCase().includes(term) ||
        (ev.organizer || '')?.toLowerCase().includes(term),
    );
  }, [events, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pagination.limit));

  const displayedEvents = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.limit;
    return filteredEvents.slice(start, start + pagination.limit);
  }, [filteredEvents, pagination]);

  const goToPage = newPage => {
    if (newPage < 1 || newPage > totalPages) return;
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  if (isLoading) return <LoadingView darkMode={darkMode} />;
  if (error) return <ErrorView error={error} darkMode={darkMode} />;

  return (
    <Container className={cx('dashboard-container', darkMode)}>
      <header className={cx('dashboard-header', darkMode)}>
        <h1 className={darkMode ? styles['dashboard-title-dark'] : ''}>All Events</h1>
        <SearchBar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSearch={handleSearch}
          onClear={handleClear}
          onKeyDown={handleSearchKeyDown}
          darkMode={darkMode}
        />
      </header>

      <Row className={styles['dashboard-row']}>
        <Col md={3} className={styles['dashboard-sidebar']}>
          <FiltersSidebar darkMode={darkMode} />
        </Col>

        <Col md={9} className={styles['dashboard-main']}>
          <h2
            className={`${styles['section-title']} ${darkMode ? styles['section-title-dark'] : ''}`}
          >
            Events
          </h2>
          <EventsGrid events={displayedEvents} darkMode={darkMode} fallback={FALLBACK_IMG} />
          <PaginationControls pagination={pagination} totalPages={totalPages} goToPage={goToPage} />
          <div className={styles['dashboard-actions']}>
            <Button color="primary">Show Past Events</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default CPDashboard;
