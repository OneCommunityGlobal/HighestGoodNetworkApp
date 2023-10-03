import { Row, Col, Container, Form, Button, FormGroup, Label, Input } from 'reactstrap';
//import { ProjectsList } from './ProjectsList';
import './BMDashboard.css';

export const BMDashboard = () => {
  return (
    // <div style={{ textAlign: 'center', marginTop: '5rem' }}>
    //   <h2>Building and Inventory Management Dashboard</h2>
    // </div>
    <Container className="d-flex justify-content-center align-items-center mw-80 px-4">
      <Form className="w-75 p-3">
        <Row className="ml-0">
          <Col className="text-center">
            <h1 className="bm-dashboard__header">Building and Inventory Management Dashboard</h1>
          </Col>
        </Row>
        <Row className="ml-0 gx-5" md="2" sm="1" xs="1">
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
            <Button className="w-100 bm-dashboard__button">
              Go to Project Dashboard
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default BMDashboard;
