import React, { useMemo, useState } from 'react';
import { Calendar } from 'react-calendar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Container,
  Row,
  Col,
  Button,
  ButtonGroup,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Card,
  CardBody,
} from 'reactstrap';
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isSameDay,
} from 'date-fns';
import { faCow, faUtensils, faSeedling, faAppleWhole } from '@fortawesome/free-solid-svg-icons';
import styles from './KICalendar.module.css';

/* ------------------ Sample Events ------------------ */

const EVENTS = [
  {
    id: 1,
    title: 'Garden Team Meeting',
    date: '2026-02-03',
    type: 'Garden',
    start: new Date(2026, 1, 3, 10, 0), // Feb 3, 10:00
    end: new Date(2026, 1, 3, 11, 0),
  },
  {
    id: 2,
    title: 'Orchard Review',
    date: '2026-02-05',
    type: 'Orchard',
    start: new Date(2026, 1, 5, 14, 0),
    end: new Date(2026, 1, 5, 15, 30),
  },
  {
    id: 3,
    title: 'Chicken Coop Cleaning',
    date: '2026-02-07',
    type: 'Animals',
    start: new Date(2026, 2, 9, 14, 0),
    end: new Date(2026, 2, 9, 15, 30),
  },
  {
    id: 4,
    title: 'Buying Supplies',
    date: '2026-02-09',
    type: 'Kitchen',
    start: new Date(2026, 2, 5, 14, 0),
    end: new Date(2026, 2, 5, 15, 30),
  },
  {
    id: 5,
    title: 'Chicken Feeding',
    date: '2026-02-09',
    type: 'Animals',
    start: new Date(2026, 2, 5, 14, 0),
    end: new Date(2026, 2, 5, 15, 30),
  },
  {
    id: 6,
    title: 'Tomato Planting',
    date: '2026-02-09',
    type: 'Garden',
    start: new Date(2026, 2, 5, 14, 0),
    end: new Date(2026, 2, 5, 15, 30),
  },
];

/* ------------------ Component ------------------ */

export default function KICalendar() {
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventFilter, setEventFilter] = useState('All Modules');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const MAX_EVENTS = 2;
  const moduleIcons = {
    'All Modules': null,
    Garden: faSeedling,
    Orchard: faAppleWhole,
    Animals: faCow,
    Kitchen: faUtensils,
  };

  /* ------------------ Navigation ------------------ */

  const goPrev = () => {
    setCurrentDate(view === 'month' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1));
  };

  const goNext = () => {
    setCurrentDate(view === 'month' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1));
  };

  /* ------------------ Helpers ------------------ */

  const eventsForDate = date =>
    EVENTS.filter(
      e =>
        isSameDay(new Date(e.date), date) &&
        (eventFilter === 'All Modules' || e.type === eventFilter),
    );

  const selectedDateEvents = eventsForDate(selectedDate);

  /* ------------------ Week Data ------------------ */

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selectedDate]);

  /* ------------------ Render ------------------ */

  return (
    <Container fluid className="p-3">
      <h1>Unified Calendar</h1>
      <p>View and manage all events across Garden, Orchard, Animals and Kitchen modules</p>
      <Row>
        {/* ---------- Left Panel ---------- */}
        <Col xs="12" md="4" lg="3" className="mb-3 mb-md-0">
          <Card>
            <CardBody>
              <h6>{format(selectedDate, 'MMMM d, yyyy')}</h6>
              <hr />
              {selectedDateEvents.length === 0 && <div className="text-muted">No events</div>}
              {selectedDateEvents.map(e => (
                <div key={e.id} className="mb-2">
                  <strong>{e.title}</strong>
                  <div className="small text-muted">{e.type}</div>
                </div>
              ))}
            </CardBody>
          </Card>
        </Col>

        {/* ---------- Calendar ---------- */}
        <Col xs="12" md="8" lg="9">
          {/* Controls */}
          <Row className="mb-3 align-items-center">
            <Col xs="12" md="6" className="mb-2 mb-md-0">
              <ButtonGroup className="mr-3">
                <Button
                  color={view === 'month' ? 'success' : 'light'}
                  onClick={() => setView('month')}
                  className={view === 'month' ? '' : styles.grayBorder}
                >
                  Month
                </Button>
                <Button
                  color={view === 'week' ? 'success' : 'light'}
                  onClick={() => setView('week')}
                  className={view === 'week' ? '' : styles.grayBorder}
                >
                  Week
                </Button>
              </ButtonGroup>

              <Dropdown
                isOpen={dropdownOpen}
                toggle={() => setDropdownOpen(v => !v)}
                className="d-inline-block ms-2"
              >
                <DropdownToggle caret color="light" className={styles.grayBorder}>
                  {eventFilter}
                </DropdownToggle>
                <DropdownMenu>
                  {['All Modules', 'Garden', 'Orchard', 'Animals', 'Kitchen'].map(type => (
                    <DropdownItem key={type} onClick={() => setEventFilter(type)}>
                      {moduleIcons[type] && (
                        <FontAwesomeIcon
                          icon={moduleIcons[type]}
                          className={`me-2 ${styles[`${type?.toLowerCase()}Text`]}`}
                        />
                      )}
                      {'  '}
                      {type}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </Col>

            <Col xs="12" md="5" className="d-flex justify-content-md-end align-items-center">
              <Button size="sm" onClick={goPrev} color="light" className={styles.grayBorder}>
                <i className="fa fa-angle-left"></i>
              </Button>
              <div className="mx-5">
                <strong>
                  {view === 'month'
                    ? format(currentDate, 'MMMM yyyy')
                    : `${format(weekDays[0], 'MMM d')} – ${format(weekDays[6], 'MMM d, yyyy')}`}
                </strong>
              </div>
              <Button size="sm" onClick={goNext} color="light" className={styles.grayBorder}>
                <i className="fa fa-angle-right"></i>
              </Button>
            </Col>
          </Row>

          {/* ---------- Month View ---------- */}
          {view === 'month' && (
            <Calendar
              value={selectedDate}
              activeStartDate={currentDate}
              onChange={setSelectedDate}
              onActiveStartDateChange={({ activeStartDate }) => setCurrentDate(activeStartDate)}
              className={styles.calendar}
              tileClassName={styles.calendarDay}
              tileContent={({ date }) => {
                const dateEvents = eventsForDate(date);
                return dateEvents.length > 0 ? (
                  <div className="small text-primary">
                    {dateEvents.slice(0, MAX_EVENTS).map(event => (
                      <div
                        key={event.id}
                        className={`${styles.eventTitle} ${styles[event.type?.toLowerCase()]} ${
                          styles.smallText
                        }`}
                      >
                        {moduleIcons[event.type] && (
                          <FontAwesomeIcon icon={moduleIcons[event.type]} className="me-2" />
                        )}{' '}
                        {event.title}
                      </div>
                    ))}

                    {dateEvents.length > MAX_EVENTS && (
                      <button
                        onClick={() => handleSeeMore(dateEvents)}
                        className={`${styles.smallText} ${styles.linkText}`}
                      >
                        +{dateEvents.length - MAX_EVENTS} more
                      </button>
                    )}
                  </div>
                ) : null;
              }}
            />
          )}

          {/* ---------- Week View ---------- */}
          {view === 'week' && (
            <Row className="w-100 text-center">
              {weekDays.map(day => {
                const dateEvents = eventsForDate(day);
                const isSelected = isSameDay(day, selectedDate);

                return (
                  <Col
                    key={day.toISOString()}
                    className={`${styles.weekDay} ${isSelected ? styles.selectedWeekDay : ''} ${
                      isSameDay(currentDate, day) ? styles.currentWeekDay : ''
                    }`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="mb-3">
                      <div>
                        <b>{format(day, 'EEE')}</b>
                      </div>
                      <div>{format(day, 'MMM d')}</div>
                    </div>
                    {dateEvents.map(event => (
                      <div
                        key={event.id}
                        className={`${styles.weeklyEventTitle} ${
                          styles[event.type?.toLowerCase()]
                        } ${styles.smallText}`}
                      >
                        {moduleIcons[event.type] && (
                          <FontAwesomeIcon icon={moduleIcons[event.type]} className="me-2" />
                        )}{' '}
                        {event.title}
                      </div>
                    ))}
                  </Col>
                );
              })}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
}
