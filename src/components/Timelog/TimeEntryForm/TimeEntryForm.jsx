import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch, useSelector } from 'react-redux';
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
import { Editor } from '@tinymce/tinymce-react';
import ReactTooltip from 'react-tooltip';
import { postTimeEntry, editTimeEntry, getTimeEntriesForWeek } from '../../../actions/timeEntries';
import { getUserProjects } from '../../../actions/userProjects';
import { getUserProfile } from 'actions/userProfile';
import { updateUserProfile } from 'actions/userProfile';

import { stopTimer } from '../../../actions/timer';
import AboutModal from './AboutModal';
import TangibleInfoModal from './TangibleInfoModal';
import ReminderModal from './ReminderModal';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import hasPermission from 'utils/permissions';
import { getTimeEntryFormData } from './selectors';
import checkNegativeNumber from 'utils/checkNegativeHours';
import fixDiscrepancy from 'utils/fixDiscrepancy';
import { boxStyle } from 'styles';

/**
 * Modal used to submit and edit tangible and intangible time entries.
 *
 * @param {boolean} props.edit If true, the time entry already exists and is being modified
 * @param {string} props.userId
 * @param {function} props.toggle Toggles the visability of this modal
 * @param {boolean} props.isOpen Whether or not this modal is visible
 * @param {*} props.timer
 * @param {boolean} props.data.isTangible
 * @param {*} props.userProfile
 * @param {function} props.resetTimer
 * @param {string} props.LoggedInuserId
 * @param {string} props.curruserId
 * @returns
 */
const TimeEntryForm = props => {

  const { userId, edit, data, isOpen, toggle, timer, LoggedInuserId, curruserId, resetTimer = () => {}, sendClear = () => {}, sendStop  = () => {} } = props;
  const canEditTimeEntry = props.hasPermission('editTimeEntry');
  const canPutUserProfileImportantInfo = props.hasPermission('putUserProfileImportantInfo');

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

  const [inputs, setInputs] = useState(edit ? data : initialFormValues);
  const [errors, setErrors] = useState({});
  const [close, setClose] = useState(false);
  const [reminder, setReminder] = useState(initialReminder);
  const [isTangibleInfoModalVisible, setTangibleInfoModalVisibleModalVisible] = useState(false);
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [formDataBeforeEdit, setFormDataBeforeEdit] = useState({});

  const fromTimer = !isEmpty(timer);
  const { userProfile, currentUserRole } = useSelector(getTimeEntryFormData);

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
  }, [props.isTaskUpdated]);

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

  const validateForm = isTimeModified => {
    const result = {};

    if (inputs.dateOfWork === '') {
      result.dateOfWork = 'Date is required';
    } else {
      const date = moment(inputs.dateOfWork);
      const today = moment(
        moment()
          .tz('America/Los_Angeles')
          .format('YYYY-MM-DD'),
      );
      if (!date.isValid()) {
        result.dateOfWork = 'Invalid date';
      }
      // Administrator/Owner can add time entries for any dates. Other roles cannot.
      // Editing details of past date is possible for any role.
      else if (
        currentUserRole !== 'Administrator' &&
        currentUserRole !== 'Owner' &&
        !edit &&
        today.diff(date, 'days') !== 0
      ) {
        result.dateOfWork = 'Invalid date. Please refresh the page.';
      }
    }

    if (inputs.hours === '' && inputs.minutes === '') {
      result.time = 'Time is required';
    } else {
      const hours = inputs.hours === '' ? 0 : inputs.hours * 1;
      const minutes = inputs.minutes === '' ? 0 : inputs.minutes * 1;
      if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
        result.time = 'Hours and minutes should be integers';
      }
      if (hours < 0 || minutes < 0 || (hours === 0 && minutes === 0)) {
        result.time = 'Time should be greater than 0';
      }
    }

    if (inputs.projectId === '') {
      result.projectId = 'Project/Task is required';
    }

    if (reminder.wordCount < 10) {
      openModal();
      setReminder(reminder => ({
        ...reminder,
        remind:
          'Please write a more detailed description of your work completed, write at least 1-2 sentences.',
      }));
      result.notes = 'Description and reference link are required';
    }

    if (reminder.wordCount >= 10 && !reminder.hasLink) {
      openModal();
      setReminder(reminder => ({
        ...reminder,
        remind:
          'Do you have a link to your Google Doc or other place to review this work? You should add it if you do. (Note: Please include http[s]:// in your URL)',
      }));
      result.notes = 'Description and reference link are required';
    }

    if (
      !canPutUserProfileImportantInfo &&
      data.isTangible &&
      isTimeModified &&
      reminder.editNotice
    ) {
      openModal();
      setReminder(reminder => ({
        ...reminder,
        remind: getEditMessage(),
        editNotice: !reminder.editNotice,
      }));
      return false;
    }

    setErrors(result);
    return isEmpty(result);
  };

  //Update hoursByCategory when submitting new time entry
  const updateHoursByCategory = async (userProfile, timeEntry, hours, minutes) => {
    const { hoursByCategory } = userProfile;
    const { projectId, isTangible, personId } = timeEntry;

    //fix discrepancy in hours in userProfile if any

    fixDiscrepancy(userProfile);

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
        : foundTask.category.toLowerCase();

      //update hours
      const isFindCategory = Object.keys(hoursByCategory).find(
        key => key === category && key !== 'unassigned',
      );
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
      : foundTask?.category.toLowerCase();
    const isFindCategory = Object.keys(hoursByCategory).find(
      key => key === category && key !== 'unassigned',
    );

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
    //Validation and variable initialization
    if (event) event.preventDefault();

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
      curruserId: curruserId,
    };

    if (edit) {
      timeEntry.hours = hours;
      timeEntry.minutes = minutes;
    } else {
      timeEntry.timeSpent = `${hours}:${minutes}:00`;
    }

    // Problem: fix timelog entry for other user page
    // To fix the problem of both wrong details getting updated in mongoDB and frontend, the response from the payload is stored in curruserProfile as userProfile contains the user whose timelog page we are viewing.
    // This can lead to the details being mixed up in mongoDB and in turn updating mongoDB with wrong user details
    //Update userprofile hoursByCategory
    const curruserProfile = await dispatch(getUserProfile(userId));


    let timeEntryStatus;
    if (edit) {
      if (!reminder.notice) {
        if (curruserProfile) {
          editHoursByCategory(curruserProfile, timeEntry, hours, minutes);
        }
        timeEntryStatus = await dispatch(editTimeEntry(data._id, timeEntry, data.dateOfWork));
      }
    } else {
      if (curruserProfile) {
        updateHoursByCategory(curruserProfile, timeEntry, hours, minutes);
      }
      timeEntryStatus = await dispatch(postTimeEntry(timeEntry));
    }

    if (timeEntryStatus !== 200) {
      toggle();
      alert(
        `An error occurred while attempting to submit your time entry. Error code: ${timeEntryStatus}`,
      );
      return;
    }

    // see if this is the first time the user is logging time
    if (!edit) {
      if (curruserProfile.isFirstTimelog && curruserProfile.isFirstTimelog === true) {
        const updatedUserProfile = {
          ...curruserProfile,
          createdDate: new Date(),
          isFirstTimelog: false,
        };

        dispatch(updateUserProfile(curruserProfile._id, updatedUserProfile));
      }
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
      sendClear();
    } else if (!reminder.notice) {
      setReminder(reminder => ({
        ...reminder,
        editNotice: !reminder.editNotice,
      }));
    }

    if (fromTimer) {
      sendStop();
      clearForm();
    }
    setReminder(initialReminder);

    if (!props.edit) setInputs(initialFormValues);

    await getUserProfile(userId)(dispatch);

    // Problem: fix timelog entry for other user page
    // To fix the problem of both wrong details getting updated in mongoDB and frontend, the state variable needs to be updated for user profile in order to get the right details
    // In addition to updating state, an update to time entries for 0th week is necessary as updateTimeEntries() under action is updating 0th week particularly with the logged in user's time entry

    await dispatch(getUserProfile(curruserId));
    await dispatch(getTimeEntriesForWeek(curruserId, 0));
    if (isOpen) toggle();
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

  const handleEditorChange = (content, editor) => {
    inputs.notes = content;
    const { wordcount } = editor.plugins;

    setInputs(inputs => ({ ...inputs, [editor.id]: content }));
    setReminder(reminder => ({
      ...reminder,
      wordCount: wordcount.body.getWordCount(),
      hasLink: inputs.notes.indexOf('http://') > -1 || inputs.notes.indexOf('https://') > -1,
    }));
  };

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
  const clearForm = closed => {
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
    if (closed === true && isOpen) toggle();
  };

  return (
    <>
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
        <ModalHeader toggle={toggle}>
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
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="dateOfWork">Date</Label>
              {canEditTimeEntry && !fromTimer ? (
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
                init={{
                  menubar: false,
                  placeholder: 'Description (10-word minimum) and reference link',
                  plugins:
                    'advlist autolink autoresize lists link charmap table paste help wordcount',
                  toolbar:
                    'bold italic underline link removeformat | bullist numlist outdent indent |\
                                    styleselect fontsizeselect | table| strikethrough forecolor backcolor |\
                                    subscript superscript charmap  | help',
                  branding: false,
                  min_height: 180,
                  max_height: 300,
                  autoresize_bottom_margin: 1,
                  content_style: 'body { cursor: text !important; }',
                }}
                id="notes"
                name="notes"
                className="form-control"
                value={inputs.notes}
                onEditorChange={handleEditorChange}
              />

              {'notes' in errors && (
                <div className="text-danger">
                  <small>{errors.notes}</small>
                </div>
              )}
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="checkbox"
                  name="isTangible"
                  checked={inputs.isTangible}
                  onChange={handleCheckboxChange}
                  disabled={!canEditTimeEntry && !data.isTangible}
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
        </ModalBody>
        <ModalFooter>
          <small className="mr-auto">* All the fields are required</small>
          <Button onClick={clearForm} color="danger" style={boxStyle}>
            Clear Form
          </Button>
          {/* <Button color="primary" disabled={isSubmitting || (data.hours === inputs.hours && data.minutes === inputs.minutes && data.notes === inputs.notes)} onClick={handleSubmit}> */}
          <Button color="primary" onClick={handleSubmit} style={boxStyle}>
            {edit ? 'Save' : 'Submit'}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
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
  LoggedInuserId: PropTypes.string,
  curruserId: PropTypes.string,
  handleStop: PropTypes.func,
};

export default connect(null, { hasPermission })(TimeEntryForm);
