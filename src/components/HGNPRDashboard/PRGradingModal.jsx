import PropTypes from 'prop-types';
import PRGradingScreen from './../PRGradingScreen/PRGradingScreen';
import styles from './PRGradingModal.module.css';

const PRGradingModal = ({
  isOpen,
  reviewGroup,
  currentUser,
  reviewers,
  teamData,
  darkMode,
  onClose,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pr-grading-modal-title"
    >
      <div className={`${styles.modal} ${darkMode ? styles.dark : ''}`}>
        <div className={styles.modalHeader}>
          <h2 id="pr-grading-modal-title">{reviewGroup?.label || 'Review for This Week'}</h2>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close PR grading"
          >
            ×
          </button>
        </div>

        <div className={styles.modalContent}>
          <PRGradingScreen
            teamData={teamData}
            reviewers={reviewers}
            currentUser={currentUser}
            darkMode={darkMode}
          />
        </div>
      </div>
    </div>
  );
};

PRGradingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,

  reviewGroup: PropTypes.shape({
    key: PropTypes.string,
    label: PropTypes.string,
    rangeStart: PropTypes.string,
    rangeEnd: PropTypes.string,
  }),

  reviewers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      reviewer: PropTypes.string,
      reviewerName: PropTypes.string,
      role: PropTypes.string,
      prsNeeded: PropTypes.number,
      gradedPrs: PropTypes.array,
    }),
  ),

  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    token: PropTypes.string,
  }),
  teamData: PropTypes.shape({
    teamName: PropTypes.string,
    dateRange: PropTypes.shape({
      start: PropTypes.string,
      end: PropTypes.string,
    }),
  }),

  darkMode: PropTypes.bool,

  onClose: PropTypes.func.isRequired,
};

PRGradingModal.defaultProps = {
  reviewGroup: null,
  reviewers: [],
  teamData: {
    teamName: 'Reviewers',
    dateRange: {
      start: '',
      end: '',
    },
  },
  darkMode: false,
};

export default PRGradingModal;
