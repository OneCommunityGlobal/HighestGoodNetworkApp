import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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
import { isEmpty, isEqual } from 'lodash';
import { Editor } from '@tinymce/tinymce-react';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import { postTimeEntry, editTimeEntry, getTimeEntriesForWeek } from '../../../actions/timeEntries';
import { getUserProjects, getUserWBSs } from '../../../actions/userProjects';
import { getUserProfile, updateUserProfile } from 'actions/userProfile';

import AboutModal from './AboutModal';
import TangibleInfoModal from './TangibleInfoModal';
import ReminderModal from './ReminderModal';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import hasPermission from 'utils/permissions';
import { permissions } from 'utils/constants';
import { boxStyle, boxStyleDark } from 'styles';
import '../../Header/DarkMode.css'

const TINY_MCE_INIT_OPTIONS = {
  license_key: 'gpl',
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
};

/**
 * Modal used to submit and edit tangible and intangible time entries.
 * There are several use cases:
 *  1. Auth user logs new time entry from Timer to auth user (from 'Timer')
 *  2. Auth user adds time entry from 'Add Intangible Time Entry' button to auth user (from 'Timelog')
 *  3. Auth user with permission adds time entry from 'Add Intangible Time Entry for XXX' button to XXX user (from other's 'Timelog')
 *  4. Auth user edits existing time entry of auth user (from 'WeeklyTab')
 *  5. Auth user with permission edits existing time entry of other user (from other's 'WeeklyTab')
 *  6. TODO: Owner like users edits time entry of other users on Task tab (from 'TaskTab')
 *
 * @param {boolean} props.edit If true, the time entry already exists and is being modified
 * @param {string} props.timeEntryUserId
 * @param {function} props.toggle Toggles the visability of this modal
 * @param {boolean} props.isOpen Whether or not this modal is visible
 * @param {boolean} props.dataIsTangible
 * @param {*} props.userProfile
 * @returns
 */

const TimeEntryForm = props => {
  /*---------------- variables -------------- */
  // props from parent
  const { from, sendStop, edit, data, toggle, isOpen, tab, userProfile, darkMode } = props;
  // props from store
  const { authUser } = props;

  const initialFormValues = Object.assign(
    {
      dateOfWork: moment()
        .tz('America/Los_Angeles')
        .format('YYYY-MM-DD'),
      personId: authUser.userid,
      projectId: '',
      wbsId: '',
      taskId: '',
      hours: 0,
      minutes: 0,
      notes: '',
      isTangible: from === 'Timer' ? true : false,
      entryType: 'default',
    },
    data,
  );

  const timeEntryUserId = from === 'Timer' ? authUser.userid : data.personId;

  const {
    dateOfWork: initialDateOfWork,
    projectId: initialProjectId,
    wbsId: initialwbsId,
    taskId: initialTaskId,
    hours: initialHours,
    minutes: initialMinutes,
    notes: initialNotes,
    isTangible: initialIsTangible,
  } = initialFormValues;

  const timeEntryInitialProjectOrTaskId = edit
    ? initialProjectId +
      (!!initialwbsId ? '/' + initialwbsId : '') +
      (!!initialTaskId ? '/' + initialTaskId : '')
    : 'defaultProject';

  const initialReminder = {
    openModal: false,
    hasLink: initialNotes.includes('http'),
    remind: '',
    enoughWords: initialNotes.split(' ').length > 10,
    editLimitNotification: true,
  };

  const [formValues, setFormValues] = useState(initialFormValues);
  const [timeEntryFormUserProfile, setTimeEntryFormUserProfile] = useState(null);
  const [timeEntryFormUserProjects, setTimeEntryFormUserProjects] = useState([]);
  const [timeEntryFormUserWBSs, setTimeEntryFormUserWBSs] = useState([]);
  const [timeEntryFormUserTasks, setTimeEntryFormUserTasks] = useState([]);
  const [projectOrTaskId, setProjectOrTaskId] = useState(timeEntryInitialProjectOrTaskId);
  const [isAsyncDataLoaded, setIsAsyncDataLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [reminder, setReminder] = useState(initialReminder);
  const [isTangibleInfoModalVisible, setTangibleInfoModalVisibility] = useState(false);
  const [isAboutModalVisible, setAboutModalVisible] = useState(false);
  const [projectsAndTasksOptions, setProjectsAndTasksOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const isForAuthUser = timeEntryUserId === authUser.userid;
  const isSameDayTimeEntry = moment().tz('America/Los_Angeles').format('YYYY-MM-DD') === formValues.dateOfWork;
  const isSameDayAuthUserEdit = isForAuthUser && isSameDayTimeEntry;
  const canEditTimeEntry =
    props.hasPermission(permissions.timeLog.editTimeEntry);
  const canPutUserProfileImportantInfo = props.hasPermission(permissions.userManagement.putUserProfileImportantInfo);

// Administrator/Owner can add time entries for any dates, and other roles can only edit their own time entry in the same day.
  const canUserEditDate = canEditTimeEntry && canPutUserProfileImportantInfo;
  const canChangeTime = from !== 'Timer' && (from === 'TimeLog' || canEditTimeEntry || isSameDayAuthUserEdit) ;

  /*---------------- methods -------------- */
  const toggleRemainder = () =>
    setReminder(reminder => ({
      ...reminder,
      openModal: !reminder.openModal,
    }));

  const cancelChange = () => {
    setReminder(initialReminder);
    setFormValues(formValues => ({
      ...formValues,
      hours: initialHours,
      minutes: initialMinutes,
    }));
  };

  const getEditMessage = () => {
    const editCount = timeEntryFormUserProfile?.timeEntryEditHistory.filter(
      item =>
        moment()
          .tz('America/Los_Angeles')
          .diff(item.date, 'days') <= 365,
    ).length;
    return `If you edit your time entries 5 times or more within the span of a year, you will be issued a blue square on the 5th time.
    You will receive an additional blue square for each edit beyond the 5th.
    Currently, you have edited your time entries ${editCount} times within the last 365 days.
    Do you wish to continue?`;
  };

  const handleInputChange = event => {
    event.persist();
    const target = event.target;
    switch (target.name) {
      case 'hours':
        if (+target.value < 0 || +target.value > 40) return;
        return setFormValues(formValues => ({ ...formValues, hours: +target.value }));
      case 'minutes':
        if (+target.value < 0 || +target.value > 59) return;
        return setFormValues(formValues => ({ ...formValues, minutes: +target.value }));
      case 'isTangible':
        return setFormValues(formValues => ({ ...formValues, isTangible: target.checked }));
      default:
        return setFormValues(formValues => ({ ...formValues, [target.name]: target.value }));
    }
  };

  const handleProjectOrTaskChange = event => {
    const optionValue = event.target.value;
    const ids = optionValue.split('/');
    const [projectId, wbsId, taskId] = ids.length > 1 ? ids : [ids[0], null, null];
    setFormValues(formValues => ({
      ...formValues,
      projectId,
      wbsId,
      taskId,
    }));
    setProjectOrTaskId(optionValue);
  };

  const handleEditorChange = (content, editor) => {
    const { wordcount } = editor.plugins;
    const hasLink = content.indexOf('http://') > -1 || content.indexOf('https://') > -1;
    const enoughWords = wordcount.body.getWordCount() > 10;
    setFormValues(formValues => ({ ...formValues, [editor.id]: content }));
    setReminder(reminder => ({
      ...reminder,
      enoughWords,
      hasLink,
    }));
  };

  const validateForm = isTimeModified => {
    const errorObj = {};
    const remindObj = { ...initialReminder };
    const date = moment(formValues.dateOfWork);
    const isDateValid = date.isValid();

    if (!formValues.dateOfWork) errorObj.dateOfWork = 'Date is required';
    if (!isDateValid) errorObj.dateOfWork = 'Invalid date';
    if (from !== 'Timer' && !canChangeTime) errorObj.dateOfWork = 'Invalid date. Please refresh the page.';
    if (!formValues.hours && !formValues.minutes)
      errorObj.time = 'Time should be greater than 0 minutes';
    if (!formValues.projectId) errorObj.projectId = 'Project/Task is required';

    if (!reminder.enoughWords) {
      remindObj.remind =
        'Please write a more detailed description of your work completed, write at least 1-2 sentences.';
      errorObj.notes = 'Description and reference link are required';
    } else if (!reminder.hasLink) {
      remindObj.remind =
        'Do you have a link to your Google Doc or other place to review this work? You should add it if you do. (Note: Please include http[s]:// in your URL)';
      errorObj.notes = 'Description and reference link are required';
    }

    setErrors(errorObj);

    if (remindObj.remind) {
      setReminder(remindObj);
      toggleRemainder();
      return false;
    }

    if (
      !canPutUserProfileImportantInfo &&
      initialIsTangible &&
      isTimeModified &&
      reminder.editLimitNotification
    ) {
      remindObj.remind = getEditMessage();
      remindObj.editLimitNotification = !reminder.editLimitNotification;
      setReminder(remindObj);
      toggleRemainder();
      return false;
    }

    return isEmpty(errorObj);
  };

  /**
   * Resets the project/task and notes fields of the form without resetting hours and minutes.
   * @param {*} closed If true, the form closes after being cleared.
   */
  const clearForm = closed => {
    setFormValues(initialFormValues);
    setReminder({ ...initialReminder });
    setErrors({});
    setProjectOrTaskId('defaultProject');
    if (closed === true && isOpen) toggle();
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setSubmitting(true);

    if (edit && isEqual(formValues, initialFormValues)) {
      toast.info(`Nothing is changed for this time entry`);
      setSubmitting(false);
      return;
    }

    const { hours: formHours, minutes: formMinutes } = formValues;

    const isTimeModified = edit && (initialHours !== formHours || initialMinutes !== formMinutes);

    if (!validateForm(isTimeModified)) {
      setSubmitting(false);
      return;
    }

    // Construct the timeEntry object
    const timeEntry = { ...formValues };

    try {
      if (edit) {
        await props.editTimeEntry(data._id, timeEntry, initialDateOfWork);
      } else {
        await props.postTimeEntry(timeEntry);
      }
  
      setFormValues(initialFormValues);

      //Clear the form and clean up.
      switch (from) {
        case 'Timer': // log time entry from Timer
          sendStop();
          clearForm();
          break;
        case 'TimeLog': // add intangible time entry
          const date = moment(formValues.dateOfWork);
          const today = moment().tz('America/Los_Angeles');
          const offset = today.week() - date.week();
          if (offset < 3) {
            props.getTimeEntriesForWeek(timeEntryUserId, offset);
          } else {
            props.getTimeEntriesForWeek(timeEntryUserId, 3);
          }
          clearForm();
          break;
        case 'WeeklyTab':
          await Promise.all([
            props.getUserProfile(timeEntryUserId),
            props.getTimeEntriesForWeek(timeEntryUserId, tab),
          ]);
          break;
        default:
          break;
      }

      if (from !== 'Timer' && !reminder.editLimitNotification) {
        setReminder(reminder => ({
          ...reminder,
          editLimitNotification: !reminder.editLimitNotification,
        }));
      }
  
      setReminder(initialReminder);
      if (isOpen) toggle();
      setSubmitting(false);

    } catch (error) {
      toast.error(`An error occurred while attempting to submit your time entry. Error: ${error}`);
      setSubmitting(false);
    }
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
    const options = [
      <option value="defaultProject" key="defaultProject" disabled>
        Select Project/Task
      </option>,
    ];
    timeEntryFormUserProjects.forEach(project => {
      const { projectId } = project;
      project.WBSObject = {};
      projectsObject[projectId] = project;
    });
    timeEntryFormUserWBSs.forEach(WBS => {
      const { projectId, _id: wbsId } = WBS;
      WBS.taskObject = {};
      if(projectsObject[projectId]){
        projectsObject[projectId].WBSObject[wbsId] = WBS;
      }
    });
    timeEntryFormUserTasks.forEach(task => {
      const { projectId, wbsId, _id: taskId, resources } = task;
      const isTaskCompletedForTimeEntryUser = resources.find(
        resource => resource.userID === timeEntryUserId,
      ).completedTask;
      if (!isTaskCompletedForTimeEntryUser && projectsObject[projectId]) {
        if (!projectsObject[projectId].WBSObject) {
          projectsObject[projectId].WBSObject = {};
        }
        if (!projectsObject[projectId].WBSObject[wbsId]) {
          projectsObject[projectId].WBSObject[wbsId] = { taskObject: {} };
        }
        projectsObject[projectId].WBSObject[wbsId].taskObject[taskId] = task;
      }   
    });

    for (const [projectId, project] of Object.entries(projectsObject)) {
      const { projectName, WBSObject } = project;
      options.push(
        <option value={projectId} key={projectId}>
          {projectName}
        </option>,
      );
      for (const [wbsId, WBS] of Object.entries(WBSObject)) {
        const { wbsName, taskObject } = WBS;
        if (Object.keys(taskObject).length) {
          options.push(
            <option value={`${projectId}/${wbsId}`} key={`TimeEntryForm_${wbsId}`} disabled>
              {`\u2003WBS: ${wbsName}`}
            </option>,
          );
          for (const [taskId, task] of Object.entries(taskObject)) {
            const { taskName } = task;
            options.push(
              <option value={`${projectId}/${wbsId}/${taskId}`} key={`TimeEntryForm_${taskId}`}>
                {`\u2003\u2003 ↳ ${taskName}`}
              </option>,
            );
          }
        }
      }
    }
    return options;
  };

  /**
   * Rectify: This will run whenever TimeEntryForm is opened, since time entry data does not bound to store states (e.g., userProfile, userProjects, userTasks..)
   * */
  const loadAsyncData = async timeEntryUserId => {
    setIsAsyncDataLoaded(false);
    try {
      const profileURL = ENDPOINTS.USER_PROFILE(timeEntryUserId);
      const projectURL = ENDPOINTS.USER_PROJECTS(timeEntryUserId);
      const wbsURL = ENDPOINTS.WBS_USER(timeEntryUserId);
      const taskURL = ENDPOINTS.TASKS_BY_USERID(timeEntryUserId);

      const profilePromise = axios.get(profileURL);
      const projectPromise = axios.get(projectURL);
      const wbsPromise = axios.get(wbsURL);
      const taskPromise = axios.get(taskURL);

      const [userProfileRes, userProjectsRes, userWBSsRes, userTasksRes] = await Promise.all([
        profilePromise,
        projectPromise,
        wbsPromise,
        taskPromise,
      ]);
      setTimeEntryFormUserProfile(userProfileRes.data);
      setTimeEntryFormUserProjects(userProjectsRes.data);
      setTimeEntryFormUserWBSs(userWBSsRes.data);
      setTimeEntryFormUserTasks(userTasksRes.data);
      setIsAsyncDataLoaded(true);
    } catch (e) {
      console.log(e);
      toast.error('An error occurred while loading the form data. Please try again later.');
    }
  };

  /*---------------- useEffects -------------- */
  useEffect(() => {
    if (isAsyncDataLoaded) {
      const options = buildOptions();
      setProjectsAndTasksOptions(options);
    }
  }, [isAsyncDataLoaded]);

  //grab form data before editing
  useEffect(() => {
    if (isOpen) {
      loadAsyncData(timeEntryUserId);
    }
  }, [isOpen]);

  useEffect(() => {
    setFormValues({ ...formValues, ...data})
  }, [data])

  const fontColor = darkMode ? 'text-light' : '';
  const headerBg = darkMode ? 'bg-space-cadet' : '';
  const bodyBg = darkMode ? 'bg-yinmn-blue' : '';

  return (
    <>
      <Modal className={darkMode ? `${fontColor} dark-mode` : ''} isOpen={isOpen} toggle={toggle} data-testid="timeEntryFormModal" style={darkMode ? boxStyleDark : {}}>
        <ModalHeader toggle={toggle} className={`${headerBg}`}>
          <div>
            {edit ? 'Edit ' : 'Add '}
            {formValues.isTangible ? (
              <span style={{ color: darkMode ? '#007BFF' : 'blue' }}>Tangible </span>
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
            { !isAsyncDataLoaded && <span> Loading Data...</span> }
          </div>
          <ReactTooltip id="registerTip" place="bottom" effect="solid">
            Click this icon to learn about this time entry form
          </ReactTooltip>
        </ModalHeader>
        <ModalBody className={bodyBg}>
          <Form>
            <FormGroup>
              <Label for="dateOfWork" className={fontColor}>Date</Label>
              <Input
                type="date"
                name="dateOfWork"
                id="dateOfWork"
                value={formValues.dateOfWork}
                onChange={handleInputChange}
                // min={userProfile?.isFirstTimelog === true ? moment().toISOString().split('T')[0] : userProfile?.startDate ? userProfile?.startDate.split('T')[0] : null} 
                disabled={!canEditTimeEntry}
              />
              {'dateOfWork' in errors && (
                <div className="text-danger">
                  <small>{errors.dateOfWork}</small>
                </div>
              )}
            </FormGroup>
            <FormGroup>
              <Label for="timeSpent" className={fontColor}>Time (HH:MM)</Label>
              <Row form>
                <Col>
                  <Input
                    type="number"
                    name="hours"
                    id="hours"
                    min={0}
                    max={40}
                    placeholder="Hours"
                    value={formValues.hours}
                    onChange={handleInputChange}
                    disabled={!canChangeTime}
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
                    value={formValues.minutes}
                    onChange={handleInputChange}
                    disabled={!canChangeTime}
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
              <Label for="project" className={fontColor}>Project/Task</Label>
              <Input
                type="select"
                name="projectOrTask"
                id="projectOrTask"
                value={projectOrTaskId || 'title'}
                onChange={handleProjectOrTaskChange}
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
              <Label for="notes" className={fontColor}>Notes</Label>
              <Editor
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                init={TINY_MCE_INIT_OPTIONS}
                id="notes"
                name="notes"
                className="form-control"
                value={formValues.notes}
                onEditorChange={handleEditorChange}
              />

              {'notes' in errors && (
                <div className="text-danger">
                  <small>{errors.notes}</small>
                </div>
              )}
            </FormGroup>
            <FormGroup check>
              <Label check className={fontColor}>
                <Input
                  type="checkbox"
                  name="isTangible"
                  checked={formValues.isTangible}
                  onChange={handleInputChange}
                  disabled={!(canEditTimeEntry || from === 'Timer')}
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
        <ModalFooter className={bodyBg}>
          <small className="mr-auto">* All the fields are required</small>
          <Button onClick={clearForm} color="danger" style={darkMode ? boxStyleDark : boxStyle}>
            Clear Form
          </Button>
          <Button color="primary" onClick={handleSubmit} style={darkMode ? boxStyleDark : boxStyle} disabled={submitting}>
            {edit ? (submitting ? 'Saving...' : 'Save') : submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </ModalFooter>
      </Modal>
      <TangibleInfoModal
        visible={isTangibleInfoModalVisible}
        setVisible={setTangibleInfoModalVisibility}
        darkMode={darkMode}
      />
      <AboutModal visible={isAboutModalVisible} setVisible={setAboutModalVisible} darkMode={darkMode}/>
      <ReminderModal
        inputs={formValues}
        data={data}
        edit={edit}
        reminder={reminder}
        visible={reminder.openModal}
        setVisible={toggleRemainder}
        cancelChange={cancelChange}
        darkMode={darkMode}
      />
    </>
  );
};

TimeEntryForm.propTypes = {
  edit: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  data: PropTypes.any.isRequired,
  handleStop: PropTypes.func,
};

const mapStateToProps = state => ({
  authUser: state.auth.user,
  userProfile: state.userProfile,
  darkMode: state.theme.darkMode,
});

export default connect(mapStateToProps, {
  hasPermission,
  getUserProfile,
  updateUserProfile,
  getUserProjects,
  getUserWBSs,
  editTimeEntry,
  postTimeEntry,
  getTimeEntriesForWeek,
})(TimeEntryForm);
