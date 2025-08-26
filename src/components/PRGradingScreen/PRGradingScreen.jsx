/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import styles from './PRGradingScreen.module.css';

const PRGradingScreen = ({ teamData, reviewers }) => {
  const darkMode = useSelector(state => state.theme.darkMode);

  // All useState hooks must be called before any early returns
  const [reviewerData, setReviewerData] = useState(reviewers || []);
  const [activeInput, setActiveInput] = useState(null); // Track which reviewer is adding PR
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [showGradingModal, setShowGradingModal] = useState(null); // Track which reviewer's grading modal is open

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'Escape' && showGradingModal) {
        handleCloseGradingModal();
      }
    };

    if (showGradingModal) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showGradingModal]);

  // Pure presentational component - requires teamData and reviewers as props
  if (!teamData || !reviewers) {
    return <div>Error: Missing required props (teamData, reviewers)</div>;
  }

  const handlePRReviewedChange = (reviewerId, newValue) => {
    setReviewerData(prevData =>
      prevData.map(reviewer => {
        if (reviewer.id !== reviewerId) return reviewer;
        let sanitizedValue = newValue;
        if (typeof newValue === 'string') {
          sanitizedValue = newValue.replace(/\D/g, '');
          sanitizedValue = sanitizedValue === '' ? null : Number(sanitizedValue);
        }
        if (sanitizedValue === null) {
          sanitizedValue = reviewer.prsReviewed;
        }
        return { ...reviewer, prsReviewed: sanitizedValue };
      }),
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

  const handleDoneClick = e => {
    e.preventDefault();
    // Format data for POST /api/weekly-grading/save
    const formattedData = {
      teamCode: teamData.teamName,
      date: {
        start: teamData.dateRange.start,
        end: teamData.dateRange.end,
      },
      reviewerGradings: reviewerData.map(reviewer => ({
        reviewer: reviewer.reviewer,
        prsReviewed: reviewer.prsReviewed,
        prsNeeded: reviewer.prsNeeded,
        prNumbersAndGrades: reviewer.gradedPrs.map(pr => ({
          prNumbers: pr.prNumbers,
          grade: pr.grade,
        })),
        ...(reviewer.role && { role: reviewer.role }), // Include role if it exists
      })),
    };
    // onSave(formattedData);
    // TODO: Replace with actual API call when backend is implemented
    // fetch('/api/weekly-grading/save', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(formattedData),
    // });
  };

  return (
    <Container
      fluid
      className={`${styles['pr-grading-screen-container']} ${darkMode ? styles['dark-mode'] : ''}`}
    >
      <Row className="justify-content-center">
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
                <div className={styles['pr-grading-screen-header-left']}>
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
                    <h2
                      className={`${styles['pr-grading-screen-team-info']} ${
                        darkMode ? styles['dark-mode'] : ''
                      }`}
                    >
                      {teamData.teamName} - {teamData.dateRange.start} to {teamData.dateRange.end}
                    </h2>
                  </div>
                </div>
                <div className={styles['pr-grading-screen-header-right']}>
                  <Button
                    variant="outline-dark"
                    className={`${styles['pr-grading-screen-done-button']} ${
                      darkMode ? styles['dark-mode'] : ''
                    }`}
                    onClick={handleDoneClick}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body className={darkMode ? styles['dark-mode'] : ''}>
              <div className={styles['pr-grading-screen-active-members-section']}>
                <h3
                  className={`${styles['pr-grading-screen-active-members-title']} ${
                    darkMode ? styles['dark-mode'] : ''
                  }`}
                >
                  Active Members
                </h3>
              </div>

              <div
                className={`${styles['pr-grading-screen-table-container']} ${
                  darkMode ? styles['dark-mode'] : ''
                }`}
              >
                <table
                  className={`${styles['pr-grading-screen-table']} ${
                    darkMode ? styles['dark-mode'] : ''
                  }`}
                >
                  <thead>
                    <tr>
                      <th className={styles['pr-grading-screen-th-name']}>Reviewer Name</th>
                      <th className={styles['pr-grading-screen-th-reviewed']}>PR reviewed</th>
                      <th className={styles['pr-grading-screen-th-needed']}>PRs Needed</th>
                      <th className={styles['pr-grading-screen-th-numbers']}>PR Numbers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewerData.map(reviewer => (
                      <tr
                        key={reviewer.id}
                        className={`${styles['pr-grading-screen-table-row']} ${
                          darkMode ? styles['dark-mode'] : ''
                        }`}
                      >
                        <td className={styles['pr-grading-screen-td-name']}>
                          <div className={styles['pr-grading-screen-reviewer-info']}>
                            <div className={styles['pr-grading-screen-reviewer-name']}>
                              {reviewer.reviewer}
                            </div>
                            {reviewer.role && (
                              <div className={styles['pr-grading-screen-reviewer-role']}>
                                {reviewer.role}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className={styles['pr-grading-screen-td-reviewed']}>
                          <input
                            // ... all your input props remain the same ...
                            className={`${styles['pr-grading-screen-pr-input']} ${
                              darkMode ? styles['dark-mode'] : ''
                            }`}
                          />
                        </td>

                        <td className={styles['pr-grading-screen-td-needed']}>
                          {reviewer.prsNeeded}
                        </td>

                        <td className={styles['pr-grading-screen-td-numbers']}>
                          <div className={styles['pr-grading-screen-pr-list']}>
                            {reviewer.gradedPrs.map(pr => {
                              const isBackendFrontendPairValue = pr.prNumbers.includes('+');
                              return (
                                <div key={pr.id} className={styles['pr-grading-screen-pr-item']}>
                                  <span
                                    className={`${styles['pr-grading-screen-pr-number']} ${
                                      isBackendFrontendPairValue
                                        ? styles['pr-grading-screen-pair']
                                        : ''
                                    } ${styles['pr-grading-screen-pr-clickable']}`}
                                    onClick={() => handlePRNumberClick(reviewer.id)}
                                    // ... rest of props ...
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
                                className={styles['pr-grading-screen-add-btn']}
                                onClick={() => handleAddNewClick(reviewer.id)}
                              >
                                + Add new
                              </Button>
                            )}

                            {/* PR Number Input */}
                            {activeInput === reviewer.id && (
                              <div
                                className={`${styles['pr-grading-screen-input-container']} ${
                                  darkMode ? styles['dark-mode'] : ''
                                }`}
                              >
                                <div className={styles['pr-grading-screen-input-wrapper']}>
                                  <input
                                    type="text"
                                    value={inputValue}
                                    onChange={e => handleInputChange(e.target.value)}
                                    // ... other props ...
                                    className={`${styles['pr-grading-screen-pr-number-input']} ${
                                      isBackendFrontendPair(inputValue)
                                        ? styles['pr-grading-screen-pair-input']
                                        : ''
                                    } ${
                                      inputError ? styles['pr-grading-screen-input-error'] : ''
                                    } ${darkMode ? styles['dark-mode'] : ''}`}
                                  />
                                  {/* ... buttons ... */}
                                </div>
                                {inputError && (
                                  <div
                                    className={`${styles['pr-grading-screen-error-message']} ${
                                      darkMode ? styles['dark-mode'] : ''
                                    }`}
                                  >
                                    {inputError}
                                  </div>
                                )}
                                {/* ... pair message ... */}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Modal - similar pattern for all modal classes */}
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
                    {/* ... rest of modal content with same pattern ... */}
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
