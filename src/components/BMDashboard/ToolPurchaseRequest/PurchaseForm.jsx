import { useEffect, useState } from 'react';
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
      .required()
      .label('Estimated Time of Use'),
    desc: Joi.string()
      .max(150)
      .required()
      .label('Usage Description'),
    makeModel: Joi.string().allow(''),
  });

  const sortedTools = [...tools].sort((a, b) => a.name.localeCompare(b.name));
  const selectedTool = sortedTools.find(tool => tool._id === toolId);

  const selectedProjectInventory = projectId
    ? toolInventory.filter(tool => getObjectId(tool.project) === projectId)
    : [];

  const projectSpecificToolIds = new Set();

  selectedProjectInventory.forEach(tool => {
    const itemTypeId = getObjectId(tool.itemType);

    if (itemTypeId) {
      projectSpecificToolIds.add(itemTypeId);
    }
  });

  sortedTools.forEach(tool => {
    const availableOnProject = (tool.available || []).some(
      item => getObjectId(item.project) === projectId,
    );
    const inUseOnProject = (tool.using || []).some(item => getObjectId(item.project) === projectId);

    if (availableOnProject || inUseOnProject) {
      projectSpecificToolIds.add(tool._id);
    }
  });

  const projectFocusedTools = sortedTools.filter(tool => projectSpecificToolIds.has(tool._id));
  const otherTools = sortedTools.filter(tool => !projectSpecificToolIds.has(tool._id));
  const selectedProjectName = bmProjects.find(project => project._id === projectId)?.name || '';

  const matchingToolRecords = toolId
    ? toolInventory.filter(tool => getObjectId(tool.itemType) === toolId)
    : [];
  const matchingProjectToolRecords = matchingToolRecords.filter(
    tool => getObjectId(tool.project) === projectId,
  );

  const projectPurchaseHistory = matchingProjectToolRecords
    .flatMap(tool => tool.purchaseRecord || [])
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const crossProjectPurchaseHistory = matchingToolRecords
    .flatMap(tool => tool.purchaseRecord || [])
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const projectAvailableCount = (selectedTool?.available || []).filter(
    item => getObjectId(item.project) === projectId,
  ).length;
  const projectUsingCount = (selectedTool?.using || []).filter(
    item => getObjectId(item.project) === projectId,
  ).length;
  const globalAvailableCount = selectedTool?.available?.length || 0;
  const globalUsingCount = selectedTool?.using?.length || 0;

  const availabilitySummary = {
    projectAvailableCount,
    projectUsingCount,
    globalAvailableCount,
    globalUsingCount,
  };

  const suggestedPriority = getSuggestedPriority(projectPurchaseHistory, availabilitySummary);
  const lastRequestedRecord = projectPurchaseHistory[0] || crossProjectPurchaseHistory[0] || null;
  const recentDuplicateRecord =
    projectPurchaseHistory.find(
      record => getDaysSince(record.date) <= RECENT_REQUEST_WINDOW_DAYS,
    ) || null;

  const availabilityStatus = (() => {
    if (!selectedTool) return 'Select a tool to view availability.';
    if (!projectId)
      return `${globalAvailableCount} available and ${globalUsingCount} in use across all projects.`;
    if (projectAvailableCount > 0) {
      return `${projectAvailableCount} available on ${selectedProjectName}.`;
    }
    if (projectUsingCount > 0) {
      return `${projectUsingCount} currently in use on ${selectedProjectName}.`;
    }
    if (globalAvailableCount > 0) {
      return `${globalAvailableCount} available on other projects.`;
    }
    if (globalUsingCount > 0) {
      return `${globalUsingCount} currently in use across other projects.`;
    }
    return 'No active inventory found for this tool yet.';
  })();

  useEffect(() => {
    if (!priorityTouched) {
      setPriority(suggestedPriority);
    }
  }, [suggestedPriority, priorityTouched]);

  useEffect(() => {
    setPriorityTouched(false);
  }, [projectId, toolId]);

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
          maxLength={DESC_CHAR_LIMIT}
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
