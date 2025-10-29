import { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Label, FormGroup, Input } from 'reactstrap';
// import './CPDashboard.css';
import styles from './CPDashboard.module.css';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserAlt } from 'react-icons/fa';

export function CPDashboard() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const parseEventDate = (dateStr, yearHint) => {
    // Example: Friday, December 6 at 12:00PM EST
    const re = /^(?:[A-Za-z]+,\s*)?([A-Za-z]+)\s+(\d+)\s+at\s+(\d{1,2}:\d{2}\s*[AP]M)\s*(?:[A-Z]{2,4})?$/i;
    const m = dateStr.trim().match(re);
    if (!m) return null;

    const [, monthName, dayStr, timeStr] = m;
    const monthIndex = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
    ].indexOf(monthName.toLowerCase());
    if (monthIndex === -1) return null;

    const day = parseInt(dayStr, 10);
    const tm = timeStr.replace(/\s+/g, '').toUpperCase();
    const [hRaw, minRaw] = tm.slice(0, tm.length - 2).split(':');
    const ampm = tm.slice(-2);
    let hours = parseInt(hRaw, 10);
    const minutes = parseInt(minRaw, 10);
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const d = new Date(yearHint, monthIndex, day, hours, minutes, 0, 0);
    return d;
  };

  const isSameYMD = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const tomorrowLocal = (() => {
    const now = new Date();
    const t = new Date(now);
    t.setDate(now.getDate() + 1);
    t.setHours(0, 0, 0, 0);
    return t;
  })();

  const filteredEvents = useMemo(() => {
    let list = events;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(e =>
        [e.title, e.location, e.organizer, e.date]
          .filter(Boolean)
          .some(v => v.toLowerCase().includes(q)),
      );
    }

    if (dateFilter === 'tomorrow') {
      const y = tomorrowLocal.getFullYear();
      list = list.filter(e => {
        const d = parseEventDate(e.date, y);
        return d ? isSameYMD(d, tomorrowLocal) : false;
      });
    }

    return list;
  }, [events, search, dateFilter]);

  useEffect(() => {
    const mockEvents = [
      {
        id: 1,
        title: 'AI Study Group',
        date: 'Saturday, October 25 at 10:30AM EST',
        location: 'Main Auditorium',
        organizer: 'AI & ML Club',
        image: 'https://placehold.co/300?text=AI%20Study%20Group',
      },
      {
        id: 2,
        title: 'Wellness Workshop',
        date: 'Sunday, October 26 at 3:00PM EST',
        location: 'Library Hall',
        organizer: 'Health & Wellness Group',
        image: 'https://placehold.co/300?text=Wellness%20Workshop',
      },
      {
        id: 3,
        title: 'Community Hack Night',
        date: 'Monday, October 27 at 5:30PM EST',
        location: 'Innovation Lab',
        organizer: 'Entrepreneurship Club',
        image: 'https://placehold.co/300?text=Community%20Hack%20Night',
      },
      {
        id: 4,
        title: 'Career Panel',
        date: 'Tuesday, October 28 at 12:00PM EST',
        location: 'Disque 919',
        organizer: 'Graduate Student Council',
        image: 'https://placehold.co/300?text=Career%20Panel',
      },
      {
        id: 5,
        title: 'Yoga & Stretch Session',
        date: 'Wednesday, October 29 at 9:30AM EST',
        location: 'North Quad',
        organizer: 'Health & Wellness Group',
        image: 'https://placehold.co/300?text=Yoga%20%26%20Stretch%20Session',
      },
      {
        id: 6,
        title: 'Data Science Meetup',
        date: 'Thursday, October 30 at 2:30PM EST',
        location: 'G.C LeBow - Lobby Tabling Space 2',
        organizer: 'AI & ML Club',
        image: 'https://placehold.co/300?text=Data%20Science%20Meetup',
      },
      {
        id: 7,
        title: 'Open Mic Night',
        date: 'Friday, October 31 at 6:00PM EST',
        location: 'Community Center',
        organizer: 'Graduate Student Council',
        image: 'https://placehold.co/300?text=Open%20Mic%20Night',
      },
      {
        id: 8,
        title: 'Startup Pitch Practice',
        date: 'Saturday, November 1 at 1:00PM EST',
        location: 'Innovation Lab',
        organizer: 'Entrepreneurship Club',
        image: 'https://placehold.co/300?text=Startup%20Pitch%20Practice',
      },
      {
        id: 9,
        title: 'Robotics Demo',
        date: 'Sunday, November 2 at 11:30AM EST',
        location: 'East Pavilion',
        organizer: 'Robotics Society',
        image: 'https://placehold.co/300?text=Robotics%20Demo',
      },
      {
        id: 10,
        title: 'Hot Chocolate/Bake Sale',
        date: 'Monday, November 3 at 4:00PM EST',
        location: 'Hill Conference Room',
        organizer: 'Kappa Phi Gamma, Sorority Inc.',
        image: 'https://placehold.co/300?text=Hot%20Chocolate%2FBake%20Sale',
      },
      {
        id: 11,
        title: 'PGSA Lunch Talks',
        date: 'Tuesday, November 4 at 12:00PM EST',
        location: 'Disque 919',
        organizer: 'Physics Graduate Student Association',
        image: 'https://placehold.co/300?text=PGSA%20Lunch%20Talks',
      },
      {
        id: 12,
        title: 'Holiday Lunch',
        date: 'Wednesday, November 5 at 12:30PM EST',
        location: 'Hill Conference Room',
        organizer: 'Chemical and Biological Engineering Graduate Society',
        image: 'https://placehold.co/300?text=Holiday%20Lunch',
      },
      {
        id: 13,
        title: 'Graduate Career Panel',
        date: 'Thursday, November 6 at 10:00AM EST',
        location: 'Room 3B',
        organizer: 'Graduate Student Council',
        image: 'https://placehold.co/300?text=Graduate%20Career%20Panel',
      },
      {
        id: 14,
        title: 'AI & Ethics Forum',
        date: 'Friday, November 7 at 2:00PM EST',
        location: 'Main Auditorium',
        organizer: 'AI & ML Club',
        image: 'https://placehold.co/300?text=AI%20%26%20Ethics%20Forum',
      },
      {
        id: 15,
        title: 'Wellness Workshop',
        date: 'Saturday, November 8 at 9:00AM EST',
        location: 'Library Hall',
        organizer: 'Health & Wellness Group',
        image: 'https://placehold.co/300?text=Wellness%20Workshop',
      },
    ];

    setEvents(mockEvents);
  }, []);

  return (
    <Container className={styles.cp_dashboard_container}>
      <header className={styles.cp_dashboard_header}>
        <h1>All Events</h1>
        <div>
          <div className={styles.cp_dashboard_search_container}>
            <Input
              type="search"
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              // className={styles.cp_dashboard_search}
            />
          </div>
        </div>
      </header>

      <Row>
        <Col md={3} className={styles.cp_dashboard_sidebar}>
          <div className={styles.cp_filter_section}>
            <h4 className={styles.cp_filter_title}>Search Filters</h4>

            <div className={`${styles.cp_filter_item} ${styles.cp_dashboard_actions}`}>
              <div className={styles.cp_filter_row}>
                <Label className={styles.cp_radio_group + ' d-flex align-items-center'}>
                  Dates
                </Label>
                <FormGroup check className={styles.cp_radio_group + ' d-flex align-items-center'}>
                  <Input id="online-only" type="checkbox" />
                  <Label htmlFor="online-only" check className="ms-2 mb-0">
                    Online Only
                  </Label>
                </FormGroup>
              </div>

              <div className={styles.cp_radio_row}>
                <FormGroup check className={styles.cp_radio_group + ' d-flex align-items-center'}>
                  <Input
                    id="date-tomorrow"
                    type="radio"
                    name="dates"
                    checked={dateFilter === 'tomorrow'}
                    onChange={() => setDateFilter('tomorrow')}
                    className={styles.cp_radio_input}
                  />
                  <Label
                    htmlFor="date-tomorrow"
                    check
                    className={styles.cp_radio_label + ' ms-2 mb-0'}
                  >
                    Tomorrow
                  </Label>
                </FormGroup>

                <FormGroup check className={styles.cp_radio_group + ' d-flex align-items-center'}>
                  <Input
                    id="date-weekend"
                    type="radio"
                    name="dates"
                    checked={dateFilter === 'weekend'}
                    onChange={() => setDateFilter('weekend')}
                    className={styles.cp_radio_input}
                  />
                  <Label
                    htmlFor="date-weekend"
                    check
                    className={styles.cp_radio_label + ' ms-2 mb-0'}
                  >
                    This Weekend
                  </Label>
                </FormGroup>
              </div>

              <Button
                size="sm"
                color="primary"
                className="p-1 mt-2"
                onClick={() => setDateFilter('')}
              >
                Clear date filter
              </Button>

              <Label htmlFor="ending-after" className="mt-3 mb-1 small text-muted">
                Ending After
              </Label>
              <Input id="ending-after" type="date" />
            </div>

            <div className={styles.cp_filter_item}>
              <Label htmlFor="branches" className="fw-semibold">
                Branches
              </Label>
              <Input id="branches" type="select" defaultValue="">
                <option value="" disabled>
                  Select branches
                </option>
              </Input>
            </div>

            <div className={styles.cp_filter_item}>
              <Label htmlFor="themes" className="fw-semibold">
                Themes
              </Label>
              <Input id="themes" type="select" defaultValue="">
                <option value="" disabled>
                  Select themes
                </option>
              </Input>
            </div>

            <div className={styles.cp_filter_item}>
              <Label htmlFor="categories" className="fw-semibold">
                Categories
              </Label>
              <Input id="categories" type="select" defaultValue="">
                <option value="" disabled>
                  Select categories
                </option>
              </Input>
            </div>
          </div>
        </Col>

        <Col md={9} className={styles.cp_dashboard_main}>
          <h2 className={styles.cp_section_title}>Events</h2>
          <Row className="g-4">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <Col md={4} key={event.id}>
                  <Card className={styles.cp_event_card}>
                    <div className={styles.cp_event_card_img_container}>
                      <img src={event.image} alt={event.title} />
                    </div>
                    <CardBody>
                      <h5 className={styles.cp_event_title}>{event.title}</h5>
                      <p className={styles.cp_event_date}>
                        <FaCalendarAlt /> {event.date}
                      </p>
                      <p className={styles.cp_event_location}>
                        <FaMapMarkerAlt /> {event.location}
                      </p>
                      <p className={styles.cp_event_organizer}>
                        <FaUserAlt /> {event.organizer}
                      </p>
                    </CardBody>
                  </Card>
                </Col>
              ))
            ) : (
              <div className={styles.cp_dashboard_actions}>No events available</div>
            )}
          </Row>
          <div className={styles.cp_dashboard_actions}>
            <Button color="primary">Show Past Events</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default CPDashboard;
