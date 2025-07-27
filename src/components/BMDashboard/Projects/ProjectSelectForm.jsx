import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Row, Col, Button, Input } from 'reactstrap';

function ProjectSelectForm() {
  const projects = useSelector(state => state.bmProjects) || [];

  const [selectedProject, setSelectedProject] = useState('');

  const history = useHistory();

  const handleGo = () => {
    if (selectedProject) {
      history.push(`/bmdashboard/projects/${selectedProject}`);
    }
  };

  return (
    <Row className="justify-content-center mt-4">
      <Col md="8" lg="6" className="d-flex align-items-center">
        <Input
          type="select"
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          style={{
            maxWidth: '300px',
            marginRight: '1rem',
            fontSize: '1rem',
          }}
        >
          <option value="">Select a project</option>
          {projects.map(p => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </Input>

        <Button
          onClick={handleGo}
          disabled={!selectedProject}
          style={{
            whiteSpace: 'nowrap',
            backgroundColor: '#2F4F4F',
            borderColor: '#2F4F4F',
            color: '#fff',
          }}
        >
          Go to Project Dashboard
        </Button>
      </Col>
    </Row>
  );
}

export default ProjectSelectForm;
