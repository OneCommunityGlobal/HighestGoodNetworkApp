import PropTypes from 'prop-types';
import React from 'react';
import AddPRModal from './AddPRModal';
import styles from './GradingTable.module.css';
import ReviewerRow from './ReviewerRow';

function GradingTable({
  gradings,
  onUpdatePRsReviewed,
  onAddPRClick,
  openAddModal,
  onAddGradedPR,
  darkMode,
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
              darkMode={darkMode}
            />
            {openAddModal === grading.reviewer && (
              <tr className={styles.modalRow}>
                <td colSpan="4" className={styles.modalCell}>
                  <AddPRModal
                    reviewer={grading.reviewer}
                    existingPRs={grading.gradedPrs}
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
GradingTable.propTypes = {
  gradings: PropTypes.arrayOf(
    PropTypes.shape({
      reviewer: PropTypes.string.isRequired,
      prsReviewed: PropTypes.number.isRequired,
      prsNeeded: PropTypes.number.isRequired,
    }),
  ).isRequired,
  onUpdatePRsReviewed: PropTypes.func.isRequired,
  onAddPRClick: PropTypes.func.isRequired,
  openAddModal: PropTypes.string,
  onAddGradedPR: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
};

GradingTable.defaultProps = {
  openAddModal: null,
  darkMode: false,
};

export default GradingTable;
