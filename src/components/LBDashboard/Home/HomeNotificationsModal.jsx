/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import PropTypes from 'prop-types';
import { FaTimes } from 'react-icons/fa';
import styles from './Home.module.css';

function HomeNotificationsModal({ onClose }) {
  return (
    <div className={styles.lbModalOverlay} onClick={onClose}>
      <div className={styles.lbNotificationModal} onClick={e => e.stopPropagation()}>
        <div className={styles.lbModalHeader}>
          <h3>Notifications</h3>
          <div className={styles.lbCloseButtonWrapper}>
            <FaTimes className={styles.lbCloseButton} onClick={onClose} />
          </div>
        </div>
        <div className={`${styles.lbModalContent} ${styles.lbNotificationContent}`}>
          <div className={`${styles.lbNotificationItem} ${styles.unread}`}>
            <h4>New booking request</h4>
            <p>Someone is interested in Unit 5</p>
            <span className={styles.lbNotificationTime}>2 hours ago</span>
          </div>
          <div className={`${styles.lbNotificationItem} ${styles.unread}`}>
            <h4>Price update</h4>
            <p>Unit 12 price has been reduced</p>
            <span className={styles.lbNotificationTime}>Yesterday</span>
          </div>
          <div className={`${styles.lbNotificationItem} ${styles.unread}`}>
            <h4>Village announcement</h4>
            <p>Community meeting this weekend</p>
            <span className={styles.lbNotificationTime}>3 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}

HomeNotificationsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default HomeNotificationsModal;
