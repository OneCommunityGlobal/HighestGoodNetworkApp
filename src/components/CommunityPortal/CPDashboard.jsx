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
    <Container className={styles['dashboard-container']}>
      <header className={styles['dashboard-header']}>
        <h1>All Events</h1>
        <div className={styles['dashboard-controls']}>
          <div className={styles['dashboard-search-container']}>
            <Input
              type="search"
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles['dashboard-search']}
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
        <Col md={3} className={styles['dashboard-sidebar']}>
          <div className={styles['filter-section']}>
            <h4>Search Filters</h4>
            <div className={styles['filter-section-divider']}>
              <div className={styles['filter-item']}>
                <label htmlFor="date-tomorrow"> Dates</label>
                <div className={styles['filter-options-horizontal']}>
                  <div>
                    <Input type="radio" name="dates" /> Tomorrow
                  </div>
                  <div>
                    <Input type="radio" name="dates" /> This Weekend
                  </div>
                </div>
                <Input type="date" placeholder="Ending After" className={styles['date-filter']} />
              </div>
              <div className={styles['filter-item']}>
                <label htmlFor="online-only">Online</label>
                <div>
                  <Input type="checkbox" /> Online Only
                </div>
              </div>
              <div className={styles['filter-item']}>
                <label htmlFor="branches">Branches</label>
                <Input type="select">
                  <option>Select branches</option>
                </Input>
              </div>
              <div className={styles['filter-item']}>
                <label htmlFor="themes">Themes</label>
                <Input type="select">
                  <option>Select themes</option>
                </Input>
              </div>
              <div className={styles['filter-item']}>
                <label htmlFor="categories">Categories</label>
                <Input type="select">
                  <option>Select categories</option>
                </Input>
              </div>
            </div>
          </div>
        </Col>

        <Col md={9} className={styles['dashboard-main']}>
          <h2 className={styles['section-title']}>Events</h2>
          <Row>
            {events.length > 0 ? (
              events.map(event => (
                <Col md={4} key={event.id} className={styles['event-card-col']}>
                  <Card className={styles['event-card']}>
                    <div className={styles['event-card-img-container']}>
                      <img
                        src={event.image}
                        alt={event.title}
                        className={styles['event-card-img']}
                      />
                    </div>
                    <CardBody>
                      <h5 className={styles['event-title']}>{event.title}</h5>
                      <p className={styles['event-date']}>
                        <FaCalendarAlt className={styles['event-icon']} /> {event.date}
                      </p>
                      <p className={styles['event-location']}>
                        <FaMapMarkerAlt className={styles['event-icon']} /> {event.location}
                      </p>
                      <p className={styles['event-organizer']}>
                        <FaUserAlt className={styles['event-icon']} /> {event.organizer}
                      </p>
                    </CardBody>
                  </Card>
                </Col>
              ))
            ) : (
              <div className={styles['no-events']}>No events available</div>
            )}
          </Row>
          <div className={styles['dashboard-actions']}>
            <Button color="primary">Show Past Events</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default CPDashboard;
