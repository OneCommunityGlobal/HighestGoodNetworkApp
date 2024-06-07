import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { Card } from 'reactstrap';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';
import BMTimeLogSelectProject from './BMTimeLogSelectProject';
import BMTimeLogCard from './BMTimeLogCard';
import BMError from '../shared/BMError';

function BMTimeLogger() {
  const date = moment();
  const [isError, setIsError] = useState(false);

  const dispatch = useDispatch();
  const errors = useSelector(state => state.errors);

  // fetch projects data on pageload
  useEffect(() => {
    dispatch(fetchBMProjects());
  }, []);

  // trigger an error state if there is an errors object
  useEffect(() => {
    if (Object.entries(errors).length) {
      setIsError(true);
    }
  }, [errors]);

  return (
    <Card className="cards-container">
      <h4 className="cards-container__header">Member Group Check In</h4>
      <div>
        <div>Date: {date.format('MM/DD/YY')}</div>
        <BMTimeLogSelectProject />
      </div>
      {isError ? <BMError errors={errors} /> : <BMTimeLogCard />}
    </Card>
  );
}

export default BMTimeLogger;
