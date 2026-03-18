import { faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { Editor } from '@tinymce/tinymce-react';
import { clsx } from 'clsx';
import { isValid } from 'date-fns';
import dateFnsFormat from 'date-fns/format';
import dateFnsParse from 'date-fns/parse';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { boxStyle, boxStyleDark } from '~/styles';
import { addNewTask } from '../../../../../actions/task';
import {
  END_DATE_ERROR_MESSAGE,
  START_DATE_ERROR_MESSAGE
} from '../../../../../languages/en/messages';
import '../../../../Header/index.css';
import TagsSearch from '../components/TagsSearch';
import styles from '../wbs.module.css';
// import styles from './AddTaskModal.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getProjectDetail } from '../../../../../actions/project';
import { fetchAllMembers } from '../../../../../actions/projectMembers';
import { fetchAllProjects } from '../../../../../actions/projects';

// Replace the darkModeStyles with this:
const darkModeStyles = `
  /* Only target dark mode elements */
  .dark-mode .modal-content,
  .dark-mode .modal-header,
  .dark-mode .modal-body,
  .dark-mode .modal-footer {
    background-color: #1a2639 !important;
    color: #fff !important;
  }

  .dark-mode .modal-header {
    border-bottom-color: #2d3a5a !important;
  }

  .dark-mode .modal-footer {
    border-top-color: #2d3a5a !important;
  }

  /* Form elements */
  .dark-mode input,
  .dark-mode textarea,
  .dark-mode select {
    background-color: #1e2b4a !important;
    color: #fff !important;
    border-color: #2d3a5a !important;
  }
    .dark-mode select option {
    background-color: #1e2b4a !important;
    color: #fff !important;
  }

  .dark-mode select option:hover,
  .dark-mode select option:focus,
  .dark-mode select option:checked {
    background-color: #3b82f6 !important;
    color: #fff !important;
  }

  .dark-mode label,
  .dark-mode span:not(.badge) {
    color: #fff !important;
  }

  /* Borders */
  .dark-mode .border,
  .dark-mode .border-left,
  .dark-mode .border-right,
  .dark-mode .border-top,
  .dark-mode .border-bottom {
    border-color: #2d3a5a !important;
  }

  /* Warning text */
  .dark-mode .warning {
    color: #ff6b6b !important;
  }

  /* Buttons */
  .dark-mode .btn-primary {
    background-color: #3b82f6 !important;
    border-color: #3b82f6 !important;
  }

  .dark-mode .btn-danger {
    background-color: #dc3545 !important;
    border-color: #dc3545 !important;
  }
  
  .dark-mode .tox-tinymce {
    background-color: #1e2b4a !important;
    border-color: #2d3a5a !important;
  }

  .dark-mode .tox-editor-container {
    background-color: #1e2b4a !important;
  }

  .dark-mode .tox-edit-area {
    background-color: #1e2b4a !important;
  }

  .dark-mode .tox-edit-area iframe {
    background-color: #1e2b4a !important;
  }

  .dark-mode .tox-toolbar {
    background-color: #1a2639 !important;
    border-bottom-color: #2d3a5a !important;
  }

  .dark-mode .tox-toolbar__primary {
    background-color: #1a2639 !important;
  }

  .dark-mode .tox-tbtn {
    color: #fff !important;
  }

  .dark-mode .tox-tbtn:hover {
    background-color: #2d3a5a !important;
  }

  .dark-mode .tox-tbtn--enabled {
    background-color: #3b82f6 !important;
  }

  .dark-mode .tox-statusbar {
    background-color: #1a2639 !important;
    border-top-color: #2d3a5a !important;
    color: #aaa !important;
  }

  /* Date inputs */
  .dark-mode [class*="form-date"] {
    color: #fff !important;
  }

  /* Remove any white backgrounds */
  .dark-mode div[style*="background-color: white"] {
    background-color: #1a2639 !important;
  }
  
  .dark-mode hr,
  .dark-mode .divider,
  .dark-mode [class*="separator"] {
    border-color: #2d3a5a !important;
    background-color: #2d3a5a !important;
  }

  /* Fix table borders and lines */
  .dark-mode .table,
  .dark-mode .table-bordered,
  .dark-mode .table-bordered th,
  .dark-mode .table-bordered td,
  .dark-mode .table td,
  .dark-mode .table th {
    border-color: #2d3a5a !important;
  }

  /* Fix all text to be white in dark mode */
  .dark-mode,
  .dark-mode *,
  .dark-mode .text-dark,
  .dark-mode .text-body,
  .dark-mode p,
  .dark-mode span,
  .dark-mode div,
  .dark-mode h1,
  .dark-mode h2,
  .dark-mode h3,
  .dark-mode h4,
  .dark-mode h5,
  .dark-mode h6,
  .dark-mode label,
  .dark-mode .form-label,
  .dark-mode .add_new_task_form-label,
  .dark-mode [class*="form-label"],
  .dark-mode [class*="add_new_task_form-label"] {
    color: #fff !important;
  }

  /* Fix input placeholders */
  .dark-mode input::placeholder,
  .dark-mode textarea::placeholder {
    color: #aaa !important;
    opacity: 1 !important;
  }

  /* Fix the WBS # text */
  .dark-mode [data-tip="WBS ID"] {
    color: #fff !important;
  }

  /* Fix the Add Task button */
  .dark-mode .controlBtn {
    background-color: #3b82f6 !important;
    border-color: #3b82f6 !important;
    color: #fff !important;
  }

  /* Fix radio buttons and checkboxes */
  .dark-mode .form-check-input {
    background-color: #1e2b4a !important;
    border-color: #2d3a5a !important;
  }

  .dark-mode .form-check-input:checked {
    background-color: #3b82f6 !important;
    border-color: #3b82f6 !important;
  }

  /* Fix the RT button */
  .dark-mode [class*="replicate-btn"] {
    background-color: #1e2b4a !important;
    border-color: #2d3a5a !important;
    color: #fff !important;
  }

  .dark-mode [class*="replicate-btn"]:hover {
    background-color: #2d3a5a !important;
  }

  /* Fix the Close button in date picker */
  .dark-mode .rdp button {
    color: #fff !important;
  }
  
    /* Add this after the .tox-statusbar styles */
  .dark-mode .tox .tox-tbtn--select {
    width: auto !important;
  }

.dark-mode .tox .tox-tbtn__select-label {
  color: #fff !important;
}

.dark-mode .tox .tox-collection__item {
  color: #fff !important;
  background-color: #1e2b4a !important;
}

.dark-mode .tox .tox-collection__item--active {
  background-color: #3b82f6 !important;
}
`;

function DateInput({ id, ariaLabel, placeholder, value, onChange, disabled, darkMode }) {
  const FORMAT = 'MM/dd/yy';
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Parse the value properly
  let selectedDate;
  if (value) {
    try {
      if (value.includes('T')) {
        selectedDate = new Date(value);
      } else {
        selectedDate = dateFnsParse(value, FORMAT, new Date());
      }
      if (!isValid(selectedDate)) {
        selectedDate = undefined;
      }
    } catch (error) {
      selectedDate = undefined;
    }
  }

  const handleDaySelect = (date) => {
    if (date) {
      const f = dateFnsFormat(date, FORMAT);
      onChange(f);
      setIsOpen(false);
    }
  };

  // Generate unique class names
  const datePickerClass = `custom-datepicker-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value || ''}
        onFocus={() => !disabled && setIsOpen(true)}
        readOnly
        disabled={disabled}
        className={`form-control ${datePickerClass}-input`}
        style={{ 
          cursor: disabled ? 'default' : 'pointer',
          backgroundColor: disabled ? '#e9ecef' : (darkMode ? '#1e2b4a' : 'white'),
          color: darkMode ? '#e0e0e0' : '#000',
          borderColor: darkMode ? '#2d3a5a' : '#ced4da',
        }}
      />
      {isOpen && !disabled && (
        <div 
          className={`${datePickerClass}-popup`}
          style={{ 
            position: 'absolute', 
            right: 0, 
            overflow: 'auto', 
            zIndex: 9999, 
            backgroundColor: darkMode ? '#1a2639' : 'white', 
            boxShadow: darkMode 
              ? '0 4px 12px rgba(0, 0, 0, 0.5)' 
              : '0 2px 8px rgba(0,0,0,0.15)', 
            borderRadius: '4px',
            border: darkMode ? '1px solid #2d3a5a' : 'none'
          }}
        >
          <style>{`
            .${datePickerClass}-popup .rdp {
              --rdp-cell-size: 40px !important;
              --rdp-accent-color: #3b82f6 !important;
              margin: 0 !important;
            }
            
            .${datePickerClass}-popup {
              background-color: ${darkMode ? '#1a2639' : 'white'} !important;
              color: ${darkMode ? '#fff' : '#000'} !important;
            }
          `}</style>
          
          <DayPicker 
            mode="single"
            selected={selectedDate}
            onSelect={handleDaySelect}
          />
          
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Close
          </button>
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
  min_height: 280,
  max_height: 300,
  autoresize_bottom_margin: 1,
};

function AddTaskModal(props) {
  /*
   * -------------------------------- variable declarations --------------------------------
   */
  // props from store
  const { copiedTask, allMembers, allProjects, error, darkMode, projectById, fetchAllProjects } = props;
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
    return members.filter(m => m && m.isActive === true);
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
  const [category, setCategory] = useState('Unspecified');
  const [whyInfo, setWhyInfo] = useState('');
  const [intentInfo, setIntentInfo] = useState('');
  const [startedDate, setStartedDate] = useState(() => dateFnsFormat(new Date(), 'MM/dd/yy'));
  const [endstateInfo, setEndstateInfo] = useState('');
  const [startDateError, setStartDateError] = useState(false);
  const [endDateError, setEndDateError] = useState(false);
  const [startDateFormatError, setStartDateFormatError] = useState(false);
  const [endDateFormatError, setEndDateFormatError] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [modal, setModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newTaskNum, setNewTaskNum] = useState('1');
  const [dateWarning, setDateWarning] = useState(false);
  const [hoursWarning, setHoursWarning] = useState(false);
  const [showReplicateConfirm, setShowReplicateConfirm] = useState(false);
  const [isReplicating, setIsReplicating] = useState(false);
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

  const bumpNumAtLevel = (numStr, levelIdxZeroBased, bumpBy) => {
    try {
      const segs = String(numStr || '1').split('.').map(s => Number.parseInt(s || '0', 10));
      const idx = Math.max(0, Math.min(levelIdxZeroBased, segs.length - 1));
      segs[idx] = (Number.isNaN(segs[idx]) ? 0 : segs[idx]) + bumpBy;
      return segs.join('.');
    } catch {
      const base = Number.parseInt(numStr, 10) || 1;
      return String(base + bumpBy);
    }
  };

  const openReplicateConfirm = () => {
  if (!resourceItems?.length) {
    if (globalThis?.toast?.error) {
      globalThis.toast.error('Select at least one Resource to replicate to.');
    }
    return;
  }
  if (!taskName?.trim()) {
    if (globalThis?.toast?.error) {
      globalThis.toast.error('Task Name is required to replicate.');
    }
    return;
  }
  if (hoursWarning || hasNegativeHours || startDateError || endDateError || startDateFormatError || endDateFormatError) {
    if (globalThis?.toast?.error) {
      globalThis.toast.error('Fix validation errors before replicating.');
    }
    return;
  }
  setShowReplicateConfirm(true);
};

  const doReplicate = async () => {
    setIsReplicating(true);
    try {
      const baseNum = newTaskNum || '1';
      const levelIdxZeroBased = (props.taskId ? (props.level + 1) : 1) - 1;
  
      for (let i = 0; i < resourceItems.length; i += 1) {
        const singleResource = [resourceItems[i]];
        const replicated = {
          taskName,
          wbsId: props.wbsId,
          num: bumpNumAtLevel(baseNum, levelIdxZeroBased, i),
          level: props.taskId ? props.level + 1 : 1,
          priority,
          resources: singleResource,           
          isAssigned: true,                    
          status,
          hoursBest: Number.parseFloat(hoursBest),
          hoursWorst: Number.parseFloat(hoursWorst),
          hoursMost: Number.parseFloat(hoursMost),
          estimatedHours: Number.parseFloat(hoursEstimate), 
          startedDatetime: startedDate,
          dueDatetime: dueDate,
          links,
          category,
          parentId1: props.level === 1 ? props.taskId : props.parentId1,
          parentId2: props.level === 2 ? props.taskId : props.parentId2,
          parentId3: props.level === 3 ? props.taskId : props.parentId3,
          mother: props.taskId,
          position: 0,
          isActive: true,
          whyInfo,
          intentInfo,
          endstateInfo,
        };
        // eslint-disable-next-line no-await-in-loop
        await props.addNewTask(replicated, props.wbsId, props.pageLoadTime);
      }
      setShowReplicateConfirm(false);
      props.load?.(); 
      globalThis?.toast?.success?.(`Replicated to ${resourceItems.length} ${resourceItems.length === 1 ? 'person' : 'people'}.`);
    } catch (e) {
      globalThis?.toast?.error?.('Replication failed.');
    } finally {
      setIsReplicating(false);
    }
  };

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

  const parseDate = (str, format, locale) => {
    // Allow empty string for partial typing
    if (!str || str.trim() === '') return undefined;
    
    try {
      const parsed = dateFnsParse(str, format, new Date(), { locale });
      if (isValid(parsed)) {
        return parsed;
      }
    } catch (error) {
      // Return undefined for invalid dates while typing
    }
    return undefined;
  };

  const validateDateFormat = (dateString) => {
    if (!dateString || dateString.trim() === '') return true;
    
    // Check if it matches the expected format pattern MM/dd/yy
    const formatRegex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/\d{2}$/;
    if (!formatRegex.test(dateString)) return false;
    
    // Check if it's a valid date
    try {
      const parsed = dateFnsParse(dateString, FORMAT, new Date());
      return isValid(parsed);
    } catch (error) {
      return false;
    }
  };

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
    if (!allProjects?.fetched && !allProjects?.fetching) {
      fetchAllProjects();
    }
  }, [allProjects?.fetched, allProjects?.fetching, fetchAllProjects]);

  useEffect(() => {
    if (hoursBest < 0 || hoursWorst < 0 || hoursMost < 0 || hoursEstimate < 0) {
      setHasNegativeHours(true);
    } else {
      setHasNegativeHours(false);
    }
  }, [hoursBest, hoursWorst, hoursMost, hoursEstimate]);

  const changeDateStart = (value) => {
    setStartedDate(value);
    
    // Validate format
    const isValidFormat = validateDateFormat(value);
    setStartDateFormatError(!isValidFormat);
  };

  const changeDateEnd = (value) => {
    if (!startedDate && value) {
      const newDate = dateFnsFormat(new Date(), FORMAT);
      setStartedDate(newDate);
    }
    setDueDate(value);
    
    // Validate format
    const isValidFormat = validateDateFormat(value);
    setEndDateFormatError(!isValidFormat);
  };

  useEffect(() => {
    if (dueDate && dueDate < startedDate) {
      setEndDateError(true);
      setStartDateError(true);
    } else {
      setEndDateError(false);
      setStartDateError(false);
    }
    if (!startedDate || !dueDate) {
      setStartDateError(false);
      setEndDateError(false);
      return;
    }
    const s = dateFnsParse(startedDate, FORMAT, new Date());
    const d = dateFnsParse(dueDate,   FORMAT, new Date());
    const bad = isValid(s) && isValid(d) ? d.getTime() < s.getTime() : false;
    setStartDateError(bad);
    setEndDateError(bad);
  }, [startedDate, dueDate]);

  // Validate date formats when dates change
  useEffect(() => {
    if (startedDate) {
      const isValidFormat = validateDateFormat(startedDate);
      setStartDateFormatError(!isValidFormat);
    } else {
      setStartDateFormatError(false);
    }
  }, [startedDate]);

  useEffect(() => {
    if (dueDate) {
      const isValidFormat = validateDateFormat(dueDate);
      setEndDateFormatError(!isValidFormat);
    } else {
      setEndDateFormatError(false);
    }
  }, [dueDate]);

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
    setStartedDate(dateFnsFormat(new Date(), 'MM/dd/yy'));
    setDueDate('');
    setLinks([]);
    setWhyInfo('');
    setIntentInfo('');
    setEndstateInfo('');
    setCategory(defaultCategory);
    setStartDateError(false);
    setEndDateError(false);
    setStartDateFormatError(false);
    setEndDateFormatError(false);
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
      setStartedDate(dateFnsFormat(new Date(), 'MM/dd/yy'));
      setDueDate('');
      setStartDateError(false);
      setEndDateError(false);
      setStartDateFormatError(false);
      setEndDateFormatError(false);
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
  
  const closeConfirm = useCallback(() => setShowReplicateConfirm(false), []);
  const confirmLabel = isReplicating ? 'Processing…' : 'YES, make it so! 💪';
  const fontColor = darkMode ? 'text-light' : '';

  return (
    <>
    {darkMode && <style>{darkModeStyles}</style>}
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
              <div className={styles["add_new_task_form-group"]}>
                <span className={`${styles['add_new_task_form-label']} ${fontColor}`} data-tip="WBS ID">
                  WBS #
                </span>

                <span className={`${styles['add_new_task_form-input_area']} ${fontColor}`}>{newTaskNum}</span>
              </div>
              <div className={styles["add_new_task_form-group"]}>
                <label htmlFor="taskNameInput" className={`${styles['add_new_task_form-label']} ${fontColor}`}>
                  Task Name
                </label>
                <span className={styles['add_new_task_form-input_area']}>
                  <textarea
                    id="taskNameInput"
                    rows="2"
                    className={`${styles['task-name']} border border-dark rounded`}
                    onChange={e => setTaskName(e.target.value)}
                    value={taskName}
                  />
                </span>
              </div>

              <div className={styles["add_new_task_form-group"]}>
                <label htmlFor="priority" className={`${styles['add_new_task_form-label']} ${fontColor}`}>
                  Priority
                </label>
                <span className={styles['add_new_task_form-input_area']}>
                  <select
                    id="priority"
                    onChange={e => setPriority(e.target.value)}
                    ref={priorityRef}
                    className={darkMode ? 'dark-select' : ''}
                  >
                    <option value="Primary">Primary</option>
                    <option value="Secondary">Secondary</option>
                    <option value="Tertiary">Tertiary</option>
                  </select>
                </span>
              </div>

              <div className={styles["add_new_task_form-group"]}>
                <label htmlFor="resource-input" className={`${styles['add_new_task_form-label']} ${fontColor}`}>
                  Resources
                </label>
                <div className={styles['add_new_task_form-input_area']}>
                  <div className={styles.resourceRow}>
                    <div className={styles.tagsWrapper}>
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

                    <div className={clsx(styles['replicate-control'], styles.replicateInline)}>
                      <button
                        type="button"
                        className={styles['replicate-btn']}
                        onClick={openReplicateConfirm}
                        data-tip
                        data-for="replicateTip"
                        disabled={!resourceItems?.length || isLoading || isReplicating}
                        aria-label="Replicate Task"
                        title="Replicate Task"
                      >
                        <span style={{ fontWeight: 700 }}>RT</span>
                      </button>
                    </div>
                  </div>
                  <ReactTooltip id="replicateTip" effect="solid" place="top">
                    Replicate Task: Clicking this button will replicate this task and add it to all the
                    individuals chosen as Resources. Hours and all other details will be copied (not divided)
                    for all people.
                  </ReactTooltip>
                </div>
              </div>

              <div className={styles["add_new_task_form-group"]}>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className={`${styles['add_new_task_form-label']} ${fontColor}`}>Assigned</label>
                <div className={styles['add_new_task_form-input_area']}>
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
                      <label className={`form-check-label`} htmlFor="assigned-yes">
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
                      <label className={`form-check-label`} htmlFor="assigned-no">
                        No
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles["add_new_task_form-group"]}>
                <span className={`${styles['add_new_task_form-label']} ${fontColor}`}>Status</span>
                <span className={styles['add_new_task_form-input_area']}>
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
                      <label className={`form-check-label`} htmlFor="active">
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
                      <label className={`form-check-label`} htmlFor="notStarted">
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
                      <label className={`form-check-label`} htmlFor="paused">
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
                      <label className={`form-check-label`} htmlFor="complete">
                        Complete
                      </label>
                    </span>
                  </div>
                </span>
              </div>
              <div className={styles["add_new_task_form-group"]}>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className={`${styles['add_new_task_form-label']} ${fontColor}`}>Hours</label>
                <div className={styles['add_new_task_form-input_area']}>
                  <div className="py-2 d-flex align-items-center justify-content-sm-around">
                    <label
                      htmlFor="bestCaseInput"
                      className={`${styles.hoursLabel} mr-2 text-nowrap align-self-center ${fontColor}`}
                      // className={`${styles['hours-label']} text-nowrap align-self-center ${fontColor}`}
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
                      className={styles['hours-input']}
                      aria-label="Best-case hours"
                    />
                  </div>
                  {hoursWarning && (
                    <div className="warning">The number of hours must be less than other cases</div>
                  )}
                  <div className="py-2 d-flex align-items-center justify-content-sm-around">
                    <label
                      htmlFor="worstCaseInput"
                      className={`${styles.hoursLabel} mr-2 text-nowrap align-self-center ${fontColor}`}
                      // className={`${styles['hours-label']} text-nowrap align-self-center ${fontColor}`}
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
                      className={styles['hours-input']}
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
                      className={`${styles.hoursLabel} mr-2 text-nowrap align-self-center ${fontColor}`}
                      // className={`${styles['hours-label']} text-nowrap align-self-center ${fontColor}`}
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
                      className={styles['hours-input']}
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
                      className={`${styles.hoursLabel} mr-2 text-nowrap align-self-center ${fontColor}`}
                      // className={`${styles['hours-label']} text-nowrap align-self-center ${fontColor}`}
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
                      className={styles['hours-input']}
                      aria-label="Estimated hours"
                    />
                  </div>
                  <div className="warning">
                    {hasNegativeHours ? 'Negative hours are not allowed.' : ''}
                  </div>
                </div>
              </div>

              <div className={styles["add_new_task_form-group"]}>
                <label htmlFor="linkInput" className={`${styles['add_new_task_form-label']} ${fontColor}`}>
                  Links
                </label>
                <span className={styles['add_new_task_form-input_area']}>
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
                <label htmlFor="category-select" className={`${styles['add_new_task_form-label']} ${fontColor}`}>
                  Category
                </label>
                <span className={styles['add_new_task_form-input_area']}>
                  <select
                    id="category-select"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className={darkMode ? 'dark-select' : ''}
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
                <div className={`border p-1`} aria-labelledby="why-task-label">
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
                <div className={`border p-1`} aria-labelledby="design-intent-label">
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
                <div className={`border p-1`} aria-labelledby="endstate-label">
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
              <div className={`d-flex border ${styles['add-modal-dt']}`}>
                {/* eslint-disable-next-line jsx-a11y/scope */}
                <span scope="col" className={`${styles['form-date']} p-1`}>Start Date</span>
                {/* eslint-disable-next-line jsx-a11y/scope */}
                <span scope="col" className="border-left p-1">
                  <div>
                    <DateInput
                      id="start-date-input"
                      ariaLabel="Start Date"
                      placeholder={dateFnsFormat(new Date(), FORMAT)}
                      value={startedDate}
                      onChange={changeDateStart}
                      disabled={false}
                      darkMode={darkMode}
                    />
                    <div className="warning text-danger">
                      {startDateFormatError && 'Please enter date in MM/dd/yy format'}
                    </div>
                    <div className="warning">{startDateError ? START_DATE_ERROR_MESSAGE : ''}</div>
                  </div>
                </span>
              </div>
              <div className={`d-flex border align-items-center ${styles['add-modal-dt']}`}>
                <label
                  htmlFor="end-date-input"
                  className={`${styles['form-date']} p-1`}
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
                    darkMode={darkMode}
                  />
                  <div className="warning text-danger">
                    {endDateFormatError && 'Please enter date in MM/dd/yy format'}
                  </div>
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
              startDateFormatError ||
              endDateFormatError ||
              hasNegativeHours
            }
            style={darkMode ? boxStyleDark : boxStyle}
          >
            {isLoading ? 'Adding Task...' : 'Save'}
          </Button>
          
          {/* [RT] Confirmation modal */}
          <Modal isOpen={showReplicateConfirm} 
            toggle={closeConfirm} 
            lassName={clsx(darkMode && 'text-light dark-mode')}
            contentClassName={clsx(darkMode && styles.confirmContentDark)}
            backdropClassName={clsx(darkMode && styles.confirmBackdropDark)}
            >
            <ModalHeader toggle={closeConfirm}>Confirm Replication</ModalHeader>

            <ModalBody>
              <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                <strong>Whoa, steady there, hero! 🦸</strong><br />
                This doesn’t divide work—it duplicates it. Everyone gets the full deal.<br />
                Are you sure you want to hit replicate?
              </p>
            </ModalBody>

            <ModalFooter>
              <button className="btn btn-outline-danger" onClick={closeConfirm}>
                NO, take me back! 🛑
              </button>
              <button className="btn btn-primary" onClick={doReplicate} disabled={isReplicating}>
                {confirmLabel}
              </button>
            </ModalFooter>
          </Modal>
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

// PropTypes validation
AddTaskModal.propTypes = {
  copiedTask: PropTypes.object,
  allMembers: PropTypes.array,
  allProjects: PropTypes.shape({
    projects: PropTypes.array,
    fetched: PropTypes.bool,
    fetching: PropTypes.bool,
  }),
  error: PropTypes.string,
  darkMode: PropTypes.bool,
  tasks: PropTypes.array,
  projectById: PropTypes.object,
  fetchAllProjects: PropTypes.func.isRequired,
  addNewTask: PropTypes.func.isRequired,
  fetchAllMembers: PropTypes.func.isRequired,
  getProjectDetail: PropTypes.func.isRequired,
  projectId: PropTypes.string,
  taskId: PropTypes.string,
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectId: PropTypes.string,
      wbsId: PropTypes.string,
    }),
  }),
};

// Default props
AddTaskModal.defaultProps = {
  copiedTask: null,
  allMembers: [],
  allProjects: {
    projects: [],
    fetched: false,
    fetching: false,
  },
  error: null,
  darkMode: false,
  tasks: [],
  projectId: '',
  taskId: '',
  match: {
    params: {
      projectId: '',
      wbsId: '',
    },
  },
};

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
  fetchAllProjects,
  getProjectDetail,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddTaskModal);
