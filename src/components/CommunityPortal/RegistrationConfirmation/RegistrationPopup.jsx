import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import styles from './RegistrationPopup.module.css';

function Popup({ onClose }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  const handleMoreDetails = () => {
    window.alert('Event details coming soon!');
  };

  const handleAddToCalendar = () => {
    window.alert('Add to calendar coming soon!');
  };

  const handleViewEmailDetails = () => {
    window.alert('Email details coming soon!');
  };

  const handleDownloadTicket = () => {
    window.alert('Download ticket coming soon!');
  };

  return (
    <div className={styles.popupOverlay}>
      <div className={`${styles.popup} ${darkMode ? styles.popupDark : ''}`}>
        <div className={styles.popupHeader}>
          <span>✅ Registration Successful!</span>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ✖
          </button>
        </div>
        <h2>Thank you for Registering!</h2>
        <p>
          You have successfully registered for the event. We have reserved your space. See you
          there!
        </p>
        <div className={styles.popupContent}>
          <strong>Event Name</strong>
          <button type="button" className={styles.eventDetails} onClick={handleMoreDetails}>
            (Click for more details)
          </button>
          <p className={styles.userFullName}>User&apos;s Full Name</p>
          <div className={styles.eventInfo}>
            <span>📅 Tuesday, January 7th, 2025</span>
            <span>⏰ 7:00 PM CST</span>
            <span>📍 Location</span>
          </div>
          <button type="button" className={styles.calendarBtn} onClick={handleAddToCalendar}>
            Add to my calendar
          </button>
          <div className={styles.popupFooter}>
            <button type="button" className={styles.emailBtn} onClick={handleViewEmailDetails}>
              View details in Email
            </button>
            <button type="button" className={styles.downloadBtn} onClick={handleDownloadTicket}>
              Download Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Popup.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default Popup;
