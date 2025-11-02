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
        <div className={styles.dashboardControls}>
          <div className={styles.dashboardSearchContainer}>
            <Input
              type="search"
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.dashboardSearch}
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
              <label htmlFor="date-tomorrow"> Dates</label>
              <div className={styles.filterOptionsHorizontal}>
                <div>
                  <Input type="radio" name="dates" /> Tomorrow
                </div>
                <div>
                  <Input type="radio" name="dates" /> This Weekend
                </div>
              </div>
              <Input type="date" placeholder="Ending After" className={styles.dateFilter} />
            </div>
            <div className={styles.filterItem}>
              <label htmlFor="online-only">Online</label>
              <div>
                <Input type="checkbox" /> Online Only
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
          <div className={styles.eventsHeader}>
            <h2 className={styles.sectionTitle}>Events</h2>
            <Button color="primary" className={styles.showPastEventsBtn}>
              Show Past Events
            </Button>
          </div>
          <Row>
            {events.length > 0 ? (
              events.map(event => (
                <Col md={4} key={event.id} className={styles.eventCardCol}>
                  <Card className={styles.eventCard}>
                    <div className={styles.eventCardImgContainer}>
                      <img src={event.image} alt={event.title} className={styles.eventCardImg} />
                    </div>
                    <CardBody>
                      <h5 className={styles.eventTitle}>{event.title}</h5>
                      <p className={styles.eventDate}>
                        <FaCalendarAlt className={styles.eventIcon} /> {event.date}
                      </p>
                      <p className={styles.eventLocation}>
                        <FaMapMarkerAlt className={styles.eventIcon} /> {event.location}
                      </p>
                      <p className={styles.eventOrganizer}>
                        <FaUserAlt className={styles.eventIcon} /> {event.organizer}
                      </p>
                    </CardBody>
                  </Card>
                </Col>
              ))
            ) : (
              <div className={styles.noEvents}>No events available</div>
            )}
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default CPDashboard;
