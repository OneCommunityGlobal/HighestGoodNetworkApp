import { Container, Row, Col, ListGroup, ListGroupItem } from 'reactstrap';

function PRDashboardTopReviewedPRs() {
  return (
    <Container fluid>
      <Row>
        <Col xs="12">
          <h1>Top Reviewed PRs</h1>
          <p>Sorted list of PRs by review activity</p>
        </Col>
      </Row>
      <Row>
        <Col xs="12">
          <ListGroup>
            <ListGroupItem className="d-flex justify-content-between align-items-center">
              <div>
                <strong>PR 104: Improve error handling</strong>
                <p className="mb-0 text-muted">Optimize performance and error handling</p>
              </div>
              <span className="badge badge-primary badge-pill">35 reviews</span>
            </ListGroupItem>
            <ListGroupItem className="d-flex justify-content-between align-items-center">
              <div>
                <strong>PR 108: Optimize performance</strong>
                <p className="mb-0 text-muted">Performance improvements across the app</p>
              </div>
              <span className="badge badge-primary badge-pill">40 reviews</span>
            </ListGroupItem>
            <ListGroupItem className="d-flex justify-content-between align-items-center">
              <div>
                <strong>PR 106: Fix styling issue</strong>
                <p className="mb-0 text-muted">CSS fixes and UI improvements</p>
              </div>
              <span className="badge badge-primary badge-pill">29 reviews</span>
            </ListGroupItem>
            <ListGroupItem className="d-flex justify-content-between align-items-center">
              <div>
                <strong>PR 110: Add new component</strong>
                <p className="mb-0 text-muted">New React component implementation</p>
              </div>
              <span className="badge badge-primary badge-pill">27 reviews</span>
            </ListGroupItem>
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
}

export default PRDashboardTopReviewedPRs;
