import { useState } from 'react';
import { Container, Row, Col, Form, FormGroup, Input, Button, Label } from 'reactstrap';
import './AddMaterials.css';

export default function AddMaterials() {
  const [project, setProject] = useState();
  return (
    <Container fluid className="add-materials-page">
      <Form className="add-materials-form">
        <Row>
          <Col>
            <h1>ADD MATERIAL</h1>
          </Col>
        </Row>
        <Row>
          <Col xs="12" sm="8" m="8">
            <FormGroup>
              <Label for="project">Project</Label>
              <Input
                id="project"
                name="project"
                type="select"
                value={project}
                onChange={e => {
                  setProject(e.target.value);
                }}
              >
                <option>Project1</option>
                <option>Project2</option>
                <option>Project3</option>
              </Input>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col xs="12" sm="8">
            <FormGroup>
              <Label for="material">Material Name</Label>
              <Input id="material" name="material" type="select">
                <option>Material1</option>
                <option>Material2</option>
                <option>Material3</option>
              </Input>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col xs="12" sm="8">
            <FormGroup>
              <Label for="invoice">Invoice Number or ID</Label>
              <Input id="invoice" name="invoice" type="number" />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormGroup>
              <Label for="unitPrice">Unit Price excl. taxes & shipping</Label>
              <Input id="unitPrice" name="unitPrice" type="number" />
            </FormGroup>
          </Col>
          <Col>
            <FormGroup>
              <Label for="currency">Currency</Label>
              <Input id="currency" name="currency" type="select">
                <option>USD</option>
                <option>DIN</option>
                <option>PND</option>
              </Input>
            </FormGroup>
          </Col>
          <Col>
            <FormGroup>
              <Label for="quantity">Total Qty</Label>
              <Input id="quantity" name="quantity" type="number" />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormGroup>
              <Label for="measurement">Qty Unit of Measurement</Label>
              <Input id="measurement" name="measurement" type="select">
                <option>Cubic Yard</option>
                <option>Cubic Foot</option>
              </Input>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormGroup>
              <Label for="purchasedDate">Purchased Date</Label>
              <Input id="purchasedDate" name="purchasedDate" type="date" />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormGroup>
              <Label for="shippingFee">Shipping Fee excluding taxes enter 0 if free</Label>
              <Input id="shippingFee" name="shippingFee" type="number" />
            </FormGroup>
          </Col>
          <Col>
            <FormGroup>
              <Label for="taxes">Taxes</Label>
              <Input id="taxes" name="taxes" type="number" />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormGroup>
              <Label for="phone">Supplier Phone Number</Label>
              <Input id="phone" name="phone" type="number" />
            </FormGroup>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}
