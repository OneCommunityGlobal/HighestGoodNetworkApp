import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import LogBar from './LogBar';
import RentedToolsDisplay from './RentedTools/RentedToolsDisplay';
import MaterialsDisplay from './Materials/MaterialsDisplay';
import ProjectLog from './ProjectLog';
import styles from './ProjectDetails.module.css';

function ProjectDetails() {
  const { projectId } = useParams();
  const darkMode = useSelector(state => state.theme.darkMode);
  const projects = useSelector(state => state.bmProjects) || [];
  const currProject = projects.find(project => String(project._id) === String(projectId));

  if (!currProject) {
    return (
      <Container className={`${styles.projectDetails}`}>
        <h2>Project Not Found</h2>
        <p>Please check if the project exists or try selecting another project.</p>
      </Container>
    );
  }

  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <Container fluid className={`${styles.projectDetails}`}>
        <h1 className={styles.projectDetailsTitle}>{currProject.name} Dashboard</h1>
        <LogBar projectId={projectId} />

        <Row className={`${styles.cardsRow}`}>
          <Col className={`${styles.cardsCol}`}>
            <RentedToolsDisplay projectId={projectId} />
          </Col>
          <Col className={`${styles.cardsCol}`}>
            <MaterialsDisplay projectId={projectId} />
          </Col>
        </Row>

        <ProjectLog projectId={projectId} />
      </Container>
    </div>
  );
}

export default ProjectDetails;
