import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Form, FormGroup, FormText, Label, Input, Button } from 'reactstrap';
import Joi from 'joi';

import { boxStyle } from 'styles';
import { purchaseEquipment } from 'actions/bmdashboard/equipmentActions';

import './PurchaseForm.css';

export default function PurchaseForm() {
  const bmProjects = useSelector(state => state.bmProjects);
  const equipments = useSelector(state => state.bmInvTypes.list);
  const history = useHistory();

  const [projectId, setProjectId] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [quantity, setQty] = useState('');
  // const [isTracking, setIsTracking] = useState(true);
  const [priority, setPriority] = useState('Low');
  const [makeModel, setMakeModel] = useState('');
  const [estTime, setEstTime] = useState('');
  const [desc, setDesc] = useState('');
  const [validationError, setValidationError] = useState('');

  const schema = Joi.object({
    projectId: Joi.string().required(),
    equipmentId: Joi.string().required(),
    quantity: Joi.number()
      .min(1)
      .max(999)
      .integer()
      .required(),
    // isTracking: Joi.boolean().required(),
    priority: Joi.string().required(),
    estTime: Joi.string().required(),
    desc: Joi.string()
      .required()
      .max(150),
    makeModel: Joi.string().allow(''),
  });

  const handleSubmit = async e => {
    e.preventDefault();
    const validate = schema.validate({
      projectId,
      equipmentId,
      quantity,
      // isTracking,
      priority,
      estTime,
      desc,
      makeModel,
    });
    // TODO: provide specific validation info to the user
    if (validate.error) {
      setValidationError('Invalid form data. Please try again.');
      return;
    }
    const body = {
      projectId,
      equipmentId,
      quantity,
      // isTracking,
      priority,
      estTime,
      desc,
      makeModel,
    };
    const response = await purchaseEquipment(body);
    setProjectId('');
    setEquipmentId('');
    setQty('');
    // setIsTracking(true);
    setPriority('Low');
    setMakeModel('');
    setEstTime('');
    setDesc('');

    if (response.status === 201) {
      toast.success('Success: your purchase request has been logged.');
    } else if (response.status >= 400) {
      toast.error(`Error: ${response.status} ${response.statusText}.`);
    } else toast.warning(`Warning: unexpected status ${response.status}.`);
  };

  const handleCancel = e => {
    e.preventDefault();
    history.goBack();
  };

  return (
    <Form className="purchase-equipment-form" onSubmit={handleSubmit}>
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
        <Label for="select-equipment">Equipment</Label>
        <Input
          id="select-equipment"
          type="select"
          value={equipmentId}
          onChange={({ currentTarget }) => {
            setValidationError('');
            setEquipmentId(currentTarget.value);
          }}
        >
          <option disabled hidden value="">
            {' '}
          </option>
          {equipments.map(({ _id, name }) => (
            <option value={_id} key={_id}>
              {name}
            </option>
          ))}
        </Input>
      </FormGroup>
      <div className="purchase-equipment-flex-group">
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
          </div>
        </FormGroup>
        {/* <FormGroup>
          <Label for="is-tracking">Is Tracking</Label>
          <Input
            id="is-tracking"
            type="select"
            value={isTracking}
            onChange={({ currentTarget }) => {
              setValidationError('');
              setIsTracking(currentTarget.value);
            }}
          >
            <option value>True</option>
            <option value={false}>False</option>
          </Input>
        </FormGroup> */}
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
        <Label htmlFor="input-estimated-time">Est. Time of Use</Label>
        <Input
          id="input-estimated-time"
          type="text"
          value={estTime}
          onChange={({ currentTarget }) => {
            setValidationError('');
            setEstTime(currentTarget.value);
          }}
        />
        <FormText>
          Ex: <q>10 days</q>, <q>2 weeks</q>, etc.
        </FormText>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="input-usage-description">Usage Description</Label>
        <Input
          id="input-usage-description"
          type="textarea"
          value={desc}
          onChange={({ currentTarget }) => {
            setValidationError('');
            setDesc(currentTarget.value);
          }}
        />
        <FormText>Max 150 characters</FormText>
      </FormGroup>
      <FormGroup>
        <Label for="input-brand">Preferred Make &amp; Model (optional)</Label>
        <Input
          type="text"
          value={makeModel}
          onChange={({ currentTarget }) => {
            setValidationError('');
            setMakeModel(currentTarget.value);
          }}
        />
      </FormGroup>
      <div className="purchase-equipment-error">{validationError && <p>{validationError}</p>}</div>
      <div className="purchase-equipment-buttons">
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
          disabled={
            !projectId ||
            !equipmentId ||
            !quantity ||
            // !isTracking ||
            !priority ||
            !estTime ||
            !desc ||
            !!validationError
          }
        >
          Submit
        </Button>
      </div>
    </Form>
  );
}
