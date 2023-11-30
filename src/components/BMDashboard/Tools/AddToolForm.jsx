import { Form, FormGroup, Label, Input, Row, Col, Button } from 'reactstrap';
import { boxStyle } from 'styles';
import './AddToolForm.css';

export default function AddToolForm() {
  return (
    <Form className="add-tool-form">
      <FormGroup>
        <Label for="select-project">Project</Label>
        <Input id="select-project" name="project" type="select">
          <option>Project 1</option>
          <option>Project 2</option>
        </Input>
      </FormGroup>
      <Row>
        <Col>
          <FormGroup>
            <Label for="select-category">Tool or Equipment</Label>
            <Input id="select-category" name="category" type="select">
              <option>Tool</option>
              <option>Equipment</option>
            </Input>
          </FormGroup>
        </Col>
        <Col>
          <FormGroup>
            <Label for="select-name">Name</Label>
            <Input id="select-name" name="name" type="select">
              <option>Tool 1</option>
              <option>Tool 2</option>
            </Input>
          </FormGroup>
        </Col>
      </Row>
      <FormGroup>
        <Label for="invoice-number">Invoice Number or ID</Label>
        <Input
          id="invoice-number"
          type="number"
          name="invoice"
          placeholder="Input Invoice No or  ID for the tool or equipment"
        />
      </FormGroup>
      <Row>
        <Col sm={6}>
          <FormGroup>
            <Label for="unit-price">Unit Price (excl.taxes & shipping)</Label>
            <Input id="unit-price" type="number" name="unit-price" />
          </FormGroup>
        </Col>
        <Col sm={2}>
          <FormGroup>
            <Label for="currency">Currency</Label>
            <Input id="currency" type="select" name="currency">
              <option>USD</option>
              <option>EUR</option>
              <option>CAD</option>
            </Input>
          </FormGroup>
        </Col>
        <Col sm={4}>
          <FormGroup>
            <Label for="quantity">Total quantity</Label>
            <Input id="quantity" type="number" name="quantity" />
          </FormGroup>
        </Col>
      </Row>
    </Form>
  );
}
