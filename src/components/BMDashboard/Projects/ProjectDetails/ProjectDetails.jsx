import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import LogBar from './LogBar';
import RentedToolsDisplay from './RentedTools/RentedToolsDisplay';
import MaterialsDisplay from './Materials/MaterialsDisplay';
import ProjectLog from './ProjectLog';
import styles from './ProjectDetails.module.css';

const SectionHeader = ({ icon, title }) => (
  <h3
    style={{
      backgroundColor: '#e6f2ff',
      padding: '10px 15px',
      borderRadius: '6px',
      fontSize: '1.2rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '30px',
    }}
  >
    <span style={{ fontSize: '1.4rem' }}>{icon}</span> {title}
  </h3>
);

function ProjectDetails() {
  const { projectId } = useParams();
  const darkMode = useSelector(state => state.theme.darkMode);
  const projects = useSelector(state => state.bmProjects) || [];
  const currProject = projects.find(project => String(project._id) === String(projectId));

  if (!currProject) {
    return (
      <Container className={`${styles['project-details']} text-center mt-5`}>
        <h2 className="text-danger">Project Not Found</h2>
        <p>Please check if the project exists or try selecting another project.</p>
      </Container>
    );
  }

  return (
    <Container
      fluid
      className={`${darkMode ? styles['project-details-dark'] : styles['project-details']}  `}
    >
      <Row className="justify-content-center">
        <Col xs="12" lg="10">
          <h1
            className={`${
              darkMode ? styles['project-details-title-dark'] : styles['project-details-title']
            } mb-2 `}
          >
            {currProject.name} Dashboard{' '}
          </h1>

          <SectionHeader icon="🕒" title="Daily Logging" />
          <LogBar projectId={projectId} />

          <Row className="mt-4">
            <Col md="6" className="mb-4">
              <SectionHeader icon="🚚" title="Rented Tools or Equipment" />
              <RentedToolsDisplay projectId={projectId} />
            </Col>
            <Col md="6" className="mb-4">
              <SectionHeader icon="🧱" title="Materials with Quantity Less Than 20%" />
              <MaterialsDisplay projectId={projectId} />
            </Col>
          </Row>

          <SectionHeader icon="👥" title="Team & Members Working Today" />
          <ProjectLog projectId={projectId} />
        </Col>
      </Row>
    </Container>
  );
}

export default ProjectDetails;
