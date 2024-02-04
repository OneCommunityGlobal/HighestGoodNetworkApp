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
import checkNegativeNumber from 'utils/checkNegativeHours';
import fixDiscrepancy from 'utils/fixDiscrepancy';
import { boxStyle } from 'styles';

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
  const { 
    from, 
    sendStop,
    edit, 
    data, 
    toggle, 
    isOpen, 
    tab,
  } = props;

  // props from store
  const { authUser } = props;
  
  
  const initialFormValues = Object.assign({
    dateOfWork: moment().tz('America/Los_Angeles').format('YYYY-MM-DD'),
    personId: authUser.userid,
    projectId: '',
    wbsId: '',
    taskId: '',
    hours: 0,
    minutes: 0,
    notes: '',
    isTangible: false, 
    entryType: 'default',
  }, data);

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
  } = initialFormValues

  const timeEntryInitialProjectOrTaskId = edit ? initialProjectId + (!!initialwbsId ? '/' + initialwbsId : '') + (!!initialTaskId ? '/' + initialTaskId : ''): 'defaultProject';

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

  const canEditTimeEntry = props.hasPermission('editTimelogInfo') || props.hasPermission('editTimeEntry');
  const canPutUserProfileImportantInfo = props.hasPermission('putUserProfileImportantInfo');

  const canChangeTime = from !== 'Timer' && (from === 'TimeLog' || canEditTimeEntry);

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
    const editCount = timeEntryFormUserProfile?.timeEntryEditHistory.filter(item => 
      moment().tz('America/Los_Angeles').diff(item.date, 'days') <= 365
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
        return setFormValues(formValues => ({ ...formValues, hours: +target.value}));
      case 'minutes':
        if (+target.value < 0 || +target.value > 59) return;
        return setFormValues(formValues => ({ ...formValues, minutes: +target.value}));
      case 'isTangible':
        return setFormValues(formValues => ({ ...formValues, isTangible: target.checked }));
      default: 
        return setFormValues(formValues => ({ ...formValues, [target.name]: target.value}));
    }
  };

  const handleProjectOrTaskChange = event => {
    const optionValue = event.target.value;
    const ids = optionValue.split('/');
    const [projectId, wbsId, taskId] = ids.length > 1 ? ids : [ids[0], null, null]
    setFormValues(formValues => ({
      ...formValues,
      projectId,
      wbsId,
      taskId,
    }))
    setProjectOrTaskId(optionValue);
  }

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
    const today = moment().tz('America/Los_Angeles');
    const isDateValid = date.isValid();
    // Administrator/Owner can add time entries for any dates, and other roles can only edit their own time entry in the same day.
    const isUserAuthorized = (canEditTimeEntry && canPutUserProfileImportantInfo) || !edit || today.diff(date, 'days') === 0
    
    if (!formValues.dateOfWork) errorObj.dateOfWork = 'Date is required'; 
    if (!isDateValid) errorObj.dateOfWork = 'Invalid date'; 
    if (!isUserAuthorized) errorObj.dateOfWork = 'Invalid date. Please refresh the page.';
    if (!formValues.hours && !formValues.minutes) errorObj.time ='Time should be greater than 0 minutes';
    if (!formValues.projectId) errorObj.projectId = 'Project/Task is required';
    
    if (!reminder.enoughWords) {
      remindObj.remind = 'Please write a more detailed description of your work completed, write at least 1-2 sentences.';
      errorObj.notes = 'Description and reference link are required';
    } else if (!reminder.hasLink) {
      remindObj.remind = 'Do you have a link to your Google Doc or other place to review this work? You should add it if you do. (Note: Please include http[s]:// in your URL)';
      errorObj.notes = 'Description and reference link are required';
    }

    setErrors(errorObj);

    if (remindObj.remind) {
      setReminder(remindObj);
      toggleRemainder();
      return false
    }

    if (!canPutUserProfileImportantInfo
      && initialIsTangible
      && isTimeModified
      && reminder.editLimitNotification
    ) {
      remindObj.remind = getEditMessage();
      remindObj.editLimitNotification = !reminder.editLimitNotification;
      setReminder(remindObj);
      toggleRemainder();
      return false
    }

    return isEmpty(errorObj);
  };

  //Update hoursByCategory when submitting new time entry
  const updateHoursByCategory = async (timeEntry, hours, minutes) => {
    const { projectId, isTangible, personId } = timeEntry;
    const url = ENDPOINTS.USER_PROFILE(personId);

    try {
      const { data: userProfile } = await axios.get(url);

      const { hoursByCategory } = userProfile;

      //fix discrepancy in hours in userProfile if any
      fixDiscrepancy(userProfile);

      //Format hours && minutes
      const volunteerTime = parseFloat(hours) + parseFloat(minutes) / 60;

      //log  hours to intangible time entry
      if (isTangible !== true) {
        userProfile.totalIntangibleHrs += volunteerTime;
      } else {
        //This is get to know which project or task is selected
        const timeEntryProject = timeEntryFormUserProjects.find(project => project.projectId === projectId);
        const category = timeEntryProject?.category.toLowerCase() || '';

        //update hours
        if (category in hoursByCategory) {
          hoursByCategory[category] += volunteerTime;
        } else {
          hoursByCategory['unassigned'] += volunteerTime;
        }
      }

    //update database
      await axios.put(url, userProfile);
    } catch (error) {
      console.log(error);
    }
  };

  //Update hoursByCategory when editing old time entry
  const editHoursByCategory = async (timeEntry, hours, minutes) => {
    const { projectId: formProjectId, isTangible: formIsTangible, personId } = timeEntry;
    const url = ENDPOINTS.USER_PROFILE(personId);

    try {
      const { data: userProfile } = await axios.get(url);

      const { hoursByCategory  } = userProfile;
      const isRegularUser = authUser.role !== 'Administrator' && authUser.role !== 'Owner'


      //hours before && after edit
      const dataEntryTime = parseFloat(initialHours) + parseFloat(initialMinutes) / 60;
      const formEntryTime = parseFloat(hours) + parseFloat(minutes) / 60;
      const timeDifference = formEntryTime - dataEntryTime;

      //No hours needs to be updated
      if (dataEntryTime === formEntryTime 
        && initialProjectId === formProjectId
        && initialIsTangible === formIsTangible
      ) {
        return;
      }

      //if time entry keeps intangible before and after edit, means we don't need update tangible hours
      if (initialIsTangible === false && formIsTangible === false) {
        userProfile.totalIntangibleHrs += timeDifference;
      }

      //found project 
      const formTimeEntryProject = timeEntryFormUserProjects.find(project => project.projectId === formProjectId);
      const formCategory = formTimeEntryProject?.category.toLowerCase();
      
      //if change timeEntry from intangible to tangible, we need add hours on categories
      if (initialIsTangible === false && formIsTangible === true) {
        userProfile.totalIntangibleHrs -= formEntryTime;
        if (formCategory in hoursByCategory) {
          hoursByCategory[formCategory] += volunteerTime;
        } else {
          hoursByCategory['unassigned'] += volunteerTime;
        }
      }

      //if change timeEntry from tangible to intangible, we need deduct hours on categories
      if (initialIsTangible === true && formIsTangible === false) {
        userProfile.totalIntangibleHrs += formEntryTime;
        if (formCategory in hoursByCategory) {
          hoursByCategory[formCategory] -= volunteerTime;
        } else {
          hoursByCategory['unassigned'] -= volunteerTime;
        }
      }

      //if timeEntry is tangible before and after edit
      if (initialIsTangible === true && formIsTangible === true) {
        //if project didn't change, add timeDifference on category
        if (initialProjectId === formProjectId) {
          if (formCategory in hoursByCategory) {
            hoursByCategory[formCategory] += timeDifference;
          } else {
            hoursByCategory['unassigned'] += timeDifference;
          }
        } else {
          const dataTimeEntryProject = timeEntryFormUserProjects.find(project => project.projectId === initialProjectId);
          const dataCategory = dataTimeEntryProject?.category.toLowerCase();

          if (dataCategory in hoursByCategory) {
            hoursByCategory[dataCategory] -= dataEntryTime;
          } else {
            hoursByCategory['unassigned'] -= dataEntryTime;
          }

          if (formCategory in hoursByCategory) {
            hoursByCategory[formCategory] += formEntryTime;
          } else {
            hoursByCategory['unassigned'] += formEntryTime;
          }
        }
      }

      checkNegativeNumber(userProfile);
      //update database
  
      await axios.put(url, userProfile);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Resets the project/task and notes fields of the form without resetting hours and minutes.
   * @param {*} closed If true, the form closes after being cleared.
   */
  const clearForm = closed => {
    setFormValues(initialFormValues);
    setReminder({ ...initialReminder });
    setErrors({});
    setProjectOrTaskId('defaultProject')
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
    
    const { 
      hours: formHours, 
      minutes: formMinutes, 
    } = formValues;

    const isTimeModified = edit && (initialHours !== formHours || initialMinutes !== formMinutes);

    if (!validateForm(isTimeModified)) {
      setSubmitting(false);
      return;
    }

    //Construct the timeEntry object
    const timeEntry = { ...formValues }
   
    let timeEntryStatus;

    if (edit) {
      timeEntry.hours = formHours;
      timeEntry.minutes = formMinutes;
      editHoursByCategory(timeEntry, formHours, formMinutes);
      timeEntryStatus = await props.editTimeEntry(data._id, timeEntry, initialDateOfWork);
    } else {
      timeEntry.timeSpent = `${formHours}:${formMinutes}:00`;
      updateHoursByCategory(timeEntry, formHours, formMinutes);
      timeEntryStatus = await props.postTimeEntry(timeEntry);
    }
    
    if (timeEntryStatus !== 200) {
      toast.error(`An error occurred while attempting to submit your time entry. Error code: ${timeEntryStatus}`);
      setSubmitting(false);
      return;
    }

    // see if this is the first time the user is logging time
    if (!edit) {
      if (timeEntryFormUserProfile?.isFirstTimelog) {
        const updatedUserProfile = {
          ...timeEntryFormUserProfile,
          createdDate: new Date(),
          isFirstTimelog: false,
        };
        await updateUserProfile(updatedUserProfile);
      }
    }
  
    setFormValues(initialFormValues);

    //Clear the form and clean up.
    if (from === 'Timer') {
      sendStop();
      clearForm();
    } else if (!reminder.editLimitNotification) {
      setReminder(reminder => ({
        ...reminder,
        editLimitNotification: !reminder.editLimitNotification,
      }));
    }

    if (from === 'TimeLog') {
      const date = moment(formValues.dateOfWork);
      const today = moment().tz('America/Los_Angeles');
      const offset = today.week() - date.week();
      if (offset < 3) {
        props.getTimeEntriesForWeek(timeEntryUserId, offset);
      } else {
        props.getTimeEntriesForWeek(timeEntryUserId, 3);
      }
      clearForm();
    }

    if (from === 'WeeklyTab') {
      await Promise.all([
        props.getUserProfile(timeEntryUserId),
        props.getTimeEntriesForWeek(timeEntryUserId, tab),
      ]);
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
      <option value="defaultProject" key="defaultProject" disabled>
        Select Project/Task
      </option>
    )];
    timeEntryFormUserProjects.forEach(project => {
      const { projectId } = project;
      project.WBSObject = {};
      projectsObject[projectId] = project;
    });
    timeEntryFormUserWBSs.forEach(WBS => {
      const { projectId, _id: wbsId } = WBS;
      WBS.taskObject = {};
      projectsObject[projectId].WBSObject[wbsId] = WBS;
    })
    timeEntryFormUserTasks.forEach(task => {
      const { projectId, wbsId, _id: taskId, resources } = task;
      const isTaskCompletedForTimeEntryUser = resources.find(resource => resource.userID === timeEntryUserId).completedTask;
      if (!isTaskCompletedForTimeEntryUser) {
        projectsObject[projectId].WBSObject[wbsId].taskObject[taskId] = task;
      }
    });

    for (const [projectId, project] of Object.entries(projectsObject)) {
      const { projectName, WBSObject } = project;
      options.push(
        <option value={projectId} key={projectId} >
          {projectName}
        </option>
      )
      for (const [wbsId, WBS] of Object.entries(WBSObject)) {
        const { wbsName, taskObject } = WBS;
        if (Object.keys(taskObject).length) {
          options.push(
            <option value={`${projectId}/${wbsId}`} key={`TimeEntryForm_${wbsId}`} disabled>
                {`\u2003WBS: ${wbsName}`}
            </option>
          )
          for (const [taskId, task] of Object.entries(taskObject)) {
            const { taskName } = task;
            options.push(
              <option value={`${projectId}/${wbsId}/${taskId}`} key={`TimeEntryForm_${taskId}`} >
                  {`\u2003\u2003 ↳ ${taskName}`}
              </option>
            )
          }
        }
      }
    };
    return options
  }

  /** 
   * Rectify: This will run whenever TimeEntryForm is opened, since time entry data does not bound to store states (e.g., userProfile, userProjects, userTasks..)
   * */
  const loadAsyncData = async (timeEntryUserId) => {
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

      const [userProfileRes, userProjectsRes, userWBSsRes, userTasksRes] = await Promise.all([profilePromise, projectPromise, wbsPromise, taskPromise]);
      setTimeEntryFormUserProfile(userProfileRes.data);
      setTimeEntryFormUserProjects(userProjectsRes.data);
      setTimeEntryFormUserWBSs(userWBSsRes.data);
      setTimeEntryFormUserTasks(userTasksRes.data);
      setIsAsyncDataLoaded(true);
    } catch (e) {
      console.log(e);
    }
  };

  /*---------------- useEffects -------------- */
  useEffect(() => {
    if (isAsyncDataLoaded) {
      const options = buildOptions();
      setProjectsAndTasksOptions(options);
    }
  }, [isAsyncDataLoaded])

  //grab form data before editing
  useEffect(() => {
    if (isOpen) {
      loadAsyncData(timeEntryUserId);
    } 
  }, [isOpen]);

  useEffect(() => {
    setFormValues({ ...formValues, ...data})
  }, [data])

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} data-testid="timeEntryFormModal">
        <ModalHeader toggle={toggle}>
          <div>
            {edit ? 'Edit ' : 'Add '}
            {formValues.isTangible ? (
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
                  value={formValues.dateOfWork}
                  onChange={handleInputChange}
                  disabled={from === 'Timer' || !canEditTimeEntry}
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
              <Label for="project">Project/Task</Label>
              <Input
                type="select"
                name="projectOrTask"
                id="projectOrTask"
                value={projectOrTaskId || "title"}
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
              <Label check>
                <Input
                  type="checkbox"
                  name="isTangible"
                  checked={formValues.isTangible}
                  onChange={handleInputChange}
                  disabled={!canEditTimeEntry}
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
          <Button color="primary" onClick={handleSubmit} style={boxStyle} disabled={submitting}>
            {
              edit 
                ? (submitting ? 'Saving...' : 'Save')
                : (submitting ? 'Submitting...' : 'Submit')
            }
          </Button>
        </ModalFooter>
      </Modal>
      <TangibleInfoModal
        visible={isTangibleInfoModalVisible}
        setVisible={setTangibleInfoModalVisibility}
      />
      <AboutModal visible={isAboutModalVisible} setVisible={setAboutModalVisible} />
      <ReminderModal
        inputs={formValues}
        data={data}
        edit={edit}
        reminder={reminder}
        visible={reminder.openModal}
        setVisible={toggleRemainder}
        cancelChange={cancelChange}
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
})

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
