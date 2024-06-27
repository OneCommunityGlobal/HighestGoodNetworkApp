import { Container } from 'reactstrap';
// import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import BMTimeLogDisplayMember from './BMTimeLogDisplayMember';

// function BMTimeLogCard({ selectedProject }) {
function BMTimeLogMembers() {
  const projectInfo = useSelector(state => state.bmProjectMembers);
  const membersList = projectInfo.members;
  console.log('membersList: ', membersList);

  return (
    <Container className="project-details" fluid>
      {membersList.map((value, index) => (
        <BMTimeLogDisplayMember
          firstName={value.user.firstName}
          lastName={value.user.lastName}
          index={index}
        />
      ))}
    </Container>
  );
}

export default BMTimeLogMembers;
