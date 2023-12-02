import { Container } from 'reactstrap';
import ProjectsList from './Projects/ProjectsList';
import ProjectSelectForm from './Projects/ProjectSelectForm';
import './BMDashboard.css';

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

export function BMDashboard() {
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
}

export default BMDashboard;
