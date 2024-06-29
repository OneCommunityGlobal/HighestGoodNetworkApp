import { CardHeader, CardBody, Card, Row, Button, Container } from 'reactstrap';
import './BMTimeLogCard.css';

// function BMTimeLogCard({ selectedProject }) {
function BMTimeLogDisplayMember({ firstName, lastName, role }) {
  let cardColor = '#97d5c8'; // default = volunteer

  if (role.includes('Volunteer') || role.includes('volunteer')) {
    cardColor = '#97d5c8'; // light green
  } else if (role.includes('Core') || role.includes('core')) {
    cardColor = '#f2c897'; // light orange
  } else if (
    role.includes('Manager') ||
    role.includes('manager') ||
    role.includes('Mentor') ||
    role.includes('mentor')
  ) {
    cardColor = '#9fd0e5'; // light blue
  } else if (role.includes('Owner') || role.includes('ownder')) {
    cardColor = '#d59797'; // light red
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
            <Row>
              <Button className="member-stopwatch mb-2 px-5">STOPWATCH TIMER</Button>
            </Row>
            <Row className="justify-content-between mb-1">
              <Button className="member-start">START</Button>
              <Button className="member-stop">STOP</Button>
            </Row>
            <Row className="mb-1">Start at: </Row>
            <Row className="mb-2">Task: </Row>
            <Row className="justify-content-center">
              <Button className="member-clear">CLEAR</Button>
            </Row>
          </Container>
        </CardBody>
      </Card>
    </div>
  );
}

export default BMTimeLogDisplayMember;
