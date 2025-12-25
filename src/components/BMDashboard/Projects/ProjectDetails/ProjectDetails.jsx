import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import { useEffect } from 'react';
import LogBar from './LogBar';
import RentedToolsDisplay from './RentedTools/RentedToolsDisplay';
import MaterialsDisplay from './Materials/MaterialsDisplay';
import ProjectLog from './ProjectLog';
import styles from './ProjectDetails.module.css';
import { fetchBMProjectMembers } from '../../../../actions/bmdashboard/projectMemberAction';
import { getAllUserTeams } from '../../../../actions/allTeamsAction';
import { fetchBMProjects } from '../../../../actions/bmdashboard/projectActions';

function ProjectDetails() {
  const { projectId } = useParams();
  const dispatch = useDispatch();

  // Get data from Redux
  const projects = useSelector(state => state.bmProjects) || [];
  const darkMode = useSelector(state => state.theme.darkMode);

  // Fetch data on mount
  useEffect(() => {
    if (projectId) {
      dispatch(fetchBMProjectMembers(projectId));
      dispatch(getAllUserTeams());
    }
    // Safety: If projects list is empty (on refresh), fetch it again
    if (projects.length === 0) {
      dispatch(fetchBMProjects());
    }
  }, [projectId, dispatch, projects.length]);

  // FIND THE PROJECT
  const currProject = projects.find(project => String(project._id) === String(projectId));

  // CONDITIONAL RENDERING:
  // 1. If we are still waiting for projects to load, show Loading...
  if (projects.length === 0) {
    return (
      <Container className="text-center mt-5">
        <h2>Loading project data...</h2>
      </Container>
    );
  }

  // 2. If projects loaded but this ID doesn't exist, show Not Found
  if (!currProject) {
    return (
      <Container className={`${styles['project-details']} text-center mt-5`}>
        <h2 className="text-danger">Project Not Found</h2>
        <p>Please check if the project exists or try selecting another project.</p>
      </Container>
    );
  }

  // 3. Render Dashboard
  return (
    <Container
      fluid
      className={`${darkMode ? styles['project-details-dark'] : styles['project-details']}`}
    >
      <Row className="justify-content-center">
        <Col xs="12" lg="10">
          <h1
            className={`${
              darkMode ? styles['project-details-title-dark'] : styles['project-details-title']
            } mb-2`}
          >
            {currProject.name} Dashboard{' '}
          </h1>

          <LogBar projectId={projectId} />

          <Row className="mt-4">
            <Col md="6" className="mb-4">
              <RentedToolsDisplay projectId={projectId} />
            </Col>
            <Col md="6" className="mb-4">
              <MaterialsDisplay projectId={projectId} />
            </Col>
          </Row>

          <ProjectLog projectId={projectId} />
        </Col>
      </Row>
    </Container>
  );
}

export default ProjectDetails;
