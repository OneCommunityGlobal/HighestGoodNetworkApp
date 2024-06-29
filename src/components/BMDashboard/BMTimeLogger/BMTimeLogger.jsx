import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import Select from 'react-select';

import { Row, Container } from 'reactstrap';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';
import BMTimeLogSelectProject from './BMTimeLogSelectProject';
import BMTimeLogCard from './BMTimeLogCard';
import BMError from '../shared/BMError';
import './BMTimeLogger.css';

function BMTimeLogger() {
  const [isError, setIsError] = useState(false);
  const [selectedProject, setselectedProject] = useState();
  const [isProjectSelected, setIsProjectSelected] = useState(false);

  const dispatch = useDispatch();
  const errors = useSelector(state => state.errors);

  // fetch projects data on pageload
  useEffect(() => {
    dispatch(fetchBMProjects());
  }, []);

  useEffect(() => {}, [selectedProject]);

  useEffect(() => {
    if (selectedProject) {
      setIsProjectSelected(true);
    }
  }, [selectedProject]);

  // trigger an error state if there is an errors object
  useEffect(() => {
    if (Object.entries(errors).length) {
      setIsError(true);
    }
  }, [errors]);

  return (
    <Container className="justify-content-center">
      <header className="bm-timelogger__header">
        <Row className="mx-auto">
          <h1>Member Group Check In</h1>
        </Row>
      </header>
      <BMTimeLogSelectProject
        selectedProject={selectedProject}
        setSelectedProject={setselectedProject}
      />

      {isProjectSelected ? <BMTimeLogCard selectedProject={selectedProject} /> : null}
      {isError ? <BMError errors={errors} /> : null}
    </Container>
  );
}

export default BMTimeLogger;
