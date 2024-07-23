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
  const [memberList, setMemberList] = useState(false);
  const [isMemberFetched, setIsMemberFetched] = useState(false);

  const dispatch = useDispatch();
  const errors = useSelector(state => state.errors);

  useEffect(() => {
    dispatch(fetchBMProjectMembers(props.selectedProject));
  }, [props.selectedProject]);

  useEffect(() => {}, [memberList]);

  useEffect(() => {
    if (memberList) {
      setIsMemberFetched(true);
    }
  }, [memberList]);

  // trigger an error state if there is an errors object
  useEffect(() => {
    if (Object.entries(errors).length) {
      setIsError(true);
    }
  }, [errors]);

  return (
    <Container fluid>
      <BMTimeLogMemberInfo setMemberList={setMemberList} />

      {isMemberFetched ? <BMTimeLogMembers membersList={memberList} /> : null}
      {isError ? <BMError errors={errors} /> : null}
    </Container>
  );
}

export default BMTimeLogCard;
