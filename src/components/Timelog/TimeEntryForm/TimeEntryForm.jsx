import React, { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
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
import { getUserProjects, getUserWBSs } from '../../../actions/userProjects';
import { getUserProfile, updateUserProfile, getUserTasks } from 'actions/userProfile';

import AboutModal from './AboutModal';
import TangibleInfoModal from './TangibleInfoModal';
import ReminderModal from './ReminderModal';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import hasPermission from 'utils/permissions';
import checkNegativeNumber from 'utils/checkNegativeHours';
import fixDiscrepancy from 'utils/fixDiscrepancy';
import { boxStyle } from 'styles';

/**
 * Modal used to submit and edit tangible and intangible time entries.
 * There are five use cases:
 *  1. Auth user logs new time entry from Timer to auth user: edit is false, fromTimer is true, isTangible is true;
 *  2. Auth user adds time entry from 'Add Intangible Time Entry' button to auth user: edit is false, fromTimer is false, isTangible depends;
 *  3. Auth user with permission adds time entry from 'Add Intangible Time Entry for XXX' button to XXX user: edit is false, fromTimer is false, isTangible depends;
 *  4. Auth user edits existing time entry of auth user: edit is true, fromTimer is false, isTangble depends;
 *  5. Auth user with permission edits existing time entry of other user: edit is true, fromTimer is false, isTangble depends;
 *
 * @param {boolean} props.edit If true, the time entry already exists and is being modified
 * @param {string} props.displayUserId
 * @param {function} props.toggle Toggles the visability of this modal
 * @param {boolean} props.isOpen Whether or not this modal is visible
 * @param {boolean} props.data.isTangible
 * @param {*} props.userProfile
 * @returns
 */

const inputNames = {
  dateOfWork: 'dateOfWork',
  hours: 'hours',
  minutes: 'minutes',
  projectOrTask: 'projectOrTask',
  notes: 'notes',
  isTangible: 'isTangible',
}

const TimeEntryForm = props => {
  /*---------------- variables -------------- */
  // props from parent
  const { 
    edit, 
    fromTimer, 
    isOpen, 
    toggle, 
    data, 
    sendStop,
    displayUserId,
    isTaskUpdated,
  } = props;

  // props from store
  const { authUser, displayUserProfile, displayUserProjects, displayUserWBSs, displayUserTask } = props;
  
  const authRole = authUser.role;
  const authId = authUser.userid;
  // const displayUserId = displayUserProfile._id;

  const initialFormValues = {
    dateOfWork: moment()
      .tz('America/Los_Angeles')
      .format('YYYY-MM-DD'),
    hours: 0,
    minutes: 0,
    projectId: '',
    wbsId: '',
    taskId: '',
    notes: '',
    isTangible: false,
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
  const [isTangibleInfoModalVisible, setTangibleInfoModalVisibility] = useState(false);
  const [isAboutModalVisible, setAboutModalVisible] = useState(false);
  // const [displayUserProjects, setProjects] = useState([])
  // const [displayUserWBSs, setWBSs] = useState([])
  // const [displayUserTask, setTasks] = useState([]);
  const [projectsAndTasksOptions, setProjectsAndTasksOptions] = useState([]);
  const [formDataBeforeEdit, setFormDataBeforeEdit] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const projectOrTaskRef = useRef(null);

  const dispatch = useDispatch();

  const canEditTimeEntry = props.hasPermission('editTimeEntry');
  const canPutUserProfileImportantInfo = props.hasPermission('putUserProfileImportantInfo');

  /*---------------- methods -------------- */
  const openRemainder = () =>
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

  const getEditMessage = () => {
    let editCount = 0;
    displayUserProfile.timeEntryEditHistory.forEach(item => {
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
    const formErrors = {
      dateError: 'Invalid date',
      
    }
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
      } else if (
        // Administrator/Owner can add time entries for any dates. Other roles cannot.
        // Editing details of past date is possible for any role.
        authRole !== 'Administrator' &&
        authRole !== 'Owner' && !edit && today.diff(date, 'days') !== 0
      ) {
        result.dateOfWork = 'Invalid date. Please refresh the page.';
      }
    }

    if (inputs.hours === '' && inputs.minutes === '') {
      result.time = 'Time is required';
    } else {
      const hours = inputs.hours === '' ? 0 : inputs.hours * 1;
      const minutes = inputs.minutes === '' ? 0 : inputs.minutes * 1;
      if (!Number.isInteger(hours) || !Number.isInteger(minutes)) result.time = 'Hours and minutes should be integers';
      if (hours < 0 || minutes < 0 || (hours === 0 && minutes === 0)) result.time = 'Time should be greater than 0 minutes';
    }

    if (inputs.projectId === '') result.projectId = 'Project/Task is required';

    if (reminder.wordCount < 10) {
      openRemainder();
      setReminder(reminder => ({
        ...reminder,
        remind:
          'Please write a more detailed description of your work completed, write at least 1-2 sentences.',
      }));
      result.notes = 'Description and reference link are required';
    }

    if (reminder.wordCount >= 10 && !reminder.hasLink) {
      openRemainder();
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
      openRemainder();
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
    const { projectId, wbsId, taskId, isTangible, personId } = timeEntry;

    //fix discrepancy in hours in userProfile if any

    fixDiscrepancy(userProfile);

    //Format hours && minutes
    const volunteerTime = parseFloat(hours) + parseFloat(minutes) / 60;

    //log  hours to intangible time entry
    if (isTangible !== 'true') {
      userProfile.totalIntangibleHrs += volunteerTime;
    } else {
      //This is get to know which project or task is selected
      const foundProject = displayUserProjects.find(project => project._id === projectId);
      const foundTask = displayUserTask.find(task => task._id === projectId);

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
    const foundProject = displayUserProjects.find(project => project._id === currProjectId);
    const foundTask = displayUserTask.find(task => task._id === currProjectId);

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
        const foundOldProject = displayUserProjects.find(project => project._id === oldProjectId);
        const foundOldTask = displayUserTask.find(task => task._id === oldProjectId);

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

  const handleInputChange = event => {
    event.persist();
    const target = event.target;
    switch (target.name) {
      case inputNames.hours: 
        if (target.value < 0 || target.value > 40) return;
        break;
      case inputNames.minutes:
        if (target.value < 0 || target.value > 59) return;
        break;
      case inputNames.isTangible:
        return setInputs(inputs => ({
          ...inputs,
          [target.name]: target.checked,
        }));
    }
    setInputs(inputs => ({
      ...inputs,
      [target.name]: target.value,
    }));
  };

  const handleEditorChange = (content, editor) => {
    const { wordcount } = editor.plugins;
    setInputs(inputs => ({ ...inputs, [editor.id]: content }));
    setReminder(reminder => ({
      ...reminder,
      wordCount: wordcount.body.getWordCount(),
      hasLink: inputs.notes.indexOf('http://') > -1 || inputs.notes.indexOf('https://') > -1,
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

  const handleSubmit = async event => {
    event.preventDefault();

    setSubmitting(true);

    const hours = inputs.hours || 0;
    const minutes = inputs.minutes || 0;
    const isTimeModified = edit && (data.hours !== hours || data.minutes !== minutes);

    if (!validateForm(isTimeModified)) {
      setSubmitting(false);
      return;
    }

    //Construct the timeEntry object
    const timeEntry = {
      personId: authId,
      dateOfWork: inputs.dateOfWork,
      projectId: inputs.projectId,
      wbsId: inputs.wbsId,
      taskId: inputs.taskId,
      notes: inputs.notes,
      isTangible: inputs.isTangible,
    };

    if (edit) {
      timeEntry.hours = hours;
      timeEntry.minutes = minutes;
    } else {
      timeEntry.timeSpent = `${hours}:${minutes}:00`;
    }

    let timeEntryStatus;
    if (edit) {
      if (!reminder.notice) {
        if (displayUserProfile) {
          editHoursByCategory(displayUserProfile, timeEntry, hours, minutes);
        }
        timeEntryStatus = await dispatch(editTimeEntry(data._id, timeEntry, data.dateOfWork));
      }
    } else {
      if (displayUserProfile) {
        updateHoursByCategory(displayUserProfile, timeEntry, hours, minutes);
      }
      timeEntryStatus = await dispatch(postTimeEntry(timeEntry));
    }

    if (timeEntryStatus !== 200) {
      toggle();
      setSubmitting(false);
      alert(
        `An error occurred while attempting to submit your time entry. Error code: ${timeEntryStatus}`,
      );
      return;
    }

    // see if this is the first time the user is logging time
    if (!edit) {
      if (displayUserProfile.isFirstTimelog && displayUserProfile.isFirstTimelog === true) {
        const updatedUserProfile = {
          ...displayUserProfile,
          createdDate: new Date(),
          isFirstTimelog: false,
        };
        await updateUserProfile(displayUserProfile._id, updatedUserProfile);
      }
    }

    if (!props.edit) setInputs(initialFormValues);

    // await dispatch(getUserProfile(displayUserId));
    // await dispatch(getTimeEntriesForWeek(displayUserId, 0));

    //Clear the form and clean up.
    if (fromTimer) {
      sendStop();
      clearForm();
    } else if (!reminder.notice) {
      setReminder(reminder => ({
        ...reminder,
        editNotice: !reminder.editNotice,
      }));
    }

    setReminder(initialReminder);
    if (isOpen) toggle();
    setSubmitting(false);
  };

  const tangibleInfoModalToggle = e => {
    e.preventDefault();
    setTangibleInfoModalVisibility(!isTangibleInfoModalVisible);
  };

  const aboutModalToggle = e => {
    e.preventDefault();
    setAboutModalVisible(!isTangibleInfoModalVisible);
  };

  const buildOptions = () => {
    const projectsObject = {};
    const options = [(
      <option value="title" key="TimeEntryFormDefaultProjectOrTask" disabled>
        Select Project/Task
      </option>
    )];
    if (displayUserProjects.length) {
      displayUserProjects.forEach(project => {
        const { projectId } = project;
        project.WBSObject = {};
        projectsObject[projectId] = project;
      });
    }
    if (displayUserProjects.length && displayUserWBSs.length) {
      displayUserWBSs.forEach(WBS => {
        const { projectId, _id: wbsId } = WBS;
        WBS.taskObject = [];
        projectsObject[projectId].WBSObject[wbsId] = WBS;
      })
    }
    if (displayUserProjects.length && displayUserWBSs.length && displayUserTask.length) {
      displayUserTask.forEach(task => {
        const { projectId, wbsId, _id: taskId } = task;
        projectsObject[projectId].WBSObject[wbsId].taskObject[taskId] = task;
      });
    }
    for (const [projectId, project] of Object.entries(projectsObject)) {
      const { projectName, WBSObject } = project;
      options.push(
        <option value={projectId} key={`TimeEntryForm_${projectId}`} >
          {projectName}
        </option>
      )
      for (const [wbsId, WBS] of Object.entries(WBSObject)) {
        const { wbsName, taskObject } = WBS;
        options.push(
          <option value={wbsId} key={`TimeEntryForm_${wbsId}`} disabled>
              {`\u2003WBS: ${wbsName}`}
          </option>
        )
        for (const [taskId, task] of Object.entries(taskObject)) {
          const { taskName } = task;
          options.push(
            <option value={taskId} key={`TimeEntryForm_${taskId}`} >
                {`\u2003\u2003 ↳ ${taskName}`}
            </option>
          )
        }
      }
    };
    return options
  }

  const loadAsyncData = async userId => {
    //load the timelog data
    try {
      await Promise.all([
        props.getUserProfile(userId),
        props.getUserProjects(userId),
        props.getUserWBSs(userId),
        props.getUserTasks(userId),
      ]);
    } catch (e) {
      console.log(e);
    }
  };

  /*---------------- useEffects -------------- */
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


  /* --------------------------------------------------- Should integrate into redux-thunk system for consistency --------------------------------------- */
  useEffect(() => {
    loadAsyncData(displayUserId)
  }, [isTaskUpdated]);

  useEffect(() => {
    const options = buildOptions();
    setProjectsAndTasksOptions(options);
  }, [displayUserProjects, displayUserWBSs, displayUserTask])

  //grab form data before editing
  useEffect(() => {
    if (isOpen && edit) {
      setFormDataBeforeEdit(inputs);
    }
  }, [isOpen]);

  useEffect(() => {
    setInputs({ ...inputs, ...data });
  }, [data]);

  return (
    <>
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
              onClick={aboutModalToggle}
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
                <Input
                  type="date"
                  name="dateOfWork"
                  id="dateOfWork"
                  value={inputs.dateOfWork}
                  onChange={handleInputChange}
                  disabled={!canEditTimeEntry || fromTimer}
                />
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                name="projectOrTask"
                id="projectOrTask"
                ref={projectOrTaskRef}
                value={inputs.taskId || inputs.projectId || "title"}
                onChange={handleInputChange}
              >
                {projectsAndTasksOptions}
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
                  onChange={handleInputChange}
                  disabled={!canEditTimeEntry && !data.isTangible}
                />
                Tangible&nbsp;
                <i
                  className="fa fa-info-circle"
                  data-tip
                  data-for="tangibleTip"
                  aria-hidden="true"
                  title="tangibleTip"
                  onClick={tangibleInfoModalToggle}
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
          <Button color="primary" onClick={handleSubmit} style={boxStyle} disabled={submitting}>
            {edit ? 'Save' : (submitting ? 'Submitting...' : 'Submit')}
          </Button>
        </ModalFooter>
      </Modal>
      <TangibleInfoModal
        visible={isTangibleInfoModalVisible}
        setVisible={setTangibleInfoModalVisibility}
      />
      <AboutModal visible={isAboutModalVisible} setVisible={setAboutModalVisible} />
      <ReminderModal
        inputs={inputs}
        data={data}
        edit={edit}
        reminder={reminder}
        visible={reminder.notification}
        setVisible={visible => setReminder({ ...reminder, notification: visible })}
        cancelChange={cancelChange}
      />
    </>
  );
};

TimeEntryForm.propTypes = {
  edit: PropTypes.bool.isRequired,
  displayUserId: PropTypes.string.isRequired,
  toggle: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  data: PropTypes.any.isRequired,
  handleStop: PropTypes.func,
};

const mapStateToProps = state => ({
  authUser: state.auth.user,
  displayUserProfile: state.userProfile,
  displayUserProjects: state.userProjects.projects,
  displayUserWBSs: state.userProjects.wbs,
  displayUserTask: state.userTask,
})

export default connect(mapStateToProps, { 
  hasPermission,
  getUserProfile,
  updateUserProfile,
  getUserTasks,
  getUserProjects,
  getUserWBSs,
})(TimeEntryForm);
