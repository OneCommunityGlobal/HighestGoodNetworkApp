import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import styles from './PRGradingScreen.module.css';
import InlinePRSummary from './InlinePRSummary';
import GRADE_OPTIONS from './gradeOptions';

const PRGradingView = ({
  darkMode,
  teamData,
  isFinalized,
  onFinalize,
  searchTerm,
  onSearchTermChange,
  roleFilter,
  onRoleFilterChange,
  availableRoles,
  onClearSearch,
  filteredReviewers,
  promotedReviewerIds,
  onPromoteClick,
  activeInput,
  inputValue,
  inputError,
  loadError,
  gradeError,
  isLoadingSaved,
  isSavingPR,
  isSavingGrade,
  onInputValueChange,
  onAddNewClick,
  onInputSubmit,
  onCancelInput,
  onPRNumberClick,
  promotingReviewer,
  onConfirmPromotion,
  onCancelPromotion,
  showGradingModal,
  onCloseGradingModal,
  gradingReviewer,
  onGradeChange,
}) => {
  const dm = darkMode ? 'dark-mode' : '';

  return (
    <Container fluid className={`${styles['pr-grading-screen-container']} ${dm}`}>
      <Row>
        <Col md={12}>
          <Card className={`${styles['pr-grading-screen-card']} ${dm}`}>
            <Card.Header className={`${styles['pr-grading-screen-header']} ${dm}`}>
              <div className={styles['pr-grading-screen-header-content']}>
                <div>
                  <h1 className={`${styles['pr-grading-screen-title']} ${dm}`}>
                    Weekly PR grading screen
                  </h1>
                  <div className={`${styles['pr-grading-screen-team-info-badge']} ${dm}`}>
                    <p className={`${styles['pr-grading-screen-team-info']} ${dm}`}>
                      {teamData.teamName} | {teamData.dateRange.start} to {teamData.dateRange.end}
                    </p>
                  </div>
                </div>
                <Button
                  variant={isFinalized ? 'secondary' : 'outline-dark'}
                  disabled={isFinalized || isSavingPR || isSavingGrade}
                  onClick={onFinalize}
                  className={`${styles['pr-grading-screen-done-button']} ${dm}`}
                >
                  {isFinalized ? 'Finalized' : 'Done'}
                </Button>
              </div>
              {loadError && (
                <p role="alert" className={`${styles['pr-grading-screen-error-message']} ${dm}`}>
                  {loadError}
                </p>
              )}
            </Card.Header>

            <Card.Body className={dm}>
              {gradeError && (
                <p role="alert" className={`${styles['pr-grading-screen-error-message']} ${dm}`}>
                  {gradeError}
                </p>
              )}
              {/* Search and Filter Bar */}
              <div className={`${styles['pr-grading-screen-search-bar']} ${dm}`}>
                <input
                  type="text"
                  placeholder="Search reviewers by name..."
                  value={searchTerm}
                  onChange={e => onSearchTermChange(e.target.value)}
                  className={`${styles['pr-grading-screen-search-input']} ${dm}`}
                />

                {availableRoles.length > 0 && (
                  <select
                    value={roleFilter}
                    onChange={e => onRoleFilterChange(e.target.value)}
                    className={`${styles['pr-grading-screen-role-select']} ${dm}`}
                  >
                    <option value="">All roles</option>
                    {availableRoles.map(role => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                )}

                {(searchTerm || roleFilter) && (
                  <button
                    onClick={onClearSearch}
                    className={`${styles['pr-grading-screen-clear-btn']} ${dm}`}
                  >
                    ✕ Clear
                  </button>
                )}
              </div>

              {/* Reviewer Table */}
              <div className={`${styles['pr-grading-screen-table-container']} ${dm}`}>
                <table className={`${styles['pr-grading-screen-table']} ${dm}`}>
                  <thead>
                    <tr>
                      <th className={styles['pr-grading-screen-th-name']}>Reviewer Name</th>
                      <th className={styles['pr-grading-screen-th-reviewed']}>PR reviewed</th>
                      <th className={styles['pr-grading-screen-th-needed']}>PRs Needed</th>
                      <th className={styles['pr-grading-screen-th-numbers']}>PR Numbers</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReviewers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className={`${styles['pr-grading-screen-no-results']} ${dm}`}
                        >
                          No reviewers found
                        </td>
                      </tr>
                    ) : (
                      filteredReviewers.map(reviewer => {
                        const isPromoted = promotedReviewerIds.has(reviewer.id);

                        return (
                          <React.Fragment key={reviewer.id}>
                            <tr>
                              {/* Reviewer Name and Promote Button Cell */}
                              <td className={styles['pr-grading-screen-td-name']}>
                                <div className={styles['pr-grading-screen-reviewer-info']}>
                                  <span className={styles['pr-grading-screen-reviewer-name']}>
                                    {reviewer.reviewer}
                                  </span>
                                  {reviewer.role && (
                                    <span className={styles['pr-grading-screen-reviewer-role']}>
                                      {reviewer.role}
                                    </span>
                                  )}
                                  <Button
                                    variant={isPromoted ? 'success' : 'outline-warning'}
                                    size="sm"
                                    disabled={isPromoted}
                                    onClick={() => onPromoteClick(reviewer)}
                                    style={{ marginTop: '8px' }}
                                  >
                                    {isPromoted ? '✅ Promoted' : '🏆 Promote'}
                                  </Button>
                                </div>
                              </td>

                              {/* PR Reviewed Count */}
                              <td className={styles['pr-grading-screen-td-reviewed']}>
                                <input
                                  type="number"
                                  value={reviewer.gradedPrs.length}
                                  readOnly
                                  disabled={isFinalized}
                                  className={`${styles['pr-grading-screen-pr-input']} ${dm}`}
                                />
                              </td>

                              {/* PRs Needed */}
                              <td className={styles['pr-grading-screen-td-needed']}>
                                {reviewer.prsNeeded}
                              </td>

                              {/* PR Numbers & Actions */}
                              <td className={styles['pr-grading-screen-td-numbers']}>
                                <div className={styles['pr-grading-screen-pr-list']}>
                                  {reviewer.gradedPrs.map(pr => (
                                    <span
                                      key={pr.id}
                                      role="button"
                                      tabIndex={0}
                                      className={`${styles['pr-grading-screen-pr-number']} ${
                                        pr.prNumbers.includes('+')
                                          ? styles['pr-grading-screen-pair']
                                          : ''
                                      } ${styles['pr-grading-screen-pr-clickable']} ${dm}`}
                                      onClick={() => onPRNumberClick(reviewer.id)}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                          e.preventDefault();
                                          onPRNumberClick(reviewer.id);
                                        }
                                      }}
                                    >
                                      {pr.prNumbers}
                                    </span>
                                  ))}
                                </div>

                                {!isFinalized && activeInput !== reviewer.id && (
                                  <Button
                                    variant="success"
                                    size="sm"
                                    disabled={isLoadingSaved || isSavingPR || Boolean(loadError)}
                                    className={styles['pr-grading-screen-add-btn']}
                                    onClick={() => onAddNewClick(reviewer.id)}
                                  >
                                    + Add new
                                  </Button>
                                )}

                                {!isFinalized && activeInput === reviewer.id && (
                                  <div className={styles['pr-grading-screen-input-container']}>
                                    <div className={styles['pr-grading-screen-input-wrapper']}>
                                      <input
                                        type="text"
                                        value={inputValue}
                                        disabled={isSavingPR}
                                        onChange={e => onInputValueChange(e.target.value)}
                                        className={styles['pr-grading-screen-pr-number-input']}
                                        placeholder="1070 or 1070 + 1256"
                                      />
                                      {inputError && (
                                        <span
                                          role="alert"
                                          className={`${styles['pr-grading-screen-error-message']} ${dm}`}
                                        >
                                          {inputError}
                                        </span>
                                      )}
                                    </div>
                                    <div className={styles['pr-grading-screen-input-buttons']}>
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        disabled={isSavingPR}
                                        onClick={() => onInputSubmit(reviewer.id)}
                                      >
                                        {isSavingPR ? 'Adding...' : 'Add'}
                                      </Button>
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={isSavingPR}
                                        onClick={onCancelInput}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </td>
                            </tr>
                            {/* Render inline summary component below each reviewer row for state synchronization and unit tests */}
                            <InlinePRSummary
                              reviewer={reviewer}
                              onGradeChange={onGradeChange}
                              isFinalized={isFinalized || isSavingGrade}
                              darkMode={darkMode}
                            />
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* PR Grading Modal */}
      {showGradingModal && gradingReviewer && (
        <div className={`${styles['pr-grading-screen-modal-overlay']} ${dm}`}>
          <div className={`${styles['pr-grading-screen-modal']} ${dm}`}>
            <div className={`${styles['pr-grading-screen-modal-header']} ${dm}`}>
              <h3>Grade PR for {gradingReviewer.reviewer}</h3>
              <button
                className={`${styles['pr-grading-screen-modal-close']} ${dm}`}
                disabled={isSavingGrade}
                onClick={onCloseGradingModal}
              >
                ×
              </button>
            </div>

            <div className={`${styles['pr-grading-screen-modal-body']} ${dm}`}>
              <table className={`${styles['pr-grading-screen-grading-table']} ${dm}`}>
                <thead>
                  <tr>
                    <th>PR Number</th>
                    {GRADE_OPTIONS.map(opt => (
                      <th key={opt.value}>{opt.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gradingReviewer.gradedPrs.map(pr => (
                    <tr key={pr.id}>
                      <td className={styles['pr-grading-screen-modal-pr-number']}>
                        {pr.prNumbers}
                      </td>
                      {GRADE_OPTIONS.map(opt => (
                        <td key={opt.value} className={styles['pr-grading-screen-checkbox-cell']}>
                          <input
                            type="checkbox"
                            disabled={isFinalized || isSavingGrade}
                            checked={pr.grade === opt.value}
                            onChange={() => onGradeChange(gradingReviewer.id, pr.id, opt.value)}
                            className={styles['pr-grading-screen-grade-checkbox']}
                            aria-label={`${pr.prNumbers} ${opt.label}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={`${styles['pr-grading-screen-modal-footer']} ${dm}`}>
                <Button
                  variant="primary"
                  disabled={isSavingGrade}
                  onClick={onCloseGradingModal}
                  className={`${styles['pr-grading-screen-done-btn']} ${dm}`}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Confirmation Modal */}
      {promotingReviewer && (
        <div className={`${styles['pr-grading-screen-modal-overlay']} ${dm}`}>
          <div className={`${styles['pr-grading-screen-modal']} ${dm}`}>
            <div className={`${styles['pr-grading-screen-modal-header']} ${dm}`}>
              <h3>Confirm Promotion</h3>
              <button
                className={`${styles['pr-grading-screen-modal-close']} ${dm}`}
                onClick={onCancelPromotion}
              >
                ×
              </button>
            </div>

            <div className={`${styles['pr-grading-screen-modal-body']} ${dm}`}>
              <p>
                Reviewer: <strong>{promotingReviewer.reviewerName}</strong>
              </p>
              <p>Team: {promotingReviewer.teamCode}</p>
              <p>Status: {promotingReviewer.isConsistent ? '✅ Consistent' : '⚠️ Inconsistent'}</p>

              {promotingReviewer.weeklyPRs && promotingReviewer.weeklyPRs.length > 0 ? (
                <table className={`${styles['pr-grading-screen-grading-table']} ${dm}`}>
                  <thead>
                    <tr>
                      <th>Week</th>
                      <th>PR Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotingReviewer.weeklyPRs.map((count, index) => (
                      <tr key={index}>
                        <td>Week {index + 1}</td>
                        <td>{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className={`${styles['pr-promotion-no-history']} ${dm}`}>
                  No weekly PR history is available for this reviewer.
                </div>
              )}

              <div className={styles['pr-promotion-footer']}>
                <button
                  type="button"
                  onClick={onCancelPromotion}
                  className={`${styles['pr-promotion-btn-cancel']} ${dm}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirmPromotion}
                  className={`${styles['pr-promotion-btn-confirm']} ${dm}`}
                >
                  Confirm Promotion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

PRGradingView.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  teamData: PropTypes.shape({
    teamName: PropTypes.string.isRequired,
    dateRange: PropTypes.shape({
      start: PropTypes.string.isRequired,
      end: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  isFinalized: PropTypes.bool.isRequired,
  onFinalize: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  onSearchTermChange: PropTypes.func.isRequired,
  roleFilter: PropTypes.string.isRequired,
  onRoleFilterChange: PropTypes.func.isRequired,
  availableRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClearSearch: PropTypes.func.isRequired,
  filteredReviewers: PropTypes.arrayOf(PropTypes.object).isRequired,
  promotedReviewerIds: (props, propName) => {
    const val = props[propName];
    // Accept Set or array-like objects with a has or includes method
    if (
      val &&
      typeof val === 'object' &&
      (typeof val.has === 'function' || typeof val.includes === 'function')
    ) {
      return null;
    }
    return new Error(`Invalid prop ${propName}: expected Set or Array, got ${typeof val}`);
  },
  onPromoteClick: PropTypes.func.isRequired,
  activeInput: PropTypes.string,
  inputValue: PropTypes.string.isRequired,
  inputError: PropTypes.string.isRequired,
  loadError: PropTypes.string.isRequired,
  gradeError: PropTypes.string.isRequired,
  isLoadingSaved: PropTypes.bool.isRequired,
  isSavingPR: PropTypes.bool.isRequired,
  isSavingGrade: PropTypes.bool.isRequired,
  onInputValueChange: PropTypes.func.isRequired,
  onAddNewClick: PropTypes.func.isRequired,
  onInputSubmit: PropTypes.func.isRequired,
  onCancelInput: PropTypes.func.isRequired,
  onPRNumberClick: PropTypes.func.isRequired,
  promotingReviewer: PropTypes.object,
  onConfirmPromotion: PropTypes.func.isRequired,
  onCancelPromotion: PropTypes.func.isRequired,
  showGradingModal: PropTypes.string,
  onCloseGradingModal: PropTypes.func.isRequired,
  gradingReviewer: PropTypes.object,
  onGradeChange: PropTypes.func.isRequired,
};

export default PRGradingView;
