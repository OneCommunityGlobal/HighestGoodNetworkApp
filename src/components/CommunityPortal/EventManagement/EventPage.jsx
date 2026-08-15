import { useState } from 'react';
import { useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useSelector } from 'react-redux';
import styles from './EventPage.module.css';
import EventManagementTabs from './EventManagementTabs';

function EventPage() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const { activityid } = useParams();

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

  const handleDateChange = dates => {
    const [start, end] = dates;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start >= today) {
      setStartDate(start);
      setEndDate(end || start);
    }
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

        <div className={styles.eventCardMiddle}>
          <input
            type="text"
            className={`${styles.eventCardTitle} ${styles.inputField} ${
              darkMode ? styles.inputDark : ''
            }`}
            value={eventName}
            onChange={e => setEventName(e.target.value)}
          />
          <p className={styles.eventCardType}>
            Type:{' '}
            <select
              value={eventType}
              onChange={e => setEventType(e.target.value)}
              className={darkMode ? styles.statusDropdownDark : styles.statusDropdown}
            >
              <option>In-person</option>
              <option>Virtual</option>
            </select>
          </p>
          <p>
            Location:{' '}
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className={`${styles.inputField} ${darkMode ? styles.inputDark : ''}`}
            />
          </p>
          <div className={`${styles.eventCard12} ${darkMode ? styles.eventCard12Dark : ''}`}>
            <div className={`${styles.eventCardInfo} ${darkMode ? styles.eventCardInfoDark : ''}`}>
              <div className={styles.infoItem}>
                <p>
                  📅 Date: <br />
                </p>
                <DatePicker
                  selected={startDate}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
              <div className={styles.infoItem}>
                <p>
                  ⏰ Time: <br />
                </p>{' '}
                <input
                  type="text"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className={`${styles.inputField} ${darkMode ? styles.inputDark : ''}`}
                />
              </div>
              <div className={styles.infoItem}>
                <p>
                  👤 Organizer: <br />
                </p>{' '}
                <input
                  type="text"
                  value={organizer}
                  onChange={e => setOrganizer(e.target.value)}
                  className={`${styles.inputField} ${darkMode ? styles.inputDark : ''}`}
                />
              </div>
            </div>

            <div
              className={`${styles.eventCardExtra} ${darkMode ? styles.eventCardExtraDark : ''}`}
            >
              <div className={styles.extraItem}>
                {' '}
                <p>
                  👥 Capacity:
                  <br />{' '}
                  <input
                    type="text"
                    value={capacity}
                    onChange={e => setCapacity(e.target.value)}
                    className={`${styles.inputField} ${darkMode ? styles.inputDark : ''}`}
                  />
                </p>
              </div>
              <div className={styles.extraItem}>
                {' '}
                <p>
                  ⭐ Overall Rating: <br /> {renderStars()}
                </p>
              </div>
              <div className={styles.extraItem}>
                {' '}
                <p>
                  Status:
                  <br />
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className={`${styles.statusDropdown} ${
                      darkMode ? styles.statusDropdownDark : ''
                    }`}
                  >
                    <option>Active</option>
                    <option>Finished</option>
                    <option>Participated</option>
                  </select>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.eventCardRight} ${darkMode ? styles.eventCardRightDark : ''}`}>
          <Calendar
            onChange={date => {
              if (date >= new Date().setHours(0, 0, 0, 0)) {
                setStartDate(date);
                setEndDate(date);
              }
            }}
            value={startDate}
            minDate={new Date()}
            tileClassName={({ date, view }) => {
              if (view === 'month' && date < new Date().setHours(0, 0, 0, 0)) {
                return styles.calendarTileDisabled;
              }
              return null;
            }}
          />
        </div>
      </div>

      <div className={styles.eventTabs}>
        <EventManagementTabs darkMode={darkMode} />
      </div>

      <div className={styles.eventDescription}>
        <textarea
          className={`${styles.textarea} ${darkMode ? styles.inputDark : ''}`}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Enter event description..."
        />
        <div className={styles.mediaUploadContainer}>
          <input
            type="file"
            accept="image/*"
            onChange={handleMediaUpload}
            className={styles.descriptionMediaUpload}
          />
          <button
            type="button"
            className={`${styles.postBtn} ${darkMode ? styles.postBtnDark : ''}`}
          >
            Post Description
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventPage;
