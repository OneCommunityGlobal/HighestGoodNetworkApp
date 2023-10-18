import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import { Row, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { isValidMediaUrl } from 'utils/checkValidURL';
import Joi from 'joi';
import { boxStyle } from 'styles';
import { postMaterial } from '../../../../actions/materials';
import './AddMaterialForm.css';

// AddMaterialsForm will take in an array of project objects
// and optionally a selected project object
export default function AddMaterialsForm(props) {
  const {
    projects,
    selectedProject,
    canAddNewMaterial,
    canAddNewMeasurement,
    materials,
    measurements,
  } = props;

  const [formInputs, setFormInputs] = useState({
    projectId: selectedProject?._id || '',
    material: '',
    newMaterial: false,
    invoice: '',
    unitPrice: '',
    currency: '',
    quantity: '',
    measurement: '',
    newMeasurement: false,
    purchaseDate: '',
    shippingFee: '',
    taxRate: '',
    phone: '',
    link: '',
    description: '',
  });
  // state for image?

  const [trySubmit, setTrySubmit] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();

  const linkRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)?$/;

  const schema = Joi.object({
    projectId: Joi.string().required(),
    material: Joi.string().required(),
    newMaterial: Joi.boolean().required(),
    invoice: Joi.string().required(),
    unitPrice: Joi.number()
      .positive()
      .required(),
    currency: Joi.string().required(),
    quantity: Joi.number()
      .positive()
      .integer()
      .required(),
    measurement: Joi.string().required(),
    newMeasurement: Joi.boolean().required(),
    purchaseDate: Joi.date().required(),
    shippingFee: Joi.number()
      .positive()
      .required(),
    taxRate: Joi.number()
      .positive()
      .required(),
    phone: Joi.string().required(),
    link: Joi.string()
      .required()
      .regex(linkRegex),
    description: Joi.string().required(),
  });

  const handleSubmit = async e => {
    e.preventDefault();
    const { error } = schema.validate(formInputs);
    if (error) {
      setTrySubmit(true);
    } else {
      dispatch(postMaterial(formInputs));
      setFormInputs({
        projectId: selectedProject?._id || '',
        material: '',
        newMaterial: false,
        invoice: '',
        unitPrice: '',
        currency: '',
        quantity: '',
        measurement: '',
        newMeasurement: false,
        purchaseDate: '',
        shippingFee: '',
        taxRate: '',
        phone: '',
        link: '',
        description: '',
      });
    }
  };

  const handleCancel = e => {
    e.preventDefault();
    history.goBack();
  };

  const handleChange = e => {
    setFormInputs({
      ...formInputs,
      [e.target.name]: e.target.value,
    });
  };

  const calculateTotal = (unitPrice, quantity, shipping, tax) => {
    const subTotal = unitPrice * quantity;
    const shippingFee = shipping * 1;
    return (shippingFee + subTotal + subTotal * (tax / 100)).toFixed(2);
  };

  return (
    <Form className="add-materials-form" onSubmit={handleSubmit}>
      <Row>
        <Col>
          <h1 style={{ fontSize: '1.3rem' }}>ADD MATERIAL</h1>
        </Col>
      </Row>
      <Row>
        <Col xs="12" md="6">
          <Row>
            <Col xs="12" sm="9">
              <FormGroup>
                <Label for="projectId">Project</Label>
                <Input
                  id="projectId"
                  name="projectId"
                  type="select"
                  invalid={trySubmit && formInputs.projectId === ''}
                  value={formInputs.projectId}
                  onChange={handleChange}
                >
                  <option value="">-- select an option --</option>
                  {projects.map(el => (
                    <option value={el._id} key={el._id}>
                      {el.projectName}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col xs="12" sm="9">
              <FormGroup>
                <Label for="material">Material Name</Label>
                {formInputs.newMaterial ? (
                  <Input
                    id="material"
                    name="material"
                    type="text"
                    autoComplete="off"
                    invalid={trySubmit && formInputs.material === ''}
                    value={formInputs.material}
                    placeholder="Add new material"
                    onChange={handleChange}
                  />
                ) : (
                  <Input
                    id="material"
                    name="material"
                    type="select"
                    invalid={trySubmit && formInputs.material === ''}
                    value={formInputs.material}
                    onChange={handleChange}
                  >
                    <option value="">-- select an option --</option>
                    {materials.map(el => (
                      <option value={el._id} key={el._id}>
                        {el.name}
                      </option>
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
                    checked={formInputs.newMaterial}
                    onChange={() => {
                      setFormInputs({
                        ...formInputs,
                        material: '',
                        newMaterial: !formInputs.newMaterial,
                      });
                    }}
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
                  autoComplete="off"
                  value={formInputs.invoice}
                  invalid={trySubmit && formInputs.invoice === ''}
                  placeholder="Input Invoice No or ID for the material"
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row className="price-currency">
            <Col xs="12" sm="7" md="8">
              <FormGroup>
                <Label for="unitPrice">Unit Price &#40;excl. taxes & shipping&#41;</Label>
                <Input
                  id="unitPrice"
                  name="unitPrice"
                  className="remove-arrows"
                  type="number"
                  invalid={trySubmit && formInputs.unitPrice === ''}
                  value={formInputs.unitPrice}
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>
            <Col xs="12" sm="4">
              <FormGroup>
                <Label for="currency">Currency</Label>
                <Input
                  id="currency"
                  name="currency"
                  type="select"
                  invalid={trySubmit && formInputs.currency === ''}
                  value={formInputs.currency}
                  onChange={handleChange}
                >
                  <option value="">- select -</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="JPY">JPY</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col xs="12" sm="7">
              <FormGroup>
                <Label for="measurement">Unit of Measurement</Label>
                {formInputs.newMeasurement ? (
                  <Input
                    id="measurement"
                    name="measurement"
                    type="text"
                    autoComplete="off"
                    invalid={trySubmit && formInputs.measurement === ''}
                    placeholder="Add new measurement"
                    value={formInputs.measurement}
                    onChange={handleChange}
                  />
                ) : (
                  <Input
                    id="measurement"
                    name="measurement"
                    type="select"
                    invalid={trySubmit && formInputs.measurement === ''}
                    value={formInputs.measurement}
                    onChange={handleChange}
                  >
                    <option value="">-- select an option --</option>
                    {measurements.map(measurementUnit => (
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
                    checked={formInputs.newMeasurement}
                    onChange={() => {
                      setFormInputs({
                        ...formInputs,
                        measurement: '',
                        newMeasurement: !formInputs.newMeasurement,
                      });
                    }}
                  />
                  <label htmlFor="newMeasurement">
                    Do you want to add a new unit of measurement?
                  </label>
                </FormGroup>
              </Col>
            </Row>
          )}
          <Row>
            <Col xs="12" sm="4">
              <FormGroup>
                <Label for="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  invalid={trySubmit && formInputs.quantity === ''}
                  value={formInputs.quantity}
                  min={1}
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>
          </Row>
        </Col>
        <Col xs="12" md="6">
          <Row style={{ justifyContent: 'space-between' }}>
            <Col xs="12" sm="7">
              <FormGroup>
                <Label for="shippingFee">Shipping Fee &#40;excl. taxes&#41;</Label>
                <Input
                  id="shippingFee"
                  name="shippingFee"
                  className="remove-arrows"
                  type="number"
                  invalid={trySubmit && formInputs.shippingFee === ''}
                  value={formInputs.shippingFee}
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>
            <Col xs="12" sm="4">
              <FormGroup>
                <Label for="taxRate">Taxes</Label>
                <Input
                  id="taxRate"
                  name="taxRate"
                  className="remove-arrows"
                  type="number"
                  invalid={trySubmit && formInputs.taxRate === ''}
                  placeholder="%"
                  value={formInputs.taxRate}
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col xs="12" sm="7">
              <FormGroup>
                <Label for="purchaseDate">Purchased Date</Label>
                <Input
                  id="purchaseDate"
                  name="purchaseDate"
                  type="date"
                  invalid={trySubmit && formInputs.purchaseDate === ''}
                  value={formInputs.purchaseDate}
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col xs="12" sm="7">
              <FormGroup>
                <Label for="phone">Supplier Phone Number</Label>
                <PhoneInput
                  id="phone"
                  name="phone"
                  country="us"
                  regions={['america', 'europe', 'asia', 'oceania', 'africa']}
                  limitMaxLength="true"
                  invalid={trySubmit && formInputs.phone === ''}
                  value={formInputs.phone}
                  onChange={phoneNum => {
                    setFormInputs({
                      ...formInputs,
                      phone: phoneNum,
                    });
                  }}
                />
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
                  type="text"
                  placeholder="https://"
                  autoComplete="off"
                  invalid={trySubmit && !isValidMediaUrl(formInputs.link)}
                  value={formInputs.link}
                  onChange={handleChange}
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
                <Label for="description">Material Description</Label>
                <Input
                  id="description"
                  name="description"
                  type="textarea"
                  maxLength={200}
                  invalid={trySubmit && formInputs.description === ''}
                  placeholder="Describe your material in detail."
                  value={formInputs.description}
                  onChange={handleChange}
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
                    {calculateTotal(
                      formInputs.unitPrice,
                      formInputs.quantity,
                      formInputs.shippingFee,
                      formInputs.taxRate,
                    )}
                    <span style={{ fontSize: '1rem', marginLeft: '5px' }}>
                      {formInputs.currency}
                    </span>
                  </b>
                </span>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button
            type="button"
            id="cancel"
            color="secondary"
            onClick={handleCancel}
            style={boxStyle}
          >
            Cancel
          </Button>
        </Col>
        <Col>
          <Button type="submit" id="submit" color="primary" style={boxStyle}>
            Submit
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
