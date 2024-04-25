import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import Joi from 'joi';

import { boxStyle } from 'styles';
import { purchaseConsumable } from 'actions/bmdashboard/consumableActions';

import './PurchaseForm.css';

export default function PurchaseForm() {
  const bmProjects = useSelector(state => state.bmProjects);
  const consumables = useSelector(state => state.bmInvTypes.list);

  const [projectId, setProjectId] = useState('');
  const [consumableId, setConsumableId] = useState('');
  const [quantity, setQty] = useState('');
  const [priority, setPriority] = useState('Low');
  const [brand, setBrand] = useState('');
  const [validationError, setValidationError] = useState('');

  const schema = Joi.object({
    projectId: Joi.string().required(),
    consumableId: Joi.string().required(),
    quantity: Joi.number()
      .min(1)
      .max(999)
      .integer()
      .required(),
    priority: Joi.string().required(),
    brand: Joi.string().allow(''),
  });

  const sortedProjects = bmProjects.slice().sort((a, b) => {
    return a.name.localeCompare(b.name); // Sort alphabetically by name
  });

  const handleSubmit = async e => {
    e.preventDefault();
    const validate = schema.validate({
      projectId,
      consumableId,
      quantity,
      priority,
      brand,
    });
    if (validate.error) {
      return setValidationError('Invalid form data. Please try again.');
    }
    const body = {
      projectId,
      consumableId,
      quantity,
      priority,
      brand,
    };
    const response = await purchaseConsumable(body);
    setProjectId('');
    setConsumableId('');
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
    window.location.href = '/bmdashboard/consumables';
  };

  return (
    <Form className="purchase-consumable-form" onSubmit={handleSubmit}>
      <FormGroup>
        <Label for="select-project">
          Project <span className="mandatory">*</span>
        </Label>
        <Input
          id="select-project"
          type="select"
          value={projectId}
          onChange={({ currentTarget }) => {
            setValidationError('');
            setProjectId(currentTarget.value);
          }}
          disabled={!sortedProjects.length}
        >
          <option disabled hidden value="">
            {' '}
          </option>
          {sortedProjects.map(({ _id, name }) => (
            <option value={_id} key={_id}>
              {name}
            </option>
          ))}
        </Input>
      </FormGroup>
      <FormGroup>
        <Label for="select-consumable">
          Consumable <span className="mandatory">*</span>
        </Label>
        <Input
          id="select-consumable"
          type="select"
          value={consumableId}
          onChange={({ currentTarget }) => {
            setValidationError('');
            setConsumableId(currentTarget.value);
          }}
        >
          <option disabled hidden value="">
            {' '}
          </option>
          {consumables.map(({ _id, name }) => (
            <option value={_id} key={_id}>
              {name}
            </option>
          ))}
        </Input>
      </FormGroup>
      <div className="purchase-consumable-flex-group">
        <FormGroup className="flex-group-qty">
          <Label for="input-quantity">
            Quantity<span className="mandatory">*</span>
          </Label>
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
          </div>
        </FormGroup>
        <FormGroup>
          <Label for="input-priority">
            Priority<span className="mandatory">*</span>
          </Label>
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
      <div className="purchase-consumable-error">{validationError && <p>{validationError}</p>}</div>
      <div className="purchase-consumable-buttons">
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
          disabled={!projectId || !consumableId || !quantity || !priority || !!validationError}
        >
          Submit
        </Button>
      </div>
    </Form>
  );
}
