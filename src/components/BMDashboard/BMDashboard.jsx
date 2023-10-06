import { Row, Col, Container, Form, Button } from 'reactstrap';
import  ProjectsList  from './Projects/ProjectsList';
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


export const BMDashboard = () => {
  return (
    <Container className="justify-content-center align-items-center mw-80 px-4">
      <header className="bm-dashboard__header">
        <h1>Building and Inventory Management Dashboard</h1>
      </header>
      <main>
        <Form className="w-100 p-3  text-center">
          <Row className="ml-0 gx-5 w-75" md="2" sm="1" xs="1">
            <ProjectSelectForm projects={dummyProjects} />
            <Col className="p-3">
              <Button className="bm-dashboard__button w-100">Go to Project Dashboard</Button>
            </Col>
          </Row>
        </Form>
        <Row className="ml-0 mt-2 text-center">
          <ProjectsList projects={dummyProjects} />
        </Row>
      </main>
    </Container>
  );
};

export default BMDashboard;
