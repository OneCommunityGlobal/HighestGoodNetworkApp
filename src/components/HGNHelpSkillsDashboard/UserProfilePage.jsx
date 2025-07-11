/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Row,
  Col,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Card,
  CardBody,
  UncontrolledTooltip,
} from 'reactstrap';
import classnames from 'classnames';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ENDPOINTS } from '../../utils/URL';
import styles from './style/UserCard.module.css';

// Sample data for skills
const mockSkillsData = {
  Frontend: [
    {
      id: 'fe1',
      name: 'UX/UI Design',
      score: 8,
      question: 'How comfortable are you with UX/UI Design principles and implementation?',
    },
    {
      id: 'fe2',
      name: 'Bootstrap',
      score: 4,
      question: 'Rate your proficiency with the Bootstrap framework',
    },
    {
      id: 'fe3',
      name: 'Advanced React',
      score: 10,
      question:
        'How would you rate your expertise with advanced React concepts like hooks, context API, and optimizations?',
    },
    {
      id: 'fe4',
      name: 'Overall Frontend',
      score: 3,
      question: 'Rate your overall frontend development skills',
    },
    {
      id: 'fe5',
      name: 'Web Sockets',
      score: 1,
      question: 'How comfortable are you integrating web sockets in frontend applications?',
    },
    {
      id: 'fe6',
      name: 'HTML Semantics',
      score: 2,
      question: 'Rate your knowledge of semantic HTML structure and accessibility',
    },
    {
      id: 'fe7',
      name: 'CSS Advanced',
      score: 9,
      question:
        'How would you rate your expertise with CSS preprocessing, animations, and layouts?',
    },
    {
      id: 'fe8',
      name: 'Redux',
      score: 7,
      question: 'Rate your proficiency with Redux state management and middleware',
    },
    {
      id: 'fe9',
      name: 'Responsive UI',
      score: 6,
      question:
        'How proficient are you with implementing responsive design across different devices?',
    },
    {
      id: 'fe10',
      name: 'Figma',
      score: 5,
      question: 'Rate your proficiency with Figma for UI/UX design',
    },
  ],
  Backend: [
    {
      id: 'be1',
      name: 'Backend',
      score: 6,
      question: 'Rate your overall backend development skills',
    },
    {
      id: 'be2',
      name: 'TDD Backend',
      score: 5,
      question: 'How comfortable are you with Test-Driven Development for backend?',
    },
    {
      id: 'be3',
      name: 'Database',
      score: 8,
      question: 'Rate your knowledge of database design and management',
    },
    {
      id: 'be4',
      name: 'MongoDB',
      score: 7,
      question: 'How would you rate your expertise with MongoDB?',
    },
    {
      id: 'be5',
      name: 'Mock MongoDB',
      score: 4,
      question: 'Rate your proficiency with mocking MongoDB for testing',
    },
    {
      id: 'be6',
      name: 'MERN Stack',
      score: 9,
      question: 'How comfortable are you working with the complete MERN stack?',
    },
  ],
  DevOps: [
    {
      id: 'devops1',
      name: 'Deployment',
      score: 5,
      question: 'How comfortable are you with deploying applications to production?',
    },
    {
      id: 'devops2',
      name: 'Version Control',
      score: 8,
      question: 'Rate your proficiency with version control systems like Git',
    },
    {
      id: 'devops3',
      name: 'Env Setup',
      score: 3,
      question: 'How would you rate your expertise with setting up development environments?',
    },
    {
      id: 'devops4',
      name: 'Testing',
      score: 7,
      question: 'Rate your knowledge of different testing methodologies',
    },
  ],
  SWPractices: [
    {
      id: 'sp1',
      name: 'Agile',
      score: 7,
      question: 'How comfortable are you working in an Agile environment?',
    },
    {
      id: 'sp2',
      name: 'Code Review',
      score: 9,
      question: 'Rate your proficiency with conducting thorough code reviews',
    },
    {
      id: 'sp3',
      name: 'Advanced Coding',
      score: 6,
      question: 'How would you rate your expertise with advanced coding practices?',
    },
    {
      id: 'sp4',
      name: 'Documentation',
      score: 8,
      question: 'Rate your skill with creating clear and comprehensive documentation',
    },
    {
      id: 'sp5',
      name: 'Markdown & Graphs',
      score: 5,
      question: 'How comfortable are you with markdown and creating graphs/charts?',
    },
    {
      id: 'sp6',
      name: 'Leadership Skills',
      score: 7,
      question: 'Rate your leadership skills within a development team',
    },
  ],
};

function CustomTooltip({ active, payload, darkMode }) {
  if (active && payload && payload.length) {
    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: darkMode ? '#22304a' : '#ffffff',
          color: darkMode ? '#fff' : '#222',
          border: darkMode ? '1px solid #2d4263' : '1px solid #ddd',
          borderRadius: '8px',
          padding: '6px 8px',
          fontSize: '12px',
          boxShadow: '0px 0px 6px rgba(0,0,0,0.1)',
          maxWidth: '180px',
          whiteSpace: 'normal',
          wordWrap: 'break-word',
        }}
      >
        <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{payload[0].payload.name}</p>
        <p style={{ margin: '0 0 4px 0' }}>
          Score:{' '}
          <span
            style={{
              color: payload[0].value < 5 ? '#dc3545' : '#28a745',
              fontWeight: 'bold',
            }}
          >
            {payload[0].value}
          </span>
        </p>
        <p style={{ margin: 0 }}>{payload[0].payload.question}</p>
      </div>
    );
  }

  return null;
}

function SkillItem({ item }) {
  return (
    <div
      id={`tooltip-${item.id}`}
      className="score-item"
      style={{
        position: 'relative',
        padding: '15px 10px',
        height: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: item.score < 5 ? '#dc3545' : '#28a745',
          marginBottom: '8px',
        }}
      >
        {item.score}
      </div>
      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.name}</div>
      <UncontrolledTooltip placement="top" target={`tooltip-${item.id}`}>
        {item.question}
      </UncontrolledTooltip>
    </div>
  );
}

// Separate Skills Tabbed Section component
function SkillsTabbedSection({ skillsData, darkMode }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const allSkills = [
    ...skillsData.Frontend,
    ...skillsData.Backend,
    ...skillsData.DevOps,
    ...skillsData.SWPractices,
  ];

  // Format all skills for the radar chart
  const radarData = allSkills.map(skill => ({
    name: skill.name,
    value: skill.score,
    question: skill.question,
  }));

  const toggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const renderScoreItems = items => {
    return (
      <Row className="g-2">
        {items.map(item => (
          <Col key={item.id} xs={6} sm={4} md={3} lg={3} className="mb-3">
            <SkillItem item={item} />
          </Col>
        ))}
      </Row>
    );
  };

  const renderRadarChart = () => {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart outerRadius={160} data={radarData} darkMode={darkMode}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" tick={{ fontSize: 9 }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} />
          <Radar name="Skills" dataKey="value" stroke="#ff4d6d" fill="#ff4d6d" fillOpacity={0.6} />
          <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
        </RadarChart>
      </ResponsiveContainer>
    );
  };


  return (
    <Card>
      <CardBody style={{ padding: '1rem' }}>
        <h5 className="mb-3">Skills</h5>
        <Row style={{ minHeight: '400px' }}>
          {/* Tabs column */}
          <Col
            md={2}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <Nav vertical pills>
              {[
                'Dashboard',
                'Frontend',
                'Backend',
                'Deployment & DevOps',
                'Software Practices',
              ].map(tab => (
                <NavItem key={tab} style={{ marginBottom: '15px' }}>
                  <NavLink
                    className={classnames({ active: activeTab === tab })}
                    onClick={() => toggle(tab)}
                    style={{
                      backgroundColor: activeTab === tab ? '#e3f2fd' : '#f1f1f1',
                      color: activeTab === tab ? '#007bff' : '#555',
                      fontWeight: '500',
                      textAlign: 'center',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      padding: '10px',
                    }}
                  >
                    {tab}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
          </Col>

          {/* Content column */}
          <Col md={10} style={{ overflowY: 'auto' }}>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="Dashboard">
                <div style={{ height: '350px', overflow: 'hidden' }}>{renderRadarChart()}</div>
              </TabPane>
              <TabPane tabId="Frontend">{renderScoreItems(skillsData.Frontend)}</TabPane>
              <TabPane tabId="Backend">{renderScoreItems(skillsData.Backend)}</TabPane>
              <TabPane tabId="Deployment & DevOps">{renderScoreItems(skillsData.DevOps)}</TabPane>
              <TabPane tabId="Software Practices">
                {renderScoreItems(skillsData.SWPractices)}
              </TabPane>
            </TabContent>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
}

function UserProfilePage() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const { userId } = useParams();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await axios.get(ENDPOINTS.USER_PROFILE(userId));
        setUserProfile(response.data);
        setLoading(false);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error loading user profile:', err);
        setError('Failed to load user profile data');
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  // if (error) return <div>Error: {error}</div>;

  return (
    <div className="user-profile-page">
      {/* This is a placeholder for the other parts of the user profile */}
      <div className="user-info-section mb-4">
        <div>User Profile Page Placeholder</div>
      </div>

      {/* Skills tabbed section */}
      <div className={`${styles.skillsSection}`}>
        <SkillsTabbedSection skillsData={mockSkillsData} darkMode={true} />      </div>
    </div>
  );
}

export default UserProfilePage;
