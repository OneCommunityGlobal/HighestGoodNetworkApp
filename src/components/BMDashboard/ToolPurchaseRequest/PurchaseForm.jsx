/* eslint-disable no-shadow */
/* eslint-disable import/no-unresolved */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import Joi from 'joi';

import { boxStyle } from 'styles';
import { purchaseTools } from 'actions/bmdashboard/toolsActions';

import './PurchaseForm.css';

export default function PurchaseForm() {
  const bmProjects = useSelector(state => state.bmProjects);
  const tools = useSelector(state => state.tools);
  const history = useHistory();

  const [projectId, setProjectId] = useState('');
  const [toolId, setToolId] = useState('');
  const [quantity, setQty] = useState('');
  const [unit, setUnit] = useState('');
  const [priority, setPriority] = useState('Low');
  const [brand, setBrand] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (toolId) {
      const toolId = tools.find(type => type._id === toolId);
      setUnit(tools.unit);
    } else setUnit('');
  }, [toolId]);

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
      toolId,
      quantity,
      priority,
      brand,
    });
    if (validate.error) {
      return setValidationError('Invalid form data. Please try again.');
    }
    const body = {
      projectId,
      toolId,
      quantity,
      priority,
      brand,
    };
    const response = await purchaseTools(body);
    setProjectId('');
    setToolId('');
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
    <Form className="purchase-tool-form" onSubmit={handleSubmit}>
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
        <Label for="select-tool">Tool</Label>
        <Input
          id="select-tool"
          type="select"
          value={toolId}
          onChange={({ currentTarget }) => {
            setValidationError('');
            setToolId(currentTarget.value);
          }}
        >
          <option disabled hidden value="">
            {' '}
          </option>
          {tools.map(({ _id, name }) => (
            <option value={_id} key={_id}>
              {name}
            </option>
          ))}
        </Input>
      </FormGroup>
      <div className="purchase-tool-flex-group">
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
      <div className="purchase-tool-error">{validationError && <p>{validationError}</p>}</div>
      <div className="purchase-tool-buttons">
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
          disabled={!projectId || !toolId || !quantity || !priority || !!validationError}
        >
          Submit
        </Button>
      </div>
    </Form>
  );
}
