import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import PRGradingScreen from './../PRGradingScreen/PRGradingScreen';
import { fetchPREntries } from '../../actions/promotionActions';
import styles from './PRGradingModal.module.css';

const PRGradingModal = ({ isOpen, reviewGroup, reviewers, teamData, darkMode, onClose }) => {
  const [reviewersWithEntries, setReviewersWithEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!reviewers || reviewers.length === 0) {
      setReviewersWithEntries([]);
      return;
    }

    const loadPREntries = async () => {
      setLoading(true);

      try {
        const enrichedReviewers = await Promise.all(
          reviewers.map(async reviewer => {
            try {
              const response = await fetchPREntries(reviewer.id);

              /*
               * Depending on your backend response, entries may be
               * returned directly or inside an `entries` property.
               */
              const entries = Array.isArray(response) ? response : response?.entries || [];

              return {
                ...reviewer,
                gradedPrs: entries,
              };
            } catch (error) {
              console.error(`Failed to load PR entries for reviewer ${reviewer.id}:`, error);

              return {
                ...reviewer,
                gradedPrs: [],
              };
            }
          }),
        );

        setReviewersWithEntries(enrichedReviewers);
      } catch (error) {
        console.error('Failed to load PR entries:', error);
        toast.error('Unable to load PR grading data.');
      } finally {
        setLoading(false);
      }
    };

    loadPREntries();
  }, [isOpen, reviewers]);

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
          {loading ? (
            <div className={styles.loading}>Loading PR grading data...</div>
          ) : (
            <PRGradingScreen
              teamData={teamData}
              reviewers={reviewersWithEntries}
              darkMode={darkMode}
            />
          )}
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
