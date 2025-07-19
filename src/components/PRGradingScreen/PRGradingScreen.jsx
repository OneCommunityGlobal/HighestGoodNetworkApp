import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { getAllMockData } from './mockData';
import './PRGradingScreen.css';

const PRGradingScreen = () => {
  const { teamData, reviewers } = getAllMockData();
  const [reviewerData, setReviewerData] = useState(reviewers);
  const [activeInput, setActiveInput] = useState(null); // Track which reviewer is adding PR
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

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
        grade: 'Added', // Default grade for newly added PRs
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

  return (
    <Container fluid className="pr-grading-screen-container">
      <Row className="justify-content-center">
        <Col md={12}>
          <Card className="pr-grading-screen-card">
            <Card.Header className="pr-grading-screen-header">
              <div className="pr-grading-screen-header-content">
                <div className="pr-grading-screen-header-left">
                  <h1 className="pr-grading-screen-title">Weekly PR grading screen</h1>
                  <div className="pr-grading-screen-team-info-badge">
                    <h2 className="pr-grading-screen-team-info">
                      {teamData.teamName} - {teamData.dateRange.start} to {teamData.dateRange.end}
                    </h2>
                  </div>
                </div>
                <div className="pr-grading-screen-header-right">
                  <Button variant="outline-dark" className="pr-grading-screen-done-button">
                    Done
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="pr-grading-screen-active-members-section">
                <h3 className="pr-grading-screen-active-members-title">Active Members</h3>
              </div>

              <div className="pr-grading-screen-table-container">
                <table className="pr-grading-screen-table">
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
                      <tr key={reviewer.id} className="pr-grading-screen-table-row">
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
                            className="pr-grading-screen-pr-input"
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
                                    }`}
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
                              <div className="pr-grading-screen-input-container">
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
                                    } ${inputError ? 'pr-grading-screen-input-error' : ''}`}
                                    autoFocus
                                  />
                                  <div className="pr-grading-screen-input-buttons">
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={handleInputSubmit}
                                      disabled={!inputValue.trim()}
                                    >
                                      Add
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={handleCancel}>
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                                {inputError && (
                                  <div className="pr-grading-screen-error-message">
                                    {inputError}
                                  </div>
                                )}
                                {isBackendFrontendPair(inputValue) && !inputError && (
                                  <div className="pr-grading-screen-pair-message">
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PRGradingScreen;
