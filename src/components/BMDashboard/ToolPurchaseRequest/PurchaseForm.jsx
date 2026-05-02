import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Form, FormGroup, FormText, Label, Input, Button } from 'reactstrap';
import Joi from 'joi';

import { boxStyle } from '~/styles';
import { purchaseTools } from '~/actions/bmdashboard/toolActions';
import BMCharacterLimitHint from '../shared/BMCharacterLimitHint';

import styles from './PurchaseForm.module.css';

const PRIORITY_ORDER = { Low: 1, Medium: 2, High: 3 };
const RECENT_REQUEST_WINDOW_DAYS = 30;
const DESC_CHAR_LIMIT = 150;

function getObjectId(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value._id) return value._id;
  return '';
}

function formatDate(dateValue) {
  if (!dateValue) return 'No prior requests';

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return 'No prior requests';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDaysSince(dateValue) {
  if (!dateValue) return Number.POSITIVE_INFINITY;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function getSuggestedPriority(records, availabilitySummary) {
  if (records.length) {
    const counts = records.reduce((acc, record) => {
      const recordPriority = record.priority || 'Low';
      const current = acc[recordPriority] || { count: 0, latest: 0 };
      const latest = new Date(record.date || 0).getTime();

      acc[recordPriority] = {
        count: current.count + 1,
        latest: Math.max(current.latest, Number.isNaN(latest) ? 0 : latest),
      };

      return acc;
    }, {});

    return Object.entries(counts).sort((a, b) => {
      if (b[1].count !== a[1].count) return b[1].count - a[1].count;
      if (b[1].latest !== a[1].latest) return b[1].latest - a[1].latest;
      return PRIORITY_ORDER[b[0]] - PRIORITY_ORDER[a[0]];
    })[0][0];
  }

  if (
    availabilitySummary.projectAvailableCount === 0 &&
    availabilitySummary.projectUsingCount > 0
  ) {
    return 'High';
  }

  if (
    availabilitySummary.projectAvailableCount === 0 &&
    availabilitySummary.globalAvailableCount > 0
  ) {
    return 'Medium';
  }

  return 'Low';
}

export default function PurchaseForm() {
  const bmProjects = useSelector(state => state.bmProjects);
  const tools = useSelector(state => state.bmInvTypes.list);
  const toolInventory = useSelector(state => state.bmTools.toolslist || []);
  const history = useHistory();

  const [projectId, setProjectId] = useState('');
  const [toolId, setToolId] = useState('');
  const [quantity, setQty] = useState('');
  const [priority, setPriority] = useState('Low');
  const [priorityTouched, setPriorityTouched] = useState(false);
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
      .min(2)
      .required()
      .label('Estimated Time of Use'),
    desc: Joi.string()
      .max(150)
      .required()
      .label('Usage Description'),
    makeModel: Joi.string().allow(''),
  });

  const validateField = (name, value) => {
    const fieldSchema = Joi.object({ [name]: schema.extract(name) });
    const { error } = fieldSchema.validate({ [name]: value });
    return error ? error.details[0].message : null;
  };

  useEffect(() => {
    const formData = {
      projectId,
      toolId,
      quantity,
      priority,
      estTime,
      desc,
      makeModel,
    };

    const { error } = schema.validate(formData, { abortEarly: false });

    if (!error) {
      setErrors({});
    } else {
      const fieldErrors = {};
      error.details.forEach(d => {
        fieldErrors[d.path[0]] = d.message;
      });
      setErrors(fieldErrors);
    }
  }, [projectId, toolId, quantity, priority, estTime, desc, makeModel]);

  const isFormValid =
    projectId && toolId && quantity && estTime && desc && Object.values(errors).every(e => !e);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isFormValid) return;

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
          onChange={e => setProjectId(e.target.value)}
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
          onChange={e => setToolId(e.target.value)}
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
            placeholder="Ex: 3 units"
            value={quantity}
            invalid={!!errors.quantity}
            onChange={e => setQty(e.target.value)}
          />
          <FormText>Admins use this to calculate total cost and inventory impact.</FormText>
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
          onChange={e => setEstTime(e.target.value)}
        />
        <FormText>Helps admins plan scheduling and avoid overlapping allocations.</FormText>
        {errors.estTime && <FormText color="danger">{errors.estTime}</FormText>}
      </FormGroup>

      {/* Description */}
      <FormGroup>
        <Label for="input-usage-description">
          Usage Description <span className="text-danger">*</span>
        </Label>
        <Input
          id="input-usage-description"
          type="textarea"
          maxLength={150}
          placeholder="Briefly describe how this tool will be used..."
          value={desc}
          invalid={!!errors.desc}
          onChange={e => setDesc(e.target.value)}
        />
        <FormText className="d-flex justify-content-between">
          <span>Admins review this to justify and approve purchases.</span>
          <span>{desc.length}/150</span>
        </FormText>
        {errors.desc && <FormText color="danger">{errors.desc}</FormText>}
      </FormGroup>

      {/* Make / Model */}
      <FormGroup>
        <Label>Preferred Make &amp; Model (optional)</Label>
        <Input
          type="text"
          placeholder="Ex: DeWalt XR Series"
          value={makeModel}
          onChange={e => setMakeModel(e.target.value)}
        />
      </FormGroup>

      {/* Buttons */}
      <div className={styles.purchaseToolButtons}>
        <Button type="button" color="secondary" onClick={handleCancel} style={boxStyle}>
          Cancel
        </Button>
        <Button type="submit" color="primary" style={boxStyle} disabled={!isFormValid}>
          Submit
        </Button>
      </div>
    </Form>
  );
}
