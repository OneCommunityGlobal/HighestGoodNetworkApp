import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { getAllMockData } from './mockData';
import './PRGradingScreen.css';

const PRGradingScreen = () => {
  const { teamData, reviewers } = getAllMockData();
  const [reviewerData, setReviewerData] = useState(reviewers);

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
                          {reviewer.gradedPrs.length}
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
                            <Button
                              variant="success"
                              size="sm"
                              className="pr-grading-screen-add-btn"
                            >
                              + Add new
                            </Button>
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
