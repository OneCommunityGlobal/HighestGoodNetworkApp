import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Form, FormGroup, Col, Row, Label, Input, Button } from 'reactstrap';

const ProjectSelectForm = ({ projects }) => {
  const history = useHistory();
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const selectOptions = projects.map(project => {
    return (
      <option key={project.projectId} value={project.projectId}>
        {project.projectName}
      </option>
    );
  });

  const handleOptionChange = event => {
    setSelectedProjectId(event.target.value);
  };

  const handleButtonClick = () => {
    if (selectedProjectId) {
      //navigate to a new page with information about the selected project
      history.push(`/bmdashboard/projects/${selectedProjectId}`);
    } else {
      alert('Please select an option first');
    }
  };

  return (
    <Form className="w-100 p-3  text-center">
      <Row className="ml-0 gx-5 w-75" md="2" sm="1" xs="1">
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
      </Row>
    </Form>
  );
};

export default ProjectSelectForm;
