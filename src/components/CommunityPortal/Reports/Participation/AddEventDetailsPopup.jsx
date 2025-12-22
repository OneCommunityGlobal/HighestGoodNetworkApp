import ReactDOM from 'react-dom';
import styles from './AddEventDetailsPopup.module.css';
import { end } from '@popperjs/core';
import { useState } from 'react';
import { formatEventDisplay } from './HelperFunctions';
import { event } from 'jquery';
import { useSelector } from 'react-redux';

const eventDetailsPopupId = document.getElementById('event-details-pop-up');

export const AddEventDetailsPopup = ({ handlePopup, addEventDetails }) => {
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventStartAt, setEventStartAt] = useState('');
  const [eventEndAt, setEventEndAt] = useState('');
  const darkMode = useSelector(state => state.theme.darkMode);
  const { loading } = useSelector(state => state.createEvent);

  const handleEventDetails = e => {
    e.preventDefault();
    const eventDetails = {
      title: eventTitle,
      type: 'Meeting',
      description: eventDesc,
      startTime: eventStartAt,
      endTime: eventEndAt,
      eventTime: formatEventDisplay({ eventStartTime: eventStartAt, eventEndTime: eventEndAt }),
      maxAttendees: -1,
      location: 'Virtual',
    };
    addEventDetails(eventDetails);
  };

  return ReactDOM.createPortal(
    <div className={styles.popupContainer}>
      <button className={styles.popupClose} onClick={handlePopup}>
        X
      </button>
      <div
        className={`${styles.eventDetailsContainer} ${
          darkMode ? styles.eventDetailsContainerDark : ''
        }`}
      >
        <h2 className={`${styles.eventHeading} ${darkMode ? styles.eventHeadingDark : ''}`}>
          Enter Event Details
        </h2>
        <form onSubmit={e => handleEventDetails(e)}>
          <div className={styles.eventDetails}>
            <span>Event Title</span>
            <input
              type="text"
              placeholder="Enter event title"
              className={styles.eventInput}
              onChange={e => setEventTitle(e.target.value)}
            />
            <span>Event Description</span>
            <input
              type="text"
              placeholder="Enter event name"
              className={styles.eventInput}
              onChange={e => setEventDesc(e.target.value)}
            />
            <div className={styles.dateContainer}>
              <div>
                <span>Event Start At</span>
                <input
                  type="datetime-local"
                  className={styles.eventInput}
                  onChange={e => setEventStartAt(e.target.value)}
                />
              </div>
              <div>
                <span>Event End At</span>
                <input
                  type="datetime-local"
                  className={styles.eventInput}
                  onChange={e => setEventEndAt(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.addBtnContainer}>
              <button type="submit" className={styles.addEventBtn}>
                Add Event
              </button>
            </div>
          </div>
        </form>
        {loading && <div className={styles.retrievalStatus}>Adding event...</div>}
      </div>
    </div>,
    eventDetailsPopupId,
  );
};
