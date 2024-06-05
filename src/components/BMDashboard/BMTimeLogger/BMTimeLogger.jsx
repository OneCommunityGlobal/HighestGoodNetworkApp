import moment from 'moment';
import { Card } from 'reactstrap';
import BMTimeLogSelectProject from './BMTimeLogSelectProject';
// import BMTimeLogCard from './BMTimeLogCard';

function BMTimeLogger() {
  const date = moment();

  return (
    <Card className="cards-container">
      <h4 className="cards-container__header">Member Group Check In</h4>
      <div>
        <div>Date: {date.format('MM/DD/YY')}</div>
        <BMTimeLogSelectProject />
      </div>
      {/* <BMTimeLogCard /> */}
    </Card>
  );
}

export default BMTimeLogger;
