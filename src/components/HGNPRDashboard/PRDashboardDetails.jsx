import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, Badge } from 'reactstrap';
import { useSelector } from 'react-redux';
import styles from './PRDashboardDetails.module.css';

function PRDashboardDetails() {
  const { prId } = useParams();
  const darkMode = useSelector(state => state.theme.darkMode);
  const dm = darkMode ? styles.dark : '';

  return (
    <div className={`${styles.wrapper} ${dm}`}>
      <Container fluid>
        <Row>
          <Col xs="12">
            <h1 className={styles.title}>PR Details - PR {prId}</h1>
            <p className={styles.subtitle}>Detailed PR view (comments, CI/CD status)</p>
          </Col>
        </Row>
        <Row>
          <Col md="8">
            <Card className={`${styles.card} ${dm}`}>
              <CardBody>
                <h4>Description</h4>
                <p>
                  This is a detailed view of PR {prId}. Here you would see the full description,
                  commits, and changes.
                </p>

                <h5>CI/CD Status</h5>
                <ul className={styles.cicdList}>
                  <li>
                    Build:{' '}
                    <Badge className={styles.badge} color="success">
                      Passed
                    </Badge>
                  </li>
                  <li>
                    Tests:{' '}
                    <Badge className={styles.badge} color="success">
                      Passed
                    </Badge>
                  </li>
                  <li>
                    Lint:{' '}
                    <Badge className={styles.badge} color="warning">
                      Warning
                    </Badge>
                  </li>
                  <li>
                    Security:{' '}
                    <Badge className={styles.badge} color="danger">
                      Failed
                    </Badge>
                  </li>
                </ul>

                <h5>Comments</h5>
                <div className={`${styles.comment} p-3 mb-2`}>
                  <strong>John Developer:</strong> Initial implementation completed
                </div>
                <div className={`${styles.comment} p-3 mb-2`}>
                  <strong>Alice Reviewer:</strong> Looks good, just need to fix the linting issues
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md="4">
            <Card className={`${styles.card} ${dm}`}>
              <CardBody>
                <h4>PR Info</h4>
                <p>
                  <strong>Author:</strong> John Developer
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <Badge className={styles.badge} color="info">
                    Open
                  </Badge>
                </p>
                <p>
                  <strong>Reviews:</strong> 17
                </p>
                <p>
                  <strong>Commits:</strong> 3
                </p>
                <p>
                  <strong>Files Changed:</strong> 5
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default PRDashboardDetails;
