import React from 'react';
import { Trash2 } from 'lucide-react';
import styles from './SummaryList.module.css';

const GRADE_OPTIONS = ['Unsatisfactory', 'Okay', 'Exceptional', 'No Correct Image'];

function SummaryList({ gradings, onUpdateGrade, onRemovePR }) {
  return (
    <div className={styles.container}>
      {gradings.map(grading => (
        <div key={grading.reviewer} className={styles.reviewerSection}>
          <h3 className={styles.reviewerName}>{grading.reviewer}</h3>
          {grading.gradedPrs.length === 0 ? (
            <p className={styles.emptyMessage}>No graded PRs yet</p>
          ) : (
            <div className={styles.prList}>
              {grading.gradedPrs.map((gradedPR, index) => (
                <div key={index} className={styles.prItem}>
                  <div className={styles.prContent}>
                    <p className={styles.prNumber}>
                      PR: <span className={styles.prNumberValue}>{gradedPR.prNumbers}</span>
                    </p>
                    <div className={styles.gradeOptions}>
                      {GRADE_OPTIONS.map(grade => (
                        <label key={grade} className={styles.gradeLabel}>
                          <input
                            type="radio"
                            name={`grade-${grading.reviewer}-${index}`}
                            value={grade}
                            checked={gradedPR.grade === grade}
                            onChange={() => onUpdateGrade(grading.reviewer, index, grade)}
                            className={styles.gradeRadio}
                          />
                          <span
                            className={`${styles.gradeText} ${
                              gradedPR.grade === grade
                                ? styles.gradeTextSelected
                                : styles.gradeTextUnselected
                            }`}
                          >
                            {grade}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Only show delete button for new PRs */}
                  {gradedPR.isNew && (
                    <button
                      onClick={() => onRemovePR(grading.reviewer, index)}
                      className={styles.removeButton}
                      title="Remove PR"
                      type="button"
                    >
                      <Trash2 className={styles.removeIcon} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default SummaryList;
