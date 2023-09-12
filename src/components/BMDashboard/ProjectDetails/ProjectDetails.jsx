import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import LogBar from './LogBar';
import RentedToolsDisplay from './RentedTools/RentedToolsDisplay';
import MaterialsDisplay from './Materials/MaterialsDisplay';
import ProjectLog from './ProjectLog';
import './ProjectDetails.css';

function ProjectDetails() {
  return (
    <Container fluid className="project-details">
      <h3>Project A Dashboard</h3>
      <Row>
        <LogBar />
      </Row>
      <Row>
        <Col md="6" sm="12">
          <RentedToolsDisplay />
        </Col>
        <Col md="6" sm="12">
          <MaterialsDisplay />
        </Col>
      </Row>
      <Row>
        <ProjectLog />
      </Row>
    </Container>
  );
}

export default ProjectDetails;
