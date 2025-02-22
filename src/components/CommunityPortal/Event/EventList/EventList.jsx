import { useState, useEffect } from 'react';
import {
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Spinner,
  Pagination,
  PaginationItem,
  PaginationLink,
} from 'reactstrap';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import EventCard from '../EventCard/EventCard';

function EventList() {
  // State for events and pagination
  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [locationTypes, setLocationTypes] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 9,
  });

  // State for filters - starting empty to show all events
  const [filters, setFilters] = useState({
    type: '',
    location: '',
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch events when page changes or filters are applied
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // Build query parameters including pagination and any active filters
        const params = new URLSearchParams({
          page: pagination.currentPage,
          limit: pagination.limit,
          ...(filters.type && { type: filters.type }),
          ...(filters.location && { location: filters.location }),
        });

        const response = await axios.get(`${ENDPOINTS.EVENTS}?${params}`);
        console.log('Events data:', response.data);
        setEvents(response.data.events);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination,
        }));
      } catch (err) {
        setError('Failed to fetch events');
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [pagination.currentPage, filters]);

  // fetch filter options when component mounts
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [typesRes, locationsRes] = await Promise.all([
          axios.get(ENDPOINTS.EVENT_TYPES),
          axios.get(ENDPOINTS.EVENT_LOCATIONS),
        ]);
        setEventTypes(typesRes.data.types);
        setLocationTypes(locationsRes.data.locations);
      } catch (err) {
        // We might want to show an error, but not block the whole component
        console.error('Failed to load filter options:', err);
      }
    };

    fetchFilterOptions();
  }, []);

  // Handle page changes
  const handlePageChange = newPage => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  // Handle filter changes - resets to page 1
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1, // Reset to first page when filters change
    }));
  };

  return (
    <div className="container-fluid p-3">
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Optional Filter Section */}
      <Row className="mb-4">
        <Col md={6}>
          <FormGroup>
            <Label>Event Type</Label>
            <Input
              type="select"
              value={filters.type}
              onChange={e => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label>Location</Label>
            <Input
              type="select"
              value={filters.location}
              onChange={e => handleFilterChange('location', e.target.value)}
            >
              <option value="">All Locations</option>
              {locationTypes.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
      </Row>

      {/* Events Display */}
      {isLoading ? (
        <div className="d-flex justify-content-center">
          <Spinner color="primary" />
        </div>
      ) : (
        <>
          <Row>
            {events.length === 0 ? (
              <Col>
                <div className="alert alert-info">No events found</div>
              </Col>
            ) : (
              events.map(event => (
                <Col key={event._id} lg={4} md={6} className="mb-4">
                  <EventCard event={event} />
                </Col>
              ))
            )}
          </Row>

          {/* Pagination Controls */}
          {events.length > 0 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <PaginationItem disabled={pagination.currentPage === 1}>
                  <PaginationLink onClick={() => handlePageChange(pagination.currentPage - 1)}>
                    Previous
                  </PaginationLink>
                </PaginationItem>

                {[...Array(pagination.totalPages)].map((_, index) => (
                  <PaginationItem key={index + 1} active={pagination.currentPage === index + 1}>
                    <PaginationLink onClick={() => handlePageChange(index + 1)}>
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem disabled={pagination.currentPage === pagination.totalPages}>
                  <PaginationLink onClick={() => handlePageChange(pagination.currentPage + 1)}>
                    Next
                  </PaginationLink>
                </PaginationItem>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default EventList;
