import { useSelector } from 'react-redux';
import { Row, Col } from 'reactstrap';
import BMTimeLogDisplayMember from './BMTimeLogDisplayMember';

// function BMTimeLogCard({ selectedProject }) {
function BMTimeLogMembers() {
  const projectInfo = useSelector(state => state.bmProjectMembers);
  const membersList = projectInfo.members;
  // console.log('membersList: ', membersList);

  return (
    <Row>
      {membersList.map((value, index) => (
        <Col md={4} key={value.user._id}>
          <BMTimeLogDisplayMember
            firstName={value.user.firstName}
            lastName={value.user.lastName}
            role={value.user.role}
            index={index}
          />
        </Col>
      ))}
    </Row>
  );
}

export default BMTimeLogMembers;
