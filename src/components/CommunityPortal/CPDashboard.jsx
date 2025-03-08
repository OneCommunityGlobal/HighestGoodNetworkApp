import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { useHistory } from 'react-router-dom'; // For React Router v5
import './CPDashboard.css';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserAlt } from 'react-icons/fa';

export function CPDashboard() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const history = useHistory(); // Use useHistory for navigation

  useEffect(() => {
    const mockEvents = [
      {
        id: 1,
        title: 'PGSA Lunch Talks',
        date: 'Friday, December 6 at 12:00PM EST',
        location: 'Disque 919',
        organizer: 'Physics Graduate Student Association',
        image: 'https://via.placeholder.com/300',
      },
      {
        id: 2,
        title: 'Hot Chocolate/Bake Sale',
        date: 'Friday, December 6 at 12:00PM EST',
        location: 'G.C LeBow - Lobby Tabling Space 2',
        organizer: 'Kappa Phi Gamma, Sorority Inc.',
        image: 'https://via.placeholder.com/300',
      },
      {
        id: 3,
        title: 'Holiday Lunch',
        date: 'Friday, December 6 at 12:00PM EST',
        location: 'Hill Conference Room',
        organizer: 'Chemical and Biological Engineering Graduate Society',
        image: 'https://via.placeholder.com/300',
      },
    ];
    setEvents(mockEvents);
  }, []);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleNavigation = path => {
    history.push(path); // Navigate to the selected path
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
          <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} className="community-dropdown">
            <DropdownToggle caret color="secondary">
              Community Portal
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => handleNavigation('/home')}>Home</DropdownItem>
              <DropdownItem onClick={() => handleNavigation('/events')}>Events</DropdownItem>
              <DropdownItem onClick={() => handleNavigation('/about')}>About Us</DropdownItem>
              <DropdownItem onClick={() => handleNavigation('/contact')}>Contact</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </header>

      <Row>
        <Col md={3} className="dashboard-sidebar">
          <div className="filter-section">
            <h4>Search Filters</h4>
            <div className="filter-item">
              <label>Dates</label>
              <div className="filter-options-horizontal">
                <div>
                  <Input type="radio" name="dates" /> Tomorrow
                </div>
                <div>
                  <Input type="radio" name="dates" /> This Weekend
                </div>
              </div>
              <Input type="date" placeholder="Ending After" className="date-filter" />
            </div>
            <div className="filter-item">
              <label>Online</label>
              <div>
                <Input type="checkbox" /> Online Only
              </div>
            </div>
            <div className="filter-item">
              <label>Branches</label>
              <Input type="select">
                <option>Select branches</option>
              </Input>
            </div>
            <div className="filter-item">
              <label>Themes</label>
              <Input type="select">
                <option>Select themes</option>
              </Input>
            </div>
            <div className="filter-item">
              <label>Categories</label>
              <Input type="select">
                <option>Select categories</option>
              </Input>
            </div>
          </div>
        </Col>

        <Col md={9} className="dashboard-main">
          <h2 className="section-title">Events</h2>
          <Row>
            {events.length > 0 ? (
              events.map(event => (
                <Col md={4} key={event.id} className="event-card-col">
                  <Card className="event-card">
                    <div className="event-card-img-container">
                      <img src={event.image} alt={event.title} className="event-card-img" />
                    </div>
                    <CardBody>
                      <h5 className="event-title">{event.title}</h5>
                      <p className="event-date">
                        <FaCalendarAlt className="event-icon" /> {event.date}
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
