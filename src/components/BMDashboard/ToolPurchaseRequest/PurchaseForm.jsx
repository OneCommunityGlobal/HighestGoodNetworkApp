import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Form, FormGroup, FormText, Label, Input, Button } from 'reactstrap';
import Joi from 'joi-browser';

import { boxStyle } from '~/styles';
import { purchaseTools } from '~/actions/bmdashboard/toolActions';

import styles from './PurchaseForm.module.css';

export default function PurchaseForm() {
  const bmProjects = useSelector(state => state.bmProjects);
  const tools = useSelector(state => state.bmInvTypes.list);
  const history = useHistory();

  const [projectId, setProjectId] = useState('');
  const [toolId, setToolId] = useState('');
  const [quantity, setQty] = useState('');
  const [priority, setPriority] = useState('Low');
  const [makeModel, setMakeModel] = useState('');
  const [estTime, setEstTime] = useState('');
  const [desc, setDesc] = useState('');
  const [errors, setErrors] = useState({});

  const schema = Joi.object({
    projectId: Joi.string()
      .required()
      .label('Project'),
    toolId: Joi.string()
      .required()
      .label('Tool'),
    quantity: Joi.number()
      .integer()
      .min(1)
      .max(999)
      .required()
      .label('Quantity'),
    priority: Joi.string().required(),
    estTime: Joi.string()
      .required()
      .label('Estimated Time of Use'),
    desc: Joi.string()
      .max(150)
      .required()
      .label('Usage Description'),
    makeModel: Joi.string().allow(''),
  });

  const handleSubmit = async e => {
    e.preventDefault();

    const { error } = schema.validate(
      { projectId, toolId, quantity, priority, estTime, desc, makeModel },
      { abortEarly: false },
    );

    if (error) {
      const fieldErrors = {};
      error.details.forEach(d => {
        fieldErrors[d.path[0]] = d.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    const response = await purchaseTools({
      projectId,
      toolId,
      quantity,
      priority,
      estTime,
      desc,
      makeModel,
    });

    if (response.status === 201) {
      toast.success('Success: your purchase request has been logged.');
      history.push('/bmdashboard/tools');
    } else if (response.status >= 400) {
      toast.error(`Error: ${response.status} ${response.statusText}.`);
    } else {
      toast.warning(`Warning: unexpected status ${response.status}.`);
    }
  };

  const handleCancel = e => {
    e.preventDefault();
    history.goBack();
  };

  return (
    <Form className={styles.purchaseToolForm} onSubmit={handleSubmit}>
      {/* Project */}
      <FormGroup>
        <Label for="select-project">Project</Label>
        <Input
          id="select-project"
          type="select"
          value={projectId}
          invalid={!!errors.projectId}
          onChange={e => {
            setProjectId(e.target.value);
            setErrors(prev => ({ ...prev, projectId: undefined }));
          }}
          disabled={!bmProjects.length}
        >
          <option hidden value="" />
          {bmProjects.map(({ _id, name }) => (
            <option key={_id} value={_id}>
              {name}
            </option>
          ))}
        </Input>
        {errors.projectId && <FormText color="danger">{errors.projectId}</FormText>}
      </FormGroup>

      {/* Tool */}
      <FormGroup>
        <Label for="select-tool">Tool</Label>
        <Input
          id="select-tool"
          type="select"
          value={toolId}
          invalid={!!errors.toolId}
          onChange={e => {
            setToolId(e.target.value);
            setErrors(prev => ({ ...prev, toolId: undefined }));
          }}
        >
          <option hidden value="" />
          {tools.map(({ _id, name }) => (
            <option key={_id} value={_id}>
              {name}
            </option>
          ))}
        </Input>
        {errors.toolId && <FormText color="danger">{errors.toolId}</FormText>}
      </FormGroup>

      <div className={styles.purchaseToolFlexGroup}>
        {/* Quantity */}
        <FormGroup className={styles.flexGroupQty}>
          <Label for="input-quantity">
            Quantity <span className="text-danger">*</span>
          </Label>
          <Input
            id="input-quantity"
            type="number"
            min={1}
            value={quantity}
            invalid={!!errors.quantity}
            onChange={e => {
              setQty(e.target.value);
              setErrors(prev => ({ ...prev, quantity: undefined }));
            }}
          />
          {errors.quantity && <FormText color="danger">{errors.quantity}</FormText>}
        </FormGroup>

        {/* Priority */}
        <FormGroup>
          <Label for="input-priority">Priority</Label>
          <Input
            id="input-priority"
            type="select"
            value={priority}
            onChange={e => setPriority(e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </Input>
        </FormGroup>
      </div>

      {/* Estimated Time */}
      <FormGroup>
        <Label for="input-estimated-time">
          Est. Time of Use <span className="text-danger">*</span>
        </Label>
        <Input
          id="input-estimated-time"
          type="text"
          placeholder="Ex: 2 weeks"
          value={estTime}
          invalid={!!errors.estTime}
          onChange={e => {
            setEstTime(e.target.value);
            setErrors(prev => ({ ...prev, estTime: undefined }));
          }}
        />
        {errors.estTime && <FormText color="danger">{errors.estTime}</FormText>}
      </FormGroup>

      {/* Description */}
      <FormGroup>
        <Label for="input-usage-description">Usage Description</Label>
        <Input
          id="input-usage-description"
          type="textarea"
          value={desc}
          invalid={!!errors.desc}
          onChange={e => {
            setDesc(e.target.value);
            setErrors(prev => ({ ...prev, desc: undefined }));
          }}
        />
        <FormText>Max 150 characters</FormText>
        {errors.desc && <FormText color="danger">{errors.desc}</FormText>}
      </FormGroup>

      {/* Make / Model */}
      <FormGroup>
        <Label>Preferred Make &amp; Model (optional)</Label>
        <Input type="text" value={makeModel} onChange={e => setMakeModel(e.target.value)} />
      </FormGroup>

      {/* Buttons */}
      <div className={styles.purchaseToolButtons}>
        <Button type="button" color="secondary" onClick={handleCancel} style={boxStyle}>
          Cancel
        </Button>
        <Button
          type="submit"
          color="primary"
          style={boxStyle}
          disabled={
            !projectId ||
            !toolId ||
            !quantity ||
            !estTime ||
            !desc ||
            Object.keys(errors).length > 0
          }
        >
          Submit
        </Button>
      </div>
    </Form>
  );
}
