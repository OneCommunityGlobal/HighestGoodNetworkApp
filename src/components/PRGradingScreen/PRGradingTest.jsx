import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '../../utils/URL';
import CreateTestConfigModal from '../PRGradingDashboard/CreateTestConfigModal';
import styles from './PRGradingTest.module.css';

const STATIC_TEAMS = [
  { id: 'team1', name: '91NePRT (Original)', description: '8 reviewers, mixed completion' },
  { id: 'team2', name: 'SmallTeam', description: '3 reviewers, minimal data' },
  { id: 'team3', name: 'ComplexTeam', description: '4 reviewers, edge cases' },
];

const PRGradingTest = () => {
  const history = useHistory();
  const darkMode = useSelector(state => state.theme.darkMode);

  const [dynamicTeams, setDynamicTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const res = await axios.get(ENDPOINTS.PR_GRADING_CONFIG);
        const fetched = res.data.map(cfg => ({
          id: cfg._id,
          name: cfg.teamName,
          description: `${cfg.reviewerCount} reviewer${cfg.reviewerCount > 1 ? 's' : ''}, ${
            cfg.testDataType
          }${cfg.notes ? ` — ${cfg.notes}` : ''}`,
          fromDB: true,
          reviewerCount: cfg.reviewerCount,
          reviewerNames: cfg.reviewerNames || [],
        }));
        setDynamicTeams(fetched);
      } catch {
        toast.error('Failed to load configurations from server.');
      } finally {
        setLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  const allTeams = [...STATIC_TEAMS, ...dynamicTeams];

  const handleTeamSelect = teamId => {
    const team = allTeams.find(t => t.id === teamId);
    history.push('/pr-grading-screen', { teamId, config: team });
  };

  const handleDeleteConfig = async (e, teamId) => {
    e.stopPropagation();
    try {
      await axios.delete(`${ENDPOINTS.PR_GRADING_CONFIG}/${teamId}`);
      setDynamicTeams(prev => prev.filter(t => t.id !== teamId));
      toast.success('Configuration deleted successfully!');
    } catch {
      toast.error('Failed to delete configuration.');
    }
  };

  const handleCreateConfig = async newConfig => {
    try {
      const res = await axios.post(ENDPOINTS.PR_GRADING_CONFIG, {
        teamName: newConfig.teamName,
        reviewerCount: Number(newConfig.reviewerCount),
        testDataType: newConfig.testDataType,
        reviewerNames: newConfig.reviewerNames || [],
        notes: newConfig.notes || '',
      });
      const saved = res.data;
      setDynamicTeams(prev => [
        ...prev,
        {
          id: saved._id,
          name: saved.teamName,
          description: `${saved.reviewerCount} reviewer${saved.reviewerCount > 1 ? 's' : ''}, ${
            saved.testDataType
          }${saved.notes ? ` — ${saved.notes}` : ''}`,
          fromDB: true,
        },
      ]);
      setShowCreateModal(false);
      toast.success(`Configuration "${saved.teamName}" created successfully!`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create configuration.';
      toast.error(msg);
    }
  };

  const existingTeamNames = allTeams.map(t => t.name);

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
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant={darkMode ? 'light' : 'primary'} />
                </div>
              ) : (
                <div className="d-grid gap-3">
                  {allTeams.map(team => (
                    <div key={team.id} className="position-relative">
                      <button
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
                      {team.fromDB && (
                        <button
                          type="button"
                          onClick={e => handleDeleteConfig(e, team.id)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'transparent',
                            border: 'none',
                            color: darkMode ? '#f87171' : '#dc3545',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            lineHeight: 1,
                            padding: '0 4px',
                          }}
                          title="Delete configuration"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
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

PRGradingTest.propTypes = {};

export default PRGradingTest;
