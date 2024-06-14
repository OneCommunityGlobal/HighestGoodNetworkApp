// import { useParams } from 'react-router-dom';
// import { Container, Row, Col } from 'reactstrap';
import { useState, useEffect } from 'react';
import { Container, Row } from 'reactstrap';
// import { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import LogBar from './LogBar';
// import RentedToolsDisplay from './RentedTools/RentedToolsDisplay';
// import MaterialsDisplay from './Materials/MaterialsDisplay';
// import ProjectLog from './ProjectLog';
// import './ProjectDetails.css';

import { fetchAllMembers } from '../../../actions/projectMembers';

// function BMTimeLogCard({ selectedProject }) {
function BMTimeLogCard(props) {
  // const state = useSelector();
  const [membersList, setMembersList] = useState();
  // console.log('props.state: ', state);
  console.log('props.selectedProject: ', props.selectedProject);

  useEffect(() => {
    fetchAllMembers(props.selectedProject);
  }, [props.selectedProject]);

  useEffect(() => {
    setMembersList(props.selectedProject);
  }, [props.selectedProject]);

  console.log('membersList: ', membersList);

  // const selectedProjectForDisplay = projects.filter(project => project._id === selectedProject);

  // console.log('selectedProjectForDisplay: ', selectedProjectForDisplay);

  // if (selectedProjectForDisplay.length > 0) {
  //   console.log('members: ', selectedProjectForDisplay[0].members);
  // }

  // const { members } = selectedProject;

  // const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // useEffect(() => {
  //   const handleResize = () => {
  //     setWindowWidth(window.innerWidth);
  //   };

  //   window.addEventListener('resize', handleResize);

  //   return () => {
  //     window.removeEventListener('resize', handleResize);
  //   };
  // }, []);

  // const summaryLabelCol = windowWidth < 700 ? '6' : '4';

  return (
    <Container className="project-details" fluid>
      <Row className="mx-auto">
        <h1>TimeLogger for {props.selectedProject}</h1>
      </Row>

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

export default BMTimeLogCard;
