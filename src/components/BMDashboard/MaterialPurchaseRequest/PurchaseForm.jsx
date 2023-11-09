import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
// import PhoneInput from 'react-phone-input-2';
import { Row, Col, Form, FormGroup, Label, Input, Button, FormFeedback } from 'reactstrap';
// import { isValidMediaUrl } from 'utils/checkValidURL';
import Joi from 'joi';
import { boxStyle } from 'styles';
// import { postMaterial } from '../../../actions/materials';
import { purchaseMaterial } from 'actions/bmdashboard/materialsActions';
import './PurchaseForm.css';

export default function PurchaseForm({ projects, materialTypes }) {
  const [projectId, setProjectId] = useState('');
  const [matTypeId, setMatTypeId] = useState('');
  const [quantity, setQty] = useState('');
  const [unit, setUnit] = useState('');
  const [validationError, setValidationError] = useState('');

  // change displayed unit of measurement based on selected material
  useEffect(() => {
    if (projects.length) {
      const matType = materialTypes.find(type => type._id === matTypeId);
      setUnit(matType.unit);
    }
  }, [matTypeId]);

  const history = useHistory();

  const schema = Joi.object({
    projectId: Joi.string().required(),
    matTypeId: Joi.string().required(),
    quantity: Joi.number()
      .positive()
      .integer()
      .required(),
  });

  const handleSubmit = async e => {
    e.preventDefault();
    const validate = schema.validate({
      projectId,
      matTypeId,
      quantity,
    });
    // setValidationError('Invalid form data. Please try again.');
    if (validate.error) {
      return setValidationError('Invalid form data. Please try again.');
    }
    const body = {
      projectId,
      matTypeId,
      quantity,
    };
    const response = await purchaseMaterial(body);
    if (response.status === 201) {
      toast.success('Success: your purchase request has been logged.');
    }
    // console.log('response', response);
  };

  const handleCancel = e => {
    e.preventDefault();
    history.goBack();
  };

  return (
    <Form className="add-materials-form" onSubmit={handleSubmit}>
      <FormGroup>
        <Label for="select-project">Project</Label>
        <Input
          id="select-project"
          // name="projectId"
          type="select"
          // invalid={trySubmit && formInputs.projectId === ''}
          value={projectId}
          onChange={({ currentTarget }) => {
            setValidationError('');
            setProjectId(currentTarget.value);
          }}
          // onChange={handleChange}
          disabled={!projects.length}
        >
          <option value=""> </option>
          {projects.map(({ _id, name }) => (
            <option value={_id} key={_id}>
              {name}
            </option>
          ))}
        </Input>
      </FormGroup>
      <FormGroup>
        <Label for="select-material">Material</Label>
        <Input
          id="select-material"
          // name="materialTypeId"
          type="select"
          // invalid={trySubmit && formInputs.material === ''}
          value={matTypeId}
          onChange={({ currentTarget }) => {
            setValidationError('');
            setMatTypeId(currentTarget.value);
          }}
          // onChange={handleChange}
        >
          <option value=""> </option>
          {materialTypes.map(({ _id, name }) => (
            <option value={_id} key={_id}>
              {name}
            </option>
          ))}
        </Input>
      </FormGroup>
      <FormGroup>
        <Label for="select-quantity">Quantity</Label>
        <Input
          id="select-quantity"
          // name="quantity"
          type="number"
          // invalid={trySubmit && formInputs.quantity === ''}
          value={quantity}
          min={1}
          onChange={({ currentTarget }) => {
            setValidationError('');
            setQty(currentTarget.value);
          }}
          // onChange={handleChange}
        />
        {unit}
      </FormGroup>
      <div className="purchase-material-error">{validationError && <p>{validationError}</p>}</div>
      <Row>
        <Button type="button" id="cancel" color="secondary" onClick={handleCancel} style={boxStyle}>
          Cancel
        </Button>

        <Button
          type="submit"
          color="primary"
          style={boxStyle}
          disabled={!projectId || !matTypeId || !quantity || !!validationError}
        >
          Submit
        </Button>
      </Row>
    </Form>
  );
}
