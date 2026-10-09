import { Plus, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';
import styles from './ReviewerRow.module.css';
import { useRowSelection } from './SelectionContext';

function ReviewerRow({
  grading,
  onUpdatePRsReviewed,
  onAddPRClick,
  onRemoveReviewer,
  isCurrentWeek,
  darkMode,
}) {
  const { activeId, selectRow } = useRowSelection();

  const handlePRsReviewedChange = e => {
    const value = e.target.value;
    // Allow empty string for better UX, but convert to 0 on blur if invalid
    if (value === '' || (!isNaN(value) && parseInt(value, 10) >= 0)) {
      onUpdatePRsReviewed(grading.reviewer, value === '' ? 0 : parseInt(value, 10));
    }
  };

  const handleBlur = e => {
    const value = e.target.value;
    if (value === '' || isNaN(value) || parseInt(value, 10) < 0) {
      onUpdatePRsReviewed(grading.reviewer, 0);
    }
  };

  return (
    <tr className={styles.row}>
      <td className={styles.cell}>
        <button
          className={styles.reviewerName}
          onClick={() => selectRow(grading.reviewer)}
          style={darkMode ? { color: '#f9fafb' } : {}}
        >
          {grading.reviewer}
        </button>
      </td>
      <td className={styles.cell}>
        <input
          type="number"
          min="0"
          value={grading.prsReviewed}
          onChange={handlePRsReviewedChange}
          onBlur={handleBlur}
          className={styles.prsReviewedInput}
          style={
            darkMode ? { backgroundColor: '#374151', color: '#f9fafb', borderColor: '#4b5563' } : {}
          }
        />
      </td>
      <td className={styles.cell}>
        <div className={styles.prsNeeded}>{grading.prsNeeded}</div>
      </td>
      <td className={styles.cell}>
        {isCurrentWeek ? (
          <div className={styles.actionsCell}>
            <button
              onClick={() => onAddPRClick(grading.reviewer)}
              className={styles.addButton}
              type="button"
            >
              <Plus className={styles.addButtonIcon} />
              Add New
            </button>
            <button
              onClick={() => onRemoveReviewer(grading.reviewer)}
              className={styles.removeButton}
              type="button"
              aria-label={`Remove reviewer ${grading.reviewer}`}
              title="Remove reviewer"
            >
              <Trash2 className={styles.removeButtonIcon} />
            </button>
          </div>
        ) : (
          <span className={styles.readOnlyLabel}>Read only</span>
        )}
      </td>
    </tr>
  );
}
ReviewerRow.propTypes = {
  grading: PropTypes.shape({
    reviewer: PropTypes.string.isRequired,
    prsReviewed: PropTypes.number.isRequired,
    prsNeeded: PropTypes.number.isRequired,
  }).isRequired,
  onUpdatePRsReviewed: PropTypes.func.isRequired,
  onAddPRClick: PropTypes.func.isRequired,
  onRemoveReviewer: PropTypes.func.isRequired,
  isCurrentWeek: PropTypes.bool,
  darkMode: PropTypes.bool,
};

ReviewerRow.defaultProps = {
  isCurrentWeek: true,
  darkMode: false,
};

export default ReviewerRow;
