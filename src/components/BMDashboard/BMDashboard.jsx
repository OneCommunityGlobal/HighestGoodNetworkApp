import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container } from 'reactstrap';
import { fetchBMProjects } from '../../actions/bmdashboard/projectActions';
import ProjectsList from './Projects/ProjectsList';
import ProjectSelectForm from './Projects/ProjectSelectForm';
import BMError from './shared/BMError';
import './BMDashboard.css';

export function BMDashboard() {
  const [isError, setIsError] = useState(false);

  const dispatch = useDispatch();
  const errors = useSelector(state => state.errors);

  // fetch projects data on pageload
  useEffect(() => {
    dispatch(fetchBMProjects());
  }, []);

  // trigger an error state if there is an errors object
  useEffect(() => {
    if (Object.entries(errors).length) {
      setIsError(true);
    }
  }, [errors]);

  return (
    <Container className="justify-content-center align-items-center">
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
