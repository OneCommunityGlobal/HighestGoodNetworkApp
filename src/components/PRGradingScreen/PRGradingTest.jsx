import { useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import CreateTestConfigModal from '../PRGradingDashboard/CreateTestConfigModal';
import styles from './PRGradingTest.module.css';

const INITIAL_TEAMS = [
  { id: 'team1', name: '91NePRT (Original)', description: '8 reviewers, mixed completion' },
  { id: 'team2', name: 'SmallTeam', description: '3 reviewers, minimal data' },
  { id: 'team3', name: 'ComplexTeam', description: '4 reviewers, edge cases' },
];

const PRGradingTest = () => {
  const history = useHistory();
  const darkMode = useSelector(state => state.theme.darkMode);

  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleTeamSelect = teamId => {
    history.push('/pr-grading-screen', { teamId });
  };

  const handleCreateConfig = async newConfig => {
    const newTeam = {
      id: `team-${Date.now()}`,
      name: newConfig.teamName,
      description: `${newConfig.reviewerCount} reviewer${newConfig.reviewerCount > 1 ? 's' : ''}, ${
        newConfig.testDataType
      }${newConfig.notes ? ` — ${newConfig.notes}` : ''}`,
    };
    setTeams(prev => [...prev, newTeam]);
    setShowCreateModal(false);
    toast.success(`Configuration "${newConfig.teamName}" created successfully!`);
  };

  const existingTeamNames = teams.map(t => t.name);

  return (
    <Container style={{ padding: '40px 20px' }} className={darkMode ? 'dark-mode' : ''}>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className={darkMode ? 'bg-dark text-light border-secondary' : ''}>
            <Card.Header className={darkMode ? 'bg-dark border-secondary' : ''}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className={darkMode ? 'text-light' : ''}>PR Grading Screen Test</h2>
                  <p className="mb-0" style={{ color: darkMode ? '#9ca3af' : undefined }}>
                    Select a team configuration to test the component
                  </p>
                </div>
                <Button variant="success" onClick={() => setShowCreateModal(true)}>
                  + Create Test Configuration
                </Button>
              </div>
            </Card.Header>
            <Card.Body className={darkMode ? 'bg-dark' : ''}>
              <div className="d-grid gap-3">
                {teams.map(team => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => handleTeamSelect(team.id)}
                    className={`text-start w-100 ${styles.teamConfigButton} ${
                      darkMode ? styles.teamConfigButtonDark : styles.teamConfigButtonLight
                    }`}
                  >
                    <div>
                      <strong>{team.name}</strong>
                      <br />
                      <small>{team.description}</small>
                    </div>
                  </button>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {showCreateModal && (
        <CreateTestConfigModal
          onAdd={handleCreateConfig}
          onCancel={() => setShowCreateModal(false)}
          existingTeamNames={existingTeamNames}
        />
      )}
    </Container>
  );
};

PRGradingTest.propTypes = {
  // No props — data is managed internally
};

export default PRGradingTest;
