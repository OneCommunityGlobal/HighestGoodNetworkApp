import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import LogBar from './LogBar';
import RentedToolsDisplay from './RentedTools/RentedToolsDisplay';
import MaterialsDisplay from './Materials/MaterialsDisplay';
import ProjectLog from './ProjectLog';
import './ProjectDetails.css';

function ProjectDetails() {
  return (
    <Container className="project-details" fluid>
      <h3>Project A Dashboard</h3>
      <Row>
        <LogBar />
      </Row>
      <Row>
        <Col lg="6" md="12">
          <RentedToolsDisplay />
        </Col>
        <Col lg="6" md="12">
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
