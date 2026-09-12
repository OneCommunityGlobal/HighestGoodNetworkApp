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
import { ENDPOINTS } from '~/utils/URL';
// import styles from './style/UserProfilePage.module.css';

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
import styles from './style/UserProfile.module.css';

// Custom tooltip for RadarChart
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={`${styles.tooltip}`}>
        <p className={`${styles.tooltipTitle}`}>{data.name}</p>
        <p className={`${styles.tooltipScore}`}>
          Score:{' '}
          <span className={data.value < 5 ? `${styles.scoreLow}` : `${styles.scoreHigh}`}>
            {data.value}
          </span>
        </p>
        <p className={`${styles.tooltipQuestion}`}>{data.question}</p>
      </div>
    );
  }
  return null;
}

// Single skill card
function SkillItem({ item }) {
  return (
    <div id={`tooltip-${item.id}`} className={`${styles.skillItem}`}>
      <div className={item.score < 5 ? `${styles.skillScoreLow}` : `${styles.skillScoreHigh}`}>
        {item.score}
      </div>
      <div className={`${styles.skillName}`}>{item.name}</div>
      <UncontrolledTooltip placement="top" target={`tooltip-${item.id}`}>
        {item.question}
      </UncontrolledTooltip>
    </div>
  );
}

// Skills tabbed section
function SkillsTabbedSection({ skillsData }) {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const allSkills = [
    ...(skillsData.Frontend || []),
    ...(skillsData.Backend || []),
    ...(skillsData.DevOps || []),
    ...(skillsData.SWPractices || []),
  ];

  const radarData = allSkills.map(skill => ({
    name: skill.name,
    value: skill.score,
    question: skill.question,
  }));

  const toggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const renderScoreItems = items => (
    <Row>
      {items.map(item => (
        <Col key={item.id} xs={6} sm={4} md={3} lg={3}>
          <SkillItem item={item} />
        </Col>
      ))}
    </Row>
  );

  return (
    <Card>
      <CardBody className={`${styles.cardBody}`}>
        <h5>Skills</h5>
        <Row className={`${styles.skillsRow}`}>
          {/* Tabs column */}
          <Col md={2} className={`${styles.navCol}`}>
            <Nav vertical pills>
              {[
                'Dashboard',
                'Frontend',
                'Backend',
                'Deployment & DevOps',
                'Software Practices',
              ].map(tab => (
                <NavItem key={tab} className={`${styles.navItem}`}>
                  <NavLink
                    className={classnames(styles.navLink, {
                      [styles.activeNavLink]: activeTab === tab,
                    })}
                    onClick={() => toggle(tab)}
                  >
                    {tab}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
          </Col>

          {/* Content column */}
          <Col md={10} className={`${styles.contentCol}`}>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="Dashboard">
                <div className={`${styles.chartContainer}`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={160} data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 9 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} />
                      <Radar
                        name="Skills"
                        dataKey="value"
                        stroke="#ff4d6d"
                        fill="#ff4d6d"
                        fillOpacity={0.6}
                      />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </TabPane>
              <TabPane tabId="Frontend">{renderScoreItems(skillsData.Frontend || [])}</TabPane>
              <TabPane tabId="Backend">{renderScoreItems(skillsData.Backend || [])}</TabPane>
              <TabPane tabId="Deployment & DevOps">
                {renderScoreItems(skillsData.DevOps || [])}
              </TabPane>
              <TabPane tabId="Software Practices">
                {renderScoreItems(skillsData.SWPractices || [])}
              </TabPane>
            </TabContent>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
}

// Main UserProfilePage
function UserProfilePage() {
  const { userId } = useParams();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await axios.get(ENDPOINTS.USER_PROFILE(userId));
        setUserProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load user profile data');
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={`${styles.userProfilePage}`}>
      <div>
        <div>User Profile Page Placeholder</div>
      </div>

      {userProfile?.skills && (
        <div className={`${styles.skillsSection}`}>
          <SkillsTabbedSection skillsData={userProfile.skills} />
        </div>
      )}
    </div>
  );
}

export default UserProfilePage;
