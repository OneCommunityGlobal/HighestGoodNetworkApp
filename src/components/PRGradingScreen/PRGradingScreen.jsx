import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import styles from './PRGradingScreen.module.css';

const PRGradingScreen = ({ teamData, reviewers }) => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [reviewerData, setReviewerData] = useState(reviewers || []);
  const [activeInput, setActiveInput] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [showGradingModal, setShowGradingModal] = useState(null);
  const [isFinalized, setIsFinalized] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

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

  const isBackendFrontendPair = value => value.includes('+');

  /* ---------------- EXPORT CSV ---------------- */

  const handleExportCSV = () => {
    if (!reviewerData || reviewerData.length === 0) return;

    const headers = [
      'Reviewer Name',
      'PRs Reviewed',
      'PRs Needed',
      'PR Numbers',
      'Grades',
      'Notes',
    ];

    const rows = filteredReviewers.map(reviewer => {
      const prNumbers = reviewer.gradedPrs.map(pr => pr.prNumbers).join(' | ');
      const grades = reviewer.gradedPrs.map(pr => pr.grade).join(' | ');

      return [
        `"${reviewer.reviewer}"`,
        reviewer.gradedPrs.length,
        reviewer.prsNeeded,
        `"${prNumbers}"`,
        `"${grades}"`,
        reviewer.role ? `"${reviewer.role}"` : '',
      ];
    });

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;

    const start = teamData.dateRange.start.replace(/\//g, '-');
    const end = teamData.dateRange.end.replace(/\//g, '-');

    link.setAttribute('download', `weekly-pr-grading-${start}-to-${end}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    const trimmed = inputValue.trim();
    // Duplicate check
    const reviewer = reviewerData.find(r => r.id === reviewerId);
    const isDuplicate = reviewer?.gradedPrs.some(
      pr => pr.prNumbers.replace(/\s/g, '') === trimmed.replace(/\s/g, ''),
    );
    if (isDuplicate) {
      setInputError(
        'This PR already exists for this reviewer. Please enter a different PR number.',
      );
      return;
    }
    const newPREntry = { id: uuidv4(), prNumbers: trimmed, grade: 'Okay' };
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
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button
                    variant="outline-primary"
                    onClick={handleExportCSV}
                    className={darkMode ? styles['dark-mode'] : ''}
                  >
                    Export to CSV
                  </Button>

                  <Button
                    variant={isFinalized ? 'secondary' : 'outline-dark'}
                    disabled={isFinalized}
                    onClick={handleFinalize}
                    className={darkMode ? styles['dark-mode'] : ''}
                  >
                    {isFinalized ? 'Finalized' : 'Done'}
                  </Button>
                </div>
              </div>
            </Card.Header>

            <Card.Body className={dm}>
              {/* ── Search Bar ── */}
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
                        <td>{reviewer.reviewer}</td>

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
                              } ${darkMode ? styles['dark-mode'] : ''}`}
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
                                } ${darkMode ? styles['dark-mode'] : ''}`}
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
                                  className={`${styles['pr-grading-screen-error-message']} ${
                                    darkMode ? styles['dark-mode'] : ''
                                  }`}
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
