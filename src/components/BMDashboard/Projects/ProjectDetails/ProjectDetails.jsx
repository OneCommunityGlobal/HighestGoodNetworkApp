import { useSelector } from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import LogBar from './LogBar';
import RentedToolsDisplay from './RentedTools/RentedToolsDisplay';
import MaterialsDisplay from './Materials/MaterialsDisplay';
import ProjectLog from './ProjectLog';
import './ProjectDetails.css';

function ProjectDetails({ projectId }) {
  // ✅ Accept projectId as a prop
  const projects = useSelector(state => state.bmProjects) || [];
  const currProject = projects.find(project => String(project._id) === String(projectId));

  if (!currProject) {
    return (
      <Container className="project-details text-center mt-5">
        <h2 className="text-danger">Project Not Found</h2>
        <p>Please check if the project exists or try selecting another project.</p>
      </Container>
    );
  }

  return (
    <Container className="project-details" fluid>
      <Row className="mx-auto">
        <h1>Project {currProject.name} Dashboard</h1>
      </Row>
      <Row className="mx-auto">
        <LogBar projectId={projectId} />
      </Row>
      <Row className="mx-auto">
        <Col lg="6" md="12">
          <RentedToolsDisplay />
        </Col>
        <Col lg="6" md="12">
          <MaterialsDisplay />
        </Col>
      </Row>
      <Row className="mx-auto">
        <ProjectLog />
      </Row>
    </Container>
  );
}

export default ProjectDetails;
