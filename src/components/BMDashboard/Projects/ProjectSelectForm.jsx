import React from 'react';
import { FormGroup, Col, Label, Input } from 'reactstrap';

const ProjectSelectForm = ({ projects }) => {
  
  const selectOptions = projects.map(project => {
    return <option key={project.projectId}>{project.projectName}</option>;
  });

  return (
    <FormGroup>
      <Col className="p-3">
        <Label for="projectSelect" hidden>
          Select
        </Label>
        <Input id="projectSelect" name="select" type="select">
          <option default>Select a project</option>
          {selectOptions}
        </Input>
      </Col>
    </FormGroup>
  );
}

export default ProjectSelectForm