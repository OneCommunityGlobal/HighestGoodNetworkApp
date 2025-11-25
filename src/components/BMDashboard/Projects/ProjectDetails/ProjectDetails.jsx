import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import { LoggingButtons, AddItemButtons, TeamButtons } from './LogBar';
import RentedToolsDisplay from './RentedTools/RentedToolsDisplay';
import MaterialsDisplay from './Materials/MaterialsDisplay';
import ProjectLog from './ProjectLog';
import styles from './ProjectDetails.module.css';

/* -------------------------------------------
   REUSABLE DASHBOARD SECTION COMPONENT (FIXED)
------------------------------------------- */
const DashboardSection = ({ title, icon, children, darkMode }) => (
  <div
    style={{
      textAlign: 'center',
      marginTop: '18px',
      marginBottom: '10px',
    }}
  >
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 22px',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '1.1rem',
        boxShadow: '0 2px 5px rgba(0,0,0,0.18)',
        backgroundColor: darkMode ? '#243447' : '#eaf2ff', // FIXED for dark mode
        color: darkMode ? 'white' : '#1a1a1a',
        minWidth: '260px', // FIXED: uniform header width
        justifyContent: 'center',
      }}
    >
      <span style={{ fontSize: '1.3rem' }}>{icon}</span>
      {title}
    </div>

    {/* BUTTON GROUP */}
    <div
      style={{
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        paddingBottom: '5px',
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
          <DashboardSection icon="🕒" title="Daily Logging" darkMode={darkMode}>
            <LoggingButtons darkMode={darkMode} />
          </DashboardSection>

          {/* --------------------------- */}
          {/*   ADD A NEW ITEM            */}
          {/* --------------------------- */}
          <DashboardSection icon="➕" title="Add a New Item" darkMode={darkMode}>
            <AddItemButtons darkMode={darkMode} />
          </DashboardSection>

          {/* --------------------------- */}
          {/*           TEAM              */}
          {/* --------------------------- */}
          <DashboardSection icon="👥" title="Team" darkMode={darkMode}>
            <TeamButtons darkMode={darkMode} />
          </DashboardSection>

          {/* TOOLS + MATERIALS ROW */}
          <Row className={`mt-4 mb-4 g-4 ${styles.toolsMaterialRow}`}>
            {/* Rented Tools */}
            <Col md="6" className="mb-4">
              <div className={styles.sectionCardWrapper}>
                <DashboardSection icon="🚚" title="Rented Tools or Equipment" darkMode={darkMode} />
                <RentedToolsDisplay projectId={projectId} />
              </div>
            </Col>

            {/* Materials */}
            <Col md="6" className="mb-4">
              <div className={styles.sectionCardWrapper}>
                <DashboardSection
                  icon="🧱"
                  title="Materials with Quantity < 20%"
                  darkMode={darkMode}
                />
                <MaterialsDisplay projectId={projectId} />
              </div>
            </Col>
          </Row>

          {/* Project Log Section */}
          <div
            style={{
              maxWidth: '1100px',
              margin: '30px auto',
              padding: '0 15px',
            }}
          >
            <DashboardSection icon="📋" title="Members Working Today" darkMode={darkMode} />

            <div
              style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                overflowX: 'auto',
                padding: '10px',
              }}
            >
              <ProjectLog projectId={projectId} />
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default ProjectDetails;
