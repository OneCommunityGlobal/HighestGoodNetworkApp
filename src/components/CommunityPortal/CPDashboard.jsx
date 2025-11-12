import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Input } from 'reactstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserAlt } from 'react-icons/fa';
import styles from './CPDashboard.module.css';

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

  const filteredEvents = events.filter(event => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return true;
    return (
      event.title.toLowerCase().includes(keyword) ||
      event.location.toLowerCase().includes(keyword) ||
      event.organizer.toLowerCase().includes(keyword)
    );
  });

  return (
    <Container fluid className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <h1>All Events</h1>
        <div className={styles.dashboardControls}>
          <div className={styles.dashboardSearchContainer}>
            <Input
              type="search"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.dashboardSearch}
            />
          </div>
        </div>
      </header>

      <Row>
        <Col md={3} className={styles.dashboardSidebar}>
          <div className={styles.filterSection}>
            <h4>Search Filters</h4>

            <div className={`${styles.filterItem} ${styles.searchFilter}`}>
              <label htmlFor="search-events">Search Events</label>
              <div className={styles.inputGroup}>
                <span className={styles.inputGroupText}>
                  <i className="fa fa-search" aria-hidden="true"></i>
                </span>
                <input
                  type="text"
                  id="search-events"
                  placeholder="Search Events"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.filterItem}>
              <label htmlFor="date-tomorrow">Dates</label>
              <div className={styles.filterOptionsVertical}>
                <label className={styles.radioOption}>
                  <input type="radio" name="dates" /> Tomorrow
                </label>
                <label className={styles.radioOption}>
                  <input type="radio" name="dates" /> This Weekend
                </label>
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
          <h2 className={styles.sectionTitle}>Events</h2>
          <Row>
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
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
          <div className={styles.dashboardActions}>
            <Button className={styles.showPastEventsBtn}>Show Past Events</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default CPDashboard;
