import { Container, Row, Col, Card, CardBody } from 'reactstrap';

function PRDashboardOverview() {
  return (
    <Container fluid>
      <Row>
        <Col xs="12">
          <h1>PR Dashboard Overview</h1>
          <p>Summary metrics (Open PRs, Stale PRs, Avg. Review Time)</p>
        </Col>
      </Row>
      <Row>
        <Col md="4">
          <Card>
            <CardBody>
              <h3>45</h3>
              <p>Open PRs</p>
            </CardBody>
          </Card>
        </Col>
        <Col md="4">
          <Card>
            <CardBody>
              <h3>12</h3>
              <p>Stale PRs</p>
            </CardBody>
          </Card>
        </Col>
        <Col md="4">
          <Card>
            <CardBody>
              <h3>2.3 days</h3>
              <p>Avg Review Time</p>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default PRDashboardOverview;
