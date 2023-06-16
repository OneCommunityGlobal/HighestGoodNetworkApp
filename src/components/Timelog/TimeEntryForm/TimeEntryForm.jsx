import React, { useState, useEffect, Fragment, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import moment from 'moment-timezone';
import { isEmpty } from 'lodash';
import { Editor } from 'primereact/editor';
import ReactTooltip from 'react-tooltip';
import { postTimeEntry, editTimeEntry } from '../../../actions/timeEntries';
import { getUserProjects } from '../../../actions/userProjects';
import { getUserProfile } from 'actions/userProfile';
import { BiPlus } from 'react-icons/bi';

import { stopTimer } from '../../../actions/timer';
import AboutModal from './AboutModal';
import TangibleInfoModal from './TangibleInfoModal';
import ReminderModal from './ReminderModal';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import hasPermission from 'utils/permissions';
import { getTimeEntryFormData } from './selectors';
import checkNegativeNumber from 'utils/checkNegativeHours';

import './TimeEntryForm.css';
import Loading from 'components/common/Loading/Loading';

/**
 * Modal used to submit and edit tangible and intangible time entries.
 *
 * @param {boolean} props.edit If true, the time entry already exists and is being modified
 * @param {string} props.userId
 * @param {function} props.toggle Toggles the visability of this modal
 * @param {boolean} props.isOpen Whether or not this modal is visible
 * @param {*} props.timer
 * @param {boolean} props.data.disabled
 * @param {boolean} props.data.isTangible
 * @param {*} props.userProfile
 * @param {function} props.resetTimer
 * @returns
 */

const TimeEntryForm = props => {
  const {
    userId,
    edit,
    data,
    isOpen,
    toggle,
    timer,
    resetTimer,
    handleStop,
    handleAddGoal,
    handleStart,
    goal,
    toggleModalClose,
  } = props;

  const initialFormValues = {
    dateOfWork: moment()
      .tz('America/Los_Angeles')
      .format('YYYY-MM-DD'),
    hours: 0,
    minutes: 0,
    projectId: '',
    notes: '',
    isTangible: data.isTangible,
  };

  const initialReminder = {
    notification: false,
    hasLink: data && data.notes && data.notes.includes('http') ? true : false,
    remind: '',
    wordCount: data && data.notes && data.notes.split(' ').length > 10 ? 10 : 0,
    editNotice: true,
  };

  /*
   * Here we just check if the amount of time that we are going to add will surpass the
   * maximum allowed time on backend that its 10 hours
   * */
  const shouldDisableAddBtn = mins => {
    const amount = moment.duration(goal ?? 0, 'milliseconds').add(mins, 'minutes');
    return amount.asHours() > 10 ? true : false;
  };

  const [isSubmitting, setSubmitting] = useState(false);
  const [inputs, setInputs] = useState(
    edit ? data : JSON.parse(localStorage.getItem('timeEntryInputs')) || initialFormValues
  );
  const [errors, setErrors] = useState({});
  const [close, setClose] = useState(false);
  const [reminder, setReminder] = useState(initialReminder);
  const [isTangibleInfoModalVisible, setTangibleInfoModalVisibleModalVisible] = useState(false);
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [formDataBeforeEdit, setFormDataBeforeEdit] = useState({});
  const numberOfWords = inputs.notes ? inputs.notes.trim().split(/\s+/).length : 0;

  const fromTimer = !isEmpty(timer);
  const { userProfile, currentUserRole } = useSelector(getTimeEntryFormData);
  const roles = useSelector(state => state.role.roles);
  const userPermissions = useSelector(state => state.auth.user?.permissions?.frontPermissions);

  const dispatch = useDispatch();

  const tangibleInfoToggle = e => {
    e.preventDefault();
    setTangibleInfoModalVisibleModalVisible(!isTangibleInfoModalVisible);
  };

  const filterTasks = (tasks, id) => {
    let result = [];
    for (let i = 0; i < tasks.length; i++) {
      let resourcesLength = tasks[i].resources.length;
      for (let j = 0; j < resourcesLength; j++) {
        if (tasks[i].resources[j].completedTask === false && tasks[i].resources[j].userID === id) {
          result.push(tasks[i]);
          break;
        }
      }
    }
    return result;
  };

  useEffect(() => {
    //this to make sure that the form is cleared before closing
    if (close && inputs.projectId == '') {
      //double make sure close is set to false to stop form from reclosing on open
      setClose(false);
      setClose(close => {
        setTimeout(function myfunc() {
          toggle();
        }, 100);
        return false;
      });
    }
  }, [close, inputs]);

  useEffect(() => {
    axios
      .get(ENDPOINTS.USER_PROFILE(userId))
      .then(res => {
        setProjects(res?.data?.projects || []);
      })
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    axios
      .get(ENDPOINTS.TASKS_BY_USERID(userId))
      .then(res => {
        let activeTasks = filterTasks(res?.data, userId);
        setTasks(activeTasks || []);
      })
      .catch(err => console.log(err));
  }, []);

  //grab form data before editing
  useEffect(() => {
    if (isOpen && edit) {
      setFormDataBeforeEdit(inputs);
    }
  }, [isOpen]);

  const openModal = () =>
    setReminder(reminder => ({
      ...reminder,
      notification: !reminder.notification,
    }));

  const cancelChange = () => {
    setReminder(initialReminder);
    setInputs(inputs => ({
      ...inputs,
      hours: data.hours,
      minutes: data.minutes,
    }));
  };

  useEffect(() => {
    const fetchProjects = async userId => {
      await dispatch(getUserProjects(userId));
    };
    fetchProjects(userId);
    return () => fetchProjects(userId);
  }, [userId, dispatch]);

  useEffect(() => {
    setInputs({ ...inputs, ...timer });
  }, [timer]);

  const projectOrTaskOptions = projects.map(project => (
    <option value={project._id} key={project._id}>
      {project.projectName}
    </option>
  ));
  projectOrTaskOptions.unshift(
    <option value="" key="none" disabled>
      Select Project/Task
    </option>,
  );

  const taskOptions = tasks.map(task => (
    <option value={task._id} key={task._id}>
      {task.taskName}
    </option>
  ));

  projectOrTaskOptions.push(taskOptions);

  const getEditMessage = () => {
    let editCount = 0;
    userProfile.timeEntryEditHistory.forEach(item => {
      if (
        moment()
          .tz('America/Los_Angeles')
          .diff(item.date, 'days') <= 365
      ) {
        editCount += 1;
      }
    });
    return `If you edit your time entries 5 times or more within the span of a year, you will be issued a blue square on the 5th time.
    You will receive an additional blue square for each edit beyond the 5th.
    Currently, you have edited your time entries ${editCount} times within the last 365 days.
    Do you wish to continue?`;
  };

  const validateForm = (isTimeModified) => {
    const result = {};
  
    if (inputs.dateOfWork === '') {
      result.dateOfWork = 'Date is required';
    } else {
      const date = moment(inputs.dateOfWork);
      const today = moment().tz('America/Los_Angeles').startOf('day');
      if (!date.isValid()) {
        result.dateOfWork = 'Invalid date';
      } else if (date.isAfter(today)) {
        result.dateOfWork = 'Date cannot be in the future';
      }
    }
  
    if (inputs.hours === '' && inputs.minutes === '') {
      result.time = 'Time is required';
    } else {
      const hours = parseInt(inputs.hours) || 0;
      const minutes = parseInt(inputs.minutes) || 0;
      const totalMinutes = hours * 60 + minutes;
      if (totalMinutes <= 0) {
        result.time = 'Time should be greater than 0';
      }
    }
  
    if (inputs.projectId === '') {
      result.projectId = 'Project/Task is required';
    }
  
    const editorContent = inputs.notes;
    const wordCount = editorContent.trim().split(/\s+/).length;
    const hasLink = editorContent.includes('http');
  
    if (wordCount < 10 || !hasLink) {
      result.notes = '10 words and reference link are required';
    }
  
    setErrors(result);
    return isEmpty(result);
  };
  //Update hoursByCategory when submitting new time entry
  const updateHoursByCategory = async (userProfile, timeEntry, hours, minutes) => {
    const { hoursByCategory } = userProfile;
    const { projectId, isTangible, personId } = timeEntry;
    //Format hours && minutes
    const volunteerTime = parseFloat(hours) + parseFloat(minutes) / 60;

    //log  hours to intangible time entry
    if (isTangible !== 'true') {
      userProfile.totalIntangibleHrs += volunteerTime;
    } else {
      //This is get to know which project or task is selected
      const foundProject = projects.find(project => project._id === projectId);
      const foundTask = tasks.find(task => task._id === projectId);

      //Get category
      const category = foundProject
        ? foundProject.category.toLowerCase()
        : foundTask.classification.toLowerCase();

      //update hours
      const isFindCategory = Object.keys(hoursByCategory).find(key => key === category);
      if (isFindCategory) {
        hoursByCategory[category] += volunteerTime;
      } else {
        hoursByCategory['unassigned'] += volunteerTime;
      }
    }

    //update database
    try {
      const url = ENDPOINTS.USER_PROFILE(personId);
      await axios.put(url, userProfile);
    } catch (error) {
      console.log(error);
    }
  };

  //Update hoursByCategory when editing old time entry
  const editHoursByCategory = async (userProfile, timeEntry, hours, minutes) => {
    const { hoursByCategory } = userProfile;
    const { projectId: currProjectId, isTangible: currIsTangible } = timeEntry;
    const {
      projectId: oldProjectId,
      isTangible,
      hours: oldHours,
      minutes: oldMinutes,
    } = formDataBeforeEdit;
    let category;
    const oldIsTangible = isTangible.toString();

    //hours before && after edit
    const oldEntryTime = parseFloat(oldHours) + parseFloat(oldMinutes) / 60;
    const currEntryTime = parseFloat(hours) + parseFloat(minutes) / 60;
    const timeDifference = currEntryTime - oldEntryTime;

    //No hours needs to be updated
    if (
      oldEntryTime === currEntryTime &&
      oldProjectId === currProjectId &&
      oldIsTangible === currIsTangible
    ) {
      return;
    }

    //if time entry keeps intangible before and after edit, means we don't need update tangible hours
    if (oldIsTangible === 'false' && currIsTangible === 'false') {
      userProfile.totalIntangibleHrs += timeDifference;
    }

    //found project or task
    const foundProject = projects.find(project => project._id === currProjectId);
    const foundTask = tasks.find(task => task._id === currProjectId);

    category = foundProject
      ? foundProject.category.toLowerCase()
      : foundTask?.classification.toLowerCase();
    const isFindCategory = Object.keys(hoursByCategory).find(key => key === category);

    //if change timeEntry from intangible to tangible, we need add hours on categories
    if (oldIsTangible === 'false' && currIsTangible === 'true') {
      userProfile.totalIntangibleHrs -= currEntryTime;
      isFindCategory
        ? (hoursByCategory[category] += currEntryTime)
        : (hoursByCategory['unassigned'] += currEntryTime);
    }

    //if change timeEntry from tangible to intangible, we need deduct hours on categories
    if (oldIsTangible === 'true' && currIsTangible === 'false') {
      userProfile.totalIntangibleHrs += currEntryTime;
      isFindCategory
        ? (hoursByCategory[category] -= currEntryTime)
        : (hoursByCategory['unassigned'] -= currEntryTime);
    }

    //if timeEntry is tangible before and after edit
    if (oldIsTangible === 'true' && currIsTangible === 'true') {
      //if project didn't change, add timeDifference on category
      if (oldProjectId === currProjectId) {
        isFindCategory
          ? (hoursByCategory[category] += timeDifference)
          : (hoursByCategory['unassigned'] += timeDifference);
      } else {
        const foundOldProject = projects.find(project => project._id === oldProjectId);
        const foundOldTask = tasks.find(task => task._id === oldProjectId);

        const oldCategory = foundOldProject
          ? foundOldProject.category.toLowerCase()
          : foundOldTask.classification.toLowerCase();

        const isFindOldCategory = Object.keys(hoursByCategory).find(key => key === category);
        isFindOldCategory
          ? (hoursByCategory[oldCategory] -= oldEntryTime)
          : (hoursByCategory['unassigned'] -= oldEntryTime);

        isFindCategory
          ? (hoursByCategory[category] += currEntryTime)
          : (hoursByCategory['unassigned'] += currEntryTime);
      }
    }
    checkNegativeNumber(userProfile);
    //update database
    try {
      const url = ENDPOINTS.USER_PROFILE(timeEntry.personId);
      await axios.put(url, userProfile);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async event => {
    if (event) event.preventDefault();
    if (isSubmitting) return;
    const hours = inputs.hours || 0;
    const minutes = inputs.minutes || 0;
    const isTimeModified = edit && (data.hours !== hours || data.minutes !== minutes);

    if (!validateForm(isTimeModified)) return;

    //Construct the timeEntry object
    const timeEntry = {
      personId: userId,
      dateOfWork: inputs.dateOfWork,
      projectId: inputs.projectId,
      notes: inputs.notes,
      isTangible: inputs.isTangible.toString(),
    };

    if (edit) {
      timeEntry.hours = hours;
      timeEntry.minutes = minutes;
    } else {
      timeEntry.timeSpent = `${hours}:${minutes}:00`;
    }

    //Send the time entry to the server
    setSubmitting(true);

    let timeEntryStatus;
    if (edit) {
      if (!reminder.notice) {
        editHoursByCategory(userProfile, timeEntry, hours, minutes);
        timeEntryStatus = await dispatch(editTimeEntry(data._id, timeEntry, data.dateOfWork));
      }
    } else {
      updateHoursByCategory(userProfile, timeEntry, hours, minutes);
      timeEntryStatus = await dispatch(postTimeEntry(timeEntry));
    }

    if (timeEntryStatus !== 200) {
      toggle();
      alert(
        `An error occurred while attempting to submit your time entry. Error code: ${timeEntryStatus}`,
      );
      return;
    }

    //Clear the form and clean up.
    if (fromTimer) {
      const timerStatus = await dispatch(stopTimer(userId));
      if (timerStatus === 200 || timerStatus === 201) {
        resetTimer();
      } else {
        alert(
          'Your time entry was successfully recorded, but an error occurred while asking the server to reset your timer. There is no need to submit your hours a second time, and doing so will result in a duplicate time entry.',
        );
      }
    } else if (!reminder.notice) {
      setReminder(reminder => ({
        ...reminder,
        editNotice: !reminder.editNotice,
      }));
    }
    setSubmitting(false);

    if (isOpen) toggleModalClose();
    if (fromTimer) clearAll();
    setReminder(initialReminder);
  
    if (!props.edit) setInputs(initialFormValues);
  
    getUserProfile(userId)(dispatch);
    window.location.reload(true);
  
    // Clear the saved notes from localStorage
    localStorage.removeItem('timeEntryInputs');
  };

  const handleInputChange = event => {
    event.persist();
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }));
  };

  const handleHHInputChange = event => {
    event.persist();
    if (event.target.value < 0 || event.target.value > 40) {
      return;
    }
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }));
  };

  const handleMMInputChange = event => {
    event.persist();
    if (event.target.value < 0 || event.target.value > 59) {
      return;
    }
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }));
  };

  const handleEditorChange = useCallback((e) => {
    setInputs((inputs) => ({ ...inputs, notes: e.htmlValue }));
    const { wordCount, hasLink } = e.textValue;
    setReminder((reminder) => ({
      ...reminder,
      wordCount: wordCount,
      hasLink: hasLink,
    }));
  }, []);  

  const handleCheckboxChange = event => {
    event.persist();
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.checked,
    }));
  };

  /**
   * Resets the project/task and notes fields of the form without resetting hours and minutes.
   * @param {*} closed If true, the form closes after being cleared.
   */
  const clearAll = closed => {
    resetTimer();
    const newInputs = {
      ...inputs,
      notes: '',
      projectId: '',
      dateOfWork: moment()
        .tz('America/Los_Angeles')
        .format('YYYY-MM-DD'),
    };
    setInputs(newInputs);
    setReminder({ ...initialReminder });
    setErrors({});
    toggleModalClose();
    localStorage.removeItem('timeEntryInputs');
  };

  const stopAllAudioAndClearIntervals = useCallback(() => {
    const audios = document.querySelectorAll('audio');
    audios.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });

    const intervals = setInterval(() => {});
    for (let i = 1; i < intervals; i++) {
      clearInterval(i);
    }
  }, []);

  useEffect(() => {
    const userHasOpenTangibleModal = isOpen && data?.isTangible;

    if (userHasOpenTangibleModal) {
      stopAllAudioAndClearIntervals();
    }
  }, [stopAllAudioAndClearIntervals, isOpen, data?.isTangible]);

  const closeBtn = (
    <Button onClick={clearAll} color="danger">
      Clear and Close
    </Button>
  );

  return (
    <div>
      <TangibleInfoModal
        visible={isTangibleInfoModalVisible}
        setVisible={setTangibleInfoModalVisibleModalVisible}
      />

      <AboutModal visible={isInfoModalVisible} setVisible={setInfoModalVisible} />

      <ReminderModal
        inputs={inputs}
        data={data}
        edit={edit}
        reminder={reminder}
        visible={reminder.notification}
        setVisible={visible => setReminder({ ...reminder, notification: visible })}
        cancelChange={cancelChange}
      />

      <Modal isOpen={isOpen} toggle={toggle} data-testid="timeEntryFormModal">
        {!isSubmitting && (
          <ModalHeader toggle={toggle} close={closeBtn}>
            <div>
              {edit ? 'Edit ' : 'Add '}
              {inputs.isTangible ? (
                <span style={{ color: 'blue' }}>Tangible </span>
              ) : (
                <span style={{ color: 'orange' }}>Intangible </span>
              )}
              Time Entry{' '}
              <i
                className="fa fa-info-circle"
                data-tip
                data-for="registerTip"
                aria-hidden="true"
                title="timeEntryTip"
                onClick={() => setInfoModalVisible(true)}
              />
            </div>
            <ReactTooltip id="registerTip" place="bottom" effect="solid">
              Click this icon to learn about this time entry form
            </ReactTooltip>
          </ModalHeader>
        )}
        <ModalBody>
          {!isSubmitting ? (
            <Form>
              <FormGroup>
                <Label for="dateOfWork">Date</Label>
                {hasPermission(
                  currentUserRole,
                  'changeIntangibleTimeEntryDate',
                  roles,
                  userPermissions,
                ) && !fromTimer ? (
                  <Input
                    type="date"
                    name="dateOfWork"
                    id="dateOfWork"
                    value={inputs.dateOfWork}
                    onChange={handleInputChange}
                  />
                ) : (
                  <Input
                    type="date"
                    name="dateOfWork"
                    id="dateOfWork"
                    value={inputs.dateOfWork}
                    disabled
                  />
                )}
                {'dateOfWork' in errors && (
                  <div className="text-danger">
                    <small>{errors.dateOfWork}</small>
                  </div>
                )}
              </FormGroup>
              <FormGroup>
                <Label for="timeSpent">Time (HH:MM)</Label>
                <Row form>
                  <Col>
                    <Input
                      type="number"
                      name="hours"
                      id="hours"
                      min={0}
                      max={40}
                      placeholder="Hours"
                      value={inputs.hours}
                      onChange={handleHHInputChange}
                      disabled={fromTimer}
                    />
                  </Col>
                  <Col>
                    <Input
                      type="number"
                      name="minutes"
                      id="minutes"
                      min={0}
                      max={59}
                      placeholder="Minutes"
                      value={inputs.minutes}
                      onChange={handleMMInputChange}
                      disabled={fromTimer}
                    />
                  </Col>
                </Row>
                {'time' in errors && (
                  <div className="text-danger">
                    <small>{errors.time}</small>
                  </div>
                )}
              </FormGroup>
              <FormGroup>
                <Label for="project">Project/Task</Label>
                <Input
                  type="select"
                  name="projectId"
                  id="projectId"
                  value={inputs.projectId}
                  onChange={handleInputChange}
                >
                  {projectOrTaskOptions}
                </Input>
                {'projectId' in errors && (
                  <div className="text-danger">
                    <small>{errors.projectId}</small>
                  </div>
                )}
              </FormGroup>
              <FormGroup>
                <Label for="notes">Notes</Label>
                <Editor
                  style={{
                            height: '180px'
                  }}
                  placeholder='Description (10-word minimum) and reference link'
                  id="notes"
                  value={inputs.notes}
                  onTextChange={handleEditorChange}
                />

                {'notes' in errors && (
                  <div className="text-danger">
                    <small>{errors.notes}</small>
                  </div>
                )}
                <span>{`${numberOfWords} words`}</span>
              </FormGroup>
              <FormGroup check>
                <Label check>
                  <Input
                    type="checkbox"
                    name="isTangible"
                    checked={inputs.isTangible}
                    onChange={handleCheckboxChange}
                    disabled={
                      !hasPermission(
                        currentUserRole,
                        'toggleTangibleTime',
                        roles,
                        userPermissions,
                      ) && !data.isTangible
                    }
                  />
                  Tangible&nbsp;
                  <i
                    className="fa fa-info-circle"
                    data-tip
                    data-for="tangibleTip"
                    aria-hidden="true"
                    title="tangibleTip"
                    onClick={tangibleInfoToggle}
                  />
                  <ReactTooltip id="tangibleTip" place="bottom" effect="solid">
                    Click this icon to learn about tangible and intangible time.
                  </ReactTooltip>
                </Label>
              </FormGroup>
            </Form>
          ) : (
            <Loading />
          )}
        </ModalBody>
        {!isSubmitting && (
          <ModalFooter>
            <small className="mr-auto">* All the fields are required</small>

            {/* <Button color="primary" disabled={isSubmitting || (data.hours === inputs.hours && data.minutes === inputs.minutes && data.notes === inputs.notes)} onClick={handleSubmit}> */}
            <Button color="secondary" onClick={() => {
              toggle()
              }}>
              Back
            </Button>
            <Button color="primary" onClick={handleSubmit}>
              {edit ? 'Save' : 'Submit'}
            </Button>
          </ModalFooter>
        )}
      </Modal>
    </div>
  );
};

TimeEntryForm.defaultProps = {
  timer: '',
  resetTimer: () => {},
  handleStop: () => {},
  handleAddGoal: () => {},
  goal: 0,
};

TimeEntryForm.propTypes = {
  edit: PropTypes.bool.isRequired,
  userId: PropTypes.string.isRequired,
  toggle: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  timer: PropTypes.any,
  data: PropTypes.any.isRequired,
  userProfile: PropTypes.any.isRequired,
  resetTimer: PropTypes.func,
  handleStop: PropTypes.func,
  handleAddGoal: PropTypes.func,
  goal: PropTypes.number.isRequired,
};

export default TimeEntryForm;