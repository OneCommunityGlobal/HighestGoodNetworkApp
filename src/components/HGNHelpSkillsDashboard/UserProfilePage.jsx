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
