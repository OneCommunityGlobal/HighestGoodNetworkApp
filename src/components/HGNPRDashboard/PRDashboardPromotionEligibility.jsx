import { Container, Row, Col, Table } from 'reactstrap';

function PRDashboardPromotionEligibility() {
  return (
    <Container fluid>
      <Row>
        <Col xs="12">
          <h1>Promotion Eligibility</h1>
          <p>Table of members with eligibility flags</p>
        </Col>
      </Row>
      <Row>
        <Col xs="12">
          <Table striped>
            <thead>
              <tr>
                <th>Reviewer</th>
                <th>Weekly Requirements</th>
                <th>Required PRs</th>
                <th>Total Reviews</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Akshay - Jayaram</td>
                <td>10</td>
                <td>20</td>
                <td>0</td>
                <td>
                  <span className="badge badge-success">Has Met</span>
                </td>
              </tr>
              <tr>
                <td>Jessica</td>
                <td>10</td>
                <td>7</td>
                <td>2</td>
                <td>
                  <span className="badge badge-danger">Has not Met</span>
                </td>
              </tr>
              <tr>
                <td>SuniIkotte</td>
                <td>7</td>
                <td>7</td>
                <td>1</td>
                <td>
                  <span className="badge badge-danger">Has not Met</span>
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default PRDashboardPromotionEligibility;
