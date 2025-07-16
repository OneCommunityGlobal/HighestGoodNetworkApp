import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Button } from 'react-bootstrap';
import { getAllMockData } from './mockData';
import './PRGradingScreen.css';

const PRGradingScreen = () => {
  const { teamData, reviewers } = getAllMockData();
  const [reviewerData, setReviewerData] = useState(reviewers);

  return (
    <Container fluid className="pr-grading-container">
      <Row className="justify-content-center">
        <Col md={12}>
          <Card className="pr-grading-card">
            <Card.Header className="pr-grading-header">
              <div className="header-content">
                <div className="header-left">
                  <h1 className="pr-grading-title">Weekly PR grading screen</h1>
                  <div className="team-info-badge">
                    <h2 className="team-info">
                      {teamData.teamName} - {teamData.dateRange.start} to {teamData.dateRange.end}
                    </h2>
                  </div>
                </div>
                <div className="header-right">
                  <Button variant="outline-dark" className="done-button">
                    Done
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="active-members-section">
                <h3 className="active-members-title">Active Members</h3>
              </div>

              <div className="table-container">
                <Table className="pr-grading-table">
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
                        <td>
                          <div className="reviewer-name-cell">
                            <div className="reviewer-name">{reviewer.reviewer}</div>
                            {reviewer.role && <div className="reviewer-role">{reviewer.role}</div>}
                          </div>
                        </td>
                        <td className="text-center">
                          <span>{reviewer.prsReviewed}</span>
                        </td>
                        <td className="text-center">
                          <span>{reviewer.prsNeeded}</span>
                        </td>
                        <td>
                          <div className="pr-numbers-cell">
                            {/* Display existing graded PRs */}
                            {reviewer.gradedPrs.map(pr => {
                              const isBackendFrontendPair = pr.prNumbers.includes('+');
                              return (
                                <div key={pr.id} className="pr-entry">
                                  <span
                                    className={`pr-numbers ${
                                      isBackendFrontendPair ? 'backend-frontend-pair' : ''
                                    }`}
                                  >
                                    {pr.prNumbers}
                                  </span>
                                  <span
                                    className={`grade-badge grade-${pr.grade
                                      .toLowerCase()
                                      .replace(' ', '-')}`}
                                  >
                                    {pr.grade}
                                  </span>
                                </div>
                              );
                            })}

                            {/* Add New button */}
                            <Button variant="success" size="sm" className="add-new-btn">
                              + Add new
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PRGradingScreen;
