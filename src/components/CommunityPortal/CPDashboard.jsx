import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container } from 'reactstrap';
// import { fetchBMProjects } from '../../actions/bmdashboard/projectActions';
// import ProjectsList from './Projects/ProjectsList';
// import ProjectSelectForm from './Projects/ProjectSelectForm';
// import BMError from './shared/BMError';
import './CPDashboard.css';

export function CPDashboard() {


  return (
    <Container className="justify-content-center align-items-center">
      <header className="cp-dashboard__header">
        <h1>Community Portal </h1>
      </header>
      <main>

      </main>
    </Container>
  );
}

export default CPDashboard;
