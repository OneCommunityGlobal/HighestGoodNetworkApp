import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import { Row, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import './AddMaterialForm.css';

// AddMaterialsForm will take in an array of project objects
// and optionally a selected project object
export default function AddMaterialsForm(props) {
  const { allProjects, selectedProject, canAddNewMaterial } = props;
  const [project, setProject] = useState(allProjects[0]._id);
  const [material, setMaterial] = useState('');
  const [newMaterial, setNewMaterial] = useState(false);
  const [invoice, setInvoice] = useState('');
  const [unitPrice, setUnitPrice] = useState(0);
  const [currency, setCurrency] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [measurement, setMeasurement] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [shippingFee, setShippingFee] = useState(0);
  const [taxes, setTaxes] = useState('');
  const [phone, setPhone] = useState('');
  // state for image?
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');

  const history = useHistory();

  const handleSubmit = e => {
    e.preventDefault();
  };

  const handleCancel = e => {
    e.preventDefault();
    history.goBack();
  };

  return (
    <Form className="add-materials-form">
      <Row>
        <Col>
          <h1 style={{ fontSize: '1.3rem' }}>ADD MATERIAL</h1>
        </Col>
      </Row>
      <Row>
        <Col xs="12" sm="8">
          <FormGroup>
            <Label for="project">Project</Label>
            <Input
              id="project"
              name="project"
              type="select"
              value={selectedProject ? selectedProject._id : project}
              onChange={e => {
                setProject(e.target.value);
              }}
            >
              {allProjects.map(el => (
                <option value={el._id} key={el._id}>
                  {el.projectName}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col xs="12" sm="8">
          <FormGroup>
            <Label for="material">Material Name</Label>
            {newMaterial ? (
              <Input
                id="material"
                name="material"
                type="text"
                value={material}
                placeholder="Add new material"
                onChange={e => setMaterial(e.target.value)}
              />
            ) : (
              <Input
                id="material"
                name="material"
                type="select"
                value={material}
                onChange={e => setMaterial(e.target.value)}
              >
                <option value="gravel">Gravel</option>
                <option value="sand">Sand</option>
                <option value="brick">Brick</option>
              </Input>
            )}
          </FormGroup>
        </Col>
      </Row>
      {canAddNewMaterial && (
        <Row>
          <Col>
            <FormGroup>
              <input
                id="newMaterial"
                name="newMaterial"
                type="checkbox"
                checked={newMaterial}
                onChange={() => setNewMaterial(!newMaterial)}
              />
              <label htmlFor="newMaterial">Do you want to add a new material?</label>
            </FormGroup>
          </Col>
        </Row>
      )}
      <Row>
        <Col xs="12" sm="8">
          <FormGroup>
            <Label for="invoice">Invoice Number or ID</Label>
            <Input
              id="invoice"
              name="invoice"
              value={invoice}
              placeholder="Input Invoice No or ID for the material"
              onChange={e => {
                setInvoice(e.target.value);
              }}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col xs="12" sm="6">
          <FormGroup>
            <Label for="unitPrice">Unit Price excl. taxes & shipping</Label>
            <Input
              id="unitPrice"
              name="unitPrice"
              type="number"
              value={unitPrice}
              onChange={e => {
                setUnitPrice(e.target.value);
              }}
            />
          </FormGroup>
        </Col>
        <Col>
          <FormGroup>
            <Label for="currency">Currency</Label>
            <Input
              id="currency"
              name="currency"
              type="select"
              value={currency}
              onChange={e => {
                setCurrency(e.target.value);
              }}
            >
              <option>USD</option>
              <option>EUR</option>
              <option>JPY</option>
            </Input>
          </FormGroup>
        </Col>
        <Col>
          <FormGroup>
            <Label for="quantity">Total Qty</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              value={quantity}
              min={0}
              onChange={e => {
                setQuantity(e.target.value);
              }}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col xs="12" sm="5">
          <FormGroup>
            <Label for="measurement">Qty Unit of Measurement</Label>
            <Input
              id="measurement"
              name="measurement"
              type="select"
              value={measurement}
              onChange={e => {
                setMeasurement(e.target.value);
              }}
            >
              <option>Cubic Yard</option>
              <option>Cubic Foot</option>
            </Input>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col xs="12" sm="5">
          <FormGroup>
            <Label for="purchasedDate">Purchased Date</Label>
            <Input
              id="purchasedDate"
              name="purchasedDate"
              type="date"
              value={purchaseDate}
              onChange={e => {
                setPurchaseDate(e.target.value);
              }}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col xs="12" sm="8">
          <FormGroup>
            <Label for="shippingFee">Shipping Fee excluding taxes enter 0 if free</Label>
            <Input
              id="shippingFee"
              name="shippingFee"
              type="number"
              min={0}
              value={shippingFee}
              onChange={e => {
                setShippingFee(e.target.value);
              }}
            />
          </FormGroup>
        </Col>
        <Col>
          <FormGroup>
            <Label for="taxes">Taxes</Label>
            <Input
              id="taxes"
              name="taxes"
              type="number"
              placeholder="%"
              min={0}
              value={taxes}
              onChange={e => {
                setTaxes(e.target.value);
              }}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <FormGroup>
            <Label for="phone">Supplier Phone Number</Label>
            {/* <Input id="phone" name="phone" type="number" /> */}
            <PhoneInput
              id="phone"
              name="phone"
              country="US"
              regions={['america', 'europe', 'asia', 'oceania', 'africa']}
              limitMaxLength="true"
              value={phone}
              onChange={e => {
                setPhone(e.target.value);
              }}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <FormGroup>
            <Label for="material-image">Upload Material Picture</Label>
            <Input id="material-image" name="material-image" type="image" />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <FormGroup>
            <Label for="link">Link to Buy</Label>
            <Input
              id="link"
              name="link"
              type="url"
              placeholder="https://"
              value={link}
              onChange={e => {
                setLink(e.target.value);
              }}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <FormGroup>
            <Label for="description">Material Description</Label>
            <Input
              id="description"
              name="description"
              type="textarea"
              placeholder="Describe your material in detail."
              value={description}
              onChange={e => {
                setDescription(e.target.value);
              }}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <div className="total-price">
            <span>
              <b>Total Price</b>
            </span>
            <span>
              <b>
                {quantity * unitPrice} <span style={{ fontSize: '1rem' }}>{currency}</span>
              </b>
            </span>
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button type="button" color="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </Col>
        <Col>
          <Button type="submit" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
