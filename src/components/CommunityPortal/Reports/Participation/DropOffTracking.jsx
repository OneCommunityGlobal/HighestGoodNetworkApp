import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './Participation.module.css';
import mockEvents from './mockData';
import { filterEventsByDate } from './FilterByDate';

function DropOffTracking() {
  const [selectedEvent, setSelectedEvent] = useState('All Events');
  const [selectedTime, setSelectedTime] = useState('All Time');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const darkMode = useSelector(state => state.theme.darkMode);

  const filteredEvents = filterEventsByDate(mockEvents, selectedTime);

  const filteredEventsByEventType = filteredEvents.filter(event => {
    if (selectedEvent === 'All Events') return true;
    return event.eventType === selectedEvent;
  });
  const handleOpenList = event => {
    setActiveEvent(event);
    setSelectedUsers([]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveEvent(null);
    setSelectedUsers([]);
  };

  return (
    <div
      className={`tracking-container-global ${styles.trackingContainer} ${
        darkMode ? styles.trackingContainerDark : ''
      }`}
    >
      <div className={`${styles.trackingHeader} ${darkMode ? styles.trackingHeaderDark : ''}`}>
        <h3>Drop-off and no-show rate tracking</h3>
        <div className={styles.trackingFilters}>
          <select
            className={styles.filterDropdown}
            value={selectedEvent}
            onChange={e => setSelectedEvent(e.target.value)}
          >
            <option value="All Events">All Events</option>
            <option value="Yoga Class">Yoga Class</option>
            <option value="Cooking Workshop">Cooking Workshop</option>
            <option value="Dance Class">Dance Class</option>
            <option value="Fitness Bootcamp">Fitness Bootcamp</option>
          </select>
          <select
            className={styles.filterDropdown}
            value={selectedTime}
            onChange={e => setSelectedTime(e.target.value)}
          >
            <option value="All Time">All Time</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
          </select>
        </div>
      </div>

      <div className={styles.trackingSummary}>
        <div className={`${styles.trackingRate} ${darkMode ? styles.trackingRateDark : ''}`}>
          <p className={styles.trackingRateValue}>
            +5% <span>Last week</span>
            {/* People who signed up but did not show up */}
          </p>
          <p className={styles.trackingRateSubheading}>
            <span>
              <b>Drop-off rate</b>
            </span>
          </p>
          <p className={styles.trackingRateValue}>
            <span className={styles.trackingRateValuePositive}>+5%</span>{' '}
            <span>since Last week</span>
          </p>
        </div>
        <div className={`${styles.trackingRate} ${darkMode ? styles.trackingRateDark : ''}`}>
          <p className={styles.trackingRateValue}>
            +5% <span>Last week</span>
            {/* People who did not show up */}
          </p>
          <p className={styles.trackingRateSubheading}>
            <span>
              <b>No-show rate</b>
            </span>
          </p>
          <p className={styles.trackingRateValue}>
            <span className={styles.trackingRateValueNegative}>
              <b>-5%</b>
            </span>{' '}
            <span>since Last week</span>
          </p>
        </div>
      </div>

      <div
        className={`${styles.trackingListContainer} ${
          darkMode ? styles.trackingListContainerDark : ''
        }`}
      >
        <table
          className={`tracking-table-global ${styles.trackingTable} ${
            darkMode ? `tracking-table-global-dark ${styles.trackingTableDark}` : ''
          }`}
        >
          <thead>
            <tr>
              <th>Event name</th>

              <th>
                No-show rate
                <span
                  className={styles.infoIcon}
                  title="Percentage of registered participants who did not attend the event. Calculated per event based on total registrations."
                >
                  ℹ️
                </span>
              </th>

              <th>
                Drop-off rate
                <span
                  className={styles.infoIcon}
                  title="Percentage of participants who joined the event but left before it was completed. Calculated per event based on total registrations."
                >
                  ℹ️
                </span>
              </th>

              <th>
                Get list
                <span
                  className={styles.infoIcon}
                  title="View the list of no-show participants for this event and send follow-up emails."
                >
                  ℹ️
                </span>
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredEventsByEventType.map(event => (
              <tr key={event.id}>
                <td>{event.eventName}</td>
                <td className={styles.trackingRateGreen} style={{ color: 'green' }}>
                  {event.noShowRate}
                </td>
                <td className={styles.trackingRateRed} style={{ color: 'red' }}>
                  {event.dropOffRate}
                </td>
                <td>
                  <button
                    type="button"
                    className={styles.getListBtn}
                    aria-label="Get no-show list"
                    onClick={() => handleOpenList(event)}
                  >
                    👥
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && activeEvent && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${darkMode ? styles.modalContentDark : ''}`}>
            <div className={styles.modalHeader}>
              <h4>No-show list</h4>
              <button type="button" className={styles.closeBtn} onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <div className={styles.modalSubHeader}>
              {activeEvent.eventName} | {activeEvent.eventTime}
            </div>

            <div className={styles.modalList}>
              <label className={styles.selectAll}>
                <input
                  type="checkbox"
                  checked={
                    selectedUsers.length > 0 &&
                    selectedUsers.length === mockEvents.slice(0, 8).length
                  }
                  onChange={e =>
                    setSelectedUsers(e.target.checked ? mockEvents.slice(0, 8).map(u => u.id) : [])
                  }
                />
                Select all
              </label>

              {mockEvents.slice(0, 8).map(user => (
                <label key={user.id} className={styles.userRow}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() =>
                      setSelectedUsers(prev =>
                        prev.includes(user.id)
                          ? prev.filter(id => id !== user.id)
                          : [...prev, user.id],
                      )
                    }
                  />
                  <span className={styles.userAvatar}>👤</span>
                  <span className={styles.userName}>No-show person {user.id}</span>
                  <span className={styles.userEmail}>user{user.id}@example.com</span>
                </label>
              ))}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.sendEmailBtn}
                disabled={selectedUsers.length === 0}
                onClick={() => {
                  handleCloseModal();
                }}
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DropOffTracking;
