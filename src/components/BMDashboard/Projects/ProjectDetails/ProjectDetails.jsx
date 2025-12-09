import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { Container, Row, Col } from 'reactstrap';
import LogBar from './LogBar';
import RentedToolsDisplay from './RentedTools/RentedToolsDisplay';
import MaterialsDisplay from './Materials/MaterialsDisplay';
import ProjectLog from './ProjectLog';
import styles from './ProjectDetails.module.css';
import { fetchBMProjects } from '../../../../actions/bmdashboard/projectActions';

function ProjectDetails() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchBMProjects());
  }, []);
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
