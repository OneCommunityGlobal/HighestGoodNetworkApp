import { useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { Form, Col, Row, Input } from 'reactstrap';
import ErrorAlert from '../ErrorAlert';

function BMTimeLogSelectProject({ selectedProject, setSelectedProject }) {
  const date = moment();
  const projects = useSelector(state => state.bmProjects);

  const [error, setError] = useState(false);

  const selectOptions = projects.map(project => {
    return (
      <option key={project._id} value={project._id}>
        {project.name}
      </option>
    );
  });

  const handleOptionChange = event => {
    setError(false);
    setSelectedProject(event.target.value);
  };

  return (
    <Form>
      <Row>
        <Col xs="3">Date: {date.format('MM/DD/YY')}</Col>

        <Col xs="1">
          <p>Project:</p>
        </Col>
        <Col xs="3">
          <Input
            id="projectSelect"
            name="select"
            type="select"
            value={selectedProject}
            onChange={handleOptionChange}
          >
            <option value="" default>
              Select a project
            </option>
            filter={selectOptions}
          </Input>
        </Col>
        <ErrorAlert error={error} message="Please select a project" />
      </Row>
    </Form>
  );
}

export default BMTimeLogSelectProject;
