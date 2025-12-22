import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import styles from './MyCases.module.css';
import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { constructQueryParams, transformEvents } from './HelperFunctions';
import { fetchCalendarEventDetails } from '../../../../actions/communityPortal/EventActivityActions';

export const EventsCalendar = () => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const calendarRef = useRef(null);
  const fetchCalendarEvent = useSelector(state => state.fetchCalendarEvent);
  const [eventsData, setEventsData] = useState([]);
  const [events, setEvents] = useState([]);
  const [prevDate, setPrevDate] = useState(new Date());
  const [nextDate, setNextDate] = useState(new Date());
  const [isPrevDisabled, setIsPrevDisabled] = useState(true);
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const dispatch = useDispatch();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!fetchCalendarEvent.loading) {
      if (fetchCalendarEvent.data === null && fetchCalendarEvent.error === null) {
        const currentDate = new Date();
        const params = {
          date: currentDate.toISOString().split('T')[0],
        };
        const queryParams = constructQueryParams(params);

        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        setPrevDate(normalizeDate(month - 3, year));
        setNextDate(normalizeDate(month + 3, year));
        dispatch(fetchCalendarEventDetails(token, queryParams));
      } else if (fetchCalendarEvent.data && fetchCalendarEvent.data.events) {
        setEventsData(transformEvents(fetchCalendarEvent.data.events));
      } /*else if (error) {
  
        }*/
    }
  }, [fetchCalendarEvent]);

  useEffect(() => {
    setEvents(eventsData);
  }, [eventsData]);

  useEffect(() => {
    setIsNextDisabled(fetchCalendarEvent.loading);
    setIsPrevDisabled(fetchCalendarEvent.loading);
  }, [fetchCalendarEvent.loading]);

  const normalizeDate = (month, year) => {
    const yearOffset = Math.floor((month - 1) / 12);
    const normalizedMonth = ((((month - 1) % 12) + 12) % 12) + 1;

    return new Date(year + yearOffset, normalizedMonth - 1, 1);
  };

  const getDate = api => {
    const view = api.view;
    const currentMonth = view.currentStart;
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  };

  const fetchEventsForCalendar = currentDate => {
    const params = {
      date: currentDate.toISOString().split('T')[0],
    };

    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    setPrevDate(normalizeDate(month - 3, year));
    setNextDate(normalizeDate(month + 3, year));

    const queryParams = constructQueryParams(params);
    dispatch(fetchCalendarEventDetails(token, queryParams));
  };

  const handlePrevChange = () => {
    if (!isNextDisabled && !isPrevDisabled) {
      const api = calendarRef.current.getApi();
      api.prev();

      const currentDate = getDate(api);

      if (currentDate <= prevDate) {
        setIsPrevDisabled(true);

        fetchEventsForCalendar(currentDate);
      }
    }
  };

  const handleNextChange = () => {
    if (!isNextDisabled && !isPrevDisabled) {
      const api = calendarRef.current.getApi();
      api.next();

      const currentDate = getDate(api);

      if (currentDate >= nextDate) {
        setIsNextDisabled(true);

        fetchEventsForCalendar(currentDate);
      }
    }
  };

  return (
    <div className={`${styles.calendarView} ${darkMode ? styles.calendarViewDark : ''}`}>
      <div className={styles.retrievalStatus}>
        {fetchCalendarEvent.loading && 'Loading Events...'}
        {!fetchCalendarEvent.loading &&
          eventsData.length === 0 &&
          `No events found between ${new Date(
            prevDate.getFullYear(),
            prevDate.getMonth() + 1,
            1,
          ).toLocaleString('en-US', {
            month: 'long',
          })} and ${new Date(
            nextDate.getFullYear(),
            nextDate.getMonth() - 1,
            1,
          ).toLocaleString('en-US', { month: 'long' })}`}
      </div>
      <FullCalendar
        ref={calendarRef}
        customButtons={{
          prevBtn: {
            text: 'Prev',
            click: handlePrevChange,
          },
          nextBtn: {
            text: 'Next',
            click: handleNextChange,
          },
        }}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prevBtn,nextBtn today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events.map(event => ({
          title: event.type + ' ' + event.title,
          date: event.startTime.split('T')[0],
          start: event.startTime,
          end: event.endTime,
        }))}
        eventClick={info => {
          const calendar = info.view.calendar;
          calendar.changeView('timeGridDay', info.event.start);
        }}
      />
    </div>
  );
};
