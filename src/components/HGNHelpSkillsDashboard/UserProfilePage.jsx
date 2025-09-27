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
import styles from './style/UserCard.module.css';

// Custom tooltip for RadarChart
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #ddd',
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

// Single skill card
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

// Skills tabbed section
function SkillsTabbedSection({ skillsData }) {
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Combine all skills for the radar chart
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
    <Row className="g-2">
      {items.map(item => (
        <Col key={item.id} xs={6} sm={4} md={3} lg={3} className="mb-3">
          <SkillItem item={item} />
        </Col>
      ))}
    </Row>
  );

  const renderRadarChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart outerRadius={160} data={radarData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="name" tick={{ fontSize: 9 }} />
        <PolarRadiusAxis angle={30} domain={[0, 10]} />
        <Radar name="Skills" dataKey="value" stroke="#ff4d6d" fill="#ff4d6d" fillOpacity={0.6} />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );

  return (
    <Card>
      <CardBody style={{ padding: '1rem' }}>
        <h5 className="mb-3">Skills</h5>
        <Row style={{ minHeight: '400px' }}>
          {/* Tabs column */}
          <Col md={2} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
    <div className="user-profile-page">
      {/* User Info Section */}
      <div className="user-info-section mb-4">
        <div>User Profile Page Placeholder</div>
      </div>

      {/* Skills Tabbed Section */}
      {userProfile?.skills && (
        <div className={`${styles.skillsSection}`}>
          <SkillsTabbedSection skillsData={userProfile.skills} />
        </div>
      )}
    </div>
  );
}

export default UserProfilePage;
