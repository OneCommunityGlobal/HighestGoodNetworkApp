import React from 'react';
import { Plus } from 'lucide-react';
import styles from './ReviewerRow.module.css';
import { useRowSelection } from './SelectionContext';

function ReviewerRow({ grading, onUpdatePRsReviewed, onAddPRClick }) {
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
        <button className={styles.reviewerName} onClick={() => selectRow(grading.reviewer)}>
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
        />
      </td>
      <td className={styles.cell}>
        <div className={styles.prsNeeded}>{grading.prsNeeded}</div>
      </td>
      <td className={styles.cell}>
        <button
          onClick={() => onAddPRClick(grading.reviewer)}
          className={styles.addButton}
          type="button"
        >
          <Plus className={styles.addButtonIcon} />
          Add New
        </button>
      </td>
    </tr>
  );
}

export default ReviewerRow;
