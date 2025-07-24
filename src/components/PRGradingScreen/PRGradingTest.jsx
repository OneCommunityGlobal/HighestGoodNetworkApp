import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import PRGradingScreen from './PRGradingScreen';
import { getDataByTeamId } from './mockData';

const PRGradingTest = () => {
  const [selectedTeam, setSelectedTeam] = useState(null);

  const teams = [
    { id: 'team1', name: '91NePRT (Original)', description: '8 reviewers, mixed completion' },
    { id: 'team2', name: 'SmallTeam', description: '3 reviewers, minimal data' },
    { id: 'team3', name: 'ComplexTeam', description: '4 reviewers, edge cases' },
  ];

  const handleTeamSelect = teamId => {
    setSelectedTeam(teamId);
  };

  if (selectedTeam) {
    const data = getDataByTeamId(selectedTeam);
    return <PRGradingScreen teamData={data.teamData} reviewers={data.reviewers} />;
  }

  return (
    <Container style={{ padding: '40px 20px' }}>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h2>PR Grading Screen Test</h2>
              <p className="mb-0">Select a team configuration to test the component</p>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-3">
                {teams.map(team => (
                  <Button
                    key={team.id}
                    variant="outline-primary"
                    size="lg"
                    onClick={() => handleTeamSelect(team.id)}
                    className="text-start"
                  >
                    <div>
                      <strong>{team.name}</strong>
                      <br />
                      <small className="text-muted">{team.description}</small>
                    </div>
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PRGradingTest;
