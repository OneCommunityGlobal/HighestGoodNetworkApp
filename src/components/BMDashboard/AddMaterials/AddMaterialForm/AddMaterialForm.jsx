import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import { Row, Col, Form, FormGroup, Label, Input, Button, FormFeedback } from 'reactstrap';
import './AddMaterialForm.css';

// AddMaterialsForm will take in an array of project objects
// and optionally a selected project object
export default function AddMaterialsForm(props) {
  const {
    allProjects,
    selectedProject,
    canAddNewMaterial,
    canAddNewMeasurement,
    materialList,
    measurementList,
  } = props;
  const defaultProject = selectedProject ? selectedProject._id : '';
  const [project, setProject] = useState(defaultProject);
  const [material, setMaterial] = useState('');
  const [newMaterial, setNewMaterial] = useState(false);
  const [invoice, setInvoice] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [currency, setCurrency] = useState('');
  const [quantity, setQuantity] = useState('');
  const [measurement, setMeasurement] = useState('');
  const [newMeasurement, setNewMeasurement] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [shippingFee, setShippingFee] = useState('');
  const [taxes, setTaxes] = useState('');
  const [phone, setPhone] = useState('');
  // state for image?
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');

  const history = useHistory();
  const dispatch = useDispatch();

  const handleSubmit = e => {
    e.preventDefault();
  };

  const handleCancel = e => {
    e.preventDefault();
    history.goBack();
  };

  return (
    <Form className="add-materials-form" onSubmit={handleSubmit}>
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
              invalid={project === ''}
              value={project}
              onChange={e => {
                setProject(e.target.value);
              }}
            >
              <option value="">-- select an option --</option>
              {allProjects.map(el => (
                <option value={el._id} key={el._id}>
                  {el.projectName}
                </option>
              ))}
            </Input>
            <FormFeedback>Please select a project</FormFeedback>
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
                <option value="">-- select an option --</option>
                {materialList.map(materialName => (
                  <option value={materialName}>{materialName}</option>
                ))}
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
            <Label for="unitPrice">Unit Price &#40;excl. taxes & shipping&#41;</Label>
            <Input
              id="unitPrice"
              name="unitPrice"
              className="remove-arrows"
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
              <option value="">-- select --</option>
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
            {newMeasurement ? (
              <Input
                id="measurement"
                name="measurement"
                type="textbox"
                placeholder="Add new measurement"
                value={measurement}
                onChange={e => {
                  setMeasurement(e.target.value);
                }}
              />
            ) : (
              <Input
                id="measurement"
                name="measurement"
                type="select"
                value={measurement}
                onChange={e => {
                  setMeasurement(e.target.value);
                }}
              >
                <option value="">-- select an option --</option>
                {measurementList.map(measurementUnit => (
                  <option value={measurementUnit}>{measurementUnit}</option>
                ))}
              </Input>
            )}
          </FormGroup>
        </Col>
      </Row>
      {canAddNewMeasurement && (
        <Row>
          <Col>
            <FormGroup>
              <input
                id="newMeasurement"
                name="newMeasurement"
                type="checkbox"
                checked={newMeasurement}
                onChange={() => setNewMeasurement(!newMeasurement)}
              />
              <label htmlFor="newMeasurement">Do you want to add a new unit of measurement?</label>
            </FormGroup>
          </Col>
        </Row>
      )}
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
            <Label for="shippingFee">Shipping Fee &#40;excluding taxes, enter 0 if free&#41;</Label>
            <Input
              id="shippingFee"
              name="shippingFee"
              className="remove-arrows"
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
              className="remove-arrows"
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
              onChange={phoneNum => {
                setPhone(phoneNum);
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
          <Button type="button" id="cancel" onClick={handleCancel}>
            Cancel
          </Button>
        </Col>
        <Col>
          <Button type="submit" id="submit">
            Submit
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
