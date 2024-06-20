import { Container } from 'reactstrap';
// import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

// function BMTimeLogCard({ selectedProject }) {
function BMTimeLogMembers() {
  const membersList = useSelector(state => state.bmProjectMembers);

  console.log('membersList: ', membersList);

  return (
    <Container className="project-details" fluid>
      {/* <Row className="mx-auto">
        <h1>projects: {projects}</h1>
      </Row> */}
      {/* <Row className="project-summary_item mx-auto">
        <Col xs={summaryLabelCol}>
          <Label className="project-summary_label">Total members:</Label>
        </Col>
        <Col xs="3">
          <span className="project-summary_span">{members.length}</span>
        </Col>
      </Row> */}
    </Container>
  );
}

export default BMTimeLogMembers;
