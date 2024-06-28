import { useState, useEffect } from 'react';
import { Container } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import BMError from '../shared/BMError';
import { fetchBMProjectMembers } from '../../../actions/bmdashboard/projectMemberAction';
import BMTimeLogMembers from './BMTimeLogMembers';

// function BMTimeLogCard({ selectedProject }) {
function BMTimeLogCard(props) {
  // const state = useSelector();
  const [isError, setIsError] = useState(false);

  const dispatch = useDispatch();
  const errors = useSelector(state => state.errors);

  // console.log('props.state: ', state);
  console.log('props.selectedProject: ', props.selectedProject);

  useEffect(() => {
    dispatch(fetchBMProjectMembers(props.selectedProject));
  }, [props.selectedProject]);

  // trigger an error state if there is an errors object
  useEffect(() => {
    if (Object.entries(errors).length) {
      setIsError(true);
    }
  }, [errors]);

  return (
    <Container fluid>
      {isError ? (
        <BMError errors={errors} />
      ) : (
        <BMTimeLogMembers selectedProject={props.selectedProject} />
      )}
    </Container>
  );
}

export default BMTimeLogCard;
