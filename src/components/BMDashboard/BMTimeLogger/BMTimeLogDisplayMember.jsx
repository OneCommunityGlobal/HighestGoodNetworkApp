import { CardHeader, Card } from 'reactstrap';
import BMTimeLogStopWatch from './BMTimeLogStopWatch';
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

  let borderProperty = '2px solid ';
  borderProperty += cardColor;

  return (
    <div>
      <Card className="member-card rounded-8 mr-3 my-3" style={{ border: borderProperty }}>
        <CardHeader className="member-card-header" style={{ backgroundColor: cardColor }}>
          <h6 className="member-card-name">
            {firstName} {lastName}
          </h6>
        </CardHeader>

        <BMTimeLogStopWatch />
      </Card>
    </div>
  );
}

export default BMTimeLogDisplayMember;
