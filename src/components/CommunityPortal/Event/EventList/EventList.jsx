import { useState, useEffect } from 'react';
import { Row, Col, FormGroup, Label, Input, Spinner } from 'reactstrap';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import EventCard from '../EventCard/EventCard';

function EventList() {
  const [events, setEvents] = useState([]);
  const [types, setTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    location: '',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [eventsRes, typesRes, locationsRes] = await Promise.all([
          axios.get(ENDPOINTS.EVENTS),
          axios.get(ENDPOINTS.EVENT_TYPES),
          axios.get(ENDPOINTS.EVENT_LOCATIONS),
        ]);
        setEvents(eventsRes.data.events);
        setTypes(typesRes.data.types);
        setLocations(locationsRes.data.locations);
      } catch (err) {
        setError(`Failed to fetch data: ${err.message}. Please try again later.`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredEvents = events.filter(
    event =>
      (!filters.type || event.type === filters.type) &&
      (!filters.location || event.location === filters.location),
  );

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '200px' }}
      >
        <Spinner color="primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid p-3">
      {error && <div className="alert alert-danger">{error}</div>}
      <Row className="mb-4">
        <Col md={6}>
          <FormGroup>
            <Label>Event Type</Label>
            <Input
              type="select"
              value={filters.type}
              onChange={e => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label>Event Location</Label>
            <Input
              type="select"
              value={filters.location}
              onChange={e => setFilters({ ...filters, location: e.target.value })}
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        {filteredEvents.length === 0 ? (
          <Col>
            <div className="alert alert-info">No events found matching your criteria.</div>
          </Col>
        ) : (
          filteredEvents.map(event => (
            <Col key={event._id} lg={4} md={6} className="mb-4">
              <EventCard event={event} />
            </Col>
          ))
        )}
      </Row>
    </div>
  );
}

export default EventList;
