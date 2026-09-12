/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import PropTypes from 'prop-types';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from './Home.module.css';

function HomeDatePickerModal({
  dateRange,
  onClose,
  onStartDateChange,
  onEndDateChange,
  onAdjustWeek,
  onApply,
  onClear,
}) {
  const showWeekNav = Boolean(dateRange.startDate && dateRange.endDate);

  return (
    <div className={styles.lbModalOverlay} onClick={onClose}>
      <div className={styles.lbDatePickerContainer} onClick={e => e.stopPropagation()}>
        <div className={styles.lbModalHeader}>
          <h3>Select Date Range</h3>
          <div className={styles.lbCloseButtonWrapper}>
            <FaTimes className={styles.lbCloseButton} onClick={onClose} />
          </div>
        </div>
        <div className={styles.lbDatePickerContent}>
          <div className={styles.lbDateInputs}>
            <div className={styles.lbDateInputGroup}>
              <label htmlFor="home-start-date">Start Date</label>
              <input
                id="home-start-date"
                type="date"
                value={dateRange.startDate}
                onChange={e => onStartDateChange(e.target.value)}
              />
            </div>
            <div className={styles.lbDateInputGroup}>
              <label htmlFor="home-end-date">End Date</label>
              <input
                id="home-end-date"
                type="date"
                value={dateRange.endDate}
                onChange={e => onEndDateChange(e.target.value)}
                min={dateRange.startDate}
              />
            </div>
          </div>

          {showWeekNav && (
            <div className={styles.lbDateNavigation}>
              <button
                type="button"
                className={styles.lbDateNavButton}
                onClick={() => onAdjustWeek('backward')}
              >
                <FaChevronLeft /> Previous Week
              </button>
              <button
                type="button"
                className={styles.lbDateNavButton}
                onClick={() => onAdjustWeek('forward')}
              >
                Next Week <FaChevronRight />
              </button>
            </div>
          )}

          <div className={styles.lbDatePickerActions}>
            <button type="button" className={styles.lbApplyButton} onClick={onApply}>
              Apply
            </button>
            <button type="button" className={styles.lbClearButton} onClick={onClear}>
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

HomeDatePickerModal.propTypes = {
  dateRange: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onStartDateChange: PropTypes.func.isRequired,
  onEndDateChange: PropTypes.func.isRequired,
  onAdjustWeek: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};

export default HomeDatePickerModal;
