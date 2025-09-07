import { Container, Row, Col } from 'reactstrap';
import styles from './LBDashboard.module.css';
import ReviewWordCloud from './ReviewWordCloud/ReviewWordCloud';

export function LBDashboard() {
  return (
    <Container fluid className={`${styles.dashboardContainer}`}>
      <header className={`${styles.dashboardHeader}`}>
        <h1>Listing and Bidding Dashboard</h1>
      </header>

      <div className={styles.dashboardContent}>
        {/* Review Word Cloud Section */}
        <Row className="mb-4">
          <Col xs="12">
            <ReviewWordCloud />
          </Col>
        </Row>

        {/* Additional dashboard components can be added here */}
      </div>
    </Container>
  );
}

export default LBDashboard;
