import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
  getWeeklyGrading,
  saveWeeklyGrading,
} from '../../actions/prAnalytics/weeklyGradingActions';
import styles from './PRGradingScreen.module.css';

const PRGradingScreen = ({ teamData, reviewers }) => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const token = useSelector(state => state.auth.token);
  const dispatch = useDispatch();

  const [reviewerData, setReviewerData] = useState(reviewers || []);
  const [activeInput, setActiveInput] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [showGradingModal, setShowGradingModal] = useState(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!teamData?.teamCode) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await dispatch(
          getWeeklyGrading(teamData.teamCode, teamData.dateRange?.start, token),
        );
        if (data && data.length > 0) {
          const mapped = data.map(entry => ({
            id: uuidv4(),
            reviewer: entry.reviewer,
            prsNeeded: entry.prsNeeded,
            prsReviewed: entry.prsReviewed,
            gradedPrs: (entry.gradedPrs || []).map(pr => ({ ...pr, id: uuidv4() })),
          }));
          setReviewerData(mapped);
        }
      } catch {
        // fallback to prop data
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamData?.teamCode]);

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

    const trimmed = inputValue.trim();
    const normalize = str => str.replace(/\s/g, '').toLowerCase();
    const reviewer = reviewerData.find(r => r.id === reviewerId);
    const isDuplicate = reviewer?.gradedPrs.some(
      pr => normalize(pr.prNumbers) === normalize(trimmed),
    );

    if (isDuplicate) {
      setInputError('This PR already exists for this reviewer.');
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

  /* ---------------- SAVE / FINALIZE ---------------- */

  const handleFinalize = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      const gradings = reviewerData.map(r => ({
        reviewer: r.reviewer,
        prsReviewed: r.gradedPrs.length,
        prsNeeded: r.prsNeeded,
        gradedPrs: r.gradedPrs.map(pr => ({ prNumbers: pr.prNumbers, grade: pr.grade })),
      }));

      await dispatch(
        saveWeeklyGrading(teamData.teamCode, teamData.dateRange?.start, gradings, token),
      );
      setIsFinalized(true);
      setSaveMessage('Grades saved successfully!');
    } catch {
      setSaveMessage('Error saving grades. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------------- RENDER ---------------- */

  if (isLoading) return <div className={styles['pr-grading-screen-container']}>Loading...</div>;

  return (
    <Container
      fluid
      className={`${styles['pr-grading-screen-container']} ${darkMode ? styles['dark-mode'] : ''}`}
    >
      <Row>
        <Col md={12}>
          <Card
            className={`${styles['pr-grading-screen-card']} ${darkMode ? styles['dark-mode'] : ''}`}
          >
            <Card.Header
              className={`${styles['pr-grading-screen-header']} ${
                darkMode ? styles['dark-mode'] : ''
              }`}
            >
              <div className={styles['pr-grading-screen-header-content']}>
                <div>
                  <h1
                    className={`${styles['pr-grading-screen-title']} ${
                      darkMode ? styles['dark-mode'] : ''
                    }`}
                  >
                    Weekly PR grading screen
                  </h1>
                  <div
                    className={`${styles['pr-grading-screen-team-info-badge']} ${
                      darkMode ? styles['dark-mode'] : ''
                    }`}
                  >
                    {teamData.teamName} - {teamData.dateRange.start} to {teamData.dateRange.end}
                  </div>
                </div>
                <div>
                  {saveMessage && (
                    <span className={styles['pr-grading-screen-save-message']}>{saveMessage}</span>
                  )}
                  <Button
                    variant={isFinalized ? 'secondary' : 'outline-dark'}
                    disabled={isFinalized || isSaving}
                    onClick={handleFinalize}
                    className={darkMode ? styles['dark-mode'] : ''}
                  >
                    {isSaving ? 'Saving...' : isFinalized ? 'Finalized' : 'Done'}
                  </Button>
                </div>
              </div>
            </Card.Header>

            <Card.Body className={darkMode ? styles['dark-mode'] : ''}>
              <table
                className={`${styles['pr-grading-screen-table']} ${
                  darkMode ? styles['dark-mode'] : ''
                }`}
              >
                <thead>
                  <tr>
                    <th>Reviewer Name</th>
                    <th>PR reviewed</th>
                    <th>PRs Needed</th>
                    <th>PR Numbers</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewerData.map(reviewer => (
                    <>
                      <tr key={reviewer.id}>
                        <td>{reviewer.reviewer}</td>
                        <td>
                          <input
                            type="number"
                            value={reviewer.gradedPrs.length}
                            readOnly
                            disabled={isFinalized}
                            className={`${styles['pr-grading-screen-pr-input']} ${
                              darkMode ? styles['dark-mode'] : ''
                            }`}
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

                          {reviewer.gradedPrs.length > 0 && (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className={styles['pr-grading-screen-add-btn']}
                              onClick={() => handlePRNumberClick(reviewer.id)}
                            >
                              Done
                            </Button>
                          )}
                        </td>
                      </tr>

                      {/* Inline summary row per reviewer */}
                      {reviewer.gradedPrs.length > 0 && (
                        <tr
                          key={`${reviewer.id}-summary`}
                          className={`${styles['pr-grading-screen-summary-row']} ${
                            darkMode ? styles['dark-mode'] : ''
                          }`}
                        >
                          <td colSpan={4} className={styles['pr-grading-screen-summary-cell']}>
                            <table
                              className={`${styles['pr-grading-screen-summary-table']} ${
                                darkMode ? styles['dark-mode'] : ''
                              }`}
                            >
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
                                {reviewer.gradedPrs.map(pr => (
                                  <tr key={pr.id}>
                                    <td>{pr.prNumbers}</td>
                                    {[
                                      'Exceptional',
                                      'Okay',
                                      'Unsatisfactory',
                                      'No Correct Image',
                                    ].map(grade => (
                                      <td key={grade}>
                                        <input
                                          type="checkbox"
                                          disabled={isFinalized}
                                          checked={pr.grade === grade}
                                          onChange={() =>
                                            handleGradeChange(reviewer.id, pr.id, grade)
                                          }
                                        />
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {showGradingModal && (
        <div
          className={`${styles['pr-grading-screen-modal-overlay']} ${
            darkMode ? styles['dark-mode'] : ''
          }`}
        >
          <div
            className={`${styles['pr-grading-screen-modal']} ${
              darkMode ? styles['dark-mode'] : ''
            }`}
          >
            <div
              className={`${styles['pr-grading-screen-modal-header']} ${
                darkMode ? styles['dark-mode'] : ''
              }`}
            >
              <h4>Grade PR</h4>
              <button
                className={styles['pr-grading-screen-modal-close']}
                onClick={handleCloseGradingModal}
              >
                ×
              </button>
            </div>
            <div
              className={`${styles['pr-grading-screen-modal-body']} ${
                darkMode ? styles['dark-mode'] : ''
              }`}
            >
              <table
                className={`${styles['pr-grading-screen-grading-table']} ${
                  darkMode ? styles['dark-mode'] : ''
                }`}
              >
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
              <div
                className={`${styles['pr-grading-screen-modal-footer']} ${
                  darkMode ? styles['dark-mode'] : ''
                }`}
              >
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
    teamCode: PropTypes.string,
    teamName: PropTypes.string,
    dateRange: PropTypes.shape({
      start: PropTypes.string,
      end: PropTypes.string,
    }),
  }).isRequired,
  reviewers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      reviewer: PropTypes.string,
      prsNeeded: PropTypes.number,
      prsReviewed: PropTypes.number,
      gradedPrs: PropTypes.array,
    }),
  ).isRequired,
};

export default PRGradingScreen;
