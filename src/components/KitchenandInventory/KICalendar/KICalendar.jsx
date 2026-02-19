import React, { useMemo, useState, useEffect } from 'react';
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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
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
  parseISO,
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
    description: 'Discuss upcoming planting schedule and volunteer coordination.',
  },
  {
    id: 2,
    title: 'Orchard Review',
    date: '2026-02-05',
    type: 'Orchard',
    description: 'Evaluate tree health and plan pruning for the season.',
    assignedTo: 'Alice',
  },
  {
    id: 3,
    title: 'Chicken Coop Cleaning',
    date: '2026-02-07',
    type: 'Animals',
    description: 'Clean and disinfect the chicken coop to ensure a healthy environment.',
  },
  {
    id: 4,
    title: 'Buying Supplies',
    date: '2026-02-09',
    type: 'Kitchen',
    description: 'Purchase ingredients and supplies needed for the upcoming week’s meals.',
    assignedTo: 'Bob',
  },
  {
    id: 5,
    title: 'Chicken Feeding',
    date: '2026-02-09',
    type: 'Animals',
    description: 'Feed the chickens and collect eggs in the morning.',
  },
  {
    id: 6,
    title: 'Tomato Planting',
    date: '2026-02-09',
    type: 'Garden',
    description: 'Plant tomato seedlings in the raised beds.',
    assignedTo: 'Charlie',
  },
  {
    id: 7,
    title: 'Apple Planting',
    date: '2026-02-09',
    type: 'Garden',
    description: 'Plant apple seedlings in the orchard.',
    assignedTo: 'Charlie',
  },
  {
    id: 8,
    title: 'Buying Veggetable',
    date: '2026-02-09',
    type: 'Kitchen',
    description: 'Purchase vegetables needed for the upcoming week’s meals.',
    assignedTo: 'Bob',
  },
];

/* ------------------ Component ------------------ */

export default function KICalendar() {
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventFilter, setEventFilter] = useState('All Modules');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const today = new Date();
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
        format(date, 'yyyy-MM-dd') === e.date &&
        (eventFilter === 'All Modules' || e.type === eventFilter),
    );

  const selectedDateEvents = eventsForDate(selectedDate);

  /* ------------------ Week Data ------------------ */

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  useEffect(() => {
    setCurrentDate(selectedDate);
  }, [selectedDate]);

  /* ------------------ Render ------------------ */

  return (
    <Container fluid className="p-3">
      <h1>Unified Calendar</h1>
      <p>View and manage all events across Garden, Orchard, Animals and Kitchen modules</p>
      <Row>
        {/* ---------- Left Panel ---------- */}
        <Col md="12" lg="4" xl="3" className="mb-3 mb-md-0">
          <Card>
            <CardBody>
              <h6>{format(selectedDate, 'MMMM d, yyyy')}</h6>
              <hr />
              {selectedDateEvents.length === 0 && <div className="text-muted">No events</div>}
              {selectedDateEvents.map(e => (
                <div key={e.id} className="mb-2">
                  <strong>{e.title}</strong>
                  <div className="mb-2">
                    <span
                      className={`mr-2 ${styles.eventTag} ${styles[e.type?.toLowerCase()]} ${
                        styles.smallText
                      }`}
                    >
                      {e.type}
                    </span>
                    {e.assignedTo ? (
                      <span className={styles.smallText}>
                        <b>
                          Assigned to: <span className={styles.blueText}>{e.assignedTo}</span>
                        </b>
                      </span>
                    ) : (
                      <span className={styles.smallText}>
                        <b>Unassigned</b>
                      </span>
                    )}
                  </div>
                  <div className={styles.smallText}>{e.description}</div>
                </div>
              ))}
            </CardBody>
          </Card>
        </Col>

        {/* ---------- Calendar ---------- */}
        <Col md="12" lg="8" xl="9">
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

            {view === 'week' && (
              <Col xs="12" md="5" className="d-flex justify-content-md-end align-items-center">
                <Button size="sm" onClick={goPrev} color="light" className={styles.grayBorder}>
                  <i className="fa fa-angle-left"></i>
                </Button>
                <div className="mx-5">
                  <strong>
                    {`${format(weekDays[0], 'MMM d')} – ${format(weekDays[6], 'MMM d, yyyy')}`}
                  </strong>
                </div>
                <Button size="sm" onClick={goNext} color="light" className={styles.grayBorder}>
                  <i className="fa fa-angle-right"></i>
                </Button>
              </Col>
            )}
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
                      <button
                        key={event.id}
                        className={`${styles.eventTitle} ${styles[event.type?.toLowerCase()]} ${
                          styles.smallText
                        }`}
                        onClick={() => {
                          setSelectedEvent(event);
                          setModalOpen(true);
                        }}
                      >
                        {moduleIcons[event.type] && (
                          <FontAwesomeIcon icon={moduleIcons[event.type]} className="me-2" />
                        )}{' '}
                        {event.title}
                      </button>
                    ))}

                    {dateEvents.length > MAX_EVENTS && (
                      <button
                        onClick={() => {
                          setView('week');
                        }}
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
                      isSameDay(today, day) ? styles.currentWeekDay : ''
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
                      <button
                        key={event.id}
                        className={`${styles.weeklyEventTitle} ${
                          styles[event.type?.toLowerCase()]
                        } ${styles.smallText}`}
                        onClick={() => {
                          setSelectedEvent(event);
                          setModalOpen(true);
                        }}
                      >
                        {moduleIcons[event.type] && (
                          <FontAwesomeIcon icon={moduleIcons[event.type]} className="me-2" />
                        )}{' '}
                        {event.title}
                      </button>
                    ))}
                  </Col>
                );
              })}
            </Row>
          )}
        </Col>
      </Row>
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)}>
        <ModalHeader toggle={() => setModalOpen(false)}>
          <h4>
            {moduleIcons[selectedEvent?.type] && (
              <FontAwesomeIcon
                icon={moduleIcons[selectedEvent?.type]}
                className={`me-2 ${styles[`${selectedEvent?.type?.toLowerCase()}Text`]}`}
              />
            )}{' '}
            {selectedEvent?.title}
          </h4>
          <div
            className={`mr-2 ${styles.eventTag} ${styles[selectedEvent?.type?.toLowerCase()]} ${
              styles.smallText
            }`}
          >
            {selectedEvent?.type}
          </div>
        </ModalHeader>
        <ModalBody>
          <p className="mb-0">
            <b>Date:</b>
          </p>
          <p>
            {selectedEvent?.date && format(parseISO(selectedEvent?.date), 'eeee, MMMM d, yyyy')}
          </p>
          <p className="mb-0">
            <b>Description:</b>
          </p>
          <p>{selectedEvent?.description}</p>
          <p className="mb-0">
            <b>Assigned To:</b>
          </p>
          <p>{selectedEvent?.assignedTo || 'Unassigned'}</p>
          <p className="mb-0">
            <b>Related Item</b>
          </p>
          <p>{selectedEvent?.relatedItem || 'None'}</p>
        </ModalBody>
      </Modal>
    </Container>
  );
}
