import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { DUE_DATE_MUST_GREATER_THAN_START_DATE } from '~/languages/en/messages';
import { DayPicker, useInput } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import dateFnsFormat from 'date-fns/format';
import dateFnsParse from 'date-fns/parse';
import parseISO from 'date-fns/parseISO';
import { isValid } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { updateTask } from '~/actions/task';
import { Editor } from '@tinymce/tinymce-react';
import hasPermission from '~/utils/permissions';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { boxStyle, boxStyleDark } from '~/styles';
import { toast } from 'react-toastify';
import UserSearch from './UserSearch';
import UserTag from './UserTag';
import ReadOnlySectionWrapper from './ReadOnlySectionWrapper';
import '../../../../Header/DarkMode.css';
import '../wbs.css';
import TagsSearch from '../components/TagsSearch';


/** tiny reusable v8 DateInput using useInput + DayPicker **/
function DateInput({ id, ariaLabel, placeholder, value, onChange, disabled }) {
  const { inputProps, dayPickerProps, show, toggle } = useInput({
    mode: 'single',
    selected: value ? new Date(value) : undefined,
    onDayChange: (date) => {
      // format back into MM/dd/yy
      const f = dateFnsFormat(utcToZonedTime(date, TIMEZONE), FORMAT);
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
        className={disabled && darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}
      />
      {show && !disabled && (
        <div style={{ position: 'absolute', zIndex: 10 }}>
          <DayPicker {...dayPickerProps} />
        </div>
      )}
    </div>
  );
}

function EditTaskModal(props) {
  /*
   * -------------------------------- variable declarations --------------------------------
   */
  // props from store
  const { /* allMembers, */ error, darkMode } = props;

  // permissions
  const canUpdateTask = props.hasPermission('updateTask');
  const canSuggestTask = props.hasPermission('suggestTask');
  const editable = canSuggestTask || canUpdateTask;

  // states from hooks
  const [thisTask, setThisTask] = useState();
  const [oldTask, setOldTask] = useState();
  const [modal, setModal] = useState(false);
  const [taskName, setTaskName] = useState();
  const [priority, setPriority] = useState();
  const [resourceItems, setResourceItems] = useState();
  const [assigned, setAssigned] = useState();
  const [status, setStatus] = useState();
  const [hoursBest, setHoursBest] = useState();
  const [hoursWorst, setHoursWorst] = useState();
  const [hoursMost, setHoursMost] = useState();
  const [hoursEstimate, setHoursEstimate] = useState();
  const [deadlineCount, setDeadlineCount] = useState();
  const [hoursWarning, setHoursWarning] = useState(false);
  const [link, setLink] = useState('');
  const [links, setLinks] = useState();
  const [category, setCategory] = useState();
  const [whyInfo, setWhyInfo] = useState();
  const [intentInfo, setIntentInfo] = useState();
  const [endstateInfo, setEndstateInfo] = useState();
  const [startedDate, setStartedDate] = useState();
  const [dueDate, setDueDate] = useState();
  const [dateWarning, setDateWarning] = useState(false);
  const [currentMode, setCurrentMode] = useState('');
  const [startDateError, setStartDateError] = useState(false);
  const [endDateError, setEndDateError] = useState(false);

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
  const TIMEZONE = 'America/Los_Angeles';

  const EditorInit = {
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
    skin: darkMode ? 'oxide-dark' : 'oxide',
    content_css: darkMode ? 'dark' : 'default',
  };
  /*
   * -------------------------------- functions --------------------------------
   */
  const toggle = () => setModal(!modal);

  // set different mode while show modal through different button
  const handleModalShow = mode => {
    setCurrentMode(mode);
    toggle();
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

  const changeDateStart = startedDate => {
    setStartedDate(startedDate);
    const endDateTime = dueDate ? dateFnsFormat(new Date(dueDate), FORMAT) : ''
    if (endDateTime) {
      if (startedDate > endDateTime) {
        setStartDateError(true); 
      } else {
        setStartDateError(false); 
      }
    }
    setEndDateError(false);
  };

  const changeDateEnd = dueDate => {
    setDueDate(dueDate);
    const startDateTime = startedDate ? dateFnsFormat(new Date(startedDate), FORMAT) : ''
    if (startedDate) {
      if (dueDate !== startDateTime && dueDate < startDateTime) {
        setEndDateError(true);
      } else {
        setEndDateError(false);
      }
    }
    setStartDateError(false); 
  };

  useEffect(() => {
    let parsedDueDate;
    let parsedStartedDate;
    if (dueDate) {
      parsedDueDate = dueDate.includes('T')
        ? parseISO(dueDate)
        : dateFnsParse(dueDate, FORMAT, new Date());
    }
    if (startedDate) {
      if (dueDate < startedDate) {
        setDateWarning(true);
      } else {
        setDateWarning(false);
      }
    }
  }, [startedDate, dueDate]);
  const formatDate = (date, format, locale) => dateFnsFormat(date, format, { locale });
  const parseDate = (str, format, locale) => {
    const parsed = dateFnsParse(str, format, new Date(), { locale });
    if (DateUtils.isDate(parsed)) {
      return parsed;
    }
    return undefined;
  };

  const addLink = () => {
    setLinks([...links, link]);
    setLink('');
    setStartDateError(false);
    setEndDateError(false);
  };
  const removeLink = index => {
    setLinks([...links.splice(0, index), ...links.splice(index + 1)]);
  };

  const updateTask = async () => {
    let newDeadlineCount = deadlineCount;
    if (thisTask?.estimatedHours !== hoursEstimate) {
      newDeadlineCount = deadlineCount + 1;
      setDeadlineCount(newDeadlineCount);
    }

    const updatedTask = {
      ...oldTask,
      taskName,
      priority,
      resources: resourceItems,
      isAssigned: assigned,
      status,
      hoursBest: parseFloat(hoursBest),
      hoursWorst: parseFloat(hoursWorst),
      hoursMost: parseFloat(hoursMost),
      estimatedHours: parseFloat(hoursEstimate),
      deadlineCount: parseFloat(newDeadlineCount),
      startedDatetime: startedDate,
      dueDatetime: dueDate,
      links,
      whyInfo,
      intentInfo,
      endstateInfo,
      category,
    };

    const updateTaskDirectly = currentMode === 'Edit';
    // console.log({canSuggestTask, canUpdateTask, updateTaskDirectly});

    props.setIsLoading?.(true);
    await props.updateTask(props.taskId, updatedTask, updateTaskDirectly, oldTask);
    props.setTask?.(updatedTask);
    await props.load?.();

    if (error === 'none' || Object.keys(error).length === 0) {
      toggle();
      toast.success('Update Success!');
      toast.success('Update Success!');
    } else {
      toast.error(`Update failed! Error is ${props.tasks.error}`);
      toast.error(`Update failed! Error is ${props.tasks.error}`);
    }
  };

  const convertDate = date => {
    try {
      if (!date) return;

      // Handle ISO strings
      if (date.includes('T')) {
        const parsedDate = parseISO(date);
        if (!isValid(parsedDate)) return;

        // Convert to timezone-aware date
        const zonedDate = utcToZonedTime(parsedDate, TIMEZONE);
        return dateFnsFormat(zonedDate, FORMAT);
      }

      // Handle date string in FORMAT format
      return date;
    } catch (error) {
      console.log(error);
    }
  };
  /*
   * -------------------------------- useEffects --------------------------------
   */
  useEffect(() => {
    const fetchTaskData = async () => {
      if (!props.taskId) {
        return;
      }
      try {
        const res = await axios.get(ENDPOINTS.GET_TASK(props.taskId));
        setThisTask(res?.data || {});
        setOldTask(res?.data || {});
      } catch (error) {
        console.log(error);
      }
    };
    fetchTaskData();
  }, [props.taskId]);

  // associate states with thisTask state
  useEffect(() => {
    setTaskName(thisTask?.taskName);
    setPriority(thisTask?.priority);
    setResourceItems(thisTask?.resources);
    setAssigned(thisTask?.isAssigned);
    setStatus(thisTask?.status);
    setHoursBest(thisTask?.hoursBest);
    setHoursWorst(thisTask?.hoursWorst);
    setHoursMost(thisTask?.hoursMost);
    setHoursEstimate(thisTask?.estimatedHours);
    setDeadlineCount(thisTask?.deadlineCount);
    setLinks(thisTask?.links);
    setCategory(thisTask?.category);
    setWhyInfo(thisTask?.whyInfo);
    setIntentInfo(thisTask?.intentInfo);
    setEndstateInfo(thisTask?.endstateInfo);
    setStartedDate(thisTask?.startedDatetime);
    setDueDate(thisTask?.dueDatetime);
  }, [thisTask]);

  useEffect(() => {
    ReactTooltip.rebuild();
  }, [links]);

  useEffect(() => {
    if (!modal) {
      setStartedDate('');
      setDueDate('');
      setStartDateError(false);
      setEndDateError(false);
    }
  }, [modal]);

  useEffect(() => {
    let isMounted = true;

    if (isMounted && startedDate && dueDate) {
      // Convert both dates to the same timezone for comparison
      const parsedDueDate = dueDate.includes('T')
        ? utcToZonedTime(parseISO(dueDate), TIMEZONE)
        : utcToZonedTime(dateFnsParse(dueDate, FORMAT, new Date()), TIMEZONE);

      const parsedStartedDate = startedDate.includes('T')
        ? utcToZonedTime(parseISO(startedDate), TIMEZONE)
        : utcToZonedTime(dateFnsParse(startedDate, FORMAT, new Date()), TIMEZONE);

      if (parsedDueDate < parsedStartedDate) {
        setDateWarning(true);
      } else {
        setDateWarning(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [startedDate, dueDate]);

  return (
    <div className="text-center">
      <Modal isOpen={modal} toggle={toggle} className={darkMode ? 'dark-mode text-light' : ''}>
        <ReactTooltip delayShow={300} />
        <ModalHeader toggle={toggle} className={darkMode ? 'bg-space-cadet' : ''}>
          {currentMode}
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue dark-mode no-hover' : ''}>
          <table
            className={`table table-bordered responsive
            ${canUpdateTask || canSuggestTask ? null : 'disable-div'} 
            ${darkMode ? 'text-light' : ''}`}
          >
            <tbody>
              <tr>
                <td id="edit-modal-td" scope="col" data-tip="task ID">
                  Task #
                </td>
                <td id="edit-modal-td" scope="col">
                  {thisTask?.num}
                </td>
              </tr>
              <tr>
                <td id="edit-modal-td" scope="col">
                  Task Name<span className="red-asterisk">* </span>
                </td>
                <td id="edit-modal-td">
                  {ReadOnlySectionWrapper(
                    <textarea
                      rows="2"
                      type="text"
                      className={`task-name border border-dark rounded ${
                        darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
                      }`}
                      onChange={e => setTaskName(e.target.value)}
                      onKeyPress={e => setTaskName(e.target.value)}
                      value={taskName}
                    />,
                    editable,
                    taskName,
                  )}
                </td>
              </tr>
              <tr>
                <td id="edit-modal-td" scope="col">
                  Priority
                </td>
                <td id="edit-modal-td">
                  {ReadOnlySectionWrapper(
                    <select
                      id="priority"
                      onChange={e => setPriority(e.target.value)}
                      value={priority}
                      className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}
                    >
                      <option value="Primary">Primary</option>
                      <option value="Secondary">Secondary</option>
                      <option value="Tertiary">Tertiary</option>
                    </select>,
                    editable,
                    priority,
                  )}
                </td>
              </tr>
              <tr>
                <td id="edit-modal-td" scope="col">
                  Resources
                </td>
                <td id="edit-modal-td" scope="col">
                  <div>
                    <TagsSearch
                      placeholder="Add resources"
                      projectId={props.projectId}
                      addResources={editable ? addResources : () => {}}
                      removeResource={editable ? removeResource : () => {}}
                      resourceItems={resourceItems}
                      disableInput={!editable}
                      darkMode={darkMode}
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td id="edit-modal-td" scope="col">
                  Assigned
                </td>
                <td id="edit-modal-td">
                  {ReadOnlySectionWrapper(
                    <div className="flex-row d-inline align-items-center">
                      <div className="form-check form-check-inline">
                        <input
                          className={`form-check-input ${
                            darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
                          }`}
                          type="radio"
                          id="true"
                          name="Assigned"
                          value="true"
                          onChange={e => setAssigned(true)}
                          checked={assigned}
                        />
                        <label
                          className={`form-check-label ${darkMode ? 'text-light' : ''}`}
                          htmlFor="true"
                        >
                          Yes
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          className={`form-check-input ${
                            darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
                          }`}
                          type="radio"
                          id="false"
                          name="Assigned"
                          value="false"
                          onChange={e => setAssigned(false)}
                          checked={!assigned}
                        />
                        <label
                          className={`form-check-label ${darkMode ? 'text-light' : ''}`}
                          htmlFor="false"
                        >
                          No
                        </label>
                      </div>
                    </div>,
                    editable,
                    assigned ? 'Yes' : 'No',
                  )}
                </td>
              </tr>
              <tr>
                <td id="edit-modal-td" scope="col">
                  Status
                </td>
                <td id="edit-modal-td">
                  {ReadOnlySectionWrapper(
                    <div className="fd-flex  flex-column">
                      <div className="d-flex">
                        {' '}
                        {/* Added: New div to group Active and Not Started */}
                        <div className="form-check form-check-inline mr-5 mw-4">
                          <input
                            className={`form-check-input ${
                              darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
                            }`}
                            type="radio"
                            id="active"
                            name="status"
                            value="Active"
                            checked={status === 'Active' || status === 'Started'}
                            onChange={e => setStatus(e.target.value)}
                          />
                          <label
                            className={`form-check-label ${darkMode ? 'text-light' : ''}`}
                            htmlFor="active"
                          >
                            Active
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className={`form-check-input ${
                              darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
                            }`}
                            type="radio"
                            id="notStarted"
                            name="status"
                            value="Not Started"
                            checked={status === 'Not Started'}
                            onChange={e => setStatus(e.target.value)}
                          />
                          <label
                            className={`form-check-label ${darkMode ? 'text-light' : ''}`}
                            htmlFor="notStarted"
                          >
                            Not Started
                          </label>
                        </div>
                      </div>
                      {/* Second row: Paused and Complete */}
                      <div className="d-flex mt-2">
                        {' '}
                        {/* Added: New div for Paused and Complete with margin-top */}
                        <div className="form-check form-check-inline mr-5 mw-4">
                          <input
                            className={`form-check-input ${
                              darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
                            }`}
                            type="radio"
                            id="paused"
                            name="status"
                            value="Paused"
                            checked={status === 'Paused'}
                            onChange={e => setStatus(e.target.value)}
                          />
                          <label
                            className={`form-check-label ${darkMode ? 'text-light' : ''}`}
                            htmlFor="paused"
                          >
                            Paused
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className={`form-check-input ${
                              darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
                            }`}
                            type="radio"
                            id="complete"
                            name="status"
                            value="Complete"
                            checked={status === 'Complete'}
                            onChange={e => setStatus(e.target.value)}
                          />
                          <label
                            className={`form-check-label ${darkMode ? 'text-light' : ''}`}
                            htmlFor="complete"
                          >
                            Complete
                          </label>
                        </div>
                      </div>{' '}
                      {/* Added: Closing div for the second row */}
                    </div>,
                    editable,
                    status,
                  )}
                </td>
              </tr>
              <tr>
                <td id="edit-modal-td" scope="col">
                  Hours
                </td>
                <td id="edit-modal-td" scope="col" className="w-100">
                  <div className="py-2 flex-responsive">
                    <label
                      htmlFor="bestCase"
                     
                      className={`text-nowrap w-25 mr-4 ${darkMode ? 'text-light' : ''}`}
                    >
                      Best-case
                    </label>
                    {ReadOnlySectionWrapper(
                      <input
                        type="number"
                        min="0"
                        max="500"
                        value={hoursBest}
                        onChange={e => setHoursBest(Math.abs(e.target.value))}
                        onBlur={() => calHoursEstimate()}
                        id="bestCase"
                        className={`m-auto ${
                          darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
                        }`}
                      />,
                      editable,
                      hoursBest,
                      { componentOnly: true },
                    )}
                  </div>
                    <div className="warning">
                      {hoursWarning ? 'The number of hours must be less than other cases' : ''}
                    </div>
                  
                  <div className="py-2 flex-responsive">
                    <label
                      htmlFor="worstCase"
                     
                      className={`text-nowrap w-25 mr-4 ${darkMode ? 'text-light' : ''}`}
                    >
                      Worst-case
                    </label>
                    {ReadOnlySectionWrapper(
                      <input
                        type="number"
                        min={hoursBest}
                        max="500"
                        value={hoursWorst}
                        onChange={e => setHoursWorst(Math.abs(e.target.value))}
                        onBlur={() => calHoursEstimate('hoursWorst')}
                        className={`m-auto ${
                          darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
                        }`}
                      />,
                      editable,
                      hoursWorst,
                      { componentOnly: true },
                    )}
                  </div>
                    <div className="warning">
                      {hoursWarning ? 'The number of hours must be higher than other cases' : ''}
                    </div>
                  
                  <div className="py-2 flex-responsive">
                    <label
                      htmlFor="mostCase"
                     
                      className={`text-nowrap w-25 mr-4 ${darkMode ? 'text-light' : ''}`}
                    >
                      Most-case
                    </label>
                    {ReadOnlySectionWrapper(
                      <input
                        type="number"
                        min="0"
                        max="500"
                        value={hoursMost}
                        onChange={e => setHoursMost(Math.abs(e.target.value))}
                        onBlur={() => calHoursEstimate('hoursMost')}
                        className={`m-auto ${
                          darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
                        }`}
                      />,
                      editable,
                      hoursMost,
                      { componentOnly: true },
                    )}
                  </div>
                    <div className="warning">
                      {hoursWarning
                        ? 'The number of hours must range between best and worst cases'
                        : ''}
                    </div>
                  
                  <div className="py-2 flex-responsive">
                    <label
                      htmlFor="Estimated"
                     
                      className={`text-nowrap w-25 mr-4 ${darkMode ? 'text-light' : ''}`}
                    >
                      Estimated
                    </label>
                    {ReadOnlySectionWrapper(
                      <input
                        type="number"
                        min="0"
                        max="500"
                        value={hoursEstimate}
                        onChange={e => setHoursEstimate(Math.abs(e.target.value))}
                        className={`m-auto ${
                          darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
                        }`}
                      />,
                      editable,
                      hoursEstimate,
                      { componentOnly: true },
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                <td id="edit-modal-td" scope="col">
                  Links
                </td>
                <td id="edit-modal-td" scope="col">
                  {ReadOnlySectionWrapper(
                    <div>
                      <input
                        type="text"
                        aria-label="Search user"
                        placeholder="Link"
                        className={`task-resouces-input ${
                          darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
                        }`}
                        data-tip="Add a link"
                        onChange={e => setLink(e.target.value)}
                        value={link}
                        disabled={!editable}
                      />
                      <button
                        className="task-resouces-btn"
                        type="button"
                        data-tip="Add Link"
                        onClick={addLink}
                      >
                        <i
                          className={`fa fa-plus ${darkMode ? 'text-light' : ''}`}
                          aria-hidden="true"
                        />
                      </button>
                    </div>,
                    editable,
                    null,
                    { componentOnly: true },
                  )}
                  <div>
                    {links?.map((link, i) =>
                      link.length >= 1 ? (
                        <div key={i}>
                          {editable && (
                            <i
                              className="fa fa-trash-o remove-link"
                              aria-hidden="true"
                              data-tip="delete"
                              onClick={editable ? () => removeLink(i) : () => {}}
                            />
                          )}
                          <a
                            href={link}
                            className="task-link"
                            target="_blank"
                            data-tip={link}
                            rel="noreferrer"
                          >
                            {link}
                          </a>
                        </div>
                      ) : null,
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                <td id="edit-modal-td" scope="col">
                  Category
                </td>
                <td id="edit-modal-td">
                  {ReadOnlySectionWrapper(
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}
                    >
                      {categoryOptions.map(cla => (
                        <option value={cla.value} key={cla.value}>
                          {cla.label}
                        </option>
                      ))}
                    </select>,
                    editable,
                    category,
                  )}
                </td>
              </tr>

              <tr>
                <td id="edit-modal-td" scope="col" colSpan="2">
                  <div>Why this Task is Important:</div>
                  {ReadOnlySectionWrapper(
                    <Editor
                      tinymceScriptSrc="/tinymce/tinymce.min.js"
                      licenseKey="gpl"
                      disabled={!editable}
                      init={EditorInit}
                      name="why-info"
                      className="why-info form-control"
                      value={whyInfo}
                      onEditorChange={content => setWhyInfo(content)}
                    />,
                    editable,
                    whyInfo,
                    { componentOnly: true },
                  )}
                </td>
              </tr>
              <tr>
                <td id="edit-modal-td" scope="col" colSpan="2">
                  <div>Design Intent:</div>
                  {ReadOnlySectionWrapper(
                    <Editor
                      tinymceScriptSrc="/tinymce/tinymce.min.js"
                      licenseKey="gpl"
                      disabled={!editable}
                      init={EditorInit}
                      name="intent-info"
                      className="intent-info form-control"
                      value={intentInfo}
                      onEditorChange={content => setIntentInfo(content)}
                    />,
                    editable,
                    intentInfo,
                    { componentOnly: true },
                  )}
                </td>
              </tr>
              <tr>
                <td id="edit-modal-td" scope="col" colSpan="2">
                  <div>Endstate:</div>
                  {ReadOnlySectionWrapper(
                    <Editor
                      tinymceScriptSrc="/tinymce/tinymce.min.js"
                      licenseKey="gpl"
                      disabled={!editable}
                      init={EditorInit}
                      name="endstate-info"
                      className="endstate-info form-control"
                      value={endstateInfo}
                      onEditorChange={content => setEndstateInfo(content)}
                    />,
                    editable,
                    endstateInfo,
                    { componentOnly: true },
                  )}
                </td>
              </tr>
              <tr>
                <td id="edit-modal-td" scope="col">
                  Start Date
                </td>
                <td id="edit-modal-td">
                {ReadOnlySectionWrapper(
                  <div className="text-dark">
                    <DateInput
                      id="start-date-input"
                      ariaLabel="Start Date"
                      placeholder={dateFnsFormat(new Date(), FORMAT)}
                      value={startedDate}
                      onChange={changeDateStart}
                      disabled={!editable}
                    />
                    <div className="warning text-danger">
                      {dateWarning ? DUE_DATE_MUST_GREATER_THAN_START_DATE : ''}
                    </div>
                  </div>,
                  editable,
                  convertDate(startedDate),
                )}
                </td>
              </tr>
              <tr>
                <td id="edit-modal-td" scope="col">
                  End Date
                </td>
                <td id="edit-modal-td">
                {ReadOnlySectionWrapper(
                  <div className="text-dark">
                    <DateInput
                      id="start-date-input"
                      ariaLabel="Start Date"
                      placeholder={dateFnsFormat(new Date(), FORMAT)}
                      value={startedDate}
                      onChange={changeDateStart}
                      disabled={!editable}
                    />
                    <div className="warning text-danger">
                      {dateWarning ? DUE_DATE_MUST_GREATER_THAN_START_DATE : ''}
                    </div>
                  </div>,
                  editable,
                  convertDate(startedDate),
                )}
                </td>
              </tr>
            </tbody>
          </table>
        </ModalBody>
        {canUpdateTask || canSuggestTask ? (
          <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
            {taskName !== '' && startedDate !== '' && dueDate !== '' ? (
              <Button
                color="primary"
                onClick={updateTask}
                disabled={startDateError || endDateError} style={darkMode ? boxStyleDark : boxStyle}
               >
                Update
              </Button>
            ) : null}
            <Button color="secondary" onClick={toggle} style={darkMode ? boxStyleDark : boxStyle}>
              Cancel
            </Button>
          </ModalFooter>
        ) : null}
      </Modal>
      <div className="task-action-buttons d-flex" />
      {canUpdateTask && (
        <Button
          className="mr-2 controlBtn"
          color="primary"
          size="sm"
          onClick={e => handleModalShow('Edit')}
          style={darkMode ? boxStyleDark : boxStyle}
        >
          Edit
        </Button>
      )}
      {canSuggestTask && (
        <Button
          className="mr-2 controlBtn"
          color="primary"
          size="sm"
          onClick={e => handleModalShow('Suggest')}
          style={darkMode ? boxStyleDark : boxStyle}
        >
          Suggest
        </Button>
      )}
      {!canUpdateTask && !canSuggestTask && (
        <Button
          className="mr-2 controlBtn"
          color="primary"
          size="sm"
          onClick={e => handleModalShow('View')}
          style={darkMode ? boxStyleDark : boxStyle}
        >
          View
        </Button>
      )}
    </div>
  );
}

const mapStateToProps = state => ({
  // allMembers: state.projectMembers.members,
  error: state.tasks.error,
  darkMode: state.theme.darkMode,
});
export default connect(mapStateToProps, { updateTask, hasPermission })(EditTaskModal);
