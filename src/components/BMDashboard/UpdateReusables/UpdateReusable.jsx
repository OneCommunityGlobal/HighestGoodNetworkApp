import { useState } from 'react';
import { Container, FormGroup, Input, Label, Form, Col, Button } from 'reactstrap';

function UpdateReusable() {
  const [reusable, setReusable] = useState('');
  const [projectName, setProjectName] = useState('');
  const [date, setDate] = useState('');
  const [available, setAvailable] = useState('');
  const [quantityUsed, setQuantityUsed] = useState('');
  const [quantityWasted, setQuantityWasted] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <FormGroup row className="align-items-center justify-content-center">
          <Label for="reusable" sm={6} className="reusable-form-label">
            Reusable
          </Label>
          <Col sm={6} className="reusable-form-value">
            <b>Reusable Name</b>
          </Col>
        </FormGroup>

        <FormGroup row className="align-items-center justify-content-center">
          <Label for="projectName" sm={6} className="reusable-form-label">
            Project Name
          </Label>
          <Col sm={6} className="reusable-form-value">
            <b>Project Name</b>
          </Col>
        </FormGroup>

        <FormGroup row className="align-items-center justify-content-center">
          <Label for="projectName" sm={6} className="reusable-form-label">
            Date
          </Label>
          <Col sm={6} className="reusable-form-value">
            <b>Date</b>
          </Col>
        </FormGroup>

        <FormGroup row className="align-items-center justify-content-center">
          <Label for="projectName" sm={6} className="reusable-form-label">
            Available
          </Label>
          <Col sm={6} className="reusable-form-value">
            <b>Available</b>
          </Col>
        </FormGroup>

        <FormGroup row className="align-items-center">
          <Label for="quantityUsed" sm={5} className="reusable-form-label">
            Quantity Used
          </Label>
          <Col sm={3} className="reusable-form-value">
            <Input
              type="text"
              id="quantityUsed"
              value={quantityUsed}
              onChange={e => setQuantityUsed(e.target.value)}
            />
          </Col>
          <Col sm={3}>
            <Input type="select" />
          </Col>
        </FormGroup>

        <FormGroup row className="align-items-center">
          <Label for="quantityWasted" sm={5} className="reusable-form-label">
            Quantity Wasted
          </Label>
          <Col sm={3} className="reusable-form-value">
            <Input
              type="text"
              id="quantityWasted"
              value={quantityWasted}
              onChange={e => setQuantityWasted(e.target.value)}
            />
          </Col>
          <Col sm={3}>
            <Input type="select" />
          </Col>
        </FormGroup>

        <FormGroup row className="justify-content-end">
          <Col sm={5}>
            <Button className="reusable-button-bg" type="submit">
              Update Reusable
            </Button>
          </Col>
        </FormGroup>
      </Form>
    </Container>
  );
}

export default UpdateReusable;
