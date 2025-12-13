import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Row, Col, Button, Input } from 'reactstrap';

function ProjectSelectForm() {
  const projects = useSelector(state => state.bmProjects) || [];
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  const [selectedProject, setSelectedProject] = useState('');

  const history = useHistory();

  const handleGo = () => {
    if (selectedProject) {
      history.push(`/bmdashboard/projects/${selectedProject}`);
    }
  };

  const inputStyles = {
    maxWidth: '300px',
    marginRight: '1rem',
    fontSize: '1rem',
    backgroundColor: darkMode ? '#2a3f5f' : '',
    borderColor: darkMode ? '#3a506b' : '',
    color: darkMode ? '#e0e0e0' : '',
  };

  const buttonStyles = {
    whiteSpace: 'nowrap',
    backgroundColor: darkMode ? '#3a506b' : '#2F4F4F',
    borderColor: darkMode ? '#3a506b' : '#2F4F4F',
    color: '#fff',
  };

  return (
    <Row className={`justify-content-center mt-4 ${darkMode ? 'project-select-form-dark' : ''}`}>
      <Col md="8" lg="6" className="d-flex align-items-center">
        <Input
          type="select"
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          style={inputStyles}
          className={darkMode ? 'form-control-dark' : ''}
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
          style={buttonStyles}
          className={darkMode ? 'btn-dark-mode' : ''}
        >
          Go to Project Dashboard
        </Button>
      </Col>
    </Row>
  );
}

export default ProjectSelectForm;
