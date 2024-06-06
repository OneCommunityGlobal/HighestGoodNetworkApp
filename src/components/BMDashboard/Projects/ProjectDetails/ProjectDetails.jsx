import { useParams } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import LogBar from './LogBar';
import RentedToolsDisplay from './RentedTools/RentedToolsDisplay';
import MaterialsDisplay from './Materials/MaterialsDisplay';
import ProjectLog from './ProjectLog';
import './ProjectDetails.css';

function ProjectDetails() {
  const { projectId } = useParams();

  return (
    <Container className="project-details" fluid>
      <Row className="mx-auto">
        <h1>Project {projectId} Dashboard</h1>
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
