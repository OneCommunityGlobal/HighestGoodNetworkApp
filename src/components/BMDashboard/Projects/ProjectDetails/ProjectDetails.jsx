import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import { LoggingButtons, AddItemButtons, TeamButtons } from './LogBar';
import RentedToolsDisplay from './RentedTools/RentedToolsDisplay';
import MaterialsDisplay from './Materials/MaterialsDisplay';
import ProjectLog from './ProjectLog';
import styles from './ProjectDetails.module.css';

/* -------------------------------------------
   REUSABLE DASHBOARD SECTION COMPONENT
------------------------------------------- */
const DashboardSection = ({ title, icon, children }) => (
  <div
    style={{
      textAlign: 'center',
      marginTop: '25px',
      marginBottom: '15px',
    }}
  >
    <h2
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#e6f2ff',
        padding: '8px 18px',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '1.2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
      }}
    >
      <span style={{ fontSize: '1.4rem' }}>{icon}</span>
      {title}
    </h2>

    {/* BUTTONS AREA */}
    <div
      style={{
        marginTop: '12px',
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '10px',
      }}
    >
      {children}
    </div>
  </div>
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
      className={`${darkMode ? styles['project-details-dark'] : styles['project-details']}`}
    >
      <Row className="justify-content-center">
        <Col xs="12" lg="10">
          {/* PAGE TITLE */}
          <h1
            className={`${
              darkMode ? styles['project-details-title-dark'] : styles['project-details-title']
            } mb-2`}
          >
            {currProject.name} Dashboard
          </h1>

          {/* --------------------------- */}
          {/*   DAILY LOGGING SECTION     */}
          {/* --------------------------- */}
          <DashboardSection icon="🕒" title="Daily Logging">
            <LoggingButtons darkMode={darkMode} />
          </DashboardSection>

          {/* --------------------------- */}
          {/*   ADD A NEW ITEM            */}
          {/* --------------------------- */}
          <DashboardSection icon="➕" title="Add a New Item">
            <AddItemButtons darkMode={darkMode} />
          </DashboardSection>

          {/* --------------------------- */}
          {/*           TEAM              */}
          {/* --------------------------- */}
          <DashboardSection icon="👥" title="Team">
            <TeamButtons darkMode={darkMode} />
          </DashboardSection>

          {/* TOOLS + MATERIALS ROW */}
          <Row className="mt-4 mb-4 g-4">
            {/* Rented Tools */}
            <Col md="6" className="mb-4">
              <DashboardSection icon="🚚" title="Rented Tools or Equipment" />
              <RentedToolsDisplay projectId={projectId} />
            </Col>

            {/* Materials */}
            <Col md="6" className="mb-4">
              <DashboardSection icon="🧱" title="Materials with Quantity < 20%" />
              <MaterialsDisplay projectId={projectId} />
            </Col>
          </Row>

          {/* Project Log */}
          <DashboardSection icon="📋" title="Members Working Today" />
          <ProjectLog projectId={projectId} />
        </Col>
      </Row>
    </Container>
  );
}

export default ProjectDetails;
