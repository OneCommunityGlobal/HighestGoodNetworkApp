import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Form, FormGroup, Col, Row, Label, Input, Button } from 'reactstrap';
import ErrorAlert from '../ErrorAlert';

function ProjectSelectForm({ projects }) {
  const history = useHistory();
  const [selectedProjectId, setSelectedProjectId] = useState('');
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
    setSelectedProjectId(event.target.value);   
  };

  const handleButtonClick = () => {
    if (selectedProjectId) {
      // navigate to a new page with information about the selected project
      history.push(`/bmdashboard/projects/${selectedProjectId}`);
    } else {
      setError(true)
    }
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
              value={selectedProjectId}
              onChange={handleOptionChange}
            >
              <option value="" default>
                Select a project
              </option>
              {selectOptions}
            </Input>
          </Col>
        </FormGroup>
        <Col className="p-3">
          <Button className="bm-dashboard__button w-100" onClick={handleButtonClick}>
            Go to Project Dashboard
          </Button>
        </Col>
        <ErrorAlert error={error} message={'Please select a project'} />
      </Row>
    </Form>
  );
}

export default ProjectSelectForm;
