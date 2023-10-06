import { Row, Col, Container, Form, Button, FormGroup, Label, Input } from 'reactstrap';
import { ProjectsList } from './Projects/ProjectsList';
import './BMDashboard.css';

export const BMDashboard = () => {
  return (
    <Container className="justify-content-center align-items-center mw-80 px-4">
      <Row className="ml-0 mt-5">
        <Col className="text-center">
          <h1 className="bm-dashboard__header">Building and Inventory Management Dashboard</h1>
        </Col>
      </Row>
      <Form className="w-100 p-3  text-center">
        <Row className="ml-0 gx-5 w-75" md="2" sm="1" xs="1">
          <Col className="p-3">
            <Label for="exampleSelect" hidden>
              Select
            </Label>
            <Input id="exampleSelect" name="select" type="select">
              <option default>Select a project</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
            </Input>
          </Col>
          <Col className="p-3">
            <Button className="w-100 bm-dashboard__button">Go to Project Dashboard</Button>
          </Col>
        </Row>
      </Form>
      <Row className="ml-0 mt-5 text-center" >
        <ProjectsList />
      </Row>
    </Container>
  );
};

export default BMDashboard;
