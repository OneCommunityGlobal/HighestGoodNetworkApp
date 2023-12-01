import { Form, FormGroup, Label, Input, Row, Col, Button } from 'reactstrap';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
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
      <Row>
        <Col>
          <FormGroup>
            <Label for="purchase-rental">Purchase or Rental</Label>
            <Input id="purchase-rental" type="select" name="purchase-rental">
              <option>Purchase</option>
              <option>Rental</option>
            </Input>
          </FormGroup>
        </Col>
        <Col>
          <FormGroup>
            <Label for="condition">Condition</Label>
            <Input id="condition" type="select" name="condition">
              <option>New</option>
              <option>Used</option>
            </Input>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <FormGroup>
            <Label for="from-date">Purchase/Rental Date</Label>
            <Input id="from-date" type="date" name="from-date" />
          </FormGroup>
        </Col>
        <Col>
          <FormGroup>
            <Label for="to-date">Return date (if rented)</Label>
            <Input id="to-date" type="date" name="to-date" />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <FormGroup>
            <Label for="shipping-fee">Shipping Fee excluding taxes (enter 0 if free)</Label>
            <Input id="shipping-fee" type="number" name="shipping-fee" placeholder="100.00" />
          </FormGroup>
        </Col>
        <Col>
          <FormGroup>
            <Label for="taxes">Taxes</Label>
            <Input id="taxes" type="number" name="taxes" placeholder="%" />
          </FormGroup>
        </Col>
      </Row>
      <FormGroup>
        <Label for="phone-number">Supplier Phone Number</Label>
        <PhoneInput  id="phone-number" name="phone-number"/>
      </FormGroup>
    </Form>
  );
}
