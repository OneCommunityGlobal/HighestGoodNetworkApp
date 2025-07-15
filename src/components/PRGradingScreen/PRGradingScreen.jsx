import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import './PRGradingScreen.css';

const PRGradingScreen = () => {
  return (
    <Container fluid className="pr-grading-container">
      <Row className="justify-content-center">
        <Col md={12}>
          <Card className="pr-grading-card">
            <Card.Header className="pr-grading-header">
              <h1 className="pr-grading-title">Weekly PR Grading Screen</h1>
              <div className="team-info-badge">
                <h2 className="team-info">Team Name - Date Range</h2>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="active-members-section">
                <h3 className="active-members-title">Active Members</h3>
              </div>

              <div className="coming-soon-message">
                <h4>🚧 Under Construction 🚧</h4>
                <p>
                  This page is being developed. The PR grading functionality will be available soon.
                </p>
                <p>Features coming soon:</p>
                <ul>
                  <li>Team member PR review tracking</li>
                  <li>PR number input with validation</li>
                  <li>Grade assignment (Unsatisfactory, Okay, Exceptional, No Correct Image)</li>
                  <li>Auto-calculation of required PRs</li>
                  <li>Backend-frontend pair detection</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PRGradingScreen;
