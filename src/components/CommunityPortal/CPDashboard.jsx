import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Input } from 'reactstrap';
import styles from './CPDashboard.module.css';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserAlt } from 'react-icons/fa';

export function CPDashboard() {
  const [allEvents, setAllEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const mockEvents = [
      {
        id: 1,
        title: 'PGSA Lunch Talks',
        date: 'Friday, December 6 at 12:00PM EST',
        location: 'Disque 919',
        organizer: 'Physics Graduate Student Association',
        image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop',
      },
      {
        id: 2,
        title: 'Hot Chocolate/Bake Sale',
        date: 'Friday, December 6 at 12:00PM EST',
        location: 'G.C LeBow - Lobby Tabling Space 2',
        organizer: 'Kappa Phi Gamma, Sorority Inc.',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
      },
      {
        id: 3,
        title: 'Holiday Lunch',
        date: 'Friday, December 6 at 12:00PM EST',
        location: 'Hill Conference Room',
        organizer: 'Chemical and Biological Engineering Graduate Society',
        image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=300&fit=crop',
      },
    ];
    setAllEvents(mockEvents);
  }, []);

  // Helper function to parse date string and extract the date
  const parseEventDate = dateString => {
    if (!dateString) return null;

    try {
      // Parse "Friday, December 6 at 12:00PM EST" format
      // Extract month and day from the string
      const dateMatch = dateString.match(/(\w+),\s+(\w+)\s+(\d+)/);
      if (dateMatch) {
        const [, , monthName, day] = dateMatch;
        const currentYear = new Date().getFullYear();
        // Create a date object to get the month index (0-11)
        const testDate = new Date(`${monthName} 1, ${currentYear}`);
        const monthIndex = testDate.getMonth();

        // Check if the month was parsed correctly
        if (!isNaN(monthIndex) && testDate.getFullYear() === currentYear) {
          const date = new Date(currentYear, monthIndex, parseInt(day, 10));
          // Format as YYYY-MM-DD for comparison
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const dayStr = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${dayStr}`;
        }
      }
      // Fallback: try to parse as a standard date string
      const parsedDate = new Date(dateString);
      if (!isNaN(parsedDate.getTime())) {
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (error) {
      console.error('Error parsing date:', error);
    }
    return null;
  };

  // Filter events based on search and date
  const filteredEvents = allEvents.filter(event => {
    // Filter by search text
    const matchesSearch =
      !search ||
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase()) ||
      event.organizer.toLowerCase().includes(search.toLowerCase());

    // Filter by date
    const matchesDate = !selectedDate || parseEventDate(event.date) === selectedDate;

    return matchesSearch && matchesDate;
  });

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
              <Input
                type="date"
                placeholder="Ending After"
                className={styles.dateFilter}
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
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
                    <CardBody className={styles.eventCardBody}>
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
            <Button color="primary">Show Past Events</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default CPDashboard;
