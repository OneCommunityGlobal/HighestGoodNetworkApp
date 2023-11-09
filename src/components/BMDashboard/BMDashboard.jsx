import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container } from 'reactstrap';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import { connect } from 'react-redux';
import { fetchAllProjects } from '../../actions/bmdashboard/projectActions';
import ProjectsList from './Projects/ProjectsList';
import ProjectSelectForm from './Projects/ProjectSelectForm';
import './BMDashboard.css';

export function BMDashboard() {
  const dispatch = useDispatch();
  const projects = useSelector(state => state.bmProjects);
  const errors = useSelector(state => state.errors);

  console.log('PROJECTS', projects);
  console.log('ERRORS', errors);

  // fetch projects data on pageload
  useEffect(() => {
    dispatch(fetchAllProjects());
  }, []);

  return (
    <Container className="justify-content-center align-items-center mw-80 px-4">
      <header className="bm-dashboard__header">
        <h1>Building and Inventory Management Dashboard</h1>
      </header>
      <main>
        {projects.length ? (
          <>
            <ProjectSelectForm projects={projects} />
            <ProjectsList projects={projects} />
          </>
        ) : (
          <div>Loading...</div>
        )}
      </main>
    </Container>
  );
}

export default BMDashboard;
