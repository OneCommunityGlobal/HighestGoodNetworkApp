import { CardHeader, Card } from 'reactstrap';
import BMTimeLogStopWatch from './BMTimeLogStopWatch';
import './BMTimeLogCard.css';

// function BMTimeLogCard({ selectedProject }) {
function BMTimeLogDisplayMember({ firstName, lastName, role }) {
  let cardColor = '#78bdda'; // default = volunteer

  if (role.includes('Volunteer') || role.includes('volunteer')) {
    cardColor = '#78bdda'; // light blue
  } else if (role.includes('Core') || role.includes('core')) {
    cardColor = '#ecb16c'; // light orange
  } else if (
    role.includes('Manager') ||
    role.includes('manager') ||
    role.includes('Mentor') ||
    role.includes('mentor')
  ) {
    cardColor = '#6cc3b2'; // light green
  } else if (role.includes('Owner') || role.includes('owner')) {
    cardColor = '#c36c6c'; // light red
  }

  let borderProperty = '2px solid ';
  borderProperty += cardColor;

  return (
    <div>
      <Card className="member-card rounded-8 mr-3 my-3" style={{ border: borderProperty }}>
        <CardHeader className="member-card-header" style={{ backgroundColor: cardColor }}>
          <h5 className="member-card-name">
            {firstName} {lastName}
          </h5>
        </CardHeader>

        <BMTimeLogStopWatch />
      </Card>
    </div>
  );
}

export default BMTimeLogDisplayMember;
