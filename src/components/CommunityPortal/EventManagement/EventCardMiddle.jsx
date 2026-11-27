import DatePicker from 'react-datepicker';
import styles from './EventPage.module.css';

function EventCardMiddle({
  darkMode,
  eventName,
  onEventNameChange,
  eventType,
  onEventTypeChange,
  location,
  onLocationChange,
  startDate,
  endDate,
  onDateChange,
  time,
  onTimeChange,
  organizer,
  onOrganizerChange,
  capacity,
  onCapacityChange,
  status,
  onStatusChange,
  stars,
}) {
  return (
    <div className={styles.eventCardMiddle}>
      <input
        type="text"
        className={`${styles.eventCardTitle} ${styles.inputField} ${
          darkMode ? styles.inputDark : ''
        }`}
        value={eventName}
        onChange={onEventNameChange}
      />
      <p className={styles.eventCardType}>
        Type:{' '}
        <select
          value={eventType}
          onChange={onEventTypeChange}
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
          onChange={onLocationChange}
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
              onChange={onDateChange}
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
              onChange={onTimeChange}
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
              onChange={onOrganizerChange}
              className={`${styles.inputField} ${darkMode ? styles.inputDark : ''}`}
            />
          </div>
        </div>

        <div className={`${styles.eventCardExtra} ${darkMode ? styles.eventCardExtraDark : ''}`}>
          <div className={styles.extraItem}>
            {' '}
            <p>
              👥 Capacity:
              <br />{' '}
              <input
                type="text"
                value={capacity}
                onChange={onCapacityChange}
                className={`${styles.inputField} ${darkMode ? styles.inputDark : ''}`}
              />
            </p>
          </div>
          <div className={styles.extraItem}>
            {' '}
            <p>
              ⭐ Overall Rating: <br /> {stars}
            </p>
          </div>
          <div className={styles.extraItem}>
            {' '}
            <p>
              Status:
              <br />
              <select
                value={status}
                onChange={onStatusChange}
                className={darkMode ? styles.statusDropdownDark : styles.statusDropdown}
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
  );
}

export default EventCardMiddle;
