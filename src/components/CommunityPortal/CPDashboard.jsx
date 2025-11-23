import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Input } from 'reactstrap';
import styles from './CPDashboard.module.css';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserAlt } from 'react-icons/fa';

export function CPDashboard() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');

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

  return (
    <Container fluid className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <h1>All Events</h1>
        <div className="dashboard-controls">
          <div className={styles.dashboardSearchContainer}>
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
        <Col md={3} className={styles.dashboardSidebar}>
          <div className={styles.filterSection}>
            <h4>Search Filters</h4>
            <div className={styles.filterItem}>
              <div className={styles.filterLabel}>Dates</div>
              <div className={styles.filterOptionsHorizontal}>
                <div>
                  <Input type="radio" name="dates" id="date-tomorrow" />{' '}
                  <label htmlFor="date-tomorrow">Tomorrow</label>
                </div>
                <div>
                  <Input type="radio" name="dates" id="date-weekend" />{' '}
                  <label htmlFor="date-weekend">This Weekend</label>
                </div>
              </div>
              <Input type="date" placeholder="Ending After" className={styles.dateFilter} />
            </div>
            <div className={styles.filterItem}>
              <div className={styles.filterLabel}>Online</div>
              <div className={styles.filterCheckboxContainer}>
                <div>
                  <Input type="checkbox" id="online-checkbox" />{' '}
                  <label htmlFor="online-checkbox">Online Only</label>
                </div>
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
        </Col>

        <Col md={9} className={styles.dashboardMain}>
          <h2 className={styles.sectionTitle}>Events</h2>
          <Row>
            {events.length > 0 ? (
              events.map(event => (
                <Col md={4} key={event.id} className="event-card-col">
                  <Card className={styles.eventCard}>
                    <div className={styles.eventCardImgContainer}>
                      <img src={event.image} alt={event.title} className="event-card-img" />
                    </div>
                    <CardBody>
                      <h5 className={styles.eventTitle}>{event.title}</h5>
                      <p className={styles.eventDate}>
                        <FaCalendarAlt className="event-icon" /> {event.date}
                      </p>
                      <p className={styles.eventLocation}>
                        <FaMapMarkerAlt className="event-icon" /> {event.location}
                      </p>
                      <p className={styles.eventOrganizer}>
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
          <div className={styles.dashboardActions}>
            <Button color="primary">Show Past Events</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default CPDashboard;
