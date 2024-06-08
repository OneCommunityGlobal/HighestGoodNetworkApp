import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { Row, Col, Card } from 'reactstrap';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';
import BMTimeLogSelectProject from './BMTimeLogSelectProject';
import BMTimeLogCard from './BMTimeLogCard';
import BMError from '../shared/BMError';
import './BMTimeLogger.css';

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
    <Card className="justify-content-center mw-50 px-5">
      <header className="bm-timelogger__header">
        <Row className="ml-0 gx-5 w-75 mx-auto" md="2" sm="1" xs="1">
          <h1>Member Group Check In</h1>
        </Row>
        <Row className="ml-0 gx-5 w-75 mx-auto" md="2" sm="1" xs="1">
          <Col className="p-3">Date: {date.format('MM/DD/YY')}</Col>
          <Col className="p-3">
            <BMTimeLogSelectProject />
          </Col>
        </Row>
      </header>

      {isError ? <BMError errors={errors} /> : <BMTimeLogCard />}
    </Card>
  );
}

export default BMTimeLogger;
