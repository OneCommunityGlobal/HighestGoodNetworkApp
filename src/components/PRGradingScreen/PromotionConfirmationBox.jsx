import PropTypes from 'prop-types';
import styles from './PRGradingScreen.module.css';

function PromotionConfirmationBox({ reviewer, onConfirm, onCancel, darkMode }) {
  const { reviewerName, teamCode, teamReviewerName, weeklyPRs } = reviewer;

  const totalPRs = weeklyPRs.reduce((sum, w) => sum + w.count, 0);
  const avgPRs = weeklyPRs.length > 0 ? (totalPRs / weeklyPRs.length).toFixed(1) : 0;
  const isConsistent = weeklyPRs.every(w => w.count >= 8);

  return (
    <div
      className={`${styles['pr-grading-screen-modal-overlay']} ${
        darkMode ? styles['dark-mode'] : ''
      }`}
    >
      <div
        className={`${styles['pr-grading-screen-modal']} ${darkMode ? styles['dark-mode'] : ''}`}
      >
        {/* Header */}
        <div
          className={`${styles['pr-grading-screen-modal-header']} ${
            darkMode ? styles['dark-mode'] : ''
          }`}
        >
          <h4 style={{ margin: 0, color: darkMode ? '#fff' : '#333' }}>🏆 Confirm Promotion</h4>
          <button
            type="button"
            className={styles['pr-grading-screen-modal-close']}
            onClick={onCancel}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div
          className={`${styles['pr-grading-screen-modal-body']} ${
            darkMode ? styles['dark-mode'] : ''
          }`}
        >
          {/* Reviewer Info */}
          <div
            style={{
              background: darkMode ? '#2d4059' : '#f0f4ff',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              border: `1px solid ${darkMode ? '#4a5a77' : '#c3d0f0'}`,
            }}
          >
            <p style={{ margin: '4px 0', color: darkMode ? '#fff' : '#333' }}>
              <strong>Reviewer:</strong> {reviewerName}
            </p>
            <p style={{ margin: '4px 0', color: darkMode ? '#fff' : '#333' }}>
              <strong>Team:</strong> {teamCode}
            </p>
            <p style={{ margin: '4px 0', color: darkMode ? '#fff' : '#333' }}>
              <strong>Team Reviewer Name:</strong> {teamReviewerName}
            </p>
          </div>

          {/* Weekly PR Stats */}
          <h5 style={{ color: darkMode ? '#e8a71c' : '#052C65', marginBottom: '8px' }}>
            Weekly PR Stats
          </h5>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
            <thead>
              <tr>
                <th
                  style={{
                    padding: '8px 12px',
                    background: darkMode ? '#2d4059' : '#f8f9fa',
                    color: darkMode ? '#fff' : '#495057',
                    border: `1px solid ${darkMode ? '#4a5a77' : '#dee2e6'}`,
                    textAlign: 'left',
                  }}
                >
                  Week
                </th>
                <th
                  style={{
                    padding: '8px 12px',
                    background: darkMode ? '#2d4059' : '#f8f9fa',
                    color: darkMode ? '#fff' : '#495057',
                    border: `1px solid ${darkMode ? '#4a5a77' : '#dee2e6'}`,
                    textAlign: 'center',
                  }}
                >
                  PR Count
                </th>
              </tr>
            </thead>
            <tbody>
              {weeklyPRs.map(w => (
                <tr key={w.week}>
                  <td
                    style={{
                      padding: '8px 12px',
                      color: darkMode ? '#fff' : '#333',
                      border: `1px solid ${darkMode ? '#4a5a77' : '#dee2e6'}`,
                    }}
                  >
                    {w.week}
                  </td>
                  <td
                    style={{
                      padding: '8px 12px',
                      color: darkMode ? '#fff' : '#333',
                      border: `1px solid ${darkMode ? '#4a5a77' : '#dee2e6'}`,
                      textAlign: 'center',
                      fontWeight: '600',
                    }}
                  >
                    {w.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Stats */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: '120px',
                background: darkMode ? '#1b2a41' : '#e9ecef',
                borderRadius: '6px',
                padding: '12px',
                textAlign: 'center',
                border: `1px solid ${darkMode ? '#4a5a77' : '#ced4da'}`,
              }}
            >
              <div
                style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  color: darkMode ? '#4a9eff' : '#052C65',
                }}
              >
                {totalPRs}
              </div>
              <div style={{ fontSize: '0.8rem', color: darkMode ? '#b0b8c4' : '#6c757d' }}>
                Total PRs
              </div>
            </div>
            <div
              style={{
                flex: 1,
                minWidth: '120px',
                background: darkMode ? '#1b2a41' : '#e9ecef',
                borderRadius: '6px',
                padding: '12px',
                textAlign: 'center',
                border: `1px solid ${darkMode ? '#4a5a77' : '#ced4da'}`,
              }}
            >
              <div
                style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  color: darkMode ? '#4a9eff' : '#052C65',
                }}
              >
                {avgPRs}
              </div>
              <div style={{ fontSize: '0.8rem', color: darkMode ? '#b0b8c4' : '#6c757d' }}>
                Avg PRs/Week
              </div>
            </div>
            <div
              style={{
                flex: 1,
                minWidth: '120px',
                background: isConsistent
                  ? darkMode
                    ? '#1a3a2a'
                    : '#d4edda'
                  : darkMode
                  ? '#3a1a1a'
                  : '#f8d7da',
                borderRadius: '6px',
                padding: '12px',
                textAlign: 'center',
                border: `1px solid ${isConsistent ? '#c3e6cb' : '#f5c6cb'}`,
              }}
            >
              <div
                style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  color: isConsistent ? '#28a745' : '#dc3545',
                }}
              >
                {isConsistent ? '✅' : '⚠️'}
              </div>
              <div style={{ fontSize: '0.8rem', color: darkMode ? '#b0b8c4' : '#6c757d' }}>
                {isConsistent ? 'Consistent' : 'Inconsistent'}
              </div>
            </div>
          </div>

          {/* Confirmation question */}
          <p
            style={{
              color: darkMode ? '#fff' : '#333',
              fontWeight: '600',
              fontSize: '1rem',
              textAlign: 'center',
              marginBottom: '16px',
            }}
          >
            Are you sure you want to confirm promotion for{' '}
            <span style={{ color: darkMode ? '#e8a71c' : '#052C65' }}>{reviewerName}</span>?
          </p>
        </div>

        {/* Footer */}
        <div
          className={`${styles['pr-grading-screen-modal-footer']} ${
            darkMode ? styles['dark-mode'] : ''
          }`}
          style={{ gap: '12px' }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 20px',
              borderRadius: '4px',
              border: `1px solid ${darkMode ? '#5a6b88' : '#6c757d'}`,
              background: darkMode ? '#6c757d' : '#fff',
              color: darkMode ? '#fff' : '#6c757d',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reviewerName, reviewer.reviewerId)}
            style={{
              padding: '8px 20px',
              borderRadius: '4px',
              border: 'none',
              background: '#28a745',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            ✅ Confirm Promotion
          </button>
        </div>
      </div>
    </div>
  );
}

PromotionConfirmationBox.propTypes = {
  reviewer: PropTypes.shape({
    reviewerId: PropTypes.string,
    reviewerName: PropTypes.string.isRequired,
    teamCode: PropTypes.string,
    teamReviewerName: PropTypes.string,
    weeklyPRs: PropTypes.arrayOf(
      PropTypes.shape({
        week: PropTypes.string,
        count: PropTypes.number,
      }),
    ),
  }).isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
};

PromotionConfirmationBox.defaultProps = {
  darkMode: false,
};

export default PromotionConfirmationBox;
