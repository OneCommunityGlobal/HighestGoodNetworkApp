import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import Joi from 'joi';

import { boxStyle } from 'styles';
import { purchaseMaterial } from 'actions/bmdashboard/materialsActions';
import './PurchaseForm.css';

export default function PurchaseForm() {
  const bmProjects = useSelector(state => state.bmProjects);
  const matTypes = useSelector(state => state.bmInvTypes);
  const history = useHistory();

  const [projectId, setProjectId] = useState('');
  const [matTypeId, setMatTypeId] = useState('');
  const [quantity, setQty] = useState('');
  const [unit, setUnit] = useState('');
  const [priority, setPriority] = useState('Low');
  const [brand, setBrand] = useState('');
  const [validationError, setValidationError] = useState('');

  // change displayed unit of measurement based on selected material
  useEffect(() => {
    if (matTypeId) {
      const matType = matTypes.find(type => type._id === matTypeId);
      setUnit(matType.unit);
    } else setUnit('');
  }, [matTypeId]);

  const schema = Joi.object({
    projectId: Joi.string().required(),
    matTypeId: Joi.string().required(),
    quantity: Joi.number()
      .min(1)
      .max(999)
      .integer()
      .required(),
    priority: Joi.string().required(),
    brand: Joi.string().allow(''),
  });

  const handleSubmit = async e => {
    e.preventDefault();
    const validate = schema.validate({
      projectId,
      matTypeId,
      quantity,
      priority,
      brand,
    });
    if (validate.error) {
      return setValidationError('Invalid form data. Please try again.');
    }
    const body = {
      projectId,
      matTypeId,
      quantity,
      priority,
      brand,
    };
    const response = await purchaseMaterial(body);
    setProjectId('');
    setMatTypeId('');
    setQty('');
    setPriority('Low');
    setBrand('');
    if (response.status === 201) {
      return toast.success('Success: your purchase request has been logged.');
    }
    return toast.error(`${response.status} - ${response.statusText}`);
  };

  const handleCancel = e => {
    e.preventDefault();
    history.goBack();
  };

  return (
    <Form className="purchase-material-form" onSubmit={handleSubmit}>
      <FormGroup>
        <Label for="select-project">Project</Label>
        <Input
          id="select-project"
          type="select"
          value={projectId}
          onChange={({ currentTarget }) => {
            setValidationError('');
            setProjectId(currentTarget.value);
          }}
          disabled={!bmProjects.length}
        >
          <option disabled hidden value="">
            {' '}
          </option>
          {bmProjects.map(({ _id, name }) => (
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
          type="select"
          value={matTypeId}
          onChange={({ currentTarget }) => {
            setValidationError('');
            setMatTypeId(currentTarget.value);
          }}
        >
          <option disabled hidden value="">
            {' '}
          </option>
          {matTypes.map(({ _id, name }) => (
            <option value={_id} key={_id}>
              {name}
            </option>
          ))}
        </Input>
      </FormGroup>
      <div className="purchase-material-flex-group">
        <FormGroup className="flex-group-qty">
          <Label for="input-quantity">Quantity</Label>
          <div className="flex-group-qty-container">
            <Input
              id="input-quantity"
              type="number"
              value={quantity}
              min={1}
              onChange={({ currentTarget }) => {
                setValidationError('');
                setQty(currentTarget.value);
              }}
            />
            <span>{unit}</span>
          </div>
        </FormGroup>
        <FormGroup>
          <Label for="input-priority">Priority</Label>
          <Input
            id="input-priority"
            type="select"
            value={priority}
            onChange={({ currentTarget }) => {
              setValidationError('');
              setPriority(currentTarget.value);
            }}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </Input>
        </FormGroup>
      </div>
      <FormGroup>
        <Label for="input-brand">Preferred Brand (optional)</Label>
        <Input
          type="text"
          value={brand}
          onChange={({ currentTarget }) => {
            setValidationError('');
            setBrand(currentTarget.value);
          }}
        />
      </FormGroup>
      <div className="purchase-material-error">{validationError && <p>{validationError}</p>}</div>
      <div className="purchase-material-buttons">
        <Button
          type="button"
          id="cancel-button"
          color="secondary"
          onClick={handleCancel}
          style={boxStyle}
        >
          Cancel
        </Button>
        <Button
          id="submit-button"
          color="primary"
          style={boxStyle}
          disabled={!projectId || !matTypeId || !quantity || !priority || !!validationError}
        >
          Submit
        </Button>
      </div>
    </Form>
  );
}
