import { CardHeader, CardBody, Card, Row, Col, Button, Container } from 'reactstrap';
import './BMTimeLogCard.css';

// function BMTimeLogCard({ selectedProject }) {
function BMTimeLogDisplayMember({ firstName, lastName, role }) {
  let cardColor = '#9fd0e5'; // default = volunteer

  if (role.includes('Volunteer') || role.includes('volunteer')) {
    cardColor = '#9fd0e5';
  } else if (role.includes('Core') || role.includes('core')) {
    cardColor = '#d59797';
  } else if (
    role.includes('Manager') ||
    role.includes('manager') ||
    role.includes('Mentor') ||
    role.includes('mentor') ||
    role.includes('Owner') ||
    role.includes('ownder')
  ) {
    cardColor = '#f2c897';
  }

  let borderProperty = '1px solid ';
  borderProperty += cardColor;

  return (
    <div>
      <Card className="member-card rounded-8 mr-3 my-3" style={{ border: borderProperty }}>
        <CardHeader className="member-card-header" style={{ backgroundColor: cardColor }}>
          <h6 className="member-card-name">
            {firstName} {lastName}
          </h6>
        </CardHeader>
        <CardBody>
          <Container>
            <Row>STOPWATCH TIMER</Row>
            <Row>
              <Col>
                <Button>START</Button>
              </Col>
              <Col>
                <Button>STOP</Button>
              </Col>
            </Row>
            <Row>Start at: </Row>
            <Row>Task: </Row>
            <Row>
              <Button>CLEAR</Button>
            </Row>
          </Container>
        </CardBody>
      </Card>
    </div>
  );
}

export default BMTimeLogDisplayMember;
