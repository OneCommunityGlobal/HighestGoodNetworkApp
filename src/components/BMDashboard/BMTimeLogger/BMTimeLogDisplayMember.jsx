import { CardHeader, Card } from 'reactstrap';
import BMTimeLogStopWatch from './BMTimeLogStopWatch';
import styles from './BMTimeLogCard.module.css';

// function BMTimeLogCard({ selectedProject }) {
function BMTimeLogDisplayMember({ firstName, lastName, role, memberId, projectId }) {
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
      <Card
        className={`${styles.memberCard} rounded-8 mr-3 my-3`}
        style={{ border: borderProperty }}
      >
        <CardHeader className={`${styles.memberCardHeader}`} style={{ backgroundColor: cardColor }}>
          <h5 className={`${styles.memberCardName}`}>
            {firstName} {lastName}
          </h5>
        </CardHeader>

        <BMTimeLogStopWatch memberId={memberId} projectId={projectId} />
      </Card>
    </div>
  );
}

export default BMTimeLogDisplayMember;
