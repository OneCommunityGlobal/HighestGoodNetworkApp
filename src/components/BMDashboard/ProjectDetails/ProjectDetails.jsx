import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import LogBar from './LogBar';
import RentedTools from './RentedTools/RentedTools';
import Materials from './Materials/Materials';
import ProjectLog from './ProjectLog';
import './ProjectDetails.css';
//import { boxStyle } from 'styles';

function ProjectDetails() {
  return (
    <Container className='project-details'>
      <h3>Project A Dashboard</h3>
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
