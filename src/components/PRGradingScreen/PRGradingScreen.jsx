import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
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
  const [isFinalized, setIsFinalized] = useState(false); // ✅ FREEZE STATE

  if (!teamData || !reviewers) {
    return <div>Error: Missing required props</div>;
  }

  /* ---------------- VALIDATION ---------------- */

  const validatePRNumber = value => {
    const trimmed = value.trim();
    const pattern = /^\d+(\s*\+\s*\d+)?$/;

    if (!trimmed) {
      return { isValid: false, error: 'PR number cannot be empty' };
    }

    if (!pattern.test(trimmed)) {
      return { isValid: false, error: 'Format: 1070 or 1070 + 1256' };
    }

    return { isValid: true, error: '' };
  };

  const isBackendFrontendPair = value => value.includes('+');

  /* ---------------- ADD PR ---------------- */

  const handleAddNewClick = reviewerId => {
    if (isFinalized) return; // 🔒 prevent action
    setActiveInput(reviewerId);
    setInputValue('');
    setInputError('');
  };

  const handleInputSubmit = reviewerId => {
    if (isFinalized) return; // 🔒 prevent action

    const validation = validatePRNumber(inputValue);
    if (!validation.isValid) {
      setInputError(validation.error);
      return;
    }

    const newPREntry = {
      id: uuidv4(),
      prNumbers: inputValue.trim(),
      grade: 'Okay',
    };

    setReviewerData(prev =>
      prev.map(r =>
        r.id === reviewerId
          ? {
              ...r,
              gradedPrs: [...r.gradedPrs, newPREntry],
              prsReviewed: r.gradedPrs.length + 1,
            }
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
    if (isFinalized) return; // 🔒 prevent modal open
    setShowGradingModal(reviewerId);
  };

  const handleGradeChange = (reviewerId, prId, newGrade) => {
    if (isFinalized) return; // 🔒 prevent grade change

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

  const handleCloseGradingModal = () => {
    setShowGradingModal(null);
  };

  const handleFinalize = () => {
    setIsFinalized(true); // 🔒 Freeze everything
  };

  /* ---------------- RENDER ---------------- */

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

                <Button
                  variant={isFinalized ? 'secondary' : 'outline-dark'}
                  disabled={isFinalized}
                  onClick={handleFinalize}
                  className={darkMode ? styles['dark-mode'] : ''}
                >
                  {isFinalized ? 'Finalized' : 'Done'}
                </Button>
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
                              onChange={e => setInputValue(e.target.value)}
                              className={styles['pr-grading-screen-pr-number-input']}
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
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {showGradingModal && (
        <div className={styles['pr-grading-screen-modal-overlay']}>
          <div className={styles['pr-grading-screen-modal']}>
            <div className={styles['pr-grading-screen-modal-header']}>
              <h4>Grade PR</h4>
              <button onClick={handleCloseGradingModal}>×</button>
            </div>

            <div className={styles['pr-grading-screen-modal-body']}>
              <table className={styles['pr-grading-screen-grading-table']}>
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

              <div className={styles['pr-grading-screen-modal-footer']}>
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

export default PRGradingScreen;
