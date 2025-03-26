import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import BMError from '../shared/BMError';
import { fetchBMProjectMembers } from '../../../actions/bmdashboard/projectMemberAction';
import BMTimeLogDisplayMember from './BMTimeLogDisplayMember';

// function BMTimeLogCard({ selectedProject }) {
function BMTimeLogCard(props) {
  // const state = useSelector();

  const [isError, setIsError] = useState(false);
  const [memberList, setMemberList] = useState([]);
  const [isMemberFetched, setIsMemberFetched] = useState(false);

  const dispatch = useDispatch();
  const errors = useSelector(state => state.errors);
  const projectInfo = useSelector(state => state.bmProjectMembers);

  useEffect(() => {
    dispatch(fetchBMProjectMembers(props.selectedProject));
  }, [props.selectedProject, dispatch]);

  useEffect(() => {
    if (projectInfo && projectInfo.members) {
      setMemberList(projectInfo.members);
      setIsMemberFetched(true);
    }
  }, [projectInfo]);

  // trigger an error state if there is an errors object
  useEffect(() => {
    if (Object.entries(errors).length > 0) {
      setIsError(true);
    }
  }, [errors]);

  return (
    <Container fluid>
      {isMemberFetched && (
        <Row>
          {memberList.map((value, index) => (
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
      )}
      {isError && <BMError errors={errors} />}
    </Container>
  );
}

export default BMTimeLogCard;
