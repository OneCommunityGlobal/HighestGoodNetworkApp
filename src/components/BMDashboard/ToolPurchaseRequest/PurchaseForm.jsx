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
  const [validationError, setValidationError] = useState('');

  const schema = Joi.object({
    projectId: Joi.string().required(),
    toolId: Joi.string().required(),
    quantity: Joi.number()
      .min(1)
      .max(999)
      .integer()
      .required(),
    priority: Joi.string().required(),
    estTime: Joi.string().required(),
    desc: Joi.string()
      .required()
      .max(DESC_CHAR_LIMIT),
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
    const { error } = schema.validate({
      projectId,
      toolId,
      quantity,
      priority,
      estTime,
      desc,
      makeModel,
    });
    if (error) {
      // Display the first validation error message
      setValidationError(
        error.details[0]?.message || 'Invalid form data. Please review your inputs.',
      );
      return;
    }
    setValidationError('');
    const body = {
      projectId,
      toolId,
      quantity,
      priority,
      estTime,
      desc,
      makeModel,
    };
    const response = await purchaseTools(body);
    setProjectId('');
    setToolId('');
    setQty('');
    setPriority('Low');
    setPriorityTouched(false);
    setMakeModel('');
    setEstTime('');
    setDesc('');

    if (response.status === 201) {
      toast.success('Success: your purchase request has been logged.');
      history.push('/bmdashboard/tools');
    } else if (response.status >= 400) {
      toast.error(`Error: ${response.status} ${response.statusText}.`);
    } else toast.warning(`Warning: unexpected status ${response.status}.`);
  };

  const handleCancel = e => {
    e.preventDefault();
    history.goBack();
  };

  return (
    <Form className={`${styles.purchaseToolForm}`} onSubmit={handleSubmit}>
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
          {!projectId &&
            sortedTools.map(({ _id, name }) => (
              <option value={_id} key={_id}>
                {name}
              </option>
            ))}
          {!!projectId && !!projectFocusedTools.length && (
            <optgroup label={`Suggested for ${selectedProjectName}`}>
              {projectFocusedTools.map(({ _id, name }) => (
                <option value={_id} key={_id}>
                  {name}
                </option>
              ))}
            </optgroup>
          )}
          {!!projectId && !!otherTools.length && (
            <optgroup label={projectFocusedTools.length ? 'Other Tool Types' : 'All Tool Types'}>
              {otherTools.map(({ _id, name }) => (
                <option value={_id} key={_id}>
                  {name}
                </option>
              ))}
            </optgroup>
          )}
        </Input>
        {projectId && (
          <FormText>
            {projectFocusedTools.length
              ? 'Tools already used, available, or previously requested on this project are grouped first.'
              : 'No prior tool history was found for this project, so the full catalog is shown.'}
          </FormText>
        )}
      </FormGroup>
      {toolId && (
        <section className={styles.toolInsightPanel}>
          <div className={styles.toolInsightHeader}>
            <h3>Selection Insights</h3>
            <span className={styles.toolInsightPriority}>
              Suggested priority: {suggestedPriority}
            </span>
          </div>
          <dl className={styles.toolInsightGrid}>
            <div>
              <dt>Availability Status</dt>
              <dd>{availabilityStatus}</dd>
            </div>
            <div>
              <dt>Last Requested</dt>
              <dd>{formatDate(lastRequestedRecord?.date)}</dd>
            </div>
            <div>
              <dt>Common Use Case</dt>
              <dd>{selectedTool?.description || 'No usage guidance added for this tool yet.'}</dd>
            </div>
          </dl>
          {recentDuplicateRecord && selectedProjectName && (
            <p className={styles.toolWarning}>
              Warning: this tool was already requested for {selectedProjectName} on{' '}
              {formatDate(recentDuplicateRecord.date)} with {recentDuplicateRecord.priority}{' '}
              priority.
            </p>
          )}
        </section>
      )}
      <div className={`${styles.purchaseToolFlexGroup}`}>
        <FormGroup className={`${styles.flexGroupQty}`}>
          <Label for="input-quantity">Quantity</Label>
          <div className={`${styles.flexGroupQtyContainer}`}>
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
          <Label for="input-priority">Priority</Label>
          <Input
            id="input-priority"
            type="select"
            value={priority}
            onChange={({ currentTarget }) => {
              setValidationError('');
              setPriorityTouched(true);
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
          maxLength={DESC_CHAR_LIMIT}
          value={desc}
          onChange={({ currentTarget }) => {
            setValidationError('');
            setDesc(currentTarget.value.slice(0, DESC_CHAR_LIMIT));
          }}
        />
        <BMCharacterLimitHint limit={DESC_CHAR_LIMIT} length={desc.length} />
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
      <div className={`${styles.purchaseToolError}`}>
        {validationError && <p>{validationError}</p>}
      </div>
      {!!projectId && !!toolId && (
        <div className={styles.confirmationSummary}>
          <h3>Ready to Submit</h3>
          <p>
            You are requesting {quantity || '0'} {selectedTool?.name || 'tool'} for{' '}
            {selectedProjectName || 'the selected project'} with {priority} priority.
          </p>
          <p>
            Expected use: {estTime || 'not provided yet'}.
            {makeModel ? ` Preferred make/model: ${makeModel}.` : ''}
          </p>
          <p>{desc || 'Add a short usage description before submitting.'}</p>
        </div>
      )}
      <div className={`${styles.purchaseToolButtons}`}>
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
            !toolId ||
            !quantity ||
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
