import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Form, FormGroup, Col, Row, Label, Input } from 'reactstrap';
import ErrorAlert from '../ErrorAlert';

function BMTimeLogSelectProject({ selectedProject, setSelectedProject }) {
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
    <Form className="w-100 p-3  text-center">
      <Row className="ml-0 gx-5 w-75 mx-auto" md="2" sm="1" xs="1">
        <FormGroup>
          <Col className="p-3">
            <Label for="projectSelect" hidden>
              Select
            </Label>
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
              {selectOptions}
            </Input>
          </Col>
        </FormGroup>
        <ErrorAlert error={error} message="Please select a project" />
      </Row>
    </Form>
  );
}

export default BMTimeLogSelectProject;
