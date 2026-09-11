import PropTypes from 'prop-types';
import styles from './PRGradingScreen.module.css';

const GRADE_OPTIONS = [
  { label: 'Exceptional', value: 'Exceptional' },
  { label: 'Okay', value: 'Okay' },
  { label: 'Unsatisfactory', value: 'Unsatisfactory' },
  { label: 'Cannot find image', value: 'No Correct Image' },
];

const InlinePRSummary = ({ reviewer, onGradeChange, isFinalized, darkMode }) => {
  const dm = darkMode ? styles['dark-mode'] : '';

  if (!reviewer.gradedPrs || reviewer.gradedPrs.length === 0) {
    return null;
  }

  return (
    <tr className={styles['pr-grading-inline-summary-row']}>
      <td colSpan={4} className={styles['pr-grading-inline-summary-cell']}>
        <div className={`${styles['pr-grading-inline-summary-container']} ${dm}`}>
          <table className={`${styles['pr-grading-inline-summary-table']} ${dm}`}>
            <thead>
              <tr>
                <th
                  className={`${styles['pr-grading-inline-header-cell']} ${styles['pr-grading-inline-pr-col']} ${dm}`}
                >
                  PR Number
                </th>
                {GRADE_OPTIONS.map(opt => (
                  <th
                    key={opt.value}
                    className={`${styles['pr-grading-inline-header-cell']} ${styles['pr-grading-inline-grade-col']} ${dm}`}
                  >
                    {opt.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviewer.gradedPrs.map(pr => {
                const isPair = pr.prNumbers.includes('+');
                return (
                  <tr key={pr.id} className={styles['pr-grading-inline-item-row']}>
                    <td
                      className={`${styles['pr-grading-inline-data-cell']} ${styles['pr-grading-inline-pr-cell']} ${dm}`}
                    >
                      <span
                        className={`${styles['pr-grading-inline-pr-tag']} ${
                          isPair
                            ? styles['pr-grading-inline-pair-tag']
                            : styles['pr-grading-inline-single-tag']
                        } ${dm}`}
                      >
                        {pr.prNumbers}
                      </span>
                    </td>
                    {GRADE_OPTIONS.map(opt => {
                      const isChecked =
                        pr.grade === opt.value ||
                        (opt.value === 'No Correct Image' && pr.grade === 'Cannot find image');
                      return (
                        <td
                          key={opt.value}
                          className={`${styles['pr-grading-inline-data-cell']} ${styles['pr-grading-pr-grading-inline-checkbox-cell']} ${dm}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isFinalized}
                            onChange={() => onGradeChange(reviewer.id, pr.id, opt.value)}
                            className={styles['pr-grading-inline-checkbox']}
                            aria-label={`${pr.prNumbers} ${opt.label}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
};

InlinePRSummary.propTypes = {
  reviewer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    gradedPrs: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        prNumbers: PropTypes.string.isRequired,
        grade: PropTypes.string,
      }),
    ).isRequired,
  }).isRequired,
  onGradeChange: PropTypes.func.isRequired,
  isFinalized: PropTypes.bool.isRequired,
  darkMode: PropTypes.bool,
};

InlinePRSummary.defaultProps = {
  darkMode: false,
};

export default InlinePRSummary;
