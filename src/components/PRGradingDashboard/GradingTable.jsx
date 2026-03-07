import React from 'react';
import ReviewerRow from './ReviewerRow';
import AddPRModal from './AddPRModal';
import styles from './GradingTable.module.css';

function GradingTable({
  gradings,
  onUpdatePRsReviewed,
  onAddPRClick,
  openAddModal,
  onAddGradedPR,
}) {
  return (
    // <div className={styles.tableWrapper}>
    <table className={styles.table}>
      <thead className={styles.tableHead}>
        <tr>
          <th className={styles.tableHeader}>Reviewer Name</th>
          <th className={styles.tableHeader}>PRs Reviewed</th>
          <th className={styles.tableHeader}>PRs Needed</th>
          <th className={styles.tableHeader}>PR Actions</th>
        </tr>
      </thead>
      <tbody className={styles.tableBody}>
        {gradings.map((grading, index) => (
          <React.Fragment key={grading.reviewer}>
            <ReviewerRow
              grading={grading}
              onUpdatePRsReviewed={onUpdatePRsReviewed}
              onAddPRClick={onAddPRClick}
            />
            {openAddModal === grading.reviewer && (
              <tr className={styles.modalRow}>
                <td colSpan="4" className={styles.modalCell}>
                  <AddPRModal
                    reviewer={grading.reviewer}
                    onAdd={onAddGradedPR}
                    onCancel={() => onAddPRClick(null)}
                  />
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
    // </div>
  );
}

export default GradingTable;
