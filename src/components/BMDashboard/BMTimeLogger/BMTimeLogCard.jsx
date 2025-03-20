import { useState, useEffect } from 'react';
import { Container } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import BMError from '../shared/BMError';
import { fetchBMProjectMembers } from '../../../actions/bmdashboard/projectMemberAction';
import BMTimeLogMembers from './BMTimeLogMembers';
import BMTimeLogMemberInfo from './BMTimeLogMemberInfo';

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
      <BMTimeLogMemberInfo members={memberList} />

      {isMemberFetched && <BMTimeLogMembers membersList={memberList} />}
      {isError && <BMError errors={errors} />}
    </Container>
  );
}

export default BMTimeLogCard;
