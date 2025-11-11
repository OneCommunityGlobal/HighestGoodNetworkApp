import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Card, CardHeader, CardBody } from 'reactstrap';
import StudentBadgeImage from './StudentBadgeImage';
import '../Badge/Badge.css'; // reuse same badge styling
import badgeIcon from '../SummaryBar/badges_icon.png';

function StudentBadgeGallery({ darkMode }) {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    const mockData = [
      {
        id: 1,
        badgeName: 'Personal Max',
        description: 'Personal best hours in a week',
        type: 'Personal Max',
        imageUrl: badgeIcon, // 👈 use imported image
        count: 5,
        earned: true,
      },
      {
        id: 2,
        badgeName: '100 Hour Streak',
        description: 'Completed 100 volunteer hours',
        type: 'Hour Multiple',
        imageUrl: badgeIcon,
        count: 1,
        earned: true,
      },
      {
        id: 3,
        badgeName: 'Team Player',
        description: 'Collaborated on group project',
        type: 'Collaboration',
        imageUrl: badgeIcon,
        earned: false,
      },
    ];
    setBadges(mockData);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <Row
        className={`${darkMode ? 'badge-box-shadow-dark bg-space-cadet' : 'bagde-box-shadow'}`}
        style={{ margin: '0 2px' }}
      >
        <Col className="px-0">
          <Card
            style={{
              backgroundColor: darkMode ? '#1C2541' : '#fafafa',
              borderRadius: 0,
              minWidth: '100%',
            }}
          >
            <CardHeader
              tag="h3"
              style={{
                color: darkMode ? '#fff' : '#285739',
                backgroundColor: darkMode ? '#0b132b' : '#eaeaea',
              }}
            >
              My Badges
            </CardHeader>
            <CardBody>
              <div className="badge_history_container">
                {badges.map((badge, index) => (
                  <div
                    key={badge.id}
                    className={`badge_image_container ${!badge.earned ? 'unearned' : ''}`}
                  >
                    <StudentBadgeImage
                      badgeData={badge}
                      time={badge.badgeName}
                      index={index}
                      personalBestMaxHrs={badge.count || 0}
                      count={badge.count || 0}
                    />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

const mapStateToProps = state => ({
  darkMode: state.theme.darkMode,
});

export default connect(mapStateToProps)(StudentBadgeGallery);
