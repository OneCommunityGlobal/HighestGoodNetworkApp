import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import styles from './PRGradingScreen.module.css';

const PRGradingScreen = ({
  teamData,
  reviewers,
  teamOptions = [],
  selectedTeamName = '',
  weekOptions = [],
  selectedWeek = '',
  onTeamChange,
  onWeekChange,
  onSave,
  onRemoveReviewer,
  saveStatus,
  onDismissSaveStatus,
  isEmpty,
  emptyMessage,
}) => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [reviewerData, setReviewerData] = useState(reviewers || []);

  // Sync local state when the reviewers prop changes (e.g. after save re-fetch)
  useEffect(() => {
    setReviewerData(reviewers || []);
  }, [reviewers]);
  const [activeInput, setActiveInput] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [showGradingModal, setShowGradingModal] = useState(null);
  const [saving, setSaving] = useState(false);

  // Confirmation dialog state
  // type: 'save' | 'delete' | null
  const [confirmDialog, setConfirmDialog] = useState({ type: null, payload: null });
  const [showAddReviewer, setShowAddReviewer] = useState(false);
  const [newReviewerName, setNewReviewerName] = useState('');
  const [addReviewerError, setAddReviewerError] = useState('');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const availableRoles = useMemo(() => {
    const roles = reviewerData.map(r => r.role).filter(Boolean);
    return [...new Set(roles)];
  }, [reviewerData]);

  const filteredReviewers = useMemo(() => {
    return reviewerData.filter(r => {
      const nameMatch = r.reviewer.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = roleFilter ? r.role === roleFilter : true;
      return nameMatch && roleMatch;
    });
  }, [reviewerData, searchTerm, roleFilter]);

  const handleClearSearch = () => {
    setSearchTerm('');
    setRoleFilter('');
  };

  if (!teamData || !reviewers) {
    return <div>Error: Missing required props</div>;
  }

  const dm = darkMode ? styles['dark-mode'] : '';

  /* ---------------- VALIDATION ---------------- */

  const validatePRNumber = value => {
    const trimmed = value.trim();
    const pattern = /^\d+(\s*\+\s*\d+)?$/;
    if (!trimmed) return { isValid: false, error: 'PR number cannot be empty' };
    if (!pattern.test(trimmed)) return { isValid: false, error: 'Format: 1070 or 1070 + 1256' };
    return { isValid: true, error: '' };
  };

  /* ---------------- PRs NEEDED ---------------- */

  const handlePrsNeededChange = (reviewerId, value) => {
    // Allow empty string so the field can be fully cleared while typing
    if (value !== '' && (Number.isNaN(Number(value)) || Number(value) < 0)) return;
    setReviewerData(prev =>
      prev.map(r =>
        r.id === reviewerId ? { ...r, prsNeeded: value === '' ? '' : Number(value) } : r,
      ),
    );
  };

  /* ---------------- ADD PR ---------------- */

  const handleAddNewClick = reviewerId => {
    setActiveInput(reviewerId);
    setInputValue('');
    setInputError('');
  };

  const handleInputSubmit = reviewerId => {
    const validation = validatePRNumber(inputValue);
    if (!validation.isValid) {
      setInputError(validation.error);
      return;
    }
    const newPREntry = { id: uuidv4(), prNumbers: inputValue.trim(), grade: 'Okay' };
    setReviewerData(prev =>
      prev.map(r => (r.id === reviewerId ? { ...r, gradedPrs: [...r.gradedPrs, newPREntry] } : r)),
    );
    setActiveInput(null);
    setInputValue('');
    setInputError('');
  };

  const handleCancelInput = () => {
    setActiveInput(null);
    setInputValue('');
    setInputError('');
  };

  /* ---------------- REMOVE PR ---------------- */

  const handleRemovePR = (reviewerId, prId) => {
    setReviewerData(prev =>
      prev.map(r =>
        r.id === reviewerId ? { ...r, gradedPrs: r.gradedPrs.filter(pr => pr.id !== prId) } : r,
      ),
    );
  };

  /* ---------------- ADD REVIEWER ---------------- */

  const handleAddReviewer = () => {
    const name = newReviewerName.trim();
    if (!name) {
      setAddReviewerError('Reviewer name cannot be empty');
      return;
    }
    if (reviewerData.some(r => r.reviewer.toLowerCase() === name.toLowerCase())) {
      setAddReviewerError('Reviewer already exists');
      return;
    }
    const newReviewer = {
      id: uuidv4(),
      reviewer: name,
      prsNeeded: 10,
      prsReviewed: 0,
      gradedPrs: [],
    };
    setReviewerData(prev => [...prev, newReviewer]);
    setNewReviewerName('');
    setAddReviewerError('');
    setShowAddReviewer(false);
  };

  /* ---------------- REMOVE REVIEWER ---------------- */

  const handleRemoveReviewerClick = reviewerName => {
    setConfirmDialog({ type: 'delete', payload: reviewerName });
  };

  const handleRemoveReviewerConfirmed = async () => {
    const reviewerName = confirmDialog.payload;
    setConfirmDialog({ type: null, payload: null });
    setReviewerData(prev => prev.filter(r => r.reviewer !== reviewerName));
    if (onRemoveReviewer) {
      await onRemoveReviewer(reviewerName);
    }
  };

  const handleConfirmCancel = () => {
    setConfirmDialog({ type: null, payload: null });
  };

  /* ---------------- MODAL ---------------- */

  const handlePRNumberClick = reviewerId => {
    setShowGradingModal(reviewerId);
  };

  const handleGradeChange = (reviewerId, prId, newGrade) => {
    setReviewerData(prev =>
      prev.map(r =>
        r.id === reviewerId
          ? {
              ...r,
              gradedPrs: r.gradedPrs.map(pr => (pr.id === prId ? { ...pr, grade: newGrade } : pr)),
            }
          : r,
      ),
    );
  };

  const handleCloseGradingModal = () => setShowGradingModal(null);

  /* ---------------- SAVE ---------------- */

  const handleSaveClick = () => {
    setConfirmDialog({ type: 'save', payload: null });
  };

  const handleSaveConfirmed = async () => {
    setConfirmDialog({ type: null, payload: null });
    setSaving(true);
    if (onSave) {
      await onSave(reviewerData);
    }
    setSaving(false);
  };

  /* ---------------- SHARED HEADER CONTROLS ---------------- */

  const renderHeaderControls = () => (
    <div>
      <h1 className={`${styles['pr-grading-screen-title']} ${dm}`}>Weekly PR grading screen</h1>

      {/* Team + Week selectors row */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        {teamOptions.length > 0 && (
          <div className={`${styles['pr-grading-screen-team-selector']} ${dm}`}>
            <label
              htmlFor="team-selector"
              className={`${styles['pr-grading-screen-team-selector-label']} ${dm}`}
            >
              Team
            </label>
            <select
              id="team-selector"
              value={selectedTeamName}
              onChange={e => onTeamChange?.(e.target.value)}
              className={`${styles['pr-grading-screen-team-select']} ${dm}`}
            >
              {teamOptions.map(team => (
                <option key={team._id ?? team.teamName} value={team.teamName}>
                  {team.teamName}
                </option>
              ))}
            </select>
          </div>
        )}

        {weekOptions.length > 0 && (
          <div className={`${styles['pr-grading-screen-team-selector']} ${dm}`}>
            <label
              htmlFor="week-selector"
              className={`${styles['pr-grading-screen-team-selector-label']} ${dm}`}
            >
              Week
            </label>
            <select
              id="week-selector"
              value={selectedWeek}
              onChange={e => onWeekChange?.(e.target.value)}
              className={`${styles['pr-grading-screen-team-select']} ${dm}`}
            >
              {weekOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className={`${styles['pr-grading-screen-team-info-badge']} ${dm}`}>
        {teamData.teamName} — {teamData.dateRange.start} to {teamData.dateRange.end}
      </div>
    </div>
  );

  /* ---------------- EMPTY STATE ---------------- */

  if (isEmpty || emptyMessage) {
    return (
      <Container fluid className={`${styles['pr-grading-screen-container']} ${dm}`}>
        <Row>
          <Col md={12}>
            <Card className={`${styles['pr-grading-screen-card']} ${dm}`}>
              <Card.Header className={`${styles['pr-grading-screen-header']} ${dm}`}>
                <div className={styles['pr-grading-screen-header-content']}>
                  {renderHeaderControls()}
                </div>
              </Card.Header>
              <Card.Body className={dm}>
                <div
                  className={`${styles['pr-grading-screen-no-results']} ${dm}`}
                  style={{ padding: '40px' }}
                >
                  {emptyMessage ?? 'No grading data for this team yet.'}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  /* ---------------- MAIN RENDER ---------------- */

  return (
    <Container fluid className={`${styles['pr-grading-screen-container']} ${dm}`}>
      <Row>
        <Col md={12}>
          <Card className={`${styles['pr-grading-screen-card']} ${dm}`}>
            <Card.Header className={`${styles['pr-grading-screen-header']} ${dm}`}>
              <div className={styles['pr-grading-screen-header-content']}>
                {renderHeaderControls()}
                <Button
                  variant="primary"
                  disabled={saving}
                  onClick={handleSaveClick}
                  className={dm}
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </Card.Header>

            {/* Save status banner */}
            {saveStatus === 'success' && (
              <div
                className={`${styles['pr-grading-screen-save-banner']} ${styles['pr-grading-screen-save-banner--success']} ${dm}`}
              >
                <span>Grading data saved successfully.</span>
                <button
                  type="button"
                  onClick={onDismissSaveStatus}
                  className={styles['pr-grading-screen-save-banner-close']}
                >
                  ×
                </button>
              </div>
            )}
            {saveStatus === 'error' && (
              <div
                className={`${styles['pr-grading-screen-save-banner']} ${styles['pr-grading-screen-save-banner--error']} ${dm}`}
              >
                <span>Failed to save grading data. Please try again.</span>
                <button
                  type="button"
                  onClick={onDismissSaveStatus}
                  className={styles['pr-grading-screen-save-banner-close']}
                >
                  ×
                </button>
              </div>
            )}

            <Card.Body className={dm}>
              {/* Search bar + Add reviewer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div
                  className={`${styles['pr-grading-screen-search-bar']} ${dm}`}
                  style={{ margin: 0, flex: 1 }}
                >
                  <input
                    type="text"
                    placeholder="Search reviewers by name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className={`${styles['pr-grading-screen-search-input']} ${dm}`}
                  />
                  {availableRoles.length > 0 && (
                    <select
                      value={roleFilter}
                      onChange={e => setRoleFilter(e.target.value)}
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
                      onClick={handleClearSearch}
                      className={`${styles['pr-grading-screen-clear-btn']} ${dm}`}
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>

                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowAddReviewer(v => !v)}
                >
                  {showAddReviewer ? 'Cancel' : '+ Add Reviewer'}
                </Button>
              </div>

              {/* Add reviewer inline form */}
              {showAddReviewer && (
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <input
                    type="text"
                    placeholder="Reviewer name"
                    value={newReviewerName}
                    onChange={e => {
                      setNewReviewerName(e.target.value);
                      setAddReviewerError('');
                    }}
                    className={`${styles['pr-grading-screen-pr-number-input']} ${dm}`}
                    style={{ minWidth: '200px' }}
                  />
                  <Button variant="success" size="sm" onClick={handleAddReviewer}>
                    Add
                  </Button>
                  {addReviewerError && (
                    <span style={{ color: '#dc3545', fontSize: '0.85rem' }}>
                      {addReviewerError}
                    </span>
                  )}
                </div>
              )}

              <table className={`${styles['pr-grading-screen-table']} ${dm}`}>
                <thead>
                  <tr>
                    <th>Reviewer Name</th>
                    <th>PRs Reviewed</th>
                    <th>PRs Needed</th>
                    <th>PR Numbers</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviewers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className={`${styles['pr-grading-screen-no-results']} ${dm}`}>
                        No reviewers found
                      </td>
                    </tr>
                  ) : (
                    filteredReviewers.map(reviewer => (
                      <tr key={reviewer.id}>
                        <td>{reviewer.reviewer}</td>

                        <td>
                          <input
                            type="number"
                            value={reviewer.gradedPrs.length}
                            readOnly
                            className={`${styles['pr-grading-screen-pr-input']} ${dm}`}
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            min={0}
                            value={reviewer.prsNeeded}
                            onChange={e => handlePrsNeededChange(reviewer.id, e.target.value)}
                            className={`${styles['pr-grading-screen-pr-input']} ${dm}`}
                          />
                        </td>

                        <td className={styles['pr-grading-screen-td-numbers']}>
                          {reviewer.gradedPrs.map(pr => (
                            <span
                              key={pr.id}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                margin: '2px',
                              }}
                            >
                              <span
                                role="button"
                                tabIndex={0}
                                className={`${styles['pr-grading-screen-pr-number']} ${
                                  pr.prNumbers.includes('+') ? styles['pr-grading-screen-pair'] : ''
                                } ${dm}`}
                                onClick={() => handlePRNumberClick(reviewer.id)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handlePRNumberClick(reviewer.id);
                                  }
                                }}
                              >
                                {pr.prNumbers}
                              </span>
                              <button
                                type="button"
                                aria-label={`Remove PR ${pr.prNumbers}`}
                                onClick={() => handleRemovePR(reviewer.id, pr.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#dc3545',
                                  fontWeight: 'bold',
                                  fontSize: '0.8rem',
                                  padding: '0 2px',
                                  lineHeight: 1,
                                }}
                              >
                                ×
                              </button>
                            </span>
                          ))}

                          {activeInput !== reviewer.id && (
                            <Button
                              variant="success"
                              size="sm"
                              className={styles['pr-grading-screen-add-btn']}
                              onClick={() => handleAddNewClick(reviewer.id)}
                            >
                              + Add new
                            </Button>
                          )}

                          {activeInput === reviewer.id && (
                            <div className={styles['pr-grading-screen-input-container']}>
                              <input
                                type="text"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                className={`${styles['pr-grading-screen-pr-number-input']} ${dm}`}
                                placeholder="1070 or 1070 + 1256"
                              />
                              {inputError && (
                                <span
                                  style={{
                                    color: '#dc3545',
                                    fontSize: '0.75rem',
                                    display: 'block',
                                  }}
                                >
                                  {inputError}
                                </span>
                              )}
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleInputSubmit(reviewer.id)}
                              >
                                Add
                              </Button>
                              <Button variant="secondary" size="sm" onClick={handleCancelInput}>
                                Cancel
                              </Button>
                            </div>
                          )}
                        </td>

                        {/* Remove reviewer */}
                        <td>
                          <button
                            type="button"
                            aria-label={`Remove reviewer ${reviewer.reviewer}`}
                            onClick={() => handleRemoveReviewerClick(reviewer.reviewer)}
                            style={{
                              background: 'none',
                              border: '1px solid #dc3545',
                              borderRadius: '4px',
                              color: '#dc3545',
                              cursor: 'pointer',
                              padding: '2px 8px',
                              fontSize: '0.8rem',
                            }}
                          >
                            Remove
                          </button>
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

      {/* Grading modal */}
      {showGradingModal && (
        <div className={`${styles['pr-grading-screen-modal-overlay']} ${dm}`}>
          <div className={`${styles['pr-grading-screen-modal']} ${dm}`}>
            <div className={`${styles['pr-grading-screen-modal-header']} ${dm}`}>
              <h4>Grade PR</h4>
              <button
                className={styles['pr-grading-screen-modal-close']}
                onClick={handleCloseGradingModal}
              >
                ×
              </button>
            </div>
            <div className={`${styles['pr-grading-screen-modal-body']} ${dm}`}>
              <table className={`${styles['pr-grading-screen-grading-table']} ${dm}`}>
                <thead>
                  <tr>
                    <th>PR Number</th>
                    <th>Exceptional</th>
                    <th>Okay</th>
                    <th>Unsatisfactory</th>
                    <th>No Correct Image</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewerData
                    .find(r => r.id === showGradingModal)
                    ?.gradedPrs.map(pr => (
                      <tr key={pr.id}>
                        <td>{pr.prNumbers}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={pr.grade === 'Exceptional'}
                            onChange={() =>
                              handleGradeChange(showGradingModal, pr.id, 'Exceptional')
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            checked={pr.grade === 'Okay'}
                            onChange={() => handleGradeChange(showGradingModal, pr.id, 'Okay')}
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            checked={pr.grade === 'Unsatisfactory'}
                            onChange={() =>
                              handleGradeChange(showGradingModal, pr.id, 'Unsatisfactory')
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            checked={pr.grade === 'No Correct Image'}
                            onChange={() =>
                              handleGradeChange(showGradingModal, pr.id, 'No Correct Image')
                            }
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <div className={`${styles['pr-grading-screen-modal-footer']} ${dm}`}>
                <Button variant="primary" onClick={handleCloseGradingModal}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation dialog */}
      {confirmDialog.type && (
        <div className={`${styles['pr-grading-screen-modal-overlay']} ${dm}`}>
          <div
            className={`${styles['pr-grading-screen-modal']} ${dm}`}
            style={{ maxWidth: '420px' }}
          >
            <div className={`${styles['pr-grading-screen-modal-header']} ${dm}`}>
              <h4>{confirmDialog.type === 'save' ? 'Confirm Save' : 'Confirm Delete'}</h4>
            </div>
            <div className={`${styles['pr-grading-screen-modal-body']} ${dm}`}>
              <p style={{ margin: '0 0 20px', fontSize: '0.95rem' }}>
                {confirmDialog.type === 'save'
                  ? 'Are you sure you want to save the current grading data?'
                  : `Are you sure you want to delete reviewer "${confirmDialog.payload}"? This cannot be undone.`}
              </p>
              <div className={`${styles['pr-grading-screen-modal-footer']} ${dm}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleConfirmCancel}
                  style={{ marginRight: '8px' }}
                >
                  Cancel
                </Button>
                <Button
                  variant={confirmDialog.type === 'save' ? 'primary' : 'danger'}
                  size="sm"
                  onClick={
                    confirmDialog.type === 'save'
                      ? handleSaveConfirmed
                      : handleRemoveReviewerConfirmed
                  }
                >
                  {confirmDialog.type === 'save' ? 'Save' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

PRGradingScreen.propTypes = {
  teamData: PropTypes.shape({
    teamName: PropTypes.string.isRequired,
    dateRange: PropTypes.shape({
      start: PropTypes.string.isRequired,
      end: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  reviewers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      reviewer: PropTypes.string.isRequired,
      role: PropTypes.string,
      prsNeeded: PropTypes.number,
      gradedPrs: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          prNumbers: PropTypes.string.isRequired,
          grade: PropTypes.string.isRequired,
        }),
      ).isRequired,
    }),
  ).isRequired,
  teamOptions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      teamName: PropTypes.string.isRequired,
    }),
  ),
  selectedTeamName: PropTypes.string,
  weekOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ),
  selectedWeek: PropTypes.string,
  onTeamChange: PropTypes.func,
  onWeekChange: PropTypes.func,
  onSave: PropTypes.func,
  onRemoveReviewer: PropTypes.func,
  saveStatus: PropTypes.oneOf(['success', 'error', null]),
  onDismissSaveStatus: PropTypes.func,
  isEmpty: PropTypes.bool,
  emptyMessage: PropTypes.string,
};

export default PRGradingScreen;
