import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
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
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleCancel = event => {
    // Let React control the dialog's open state.
    event.preventDefault();
    handleClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.prGradingModal} ${darkMode ? styles.prGradingModalDark : ''}`}
      aria-labelledby="pr-grading-modal-title"
      onCancel={handleCancel}
    >
      <div className={styles.prGradingModalHeader}>
        <h2 id="pr-grading-modal-title">{reviewGroup?.label || 'Review for This Week'}</h2>

        <button
          type="button"
          className={styles.prGradingModalCloseButton}
          onClick={handleClose}
          aria-label="Close PR grading"
        >
          ×
        </button>
      </div>

      <div className={styles.prGradingModalContent}>
        <PRGradingScreen
          teamData={teamData}
          reviewers={reviewers}
          currentUser={currentUser}
          darkMode={darkMode}
        />
      </div>
    </dialog>
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
