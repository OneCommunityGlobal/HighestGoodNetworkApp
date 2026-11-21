import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import { useSelector } from 'react-redux';
import styles from './PRDashboardOverview.module.css';

function PRDashboardOverview() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dm = darkMode ? styles.dark : '';

  return (
    <div className={`${styles.wrapper} ${dm}`}>
      <Container fluid>
        <Row>
          <Col xs="12">
            <h1 className={styles.title}>PR Dashboard Overview</h1>
            <p className={styles.subtitle}>
              Summary metrics (Open PRs, Stale PRs, Avg. Review Time)
            </p>
          </Col>
        </Row>
        <Row>
          <Col md="4">
            <Card className={`${styles.card} ${dm}`}>
              <CardBody>
                <h3 className={styles.metric}>45</h3>
                <p className={styles.label}>Open PRs</p>
              </CardBody>
            </Card>
          </Col>
          <Col md="4">
            <Card className={`${styles.card} ${dm}`}>
              <CardBody>
                <h3 className={styles.metric}>12</h3>
                <p className={styles.label}>Stale PRs</p>
              </CardBody>
            </Card>
          </Col>
          <Col md="4">
            <Card className={`${styles.card} ${dm}`}>
              <CardBody>
                <h3 className={styles.metric}>2.3 days</h3>
                <p className={styles.label}>Avg Review Time</p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default PRDashboardOverview;
