import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import Select from 'react-select';
import moment from 'moment';
import { Row, Container, Col, Input } from 'reactstrap';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';
import BMTimeLogCard from './BMTimeLogCard';
import BMError from '../shared/BMError';
import './BMTimeLogger.css';

function BMTimeLogger() {
  const [isError, setIsError] = useState(false);
  const [selectedProject, setselectedProject] = useState(null);

  const dispatch = useDispatch();
  const errors = useSelector(state => state.errors);
  const projects = useSelector(state => state.bmProjects);
  // fetch projects data on pageload
  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  // trigger an error state if there is an errors object
  useEffect(() => {
    if (Object.entries(errors).length > 0) {
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

      {/* select project dropdown */}
      <Row>
        <Col xs="3">Date: {moment().format('MM/DD/YY')}</Col>
        <Col xs="1">
          <p>Project:</p>
        </Col>
        <Col xs="3">
          <Input
            id="projectSelect"
            name="select"
            type="select"
            value={selectedProject || ''}
            onChange={e => {
              const { value } = e.target;
              setselectedProject(value);
            }}
          >
            <option value="">Select a project</option>
            {projects.map(project => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </Input>
        </Col>
      </Row>

      {selectedProject && <BMTimeLogCard selectedProject={selectedProject} />}
      {isError && <BMError errors={errors} />}
    </Container>
  );
}

export default BMTimeLogger;
