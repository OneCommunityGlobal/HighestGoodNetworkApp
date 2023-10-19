import { Container } from 'reactstrap';
import ProjectsList from './Projects/ProjectsList';
import ProjectSelectForm from './Projects/ProjectSelectForm';
import './BMDashboard.css';
//TO DO: add error state, add loading state, update dummy projects to a more complex structure (see database and wireframe)
const dummyProjects = [
  {
    projectId: 1,
    projectName: 'Big project',
  },
  {
    projectId: 2,
    projectName: 'Bigger project',
  },
  {
    projectId: 3,
    projectName: 'Very important project',
  },
  {
    projectId: 4,
    projectName: 'Super important project',
  },
];

export const BMDashboard = () => {
  return (
    <Container className="justify-content-center align-items-center mw-80 px-4">
      <header className="bm-dashboard__header">
        <h1>Building and Inventory Management Dashboard</h1>
      </header>
      <main>
        <ProjectSelectForm projects={dummyProjects} />
        <ProjectsList projects={dummyProjects} />
      </main>
    </Container>
  );
};

export default BMDashboard;
