import { useState } from 'react';

import 'react-datepicker/dist/react-datepicker.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useSelector } from 'react-redux';
import styles from './EventPage.module.css';
import EventManagementTabs from './EventManagementTabs';
import EventDescriptionPanel from './EventDescriptionPanel';
import EventCardMiddle from './EventCardMiddle';

function EventPage() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [eventName, setEventName] = useState('Event Name');
  const [eventType, setEventType] = useState('In-person');
  const [location, setLocation] = useState('San Francisco, CA 94108');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [time, setTime] = useState('9:00 AM - 11:00 AM EDT');
  const [organizer, setOrganizer] = useState('Alex Brain');
  const [capacity, setCapacity] = useState('120/200');
  const [status, setStatus] = useState('Active');
  const [rating] = useState(4);
  const [media, setMedia] = useState(null);
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [descriptionPosted, setDescriptionPosted] = useState(false);

  const handleMediaUpload = event => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMedia(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderStars = () => {
    const stars = ['one', 'two', 'three', 'four', 'five'];
    return stars.map((id, i) => (
      <span key={id} className={`${styles.star} ${i < rating ? styles.filled : ''}`}>
        ⭐
      </span>
    ));
  };

  const handlePostDescription = () => {
    if (!description.trim()) {
      setDescriptionError('Description cannot be empty.');
      setDescriptionPosted(false);
      return;
    }
    setDescriptionError('');
    setDescriptionPosted(true);
  };

  const handleDateChange = dates => {
    const [start, end] = dates;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start >= today) {
      setStartDate(start);
      setEndDate(end || start);
    }
  };

  const handleCalendarChange = date => {
    if (date >= new Date().setHours(0, 0, 0, 0)) {
      setStartDate(date);
      setEndDate(date);
    }
  };

  const getCalendarTileClassName = ({ date, view }) => {
    if (view === 'month' && date < new Date().setHours(0, 0, 0, 0)) {
      return darkMode ? styles.calendarTileDisabledDark : styles.calendarTileDisabled;
    }
    return null;
  };

  const handleDescriptionChange = e => {
    setDescription(e.target.value);
    if (descriptionError) setDescriptionError('');
    if (descriptionPosted) setDescriptionPosted(false);
  };

  return (
    <div className={`${styles.eventPage} ${darkMode ? styles.eventPageDark : ''}`}>
      <div className={styles.eventCard}>
        <div className={styles.eventCardLeft}>
          <div className={styles.eventCardImage}>
            {media ? <img src={media} alt="Event Media" /> : <span>No Media</span>}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleMediaUpload}
            className={styles.eventCardMediaUpload}
          />
        </div>

        <EventCardMiddle
          darkMode={darkMode}
          eventName={eventName}
          onEventNameChange={e => setEventName(e.target.value)}
          eventType={eventType}
          onEventTypeChange={e => setEventType(e.target.value)}
          location={location}
          onLocationChange={e => setLocation(e.target.value)}
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
          time={time}
          onTimeChange={e => setTime(e.target.value)}
          organizer={organizer}
          onOrganizerChange={e => setOrganizer(e.target.value)}
          capacity={capacity}
          onCapacityChange={e => setCapacity(e.target.value)}
          status={status}
          onStatusChange={e => setStatus(e.target.value)}
          stars={renderStars()}
        />

        <div className={`${styles.eventCardRight} ${darkMode ? styles.eventCardRightDark : ''}`}>
          <Calendar
            onChange={handleCalendarChange}
            value={startDate}
            minDate={new Date()}
            tileClassName={getCalendarTileClassName}
          />
        </div>
      </div>

      <div className={styles.eventTabs}>
        <EventManagementTabs darkMode={darkMode} />
      </div>

      <EventDescriptionPanel
        darkMode={darkMode}
        description={description}
        descriptionError={descriptionError}
        descriptionPosted={descriptionPosted}
        onDescriptionChange={handleDescriptionChange}
        onMediaUpload={handleMediaUpload}
        onPostDescription={handlePostDescription}
      />
    </div>
  );
}

export default EventPage;
