import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Card, CardHeader, CardBody, Spinner } from 'reactstrap';
import StudentBadgeImage from './StudentBadgeImage';
import '../Badge/Badge.css'; // Reuse shared badge styling
import badgeIcon from '../SummaryBar/badges_icon.png';
import reportIcon from '../SummaryBar/report_icon.png';
import taskIcon from '../SummaryBar/task_icon.png';
import StudentBadgeDetailModal from './StudentBadgeDetailModal';
import styles from './StudentBadgeGallery.module.css';

function StudentBadgeGallery({ darkMode }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // ============================================================
    // 🔒 TEMPORARY FRONTEND MOCK (REMOVE AFTER BACKEND IS READY)
    // ============================================================
    const mockData = [
      {
        id: 1,
        badgeName: 'Personal Max',
        description: 'Personal best hours in a week',
        type: 'Personal Max',
        imageUrl: badgeIcon,
        count: 5,
        earned: true,
      },
      {
        id: 2,
        badgeName: '100 Hour Streak',
        description: 'Completed 100 volunteer hours',
        type: 'Hour Multiple',
        imageUrl: reportIcon,
        count: 1,
        earned: true,
      },
      {
        id: 3,
        badgeName: 'Team Player',
        description: 'Collaborated on group project',
        type: 'Collaboration',
        imageUrl: taskIcon,
        count: 0,
        earned: false,
      },
    ];
    setBadges(mockData);
    setLoading(false);

    // ============================================================
    // 🚀 REAL BACKEND INTEGRATION (UNCOMMENT AFTER API IS READY)
    // ============================================================
    /*
    fetch('/student/badges', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // ✅ if authentication cookie/session needed
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch student badges');
        }
        return response.json();
      })
      .then(data => {
        // ⚙️ Expected API format:
        // [
        //   {
        //     id: number,
        //     badgeName: string,
        //     description: string,
        //     type: string,
        //     imageUrl: string,
        //     count: number,
        //     earned: boolean
        //   }
        // ]
        setBadges(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error fetching badges:', err);
        setLoading(false);
      });
    */
  }, []);

  const openModal = badge => {
    setSelected(badge);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  return (
    <div className={styles.galleryContainer}>
      <Row
        className="bagde-box-shadow"
        style={{
          margin: '0 2px',
          backgroundColor: '#ffffff', // lock to light mode
        }}
      >
        <Col className="px-0">
          <Card
            style={{
              backgroundColor: '#fafafa',
              borderRadius: 0,
              minWidth: '100%',
            }}
          >
            <CardHeader className={styles.cardHeader}>My Badges</CardHeader>
            <CardBody>
              {loading ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: 24,
                  }}
                >
                  <Spinner />
                </div>
              ) : badges.length === 0 ? (
                <p
                  style={{
                    opacity: 0.7,
                    textAlign: 'center',
                    margin: '12px 0',
                  }}
                >
                  You haven’t earned any badges yet — keep contributing to unlock them!
                </p>
              ) : (
                <div className={styles.badge_history_container}>
                  {badges.map((badge, index) => (
                    <div
                      key={badge.id}
                      className={`${styles.badge_image_container} ${
                        !badge.earned ? styles.unearned : ''
                      }`}
                    >
                      <button
                        onClick={() => openModal(badge)}
                        className={styles.badgeButton}
                        aria-label={`View details for ${badge.badgeName}`}
                      >
                        <StudentBadgeImage
                          badgeData={badge}
                          time={badge.badgeName}
                          index={index}
                          personalBestMaxHrs={badge.count || 0}
                          count={badge.count || 0}
                        />
                      </button>
                      <div className={styles.badgeLabel}>{badge.badgeName}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <StudentBadgeDetailModal isOpen={modalOpen} onClose={closeModal} badge={selected} />
    </div>
  );
}

const mapStateToProps = state => ({
  darkMode: state.theme.darkMode,
});

export default connect(mapStateToProps)(StudentBadgeGallery);
