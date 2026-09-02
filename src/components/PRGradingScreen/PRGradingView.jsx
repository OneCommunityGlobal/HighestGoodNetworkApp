import PropTypes from 'prop-types';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import styles from './PRGradingScreen.module.css';
import PromotionConfirmationBox from './PromotionConfirmationBox';
import ReviewerCell from './ReviewerCell';
import React from 'react';

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
  const dm = darkMode ? styles['dark-mode'] : '';

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
                    {teamData.teamName} - {teamData.dateRange.start} to {teamData.dateRange.end}
                  </div>
                </div>
                <Button
                  variant={isFinalized ? 'secondary' : 'outline-dark'}
                  disabled={isFinalized}
                  onClick={onFinalize}
                  className={dm}
                >
                  {isFinalized ? 'Finalized' : 'Done'}
                </Button>
              </div>
            </Card.Header>

            <Card.Body className={dm}>
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
                    type="button"
                    onClick={onClearSearch}
                    className={`${styles['pr-grading-screen-clear-btn']} ${dm}`}
                  >
                    ✕ Clear
                  </button>
                )}
              </div>

              <table className={`${styles['pr-grading-screen-table']} ${dm}`}>
                <thead>
                  <tr>
                    <th>Reviewer Name</th>
                    <th>PR reviewed</th>
                    <th>PRs Needed</th>
                    <th>PR Numbers</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReviewers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={`${styles['pr-grading-screen-no-results']} ${dm}`}>
                        No reviewers found
                      </td>
                    </tr>
                  ) : (
                    filteredReviewers.map(reviewer => (
                      <tr key={reviewer.id}>
                        <td>
                          <ReviewerCell
                            reviewer={reviewer}
                            promoted={promotedReviewerIds.has(reviewer.id)}
                            onPromoteClick={() => onPromoteClick(reviewer)}
                            darkMode={darkMode}
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            value={reviewer.gradedPrs.length}
                            readOnly
                            disabled={isFinalized}
                            className={`${styles['pr-grading-screen-pr-input']} ${dm}`}
                          />
                        </td>

                        <td>{reviewer.prsNeeded}</td>

                        <td className={styles['pr-grading-screen-td-numbers']}>
                          {reviewer.gradedPrs.map(pr => (
                            <span
                              key={pr.id}
                              role="button"
                              tabIndex={0}
                              className={`${styles['pr-grading-screen-pr-number']} ${
                                pr.prNumbers.includes('+') ? styles['pr-grading-screen-pair'] : ''
                              } ${dm}`}
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

                          {!isFinalized && activeInput !== reviewer.id && (
                            <Button
                              variant="success"
                              size="sm"
                              className={styles['pr-grading-screen-add-btn']}
                              onClick={() => onAddNewClick(reviewer.id)}
                            >
                              + Add new
                            </Button>
                          )}

                          {!isFinalized && activeInput === reviewer.id && (
                            <div className={styles['pr-grading-screen-input-container']}>
                              <input
                                type="text"
                                value={inputValue}
                                onChange={e => onInputValueChange(e.target.value)}
                                className={styles['pr-grading-screen-pr-number-input']}
                                placeholder="1070 or 1070 + 1256"
                              />
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => onInputSubmit(reviewer.id)}
                              >
                                Add
                              </Button>
                              <Button variant="secondary" size="sm" onClick={onCancelInput}>
                                Cancel
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {promotingReviewer && (
        <PromotionConfirmationBox
          reviewer={promotingReviewer}
          onConfirm={onConfirmPromotion}
          onCancel={onCancelPromotion}
          darkMode={darkMode}
        />
      )}

      {showGradingModal && gradingReviewer && (
        <div className={styles['pr-grading-screen-modal-overlay']}>
          <div className={`${styles['pr-grading-screen-modal-content']} ${dm}`}>
            <h3>Grade PRs for {gradingReviewer.name}</h3>
            <table className={`${styles['pr-grading-screen-table']} ${dm}`}>
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
                {gradingReviewer.gradedPrs.map(pr => (
                  <tr key={pr.id}>
                    <td>{pr.prNumbers}</td>
                    <td>
                      <input
                        type="checkbox"
                        disabled={isFinalized}
                        checked={pr.grade === 'Exceptional'}
                        onChange={() => onGradeChange(showGradingModal, pr.id, 'Exceptional')}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        disabled={isFinalized}
                        checked={pr.grade === 'Okay'}
                        onChange={() => onGradeChange(showGradingModal, pr.id, 'Okay')}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        disabled={isFinalized}
                        checked={pr.grade === 'Unsatisfactory'}
                        onChange={() => onGradeChange(showGradingModal, pr.id, 'Unsatisfactory')}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        disabled={isFinalized}
                        checked={pr.grade === 'Cannot find image'}
                        onChange={() => onGradeChange(showGradingModal, pr.id, 'Cannot find image')}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={`${styles['pr-grading-screen-modal-footer']} ${dm}`}>
              <Button variant="primary" onClick={onCloseGradingModal}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

PRGradingView.propTypes = {
  darkMode: PropTypes.bool,
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
  promotedReviewerIds: PropTypes.instanceOf(Set).isRequired,
  onPromoteClick: PropTypes.func.isRequired,
  activeInput: PropTypes.string,
  inputValue: PropTypes.string.isRequired,
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

PRGradingView.defaultProps = {
  darkMode: false,
  activeInput: null,
  promotingReviewer: null,
  showGradingModal: null,
  gradingReviewer: null,
};

export default PRGradingView;
