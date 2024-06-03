import { Card } from 'reactstrap';
import BMTimeLogCard from './BMTimeLogCard';

function BMTimeLogger() {
  return (
    <Card className="cards-container">
      <h2 className="cards-container__header">Member Group Check In</h2>
      <BMTimeLogCard />
    </Card>
  );
}

export default BMTimeLogger;
