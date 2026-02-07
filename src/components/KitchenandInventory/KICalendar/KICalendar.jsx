import React, { useMemo, useState } from 'react';
import { Calendar } from 'react-calendar';
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
import styles from './KICalendar.module.css';

/* ------------------ Sample Events ------------------ */

const EVENTS = [
  {
    id: 1,
    title: 'Team Meeting',
    date: '2026-02-03',
    type: 'Meeting',
    start: new Date(2026, 1, 3, 10, 0), // Feb 3, 10:00
    end: new Date(2026, 1, 3, 11, 0),
  },
  {
    id: 2,
    title: 'Sprint Review',
    date: '2026-02-05',
    type: 'Meeting',
    start: new Date(2026, 1, 5, 14, 0),
    end: new Date(2026, 1, 5, 15, 30),
  },
  {
    id: 3,
    title: 'Deadline',
    date: '2026-02-07',
    type: 'Task',
    start: new Date(2026, 2, 9, 14, 0),
    end: new Date(2026, 2, 9, 15, 30),
  },
  {
    id: 4,
    title: 'Holiday',
    date: '2026-02-09',
    type: 'Holiday',
    start: new Date(2026, 2, 5, 14, 0),
    end: new Date(2026, 2, 5, 15, 30),
  },
  {
    id: 5,
    title: 'Holiday 2',
    date: '2026-02-09',
    type: 'Holiday',
    start: new Date(2026, 2, 5, 14, 0),
    end: new Date(2026, 2, 5, 15, 30),
  },
  {
    id: 6,
    title: 'Holiday 3',
    date: '2026-02-09',
    type: 'Holiday',
    start: new Date(2026, 2, 5, 14, 0),
    end: new Date(2026, 2, 5, 15, 30),
  },
];

/* ------------------ Component ------------------ */

export default function KICalendar() {
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventFilter, setEventFilter] = useState('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const MAX_EVENTS = 2;

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
      e => isSameDay(new Date(e.date), date) && (eventFilter === 'All' || e.type === eventFilter),
    );

  const selectedDateEvents = eventsForDate(selectedDate);

  /* ------------------ Week Data ------------------ */

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

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
                  Events: {eventFilter}
                </DropdownToggle>
                <DropdownMenu>
                  {['All', 'Meeting', 'Task', 'Holiday'].map(type => (
                    <DropdownItem key={type} onClick={() => setEventFilter(type)}>
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
                const count = dateEvents.length;
                return dateEvents.length > 0 ? (
                  <div className="small text-primary">
                    {dateEvents.slice(0, MAX_EVENTS).map(event => (
                      <div key={event.id}>{event.title}</div>
                    ))}

                    {dateEvents.length > MAX_EVENTS && (
                      <button
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSeeMore(dateEvents)}
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
            <Row className="border text-center">
              {weekDays.map(day => {
                const dayEvents = eventsForDate(day);
                const isSelected = isSameDay(day, selectedDate);

                return (
                  <Col
                    key={day.toISOString()}
                    xs="12"
                    sm="6"
                    md
                    className={`border p-2 ${isSelected ? 'bg-primary bg-opacity-25' : ''}`}
                    style={{ cursor: 'pointer', minHeight: 140 }}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="fw-bold">{format(day, 'EEE')}</div>
                    <div className="text-muted small mb-1">{format(day, 'MMM d')}</div>

                    {dayEvents.map(e => (
                      <div key={e.id} className="small text-truncate">
                        • {e.title}
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
