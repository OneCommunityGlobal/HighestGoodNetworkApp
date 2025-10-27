import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container } from 'reactstrap';
import { fetchBMProjects } from '../../actions/bmdashboard/projectActions';
import ProjectsList from './Projects/ProjectsList';
import ProjectSelectForm from './Projects/ProjectSelectForm';
import BMError from './shared/BMError';
import './BMDashboard.module.css';

export function BMDashboard() {
  const [isError, setIsError] = useState(false);

  const dispatch = useDispatch();
  const errors = useSelector(state => state.errors || {});
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  // fetch projects data on pageload
  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  // trigger an error state if there is an errors object
  useEffect(() => {
    if (Object.entries(errors).length) {
      setIsError(true);
    }
  }, [errors]);

  return (
    <Container
      className={`justify-content-center align-items-center bm-dashboard-container ${
        darkMode ? 'bm-dashboard-dark' : ''
      }`}
    >
      <header className={`bm-dashboard__header ${darkMode ? 'bm-dashboard__header-dark' : ''}`}>
        <h1 className={darkMode ? 'text-light' : ''}>
          Building and Inventory Management Dashboard
        </h1>
      </header>
      <main className={darkMode ? 'bm-dashboard-main-dark' : ''}>
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
