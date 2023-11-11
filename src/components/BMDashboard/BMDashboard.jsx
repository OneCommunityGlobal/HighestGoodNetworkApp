import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container } from 'reactstrap';
import { fetchAllProjects } from '../../actions/bmdashboard/projectActions';
import ProjectsList from './Projects/ProjectsList';
import ProjectSelectForm from './Projects/ProjectSelectForm';
import BMError from './shared/BMError';
import './BMDashboard.css';

export function BMDashboard() {
  const [isError, setIsError] = useState(false);

  const dispatch = useDispatch();
  const projects = useSelector(state => state.bmProjects);
  const errors = useSelector(state => state.errors);

  console.log('PROJECTS', projects);
  console.log('ERRORS', errors);

  // fetch projects data on pageload
  useEffect(() => {
    dispatch(fetchAllProjects());
  }, []);

  // trigger an error state if there is an errors object
  useEffect(() => {
    if (Object.entries(errors).length) {
      setIsError(true);
    }
  }, [errors]);

  console.log(Object.entries(errors).length);
  console.log(isError);

  return (
    <Container className="justify-content-center align-items-center mw-80 px-4">
      <header className="bm-dashboard__header">
        <h1>Building and Inventory Management Dashboard</h1>
      </header>
      <main>
        {isError ? (
          <BMError errors={errors} />
        ) : (
          <>
            <ProjectSelectForm />
            <ProjectsList />
          </>
        )}
      </main>
    </Container>
  );
}

export default BMDashboard;
