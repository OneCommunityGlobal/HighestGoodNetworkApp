import { useParams } from 'react-router-dom';
import { Container, Row } from 'reactstrap';
// import LogBar from './LogBar';
// import RentedToolsDisplay from './RentedTools/RentedToolsDisplay';
// import MaterialsDisplay from './Materials/MaterialsDisplay';
// import ProjectLog from '../ProjectLog';
// import '../ProjectDetails.css';

function BMTimeLogProjectDetails() {
  const { projectId } = useParams();
  return (
    <Container className="project-details" fluid>
      <Row className="mx-auto">
        <h1>Project {projectId} Dashboard</h1>
      </Row>
    </Container>
  );
}

export default BMTimeLogProjectDetails;
