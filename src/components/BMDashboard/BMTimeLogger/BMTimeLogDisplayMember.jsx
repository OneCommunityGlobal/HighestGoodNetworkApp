import { CardHeader, Card } from 'reactstrap';
import BMTimeLogStopWatch from './BMTimeLogStopWatch';
import './BMTimeLogCard.css';

// function BMTimeLogCard({ selectedProject }) {
function BMTimeLogDisplayMember({ firstName, lastName, role }) {
  const roleColors = {
    volunteer: '#78bdda', // light blue
    core: '#ecb16c', // light orange
    manager: '#6cc3b2', // light green
    mentor: '#6cc3b2', // light green
    owner: '#c36c6c', // light red
  };

  const roleKey = role.toLowerCase();
  const cardColor = roleColors[roleKey] || '#78bdda';
  const borderProperty = `2px solid ${cardColor}`;

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
