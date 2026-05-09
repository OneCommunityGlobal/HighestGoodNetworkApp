import axios from 'axios';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import styles from './PRGradingScreen.module.css';
import PromotionConfirmationBox from './PromotionConfirmationBox';

const PRGradingScreen = ({ teamData, reviewers }) => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [reviewerData, setReviewerData] = useState(reviewers || []);
  const [activeInput, setActiveInput] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [showGradingModal, setShowGradingModal] = useState(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [promotionCandidate, setPromotionCandidate] = useState(null);
  const [confirmedPromotions, setConfirmedPromotions] = useState(() => {
    try {
      const stored = localStorage.getItem(`promotedReviewers_${teamData?.teamName}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [selectedForPromotion, setSelectedForPromotion] = useState([]);
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);

  /* ---------------- SEARCH FILTER ---------------- */

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

  /* ---------------- VALIDATION ---------------- */

  const validatePRNumber = value => {
    const trimmed = value.trim();
    const pattern = /^\d+(\s*\+\s*\d+)?$/;
    if (!trimmed) return { isValid: false, error: 'PR number cannot be empty' };
    if (!pattern.test(trimmed)) return { isValid: false, error: 'Format: 1070 or 1070 + 1256' };
    return { isValid: true, error: '' };
  };

  /* ---------------- ADD PR ---------------- */

  const handleAddNewClick = reviewerId => {
    if (isFinalized) return;
    setActiveInput(reviewerId);
    setInputValue('');
    setInputError('');
  };

  const handleInputSubmit = reviewerId => {
    if (isFinalized) return;
    const validation = validatePRNumber(inputValue);
    if (!validation.isValid) {
      setInputError(validation.error);
      return;
    }
    const newPREntry = { id: uuidv4(), prNumbers: inputValue.trim(), grade: 'Okay' };
    setReviewerData(prev =>
      prev.map(r =>
        r.id === reviewerId
          ? { ...r, gradedPrs: [...r.gradedPrs, newPREntry], prsReviewed: r.gradedPrs.length + 1 }
          : r,
      ),
    );
    setActiveInput(null);
    setInputValue('');
    setInputError('');
  };

  const handleCancel = () => {
    if (isFinalized) return;
    setActiveInput(null);
    setInputValue('');
    setInputError('');
  };

  /* ---------------- MODAL ---------------- */

  const handlePRNumberClick = reviewerId => {
    if (isFinalized) return;
    setShowGradingModal(reviewerId);
  };

  const handleGradeChange = (reviewerId, prId, newGrade) => {
    if (isFinalized) return;
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

  const handleFinalize = () => setIsFinalized(true);

  /* ---------------- PROMOTION ---------------- */

  const handlePromoteClick = async reviewer => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_APIENDPOINT}/promotion-details/${reviewer.id}`,
      );
      setPromotionCandidate({
        reviewerId: reviewer.id,
        reviewerName: response.data.reviewerName || reviewer.reviewer,
        teamCode: response.data.teamCode || teamData.teamName,
        teamReviewerName: response.data.teamReviewerName || reviewer.reviewer,
        weeklyPRs:
          response.data.weeklyPRs && response.data.weeklyPRs.length > 0
            ? response.data.weeklyPRs
            : [{ week: teamData.dateRange.start, count: reviewer.gradedPrs.length }],
      });
    } catch (error) {
      setPromotionCandidate({
        reviewerId: reviewer.id,
        reviewerName: reviewer.reviewer,
        teamCode: teamData.teamName,
        teamReviewerName: reviewer.reviewer,
        weeklyPRs: [{ week: teamData.dateRange.start, count: reviewer.gradedPrs.length }],
      });
    }
  };

  const handleConfirmPromotion = async (reviewerName, reviewerId) => {
    try {
      if (reviewerId) {
        await axios.post(`${process.env.REACT_APP_APIENDPOINT}/promote-members`, {
          memberIds: [reviewerId],
        });
      }
    } catch (error) {
      // silently continue
    }
    setConfirmedPromotions(prev => {
      const updated = [...prev, reviewerName];
      localStorage.setItem(`promotedReviewers_${teamData?.teamName}`, JSON.stringify(updated));
      return updated;
    });
    setPromotionCandidate(null);
  };

  const handleCancelPromotion = () => setPromotionCandidate(null);

  /* ---------------- BATCH PROMOTION ---------------- */

  const handleCheckboxChange = reviewerId => {
    setSelectedForPromotion(prev =>
      prev.includes(reviewerId) ? prev.filter(id => id !== reviewerId) : [...prev, reviewerId],
    );
  };

  const handleBatchConfirm = async () => {
    try {
      if (selectedForPromotion.length > 0) {
        await axios.post(`${process.env.REACT_APP_APIENDPOINT}/promote-members`, {
          memberIds: selectedForPromotion,
        });
      }
    } catch (error) {
      // silently continue
    }
    const selectedNames = reviewerData
      .filter(r => selectedForPromotion.includes(r.id))
      .map(r => r.reviewer);
    setConfirmedPromotions(prev => {
      const updated = [...prev, ...selectedNames];
      localStorage.setItem(`promotedReviewers_${teamData?.teamName}`, JSON.stringify(updated));
      return updated;
    });
    setSelectedForPromotion([]);
    setShowBatchConfirm(false);
  };

  const handleBatchCancel = () => setShowBatchConfirm(false);

  /* ---------------- RENDER ---------------- */

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
                  onClick={handleFinalize}
                  className={dm}
                >
                  {isFinalized ? 'Finalized' : 'Done'}
                </Button>
              </div>
            </Card.Header>

            <Card.Body className={dm}>
              {/* Search Bar */}
              <div className={`${styles['pr-grading-screen-search-bar']} ${dm}`}>
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
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span>{reviewer.reviewer}</span>
                            {!confirmedPromotions.includes(reviewer.reviewer) ? (
                              <>
                                <input
                                  type="checkbox"
                                  title="Select for batch promotion"
                                  checked={selectedForPromotion.includes(reviewer.id)}
                                  onChange={() => handleCheckboxChange(reviewer.id)}
                                  style={{
                                    marginTop: '4px',
                                    cursor: 'pointer',
                                    width: '16px',
                                    height: '16px',
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handlePromoteClick(reviewer)}
                                  style={{
                                    fontSize: '0.75rem',
                                    padding: '3px 10px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    background: '#ffc107',
                                    color: '#333',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                  }}
                                >
                                  🏆 Promote
                                </button>
                              </>
                            ) : (
                              <span
                                style={{ fontSize: '0.75rem', color: '#28a745', fontWeight: '600' }}
                              >
                                ✅ Promoted
                              </span>
                            )}
                          </div>
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
                          ))}

                          {!isFinalized && activeInput !== reviewer.id && (
                            <Button
                              variant="success"
                              size="sm"
                              className={styles['pr-grading-screen-add-btn']}
                              onClick={() => handleAddNewClick(reviewer.id)}
                            >
                              + Add new
                            </Button>
                          )}

                          {!isFinalized && activeInput === reviewer.id && (
                            <div className={styles['pr-grading-screen-input-container']}>
                              <input
                                type="text"
                                value={inputValue}
                                onChange={e => {
                                  setInputValue(e.target.value);
                                  setInputError('');
                                }}
                                className={`${styles['pr-grading-screen-pr-number-input']} ${
                                  inputError ? styles['pr-grading-screen-input-error'] : ''
                                } ${dm}`}
                                placeholder="1070 or 1070 + 1256"
                              />
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleInputSubmit(reviewer.id)}
                              >
                                Add
                              </Button>
                              <Button variant="secondary" size="sm" onClick={handleCancel}>
                                Cancel
                              </Button>
                              {inputError && (
                                <div
                                  className={`${styles['pr-grading-screen-error-message']} ${dm}`}
                                >
                                  {inputError}
                                </div>
                              )}
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
                    <th>Cannot find image</th>
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
                            disabled={isFinalized}
                            checked={pr.grade === 'Exceptional'}
                            onChange={() =>
                              handleGradeChange(showGradingModal, pr.id, 'Exceptional')
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            disabled={isFinalized}
                            checked={pr.grade === 'Okay'}
                            onChange={() => handleGradeChange(showGradingModal, pr.id, 'Okay')}
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            disabled={isFinalized}
                            checked={pr.grade === 'Unsatisfactory'}
                            onChange={() =>
                              handleGradeChange(showGradingModal, pr.id, 'Unsatisfactory')
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            disabled={isFinalized}
                            checked={pr.grade === 'Cannot find image'}
                            onChange={() =>
                              handleGradeChange(showGradingModal, pr.id, 'Cannot find image')
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

      {selectedForPromotion.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '24px',
            zIndex: 999,
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            background: darkMode ? '#2d4059' : '#fff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            border: `1px solid ${darkMode ? '#4a5a77' : '#dee2e6'}`,
          }}
        >
          <span style={{ color: darkMode ? '#fff' : '#333', fontWeight: '600' }}>
            {selectedForPromotion.length} selected
          </span>
          <button
            type="button"
            onClick={() => setShowBatchConfirm(true)}
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
            🏆 Promote Selected
          </button>
          <button
            type="button"
            onClick={() => setSelectedForPromotion([])}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: `1px solid ${darkMode ? '#5a6b88' : '#dee2e6'}`,
              background: 'transparent',
              color: darkMode ? '#fff' : '#333',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
      )}

      {showBatchConfirm && (
        <div className={`${styles['pr-grading-screen-modal-overlay']} ${dm}`}>
          <div className={`${styles['pr-grading-screen-modal']} ${dm}`}>
            <div className={`${styles['pr-grading-screen-modal-header']} ${dm}`}>
              <h4 style={{ margin: 0, color: darkMode ? '#fff' : '#333' }}>
                🏆 Confirm Batch Promotion
              </h4>
              <button
                type="button"
                className={styles['pr-grading-screen-modal-close']}
                onClick={handleBatchCancel}
              >
                ×
              </button>
            </div>
            <div className={`${styles['pr-grading-screen-modal-body']} ${dm}`}>
              <p style={{ color: darkMode ? '#fff' : '#333', marginBottom: '12px' }}>
                You are about to promote <strong>{selectedForPromotion.length}</strong> reviewer(s):
              </p>
              <ul style={{ color: darkMode ? '#fff' : '#333', marginBottom: '16px' }}>
                {reviewerData
                  .filter(r => selectedForPromotion.includes(r.id))
                  .map(r => (
                    <li key={r.id}>{r.reviewer}</li>
                  ))}
              </ul>
              <p
                style={{
                  color: darkMode ? '#fff' : '#333',
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                Are you sure you want to promote all selected reviewers?
              </p>
            </div>
            <div
              className={`${styles['pr-grading-screen-modal-footer']} ${dm}`}
              style={{ gap: '12px' }}
            >
              <button
                type="button"
                onClick={handleBatchCancel}
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
                onClick={handleBatchConfirm}
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
                ✅ Confirm All
              </button>
            </div>
          </div>
        </div>
      )}

      {promotionCandidate && (
        <PromotionConfirmationBox
          reviewer={promotionCandidate}
          onConfirm={handleConfirmPromotion}
          onCancel={handleCancelPromotion}
          darkMode={darkMode}
        />
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
};

export default PRGradingScreen;
