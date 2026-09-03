import PropTypes from 'prop-types';
import styles from './PRGradingScreen.module.css';

const InlinePRSummary = ({ reviewer, onGradeChange, isFinalized, darkMode }) => {
  const dm = darkMode ? styles['dark-mode'] : '';

  if (!reviewer.gradedPrs || reviewer.gradedPrs.length === 0) {
    return null;
  }

  return (
    <tr className={`${styles['pr-grading-inline-summary-row']} ${dm}`}>
      <td colSpan={4} className={styles['pr-grading-inline-summary-cell']}>
        <div className={`${styles['pr-grading-inline-container']} ${dm}`}>
          <table className={`${styles['pr-grading-inline-table']} ${dm}`}>
            <thead>
              <tr>
                <th>PR Number</th>
                <th>Exceptional</th>
                <th>Okay</th>
                <th>Unsatisfactory</th>
                <th>Cannot find image</th>
              </tr>
            </thead>
            <tbody>
              {reviewer.gradedPrs.map(pr => (
                <tr key={pr.id}>
                  <td>{pr.prNumbers}</td>
                  <td>
                    <input
                      type="checkbox"
                      disabled={isFinalized}
                      checked={pr.grade === 'Exceptional'}
                      onChange={() => onGradeChange(reviewer.id, pr.id, 'Exceptional')}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      disabled={isFinalized}
                      checked={pr.grade === 'Okay'}
                      onChange={() => onGradeChange(reviewer.id, pr.id, 'Okay')}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      disabled={isFinalized}
                      checked={pr.grade === 'Unsatisfactory'}
                      onChange={() => onGradeChange(reviewer.id, pr.id, 'Unsatisfactory')}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      disabled={isFinalized}
                      checked={pr.grade === 'Cannot find image'}
                      onChange={() => onGradeChange(reviewer.id, pr.id, 'Cannot find image')}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
};

InlinePRSummary.propTypes = {
  reviewer: PropTypes.object.isRequired,
  onGradeChange: PropTypes.func.isRequired,
  isFinalized: PropTypes.bool.isRequired,
  darkMode: PropTypes.bool,
};

InlinePRSummary.defaultProps = {
  darkMode: false,
};

export default InlinePRSummary;
