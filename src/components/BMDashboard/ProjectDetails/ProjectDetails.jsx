import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import LogBar from './LogBar';
import RentedTools from './RentedTools/RentedTools';
import Materials from './Materials/Materials';
import ProjectLog from './ProjectLog';

function ProjectDetails() {
  return (
    <Container>
      <h2>Project A Dashboard</h2>
      <Row>
        <LogBar />
      </Row>
      <Row>
        <Col>
          <RentedTools />
        </Col>
        <Col>
          <Materials />
        </Col>
      </Row>
      <Row>
        <ProjectLog />
      </Row>
    </Container>
  );
}

export default ProjectDetails;
