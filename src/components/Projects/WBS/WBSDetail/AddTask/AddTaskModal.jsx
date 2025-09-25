import { Editor } from '@tinymce/tinymce-react';
import dateFnsFormat from 'date-fns/format';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DayPicker, useInput } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { boxStyle, boxStyleDark } from '~/styles';

import { faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { addNewTask } from '../../../../../actions/task';
import {
  END_DATE_ERROR_MESSAGE,
  START_DATE_ERROR_MESSAGE
} from '../../../../../languages/en/messages';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getProjectDetail } from '../../../../../actions/project';
import { fetchAllMembers } from '../../../../../actions/projectMembers';
import '../../../../Header/DarkMode.css';
import TagsSearch from '../components/TagsSearch';
import './AddTaskModal.css';

/** small v8 DateInput: uses useInput + DayPicker under the hood **/
function DateInput({ id, ariaLabel, placeholder, value, onChange, disabled }) {
  const { inputProps, dayPickerProps, show, toggle } = useInput({
    mode: 'single',
    selected: value ? new Date(value) : undefined,
    onDayChange(date) {
      // format back to your MM/dd/yy
      /* eslint-disable */
      const f = dateFnsFormat(date, FORMAT);
      onChange(f);
      toggle(false);
    },
  });

  return (
    <div style={{ position: 'relative' }}>
      <input
        {...inputProps}
        id={id}
        aria-label={ariaLabel}
        placeholder={placeholder}
        onFocus={() => !disabled && toggle(true)}
        readOnly
        disabled={disabled}
        className="form-control" /* or whatever styling you need */
      />
      {show && !disabled && (
        <div style={{ position: 'absolute', zIndex: 10 }}>
          <DayPicker {...dayPickerProps} />
        </div>
      )}
    </div>
  );
}

const TINY_MCE_INIT_OPTIONS = {
  license_key: 'gpl',
  menubar: false,
  plugins: 'advlist autolink autoresize lists link charmap table help',
  toolbar:
    'bold italic  underline numlist   |  removeformat link bullist  outdent indent |\
                    styleselect fontsizeselect | table| strikethrough forecolor backcolor |\
                    subscript superscript charmap  | help',
  branding: false,
  min_height: 180,
  max_height: 300,
  autoresize_bottom_margin: 1,
};

function AddTaskModal(props) {
  /*
   * -------------------------------- variable declarations --------------------------------
   */
  // props from store
  const { copiedTask, allMembers, allProjects, error, darkMode, projectById } = props;
  const tasksList = Array.isArray(props.tasks) ? props.tasks : [];

  const handleBestHoursChange = e => {
    setHoursBest(e.target.value);
  };
  const handleWorstHoursChange = e => {
    setHoursWorst(e.target.value);
  };
  const handleMostHoursChange = e => {
    setHoursMost(e.target.value);
  };
  const handleEstimateHoursChange = e => {
    setHoursEstimate(e.target.value);
  };

  const handleBestHoursBlur = () => {
    calHoursEstimate();
  };

  const handleWorstHoursBlur = () => {
    calHoursEstimate('hoursWorst');
  };

  const handleMostHoursBlur = () => {
    calHoursEstimate('hoursMost');
  };

  // states from hooks
   const activeMembers = useMemo(() => {
        const members = Array.isArray(allMembers) ? allMembers : [];
        const filtered = members.filter(u => {
          if (!u) return false;
          // Treat only explicit “inactive” as excluded; accept truthy/unknown as active
          const isInactive =
            u.status === 'Inactive' ||
            u.isActive === false ||
            String(u?.isActive).toLowerCase() === 'false';
          return !isInactive;
        });
        return filtered.length ? filtered : members; // fallback so the list isn't empty
      }, [allMembers]);

const projectsList = Array.isArray(allProjects?.projects) ? allProjects.projects : [];
const defaultCategory = useMemo(() => {
  if (props.taskId) {
    const task = tasksList.find(t => t?._id === props.taskId);
    return task?.category ?? 'Unspecified';
  }
  if (props.projectId) {
    // Prefer the category from projectById if available (covers page refresh case)
    const categoryFromProjectById = projectById?.category;
    if (typeof categoryFromProjectById === 'string' && categoryFromProjectById.length) {
      return categoryFromProjectById;
    }
    const project = projectsList.find(p => p?._id === props.projectId);
    return project?.category ?? 'Unspecified';
  }
  return 'Unspecified';
}, [props.taskId, props.projectId, projectById?.category, tasksList.length, projectsList.length]);


  const [taskName, setTaskName] = useState('');
  const [priority, setPriority] = useState('Primary');
  const [resourceItems, setResourceItems] = useState([]);
  const [assigned, setAssigned] = useState(false);
  const [status, setStatus] = useState('Started');
  const [hoursBest, setHoursBest] = useState(0);
  const [hoursMost, setHoursMost] = useState(0);
  const [hoursWorst, setHoursWorst] = useState(0);
  const [hoursEstimate, setHoursEstimate] = useState(0);
  const [hasNegativeHours, setHasNegativeHours] = useState(false);
  const [link, setLink] = useState('');
  const [links, setLinks] = useState([]);
  const [category, setCategory] = useState(defaultCategory);
  const [whyInfo, setWhyInfo] = useState('');
  const [intentInfo, setIntentInfo] = useState('');
  const [startedDate, setStartedDate] = useState('');
  const [endstateInfo, setEndstateInfo] = useState('');
  const [startDateError, setStartDateError] = useState(false);
  const [endDateError, setEndDateError] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [modal, setModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newTaskNum, setNewTaskNum] = useState('1');
  const [dateWarning, setDateWarning] = useState(false);
  const [hoursWarning, setHoursWarning] = useState(false);
  const priorityRef = useRef(null);

  const categoryOptions = [
    { value: 'Unspecified', label: 'Unspecified' },
    { value: 'Housing', label: 'Housing' },
    { value: 'Food', label: 'Food' },
    { value: 'Energy', label: 'Energy' },
    { value: 'Education', label: 'Education' },
    { value: 'Society', label: 'Society' },
    { value: 'Economics', label: 'Economics' },
    { value: 'Stewardship', label: 'Stewardship' },
    { value: 'Other', label: 'Other' },
  ];
  const FORMAT = 'MM/dd/yy';

  /*
   * -------------------------------- functions --------------------------------
   */
  const toggle = () => setModal(!modal);

  const openModal = () => {
    if (!props.isOpen && props.setIsOpen) props.setIsOpen(true);
    toggle();
  };

  const getNewNum = () => {
    if (!tasksList.length) return '1';
    let newNum;
    if (props.taskId) {
      const numOfLastInnerLevelTask = tasksList.reduce((num, task) => {
        if (task.mother === props.taskId) {
          const numIndexArray = task.num.split('.');
          const numOfInnerLevel = numIndexArray[props.level];
          num = +numOfInnerLevel > num ? +numOfInnerLevel : num;
        }
        return num;
      }, 0);
      const currentLevelIndexes = props.taskNum.replaceAll('.0', '').split('.');
      currentLevelIndexes[props.level] = `${numOfLastInnerLevelTask + 1}`;
      newNum = currentLevelIndexes.join('.');
    } else {
      const numOfLastLevelOneTask = tasksList.reduce((num, task) => {
        if (task.level === 1) {
          const numIndexArray = task.num.split('.');
          const indexOfFirstNum = numIndexArray[0];
          num = +indexOfFirstNum > num ? +indexOfFirstNum : num;
        }
        return num;
      }, 0);
      newNum = `${numOfLastLevelOneTask + 1}`;
    }
    return newNum;
  };

  const removeResource = userID => {
    const newResource = resourceItems.filter(item => item.userID !== userID);
    setResourceItems(newResource);
    if (!newResource.length) setAssigned(false);
  };

  const addResources = (userID, first, last, profilePic) => {
    const newResource = [
      {
        userID,
        name: `${first} ${last}`,
        profilePic,
      },
      ...resourceItems,
    ];
    setResourceItems(newResource);
    setAssigned(true);
  };

  const formatDate = (date, format, locale) => dateFnsFormat(date, format, { locale });

  const calHoursEstimate = (isOn = null) => {
    let currHoursMost = parseInt(hoursMost);
    let currHoursWorst = parseInt(hoursWorst);
    const currHoursBest = parseInt(hoursBest);
    if (isOn !== 'hoursMost') {
      currHoursMost = Math.round((currHoursWorst - currHoursBest) / 2 + currHoursBest);
      setHoursMost(currHoursMost);
      if (isOn !== 'hoursWorst') {
        currHoursWorst = Math.round(currHoursBest * 2);
        setHoursWorst(currHoursWorst);
        currHoursMost = Math.round((currHoursWorst - currHoursBest) / 2 + currHoursBest);
        setHoursMost(currHoursMost);
      }
    }

    setHoursEstimate(parseInt((currHoursMost + currHoursBest + currHoursWorst) / 3));

    if (!(currHoursBest <= currHoursMost && currHoursMost <= currHoursWorst)) {
      setHoursWarning(true);
    } else {
      setHoursWarning(false);
    }
  };

  useEffect(() => {
    if (hoursBest < 0 || hoursWorst < 0 || hoursMost < 0 || hoursEstimate < 0) {
      setHasNegativeHours(true);
    } else {
      setHasNegativeHours(false);
    }
  }, [hoursBest, hoursWorst, hoursMost, hoursEstimate]);

  const changeDateStart = startDate => {
    setStartedDate(startDate);
  };

  const changeDateEnd = dueDate => {
    if (!startedDate) {
      const newDate = dateFnsFormat(new Date(), FORMAT);
      setStartedDate(newDate);
    }
    setDueDate(dueDate);
  };

  useEffect(() => {
    if (dueDate && dueDate < startedDate) {
      setEndDateError(true);
      setStartDateError(true);
    } else {
      setEndDateError(false);
      setStartDateError(false);
    }
  }, [startedDate, dueDate]);

  const addLink = () => {
    setLinks([...links, link]);
    setLink('');
  };

  const removeLink = index => {
    setLinks([...links.slice(0, index), ...links.slice(index + 1)]);
  };

  const clear = () => {
    setTaskName('');
    setPriority('Primary');
    setResourceItems([]);
    setAssigned(false);
    setStatus('Started');
    setHoursBest(0);
    setHoursWorst(0);
    setHoursMost(0);
    setHoursEstimate(0);
    setStartedDate('');
    setDueDate('');
    setLinks([]);
    setWhyInfo('');
    setIntentInfo('');
    setEndstateInfo('');
    setCategory(defaultCategory);
    setStartDateError(false);
    setEndDateError(false);
    setHasNegativeHours(false);
  };

  const paste = () => {
    setTaskName(copiedTask.taskName);

    setPriority(copiedTask.priority);
    priorityRef.current.value = copiedTask.priority;

    setResourceItems(copiedTask.resources);
    setAssigned(copiedTask.isAssigned);
    setStatus(copiedTask.status);

    setHoursBest(copiedTask.hoursBest);
    setHoursWorst(copiedTask.hoursWorst);
    setHoursMost(copiedTask.hoursMost);
    setHoursEstimate(copiedTask.estimatedHours);

    setStartedDate(copiedTask.startedDatetime);
    setDueDate(copiedTask.dueDatetime);

    setLinks(copiedTask.links);
    setWhyInfo(copiedTask.whyInfo);
    setIntentInfo(copiedTask.intentInfo);
    setEndstateInfo(copiedTask.endstateInfo);
  };

  const addNewTask = async () => {
    setIsLoading(true);
    const newTask = {
      taskName,
      wbsId: props.wbsId,
      num: newTaskNum,
      level: props.taskId ? props.level + 1 : 1,
      priority,
      resources: resourceItems,
      isAssigned: assigned,
      status,
      hoursBest: parseFloat(hoursBest),
      hoursWorst: parseFloat(hoursWorst),
      hoursMost: parseFloat(hoursMost),
      estimatedHours: parseFloat(hoursEstimate),
      startedDatetime: startedDate,
      dueDatetime: dueDate,
      links,
      category,
      parentId1: props.level === 1 ? props.taskId : props.parentId1,
      parentId2: props.level === 2 ? props.taskId : props.parentId2,
      parentId3: props.level === 3 ? props.taskId : props.parentId3,
      mother: props.taskId,
      position: 0, // it is required in database schema, didn't find its usage
      isActive: true,
      whyInfo,
      intentInfo,
      endstateInfo,
    };
    await props.addNewTask(newTask, props.wbsId, props.pageLoadTime);
    toggle();
    setIsLoading(false);
    props.load();
  };

  /*
   * -------------------------------- useEffects --------------------------------
   */
  useEffect(() => {
    if (modal) {
      setNewTaskNum(getNewNum());
    }
    // setNewTaskNum(getNewNum());
  }, [modal, tasksList.length, props.taskId, props.level, props.taskNum]);

  useEffect(() => {
    ReactTooltip.rebuild();
  }, [links]);

  useEffect(() => {
    if (error === 'outdated') {
      // eslint-disable-next-line no-alert
      // alert('Database changed since your page loaded , click OK to get the newest data!');
      props.load();
    } else {
      clear();
    }
  }, [error, tasksList.length]);

  useEffect(() => {
    if (!modal) {
      setStartedDate('');
      setDueDate('');
      setStartDateError(false);
      setEndDateError(false);
    }
  }, [modal]);

  useEffect(() => {
        if (modal) {
          // Fetch for this project whenever modal opens (or project changes)
          props.fetchAllMembers(props.projectId ?? '');
        }
      }, [modal, props.projectId]);

  useEffect(() => {
    if (!modal || !props.projectId) return;

    const categoryKnownFromProjectById =
      Boolean(projectById && projectById._id === props.projectId && projectById.category);
    const categoryKnownFromAllProjects =
      Boolean(projectsList.find(p => p?._id === props.projectId)?.category);

    if (!categoryKnownFromProjectById && !categoryKnownFromAllProjects) {
      props.getProjectDetail(props.projectId);
    }
  }, [modal, props.projectId, projectById, projectsList]);

  useEffect(() => {
    setCategory(defaultCategory);
  }, [defaultCategory]);
  
  const fontColor = darkMode ? 'text-light' : '';

  return (
    <>
      <Modal isOpen={modal} toggle={toggle} className={darkMode ? 'text-light dark-mode' : ''}>
        <ModalHeader
          toggle={toggle}
          className={`w-100 align-items-center ${darkMode ? 'bg-space-cadet' : ''}`}
        >
          <ReactTooltip delayShow={300} />
          <p className="fs-2 d-inline mr-3">Add New Task</p>
          <button
            type="button"
            size="small"
            className="btn btn-primary btn-sm ml-2"
            onClick={() => paste()}
            disabled={hoursWarning}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Paste
          </button>
          <button
            type="button"
            size="small"
            className="btn btn-danger btn-sm ml-2"
            onClick={() => clear()}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Reset
          </button>
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue dark-mode no-hover' : ''}>
          <div className="table table-bordered responsive">
            <div>
              <div className="add_new_task_form-group">
                <span className={`add_new_task_form-label ${fontColor}`} data-tip="WBS ID">
                  WBS #
                </span>

                <span className={`add_new_task_form-input_area ${fontColor}`}>{newTaskNum}</span>
              </div>
              <div className="add_new_task_form-group">
                <label htmlFor="taskNameInput" className={`add_new_task_form-label ${fontColor}`}>
                  Task Name
                </label>
                <span className="add_new_task_form-input_area">
                  <textarea
                    id="taskNameInput"
                    rows="2"
                    className="task-name border border-dark rounded"
                    onChange={e => setTaskName(e.target.value)}
                    value={taskName}
                  />
                </span>
              </div>

              <div className="add_new_task_form-group">
                <label htmlFor="priority" className={`add_new_task_form-label ${fontColor}`}>
                  Priority
                </label>
                <span className="add_new_task_form-input_area">
                  <select
                    id="priority"
                    onChange={e => setPriority(e.target.value)}
                    ref={priorityRef}
                  >
                    <option value="Primary">Primary</option>
                    <option value="Secondary">Secondary</option>
                    <option value="Tertiary">Tertiary</option>
                  </select>
                </span>
              </div>

              <div className="add_new_task_form-group">
                <label htmlFor="resource-input" className={`add_new_task_form-label ${fontColor}`}>
                  Resources
                </label>
                <div className="add_new_task_form-input_area">
                <TagsSearch
                  key={`tags-${props.projectId}-${activeMembers.length}`}
                  placeholder="Add resources"
                  members={activeMembers}
                  addResources={addResources}
                  removeResource={removeResource}
                  resourceItems={resourceItems}
                  disableInput={false}
                  inputTestId="resource-input"
                  projectId={props.projectId}
                />
                </div>
              </div>

              <div className="add_new_task_form-group">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className={`add_new_task_form-label ${fontColor}`}>Assigned</label>
                <div className="add_new_task_form-input_area">
                  <div className="flex-row d-inline align-items-center">
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="assigned-yes"
                        name="Assigned"
                        value="true"
                        checked={assigned === true}
                        onChange={() => setAssigned(true)}
                      />
                      <label className={`form-check-label ${fontColor}`} htmlFor="assigned-yes">
                        Yes
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="assigned-no"
                        name="Assigned"
                        value="false"
                        checked={assigned === false}
                        onChange={() => setAssigned(false)}
                      />
                      <label className={`form-check-label ${fontColor}`} htmlFor="assigned-no">
                        No
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="add_new_task_form-group">
                <span className={`add_new_task_form-label ${fontColor}`}>Status</span>
                <span className="add_new_task_form-input_area">
                  <div className="d-flex align-items-center flex-wrap">
                    <span className="form-check form-check-inline mr-5">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="active"
                        name="status"
                        value="Active"
                        checked={status === 'Active' || status === 'Started'}
                        onChange={e => setStatus(e.target.value)}
                      />
                      <label className={`form-check-label ${fontColor}`} htmlFor="active">
                        Active
                      </label>
                    </span>
                    <span className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="notStarted"
                        name="status"
                        value="Not Started"
                        checked={status === 'Not Started'}
                        onChange={e => setStatus(e.target.value)}
                      />
                      <label className={`form-check-label ${fontColor}`} htmlFor="notStarted">
                        Not Started
                      </label>
                    </span>
                  </div>
                  <div className="d-flex align-items-center flex-wrap">
                    <span className="form-check form-check-inline mr-5">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="paused"
                        name="status"
                        value="Paused"
                        checked={status === 'Paused'}
                        onChange={e => setStatus(e.target.value)}
                      />
                      <label className={`form-check-label ${fontColor}`} htmlFor="paused">
                        Paused
                      </label>
                    </span>
                    <span className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="complete"
                        name="status"
                        value="Complete"
                        checked={status === 'Complete'}
                        onChange={e => setStatus(e.target.value)}
                      />
                      <label className={`form-check-label ${fontColor}`} htmlFor="complete">
                        Complete
                      </label>
                    </span>
                  </div>
                </span>
              </div>
              <div className="add_new_task_form-group">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className={`add_new_task_form-label ${fontColor}`}>Hours</label>
                <div className="add_new_task_form-input_area">
                  <div className="py-2 d-flex align-items-center justify-content-sm-around">
                    <label
                      htmlFor="bestCaseInput"
                      className={`hours-label text-nowrap align-self-center ${fontColor}`}
                    >
                      Best-case
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={hoursBest}
                      onChange={handleBestHoursChange}
                      onBlur={handleBestHoursBlur}
                      id="bestCaseInput"
                      className="hours-input"
                      aria-label="Best-case hours"
                    />
                  </div>
                  {hoursWarning && (
                    <div className="warning">The number of hours must be less than other cases</div>
                  )}
                  <div className="py-2 d-flex align-items-center justify-content-sm-around">
                    <label
                      htmlFor="worstCaseInput"
                      className={`hours-label text-nowrap align-self-center ${fontColor}`}
                    >
                      Worst-case
                    </label>
                    <input
                      type="number"
                      min={hoursBest}
                      max="500"
                      value={hoursWorst}
                      onChange={handleWorstHoursChange}
                      onBlur={handleWorstHoursBlur}
                      id="worstCaseInput"
                      className="hours-input"
                      aria-label="Worst-case hours"
                    />
                  </div>
                  {hoursWarning && (
                    <div className="warning">
                      The number of hours must be higher than other cases
                    </div>
                  )}
                  <div className="py-2 d-flex align-items-center justify-content-sm-around">
                    <label
                      htmlFor="mostCaseInput"
                      className={`hours-label text-nowrap align-self-center ${fontColor}`}
                    >
                      Most-case
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={hoursMost}
                      onChange={handleMostHoursChange}
                      onBlur={handleMostHoursBlur}
                      id="mostCaseInput"
                      className="hours-input"
                      aria-label="Most-case hours"
                    />
                  </div>
                  {hoursWarning && (
                    <div className="warning">
                      The number of hours must range between best and worst cases
                    </div>
                  )}
                  <div className="py-2 d-flex align-items-center justify-content-sm-around">
                    <label
                      htmlFor="estimatedInput"
                      className={`hours-label text-nowrap align-self-center ${fontColor}`}
                    >
                      Estimated
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={hoursEstimate}
                      onChange={handleEstimateHoursChange}
                      id="estimatedInput"
                      className="hours-input"
                      aria-label="Estimated hours"
                    />
                  </div>
                  <div className="warning">
                    {hasNegativeHours ? 'Negative hours are not allowed.' : ''}
                  </div>
                </div>
              </div>

              <div className="add_new_task_form-group">
                <label htmlFor="linkInput" className={`add_new_task_form-label ${fontColor}`}>
                  Links
                </label>
                <span className="add_new_task_form-input_area">
                  <div className="d-flex flex-row">
                    <input
                      type="text"
                      id="linkInput"
                      aria-label="Link Input"
                      placeholder="Link"
                      className="task-resouces-input"
                      onChange={e => setLink(e.target.value)}
                      value={link}
                    />
                    <button
                      type="button"
                      className="task-resouces-btn"
                      aria-label="Add Link"
                      onClick={addLink}
                    >
                      <FontAwesomeIcon
                        icon={faPlusCircle}
                        title="Add link"
                        style={{
                          color: '#007bff',           
                          cursor: 'pointer',
                          fontSize: '1.1rem',         
                          marginLeft: '8px',          
                          verticalAlign: 'middle',    
                        }}
                      />
                    </button>
                  </div>
                  <div>
                    {links.map((link, i) => (
                      <div key={i} className="link-item" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start', 
                        gap: '8px',
                        marginBottom: '4px',
                      }}>
                        <a href={link} className="task-link" target="_blank" rel="noreferrer">
                          {link}
                        </a>
                        <button
                          type="button"
                          aria-label={`Delete link ${link}`}
                          onClick={() => removeLink(i)}
                          style={{
                            background: 'none',
                            border: 'none',
                            marginLeft: '8px',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faMinusCircle}
                            title="Remove link"
                            style={{
                              color: '#dc3545', // Bootstrap red
                              fontSize: '1.1rem',
                            }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </span>
              </div>

              <div className="d-flex border align-items-center">
                <label htmlFor="category-select" className={`add_new_task_form-label ${fontColor}`}>
                  Category
                </label>
                <span className="add_new_task_form-input_area">
                  <select
                    id="category-select"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    aria-label="Category"
                  >
                    {categoryOptions.map(cla => (
                      <option value={cla.value} key={cla.value}>
                        {cla.label}
                      </option>
                    ))}
                  </select>
                </span>
              </div>
              <div>
                <div className={`border p-1 ${fontColor}`} aria-labelledby="why-task-label">
                  <div id="why-task-label">Why this Task is Important</div>
                  <Editor
                    tinymceScriptSrc="/tinymce/tinymce.min.js"
                    licenseKey="gpl"
                    init={TINY_MCE_INIT_OPTIONS}
                    name="why-info"
                    className="why-info form-control"
                    value={whyInfo}
                    onEditorChange={content => setWhyInfo(content)}
                  />
                </div>
              </div>
              <div>
                <div className={`border p-1 ${fontColor}`} aria-labelledby="design-intent-label">
                  <div id="design-intent-label">Design Intent</div>
                  <Editor
                    tinymceScriptSrc="/tinymce/tinymce.min.js"
                    licenseKey="gpl"
                    init={TINY_MCE_INIT_OPTIONS}
                    name="intent-info"
                    className="intent-info form-control"
                    value={intentInfo}
                    onEditorChange={content => setIntentInfo(content)}
                  />
                </div>
              </div>
              <div>
                <div className={`border p-1 ${fontColor}`} aria-labelledby="endstate-label">
                  <div id="endstate-label">Endstate</div>
                  <Editor
                    tinymceScriptSrc="/tinymce/tinymce.min.js"
                    licenseKey="gpl"
                    init={TINY_MCE_INIT_OPTIONS}
                    name="endstate-info"
                    className="endstate-info form-control"
                    value={endstateInfo}
                    onEditorChange={content => setEndstateInfo(content)}
                  />
                </div>
              </div>
              <div className="d-flex border add-modal-dt">
                {/* eslint-disable-next-line jsx-a11y/scope */}
                <span scope="col" className={`form-date p-1 ${fontColor}`}>Start Date</span>
                {/* eslint-disable-next-line jsx-a11y/scope */}
                <span scope="col" className="border-left p-1">
                  <div>
                    <DateInput
                      id="start-date-input"
                      ariaLabel="Start Date"
                      placeholder={dateFnsFormat(new Date(), FORMAT)}
                      value={startedDate}
                      onChange={changeDateStart}
                      disabled={false} // always enabled here
                    />
                    <div className="warning">{startDateError ? START_DATE_ERROR_MESSAGE : ''}</div>
                  </div>
                </span>
              </div>
              <div className="d-flex border align-items-center  add-modal-dt">
                <label
                  htmlFor="end-date-input"
                  className={`form-date p-1 ${fontColor}`}
                  // eslint-disable-next-line jsx-a11y/scope
                  scope="col"
                >
                  End Date
                </label>
                {/* eslint-disable-next-line jsx-a11y/scope */}
                <span scope="col" className="border-left p-1">
                  <DateInput
                    id="end-date-input"
                    ariaLabel="End Date"
                    placeholder={dateFnsFormat(new Date(), FORMAT)}
                    value={dueDate}
                    onChange={changeDateEnd}
                    disabled={false}
                  />
                  <div className="warning">{endDateError ? END_DATE_ERROR_MESSAGE : ''}</div>
                </span>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button
            color="primary"
            onClick={addNewTask}
            disabled={
              taskName === '' ||
              hoursWarning ||
              isLoading ||
              startDateError ||
              endDateError ||
              hasNegativeHours
            }
            style={darkMode ? boxStyleDark : boxStyle}
          >
            {isLoading ? 'Adding Task...' : 'Save'}
          </Button>
        </ModalFooter>
      </Modal>
      <Button
        color="primary"
        className="controlBtn"
        size="sm"
        onClick={openModal}
        style={darkMode ? boxStyleDark : boxStyle}
      >
        Add Task
      </Button>
    </>
  );
}

const mapStateToProps = state => ({
  copiedTask: state.tasks.copiedTask,
  allMembers: state.projectMembers.members,
  allProjects: state.allProjects,
  projectById: state.projectById,
  error: state.tasks.error,
  darkMode: state.theme.darkMode,
  // tasks: state.tasks.taskItems,
});

const mapDispatchToProps = {
  addNewTask,
  fetchAllMembers,
  getProjectDetail,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddTaskModal);
