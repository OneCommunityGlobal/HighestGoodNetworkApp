import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Input } from 'reactstrap';
import './CPDashboard.css';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserAlt } from 'react-icons/fa';

export function CPDashboard() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    const mockEvents = [
      {
        id: 1,
        title: 'PGSA Lunch Talks',
        date: '2025-11-08T12:00:00',
        location: 'Disque 919',
        organizer: 'Physics Graduate Student Association',
        image: 'https://via.placeholder.com/300',
      },
      {
        id: 2,
        title: 'Hot Chocolate/Bake Sale',
        date: '2025-11-15T12:00:00',
        location: 'G.C LeBow - Lobby Tabling Space 2',
        organizer: 'Kappa Phi Gamma, Sorority Inc.',
        image: 'https://via.placeholder.com/300',
      },
      {
        id: 3,
        title: 'Holiday Lunch',
        date: '2025-12-22T12:00:00',
        location: 'Hill Conference Room',
        organizer: 'Chemical and Biological Engineering Graduate Society',
        image: 'https://via.placeholder.com/300',
      },
    ];
    setEvents(mockEvents);
    setFilteredEvents(mockEvents);
  }, []);

  useEffect(() => {
    let filtered = [...events];
    const today = new Date();

    if (selectedDateFilter === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      filtered = events.filter(event => isSameDay(new Date(event.date), tomorrow));
    } else if (selectedDateFilter === 'weekend') {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sun, 6 = Sat

      // Calculate upcoming Saturday and Sunday
      const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
      const saturday = new Date(today);
      saturday.setDate(today.getDate() + daysUntilSaturday);

      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);

      // Keep only events within this weekend range
      filtered = events.filter(event => {
        const eventDate = new Date(event.date);
        const eventDay = eventDate.toISOString().split('T')[0];
        const saturdayDay = saturday.toISOString().split('T')[0];
        const sundayDay = sunday.toISOString().split('T')[0];
        return eventDay >= saturdayDay && eventDay <= sundayDay;
      });
    } else if (customDate) {
      filtered = events.filter(event => isSameDay(event.date, customDate));
    }

    setFilteredEvents(filtered);
  }, [selectedDateFilter, customDate, events]);

  function isSameDay(date1, date2) {
    const day1 = new Date(date1).toISOString().split('T')[0];
    const day2 = new Date(date2).toISOString().split('T')[0];
    return day1 === day2;
  }

  const formatDateForUI = dateString => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Container fluid className="dashboard-container">
      <header className="dashboard-header">
        <h1>All Events</h1>
        <div className="dashboard-controls">
          <div className="dashboard-search-container">
            <Input
              type="search"
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="dashboard-search"
            />
          </div>
          {/* <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} className="community-dropdown">
            <DropdownToggle caret color="secondary">
              Community Portal
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => handleNavigation('/home')}>Home</DropdownItem>
              <DropdownItem onClick={() => handleNavigation('/events')}>Events</DropdownItem>
              <DropdownItem onClick={() => handleNavigation('/about')}>About Us</DropdownItem>
              <DropdownItem onClick={() => handleNavigation('/contact')}>Contact</DropdownItem>
            </DropdownMenu>
          </Dropdown> */}
        </div>
      </header>

      <Row>
        <Col md={3} className="dashboard-sidebar">
          <div className="filter-section">
            <h4>Search Filters</h4>
            <div className="filter-item">
              <label htmlFor="date-tomorrow"> Dates</label>
              <div className="filter-options-horizontal">
                <div>
                  <Input
                    type="radio"
                    name="dates"
                    checked={selectedDateFilter === 'tomorrow'}
                    onChange={() => {
                      setSelectedDateFilter(prev => (prev === 'tomorrow' ? '' : 'tomorrow'));
                      setCustomDate('');
                    }}
                  />{' '}
                  Tomorrow
                </div>
                <div>
                  <Input
                    type="radio"
                    name="dates"
                    checked={selectedDateFilter === 'weekend'}
                    onClick={() => {
                      setSelectedDateFilter(prev => (prev === 'weekend' ? '' : 'weekend'));
                      setCustomDate('');
                    }}
                  />{' '}
                  This Weekend
                </div>
              </div>
              <Input
                type="date"
                value={customDate}
                onClick={e => {
                  setSelectedDateFilter('');
                  setCustomDate(e.target.value);
                }}
                className="date-filter"
              />
            </div>
            <div className="filter-item">
              <label htmlFor="online-only">Online</label>
              <div>
                <Input type="checkbox" /> Online Only
              </div>
            </div>
            <div className="filter-item">
              <label htmlFor="branches">Branches</label>
              <Input type="select">
                <option>Select branches</option>
              </Input>
            </div>
            <div className="filter-item">
              <label htmlFor="themes">Themes</label>
              <Input type="select">
                <option>Select themes</option>
              </Input>
            </div>
            <div className="filter-item">
              <label htmlFor="categories">Categories</label>
              <Input type="select">
                <option>Select categories</option>
              </Input>
            </div>
          </div>
        </Col>

        <Col md={9} className="dashboard-main">
          <h2 className="section-title">Events</h2>
          <Row>
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <Col md={4} key={event.id} className="event-card-col">
                  <Card className="event-card">
                    <div className="event-card-img-container">
                      <img src={event.image} alt={event.title} className="event-card-img" />
                    </div>
                    <CardBody>
                      <h5 className="event-title">{event.title}</h5>
                      <p className="event-date">
                        <FaCalendarAlt className="event-icon" /> {formatDateForUI(event.date)}
                      </p>
                      <p className="event-location">
                        <FaMapMarkerAlt className="event-icon" /> {event.location}
                      </p>
                      <p className="event-organizer">
                        <FaUserAlt className="event-icon" /> {event.organizer}
                      </p>
                    </CardBody>
                  </Card>
                </Col>
              ))
            ) : (
              <div className="no-events">No events available</div>
            )}
          </Row>
          <div className="dashboard-actions">
            <Button color="primary">Show Past Events</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default CPDashboard;
