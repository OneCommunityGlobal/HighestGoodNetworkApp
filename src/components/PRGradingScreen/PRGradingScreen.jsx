import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import './PRGradingScreen.css';

const PRGradingScreen = ({ teamData, reviewers }) => {
  const darkMode = useSelector(state => state.theme.darkMode);

  // Pure presentational component - requires teamData and reviewers as props
  if (!teamData || !reviewers) {
    return <div>Error: Missing required props (teamData, reviewers)</div>;
  }

  const [reviewerData, setReviewerData] = useState(reviewers);
  const [activeInput, setActiveInput] = useState(null); // Track which reviewer is adding PR
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [showGradingModal, setShowGradingModal] = useState(null); // Track which reviewer's grading modal is open

  const handlePRReviewedChange = (reviewerId, newValue) => {
    setReviewerData(prevData =>
      prevData.map(reviewer =>
        reviewer.id === reviewerId ? { ...reviewer, prsReviewed: newValue } : reviewer,
      ),
    );
  };

  const validatePRNumber = value => {
    const trimmed = value.trim();
    // Pattern: single number or two numbers with +
    const pattern = /^\d+(\s*\+\s*\d+)?$/;

    if (!trimmed) {
      return { isValid: false, error: 'PR number cannot be empty' };
    }

    if (!pattern.test(trimmed)) {
      return { isValid: false, error: 'Format should be: 1070 or 1070 + 1256' };
    }

    return { isValid: true, error: '' };
  };

  const isBackendFrontendPair = value => {
    return value.includes('+');
  };

  const handleAddNewClick = reviewerId => {
    setActiveInput(reviewerId);
    setInputValue('');
    setInputError('');
  };

  const handleInputChange = value => {
    setInputValue(value);
    const validation = validatePRNumber(value);
    setInputError(validation.error);
  };

  const handleInputSubmit = () => {
    const validation = validatePRNumber(inputValue);
    if (validation.isValid) {
      const reviewerId = activeInput;
      const newPREntry = {
        id: `pr_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        prNumbers: inputValue.trim(),
        grade: 'Okay', // Default grade for newly added PRs
      };

      setReviewerData(prevData =>
        prevData.map(reviewer =>
          reviewer.id === reviewerId
            ? { ...reviewer, gradedPrs: [...reviewer.gradedPrs, newPREntry] }
            : reviewer,
        ),
      );

      // Reset states
      setActiveInput(null);
      setInputValue('');
      setInputError('');
    } else {
      setInputError(validation.error);
    }
  };

  const handleCancel = () => {
    setActiveInput(null);
    setInputValue('');
    setInputError('');
  };

  const handlePRNumberClick = reviewerId => {
    setShowGradingModal(reviewerId);
  };

  const handleGradeChange = (reviewerId, prId, newGrade) => {
    setReviewerData(prevData =>
      prevData.map(reviewer =>
        reviewer.id === reviewerId
          ? {
              ...reviewer,
              gradedPrs: reviewer.gradedPrs.map(pr =>
                pr.id === prId ? { ...pr, grade: newGrade } : pr,
              ),
            }
          : reviewer,
      ),
    );
  };

  const handleCloseGradingModal = () => {
    setShowGradingModal(null);
  };

  return (
    <Container fluid className={`pr-grading-screen-container ${darkMode ? 'dark-mode' : ''}`}>
      <Row className="justify-content-center">
        <Col md={12}>
          <Card className={`pr-grading-screen-card ${darkMode ? 'dark-mode' : ''}`}>
            <Card.Header className={`pr-grading-screen-header ${darkMode ? 'dark-mode' : ''}`}>
              <div className="pr-grading-screen-header-content">
                <div className="pr-grading-screen-header-left">
                  <h1 className={`pr-grading-screen-title ${darkMode ? 'dark-mode' : ''}`}>
                    Weekly PR grading screen
                  </h1>
                  <div
                    className={`pr-grading-screen-team-info-badge ${darkMode ? 'dark-mode' : ''}`}
                  >
                    <h2 className={`pr-grading-screen-team-info ${darkMode ? 'dark-mode' : ''}`}>
                      {teamData.teamName} - {teamData.dateRange.start} to {teamData.dateRange.end}
                    </h2>
                  </div>
                </div>
                <div className="pr-grading-screen-header-right">
                  <Button
                    variant="outline-dark"
                    className={`pr-grading-screen-done-button ${darkMode ? 'dark-mode' : ''}`}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body className={darkMode ? 'dark-mode' : ''}>
              <div className="pr-grading-screen-active-members-section">
                <h3
                  className={`pr-grading-screen-active-members-title ${
                    darkMode ? 'dark-mode' : ''
                  }`}
                >
                  Active Members
                </h3>
              </div>

              <div className={`pr-grading-screen-table-container ${darkMode ? 'dark-mode' : ''}`}>
                <table className={`pr-grading-screen-table ${darkMode ? 'dark-mode' : ''}`}>
                  <thead>
                    <tr>
                      <th className="pr-grading-screen-th-name">Reviewer Name</th>
                      <th className="pr-grading-screen-th-reviewed">PR reviewed</th>
                      <th className="pr-grading-screen-th-needed">PRs Needed</th>
                      <th className="pr-grading-screen-th-numbers">PR Numbers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewerData.map(reviewer => (
                      <tr
                        key={reviewer.id}
                        className={`pr-grading-screen-table-row ${darkMode ? 'dark-mode' : ''}`}
                      >
                        <td className="pr-grading-screen-td-name">
                          <div className="pr-grading-screen-reviewer-info">
                            <div className="pr-grading-screen-reviewer-name">
                              {reviewer.reviewer}
                            </div>
                            {reviewer.role && (
                              <div className="pr-grading-screen-reviewer-role">{reviewer.role}</div>
                            )}
                          </div>
                        </td>

                        <td className="pr-grading-screen-td-reviewed">
                          <input
                            type="number"
                            value={reviewer.prsReviewed}
                            onChange={e =>
                              handlePRReviewedChange(reviewer.id, Number(e.target.value) || 0)
                            }
                            onFocus={e => e.target.select()}
                            className={`pr-grading-screen-pr-input ${darkMode ? 'dark-mode' : ''}`}
                            min="0"
                          />
                        </td>

                        <td className="pr-grading-screen-td-needed">{reviewer.prsNeeded}</td>

                        <td className="pr-grading-screen-td-numbers">
                          <div className="pr-grading-screen-pr-list">
                            {reviewer.gradedPrs.map(pr => {
                              const isBackendFrontendPair = pr.prNumbers.includes('+');
                              return (
                                <div key={pr.id} className="pr-grading-screen-pr-item">
                                  <span
                                    className={`pr-grading-screen-pr-number ${
                                      isBackendFrontendPair ? 'pr-grading-screen-pair' : ''
                                    } pr-grading-screen-pr-clickable`}
                                    onClick={() => handlePRNumberClick(reviewer.id)}
                                  >
                                    {pr.prNumbers}
                                  </span>
                                </div>
                              );
                            })}
                            {/* Add New Button */}
                            {activeInput !== reviewer.id && (
                              <Button
                                variant="success"
                                size="sm"
                                className="pr-grading-screen-add-btn"
                                onClick={() => handleAddNewClick(reviewer.id)}
                              >
                                + Add new
                              </Button>
                            )}

                            {/* PR Number Input */}
                            {activeInput === reviewer.id && (
                              <div
                                className={`pr-grading-screen-input-container ${
                                  darkMode ? 'dark-mode' : ''
                                }`}
                              >
                                <div className="pr-grading-screen-input-wrapper">
                                  <input
                                    type="text"
                                    value={inputValue}
                                    onChange={e => handleInputChange(e.target.value)}
                                    onKeyPress={e => {
                                      if (e.key === 'Enter') {
                                        handleInputSubmit();
                                      } else if (e.key === 'Escape') {
                                        handleCancel();
                                      }
                                    }}
                                    placeholder="1070 or 1070 + 1256"
                                    className={`pr-grading-screen-pr-number-input ${
                                      isBackendFrontendPair(inputValue)
                                        ? 'pr-grading-screen-pair-input'
                                        : ''
                                    } ${inputError ? 'pr-grading-screen-input-error' : ''} ${
                                      darkMode ? 'dark-mode' : ''
                                    }`}
                                    autoFocus
                                  />
                                  <div className="pr-grading-screen-input-buttons">
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={handleInputSubmit}
                                      disabled={!inputValue.trim()}
                                      className={darkMode ? 'dark-mode' : ''}
                                    >
                                      Add
                                    </Button>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={handleCancel}
                                      className={darkMode ? 'dark-mode' : ''}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                                {inputError && (
                                  <div
                                    className={`pr-grading-screen-error-message ${
                                      darkMode ? 'dark-mode' : ''
                                    }`}
                                  >
                                    {inputError}
                                  </div>
                                )}
                                {isBackendFrontendPair(inputValue) && !inputError && (
                                  <div
                                    className={`pr-grading-screen-pair-message ${
                                      darkMode ? 'dark-mode' : ''
                                    }`}
                                  >
                                    Frontend-Backend Pair Detected
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Grading Modal */}
              {showGradingModal && (
                <div
                  className={`pr-grading-screen-modal-overlay ${darkMode ? 'dark-mode' : ''}`}
                  onClick={handleCloseGradingModal}
                >
                  <div
                    className={`pr-grading-screen-modal ${darkMode ? 'dark-mode' : ''}`}
                    onClick={e => e.stopPropagation()}
                  >
                    <div
                      className={`pr-grading-screen-modal-header ${darkMode ? 'dark-mode' : ''}`}
                    >
                      <h3>Grade PR Numbers</h3>
                      <button
                        className={`pr-grading-screen-modal-close ${darkMode ? 'dark-mode' : ''}`}
                        onClick={handleCloseGradingModal}
                      >
                        ×
                      </button>
                    </div>
                    <div className={`pr-grading-screen-modal-body ${darkMode ? 'dark-mode' : ''}`}>
                      <table
                        className={`pr-grading-screen-grading-table ${darkMode ? 'dark-mode' : ''}`}
                      >
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
                                <td className="pr-grading-screen-modal-pr-number">
                                  <span
                                    className={`pr-grading-screen-pr-number ${
                                      pr.prNumbers.includes('+') ? 'pr-grading-screen-pair' : ''
                                    }`}
                                  >
                                    {pr.prNumbers}
                                  </span>
                                </td>
                                <td className="pr-grading-screen-checkbox-cell">
                                  <input
                                    type="checkbox"
                                    checked={pr.grade === 'Exceptional'}
                                    onChange={() =>
                                      handleGradeChange(showGradingModal, pr.id, 'Exceptional')
                                    }
                                    className="pr-grading-screen-grade-checkbox"
                                  />
                                </td>
                                <td className="pr-grading-screen-checkbox-cell">
                                  <input
                                    type="checkbox"
                                    checked={pr.grade === 'Okay'}
                                    onChange={() =>
                                      handleGradeChange(showGradingModal, pr.id, 'Okay')
                                    }
                                    className="pr-grading-screen-grade-checkbox"
                                  />
                                </td>
                                <td className="pr-grading-screen-checkbox-cell">
                                  <input
                                    type="checkbox"
                                    checked={pr.grade === 'Unsatisfactory'}
                                    onChange={() =>
                                      handleGradeChange(showGradingModal, pr.id, 'Unsatisfactory')
                                    }
                                    className="pr-grading-screen-grade-checkbox"
                                  />
                                </td>
                                <td className="pr-grading-screen-checkbox-cell">
                                  <input
                                    type="checkbox"
                                    checked={pr.grade === 'Cannot find image'}
                                    onChange={() =>
                                      handleGradeChange(
                                        showGradingModal,
                                        pr.id,
                                        'Cannot find image',
                                      )
                                    }
                                    className="pr-grading-screen-grade-checkbox"
                                  />
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      <div className="pr-grading-screen-modal-footer">
                        <Button
                          variant="primary"
                          onClick={handleCloseGradingModal}
                          className={`pr-grading-screen-done-btn ${darkMode ? 'dark-mode' : ''}`}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PRGradingScreen;
