import { useSelector } from 'react-redux';
import styles from './RegistrationPopup.module.css';
import PropTypes from 'prop-types';
function Popup({ onClose }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  return (
    <div className={darkMode ? styles.darkMode : ''}>
      <div className={`${styles.popupOverlay}`}>
        <div className={`${styles.popup}`}>
          <div className={`${styles.popupHeader}`}>
            <span>✅ Registration Successful!</span>
            <button type="button" className={`${styles.closeBtn}`} onClick={onClose}>
              ✖
            </button>
          </div>
          <h2>Thank you for Registering!</h2>
          <p>
            You have successfully registered for the event. We have reserved your space. See you
            there!
          </p>
          <div className={`${styles.popupContent}`}>
            <strong>Event Name</strong>
            <p className={`${styles.eventDetails}`}>(Click for more details)</p>
            <p className={`${styles.userFullName}`}>User&apos;s Full Name</p>

            <div className={`${styles.eventInfo}`}>
              <span>📅 Tuesday, January 7th, 2025</span>
              <span>⏰ 7:00 PM CST</span>
              <span>📍 Location</span>
            </div>

            <button type="button" className={`${styles.calendarBtn}`}>
              Add to my calendar
            </button>

            <div className={`${styles.popupFooter}`}>
              <button type="button" className={`${styles.emailBtn}`}>
                View details in Email
              </button>
              <button type="button" className={`${styles.downloadBtn}`}>
                Download Ticket
              </button>
            </div>
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
