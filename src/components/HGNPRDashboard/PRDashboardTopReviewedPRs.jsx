import { Container, Row, Col, ListGroup, ListGroupItem } from 'reactstrap';
import { useSelector } from 'react-redux';
import styles from './PRDashboardTopReviewedPRs.module.css';

function PRDashboardTopReviewedPRs() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dm = darkMode ? styles.dark : '';

  return (
    <div className={`${styles.wrapper} ${dm}`}>
      <Container fluid>
        <Row>
          <Col xs="12">
            <h1 className={styles.title}>Top Reviewed PRs</h1>
            <p className={styles.subtitle}>Sorted list of PRs by review activity</p>
          </Col>
        </Row>
        <Row>
          <Col xs="12">
            <ListGroup>
              <ListGroupItem
                className={`${styles.item} ${dm} d-flex justify-content-between align-items-center`}
              >
                <div>
                  <strong>PR 104: Improve error handling</strong>
                  <p className={`mb-0 ${styles.subtitle}`}>
                    Optimize performance and error handling
                  </p>
                </div>
                <span className="badge badge-primary badge-pill">35 reviews</span>
              </ListGroupItem>
              <ListGroupItem
                className={`${styles.item} ${dm} d-flex justify-content-between align-items-center`}
              >
                <div>
                  <strong>PR 108: Optimize performance</strong>
                  <p className={`mb-0 ${styles.subtitle}`}>
                    Performance improvements across the app
                  </p>
                </div>
                <span className="badge badge-primary badge-pill">40 reviews</span>
              </ListGroupItem>
              <ListGroupItem
                className={`${styles.item} ${dm} d-flex justify-content-between align-items-center`}
              >
                <div>
                  <strong>PR 106: Fix styling issue</strong>
                  <p className={`mb-0 ${styles.subtitle}`}>CSS fixes and UI improvements</p>
                </div>
                <span className="badge badge-primary badge-pill">29 reviews</span>
              </ListGroupItem>
              <ListGroupItem
                className={`${styles.item} ${dm} d-flex justify-content-between align-items-center`}
              >
                <div>
                  <strong>PR 110: Add new component</strong>
                  <p className={`mb-0 ${styles.subtitle}`}>New React component implementation</p>
                </div>
                <span className="badge badge-primary badge-pill">27 reviews</span>
              </ListGroupItem>
            </ListGroup>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default PRDashboardTopReviewedPRs;
