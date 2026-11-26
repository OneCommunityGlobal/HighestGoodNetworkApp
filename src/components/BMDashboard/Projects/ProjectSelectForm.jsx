import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Row, Col, Button, Input } from 'reactstrap';
import styles from './ProjectSelectForm.module.css';

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

  return (
    <Row className={`justify-content-center mt-4 ${darkMode ? 'project-select-form-dark' : ''}`}>
      <Col md="8" lg="6" className={styles.controls}>
        <Input
          type="select"
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          className={`${styles.projectSelect} ${darkMode ? styles.darkInput : ''}`}
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
          className={`${styles.goButton} ${darkMode ? styles.goButtonDark : ''}`}
        >
          Go to Project Dashboard
        </Button>
      </Col>
    </Row>
  );
}

export default ProjectSelectForm;
