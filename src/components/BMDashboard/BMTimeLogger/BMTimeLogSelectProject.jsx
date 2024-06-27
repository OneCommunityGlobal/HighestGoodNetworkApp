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
        <Col>Date: {date.format('MM/DD/YY')}</Col>

        <Col>Project:</Col>
        <Col>
          <Input
            id="projectSelect"
            name="select"
            type="select"
            value={selectedProject}
            onChange={handleOptionChange}
          >
            filter={selectOptions}
          </Input>
        </Col>
      </Row>
      <ErrorAlert error={error} message="Please select a project" />
    </Form>

    // <Form>
    //   <Row>
    //     <Col>Date: {date.format('MM/DD/YY')}</Col>
    //     <Col>
    //       <Col md="3" className="text-md-right">
    //         <Label>Project:</Label>
    //       </Col>
    //       <Col md="8">
    //         <FormGroup>
    //           {/* <Input
    //             id="projectSelect"
    //             name="select"
    //             type="select"
    //             value={selectedProject}
    //             onChange={handleOptionChange}
    //           > */}
    //             filter={selectOptions}
    //           </Input>
    //         </FormGroup>
    //       </Col>
    //     </Col>
    //   </Row>
    //   <ErrorAlert error={error} message="Please select a project" />
    // </Form>
  );
}

export default BMTimeLogSelectProject;
