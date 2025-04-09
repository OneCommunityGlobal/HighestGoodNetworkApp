/* eslint-disable react/require-default-props */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-param-reassign */
import { useState, useEffect } from 'react';
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
import { getUserProfile } from 'actions/userProfile';
import axios from 'axios';
import hasPermission from 'utils/permissions';
import { boxStyle, boxStyleDark } from 'styles';
import { postTimeEntry, editTimeEntry, getTimeEntriesForWeek } from '../../../actions/timeEntries';
import AboutModal from './AboutModal';
import TangibleInfoModal from './TangibleInfoModal';
import ReminderModal from './ReminderModal';
import TimeLogConfirmationModal from './TimeLogConfirmationModal';
import { ENDPOINTS } from '../../../utils/URL';
import '../../Header/DarkMode.css';

// Images are not allowed in timelog
const customImageUploadHandler = () =>
  new Promise((_, reject) => {
    // eslint-disable-next-line prefer-promise-reject-errors
    reject({ message: 'Pictures are not allowed here!', remove: true });
  });

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

function TimeEntryForm(props) {
  /* ---------------- variables -------------- */
  // props from parent
  const { from, sendStop, edit, data, toggle, isOpen, tab, darkMode } = props;
  // props from store
  const { authUser } = props;

  const viewingUser = JSON.parse(sessionStorage.getItem('viewingUser') ?? '{}');

  const initialFormValues = {
    dateOfWork: moment()
      .tz('America/Los_Angeles')
      .format('YYYY-MM-DD'),
    personId: viewingUser.userId ?? authUser.userid,
    projectId: '',
    wbsId: '',
    taskId: '',
    hours: 0,
    minutes: 0,
    notes: '',
    isTangible: from === 'Timer',
    entryType: 'default',
    ...data,
  };

  const TINY_MCE_INIT_OPTIONS = {
    license_key: 'gpl',
    menubar: false,
    placeholder: 'Description (10-word minimum) and reference link',
    plugins: 'advlist autolink autoresize lists link charmap table paste help wordcount',
    toolbar:
      // eslint-disable-next-line no-multi-str
      'bold italic underline link removeformat | bullist numlist outdent indent |\
                      styleselect fontsizeselect | table| strikethrough forecolor backcolor |\
                      subscript superscript charmap  | help',
    branding: false,
    toolbar_mode: 'sliding',
    min_height: 180,
    max_height: 300,
    autoresize_bottom_margin: 1,
    content_style: 'body { cursor: text !important; }',
    images_upload_handler: customImageUploadHandler,
    skin: darkMode ? 'oxide-dark' : 'oxide',
    content_css: darkMode ? 'dark' : 'default',
  };

  const timeEntryUserId = from === 'Timer' ? viewingUser.userId ?? authUser.userid : data.personId;

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
      (initialwbsId ? `/${initialwbsId}` : '') +
      (initialTaskId ? `/${initialTaskId}` : '')
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
  const [timeEntryFormUserTasks, setTimeEntryFormUserTasks] = useState([]);
  const [projectOrTaskId, setProjectOrTaskId] = useState(timeEntryInitialProjectOrTaskId);
  const [isAsyncDataLoaded, setIsAsyncDataLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [reminder, setReminder] = useState(initialReminder);
  const [isTangibleInfoModalVisible, setTangibleInfoModalVisibility] = useState(false);
  const [isAboutModalVisible, setAboutModalVisible] = useState(false);
  const [isTimelogConfirmationModalVisible, setTimelogConfirmationModalVisible] = useState(false);
  const [projectsAndTasksOptions, setProjectsAndTasksOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const isForAuthUser = timeEntryUserId === authUser.userid;
  const isSameDayTimeEntry =
    moment()
      .tz('America/Los_Angeles')
      .format('YYYY-MM-DD') === formValues.dateOfWork;
  const isSameDayAuthUserEdit = isForAuthUser && isSameDayTimeEntry;
  const canEditTimeEntryTime = props.hasPermission('editTimeEntryTime');
  const canEditTimeEntryDescription = props.hasPermission('editTimeEntryDescription');
  const canEditTimeEntryToggleTangible = isForAuthUser
    ? props.hasPermission('toggleTangibleTime')
    : props.hasPermission('editTimeEntryToggleTangible');
  const canEditTimeEntryDate = props.hasPermission('editTimeEntryDate');
  const canPutUserProfileImportantInfo = props.hasPermission('putUserProfileImportantInfo');

  // Administrator/Owner can add time entries for any dates, and other roles can only edit their own time entry in the same day.
  const canChangeTime =
    from !== 'Timer' && (from === 'TimeLog' || canEditTimeEntryTime || isSameDayAuthUserEdit);

  /* ---------------- methods -------------- */
  const toggleRemainder = () =>
    setReminder(r => ({
      ...r,
      openModal: !r.openModal,
    }));

  const cancelChange = () => {
    setReminder(initialReminder);
    setFormValues(fv => ({
      ...fv,
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
    const { name, value, checked } = event.target;

    const updateFormValues = (key, val) => {
      setFormValues(fv => ({ ...fv, [key]: val }));
    };

    if (name === 'hours' || name === 'minutes') {
      const numValue = +value;
      const isValid =
        name === 'hours' ? numValue >= 0 && numValue <= 40 : numValue >= 0 && numValue <= 59;
      if (isValid) {
        updateFormValues(name, numValue);
      }
    } else if (name === 'isTangible') {
      updateFormValues(name, checked);
    } else {
      updateFormValues(name, value);
    }
  };

  const handleProjectOrTaskChange = event => {
    const optionValue = event.target.value;
    const ids = optionValue.split('/');
    const [projectId, wbsId, taskId] = ids.length > 1 ? ids : [ids[0], null, null];
    setFormValues(fv => ({
      ...fv,
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
    setFormValues(fv => ({ ...fv, [editor.id]: content }));
    setReminder(r => ({
      ...r,
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
    if (from !== 'Timer' && from !== 'WeeklyTab' && !canChangeTime)
      errorObj.dateOfWork = 'Invalid date. Please refresh the page.';
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

  const submitTimeEntry = async () => {
    const { hours: formHours, minutes: formMinutes } = formValues;
    const timeEntry = { ...formValues };
    const isTimeModified = edit && (initialHours !== formHours || initialMinutes !== formMinutes);

    if (!validateForm(isTimeModified)) {
      setSubmitting(false);
      return;
    }

    const handleFormReset = () => {
      setFormValues(initialFormValues);
      setReminder(initialReminder);
      if (isOpen) toggle();
      setSubmitting(false);
    };

    const handleError = error => {
      toast.error(`An error occurred while attempting to submit your time entry. Error: ${error}`);
      setSubmitting(false);
    };

    const handlePostSubmitActions = async () => {
      switch (from) {
        case 'Timer':
          sendStop();
          clearForm();
          break;
        case 'TimeLog': {
          const date = moment(formValues.dateOfWork);
          const today = moment().tz('America/Los_Angeles');
          const offset = today.week() - date.week();
          props.getTimeEntriesForWeek(timeEntryUserId, Math.min(offset, 3));
          clearForm();
          break;
        }
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
        setReminder(r => ({
          ...r,
          editLimitNotification: !r.editLimitNotification,
        }));
      }
    };

    try {
      if (edit) {
        await props.editTimeEntry(data._id, timeEntry, initialDateOfWork);
      } else {
        await props.postTimeEntry(timeEntry);
      }

      await handlePostSubmitActions();
      handleFormReset();
    } catch (error) {
      handleError(error);
    }
  };

  const handleSubmit = async event => {
    if (event) {
      event.preventDefault();
    }
    setSubmitting(true);

    if (edit && isEqual(formValues, initialFormValues)) {
      toast.info(`Nothing is changed for this time entry`);
      setSubmitting(false);
      return;
    }

    if (!edit && !formValues.isTangible) {
      setTimelogConfirmationModalVisible(true);
      setSubmitting(false);
      return;
    }

    await submitTimeEntry();
  };

  const handleTangibleTimelogConfirm = async () => {
    setTimelogConfirmationModalVisible(false);
    await submitTimeEntry();
  };

  const handleTangibleTimelogCancel = () => {
    setTimelogConfirmationModalVisible(false);
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

    // Initialize default option
    const options = [
      <option value="defaultProject" key="defaultProject" disabled>
        Select Project/Task
      </option>,
    ];

    // Build projectsObject with WBS and tasks
    const buildProjectsObject = () => {
      timeEntryFormUserProjects.forEach(project => {
        const { projectId } = project;
        project.WBSObject = {};
        projectsObject[projectId] = project;
      });

      timeEntryFormUserTasks.forEach(task => {
        const { projectId, wbsId, _id: taskId, wbsName, projectName } = task;
        if (!projectsObject[projectId]) {
          projectsObject[projectId] = {
            projectName,
            WBSObject: {
              [wbsId]: {
                wbsName,
                taskObject: { [taskId]: task },
              },
            },
          };
        } else if (!projectsObject[projectId].WBSObject[wbsId]) {
          projectsObject[projectId].WBSObject[wbsId] = {
            wbsName,
            taskObject: { [taskId]: task },
          };
        } else {
          projectsObject[projectId].WBSObject[wbsId].taskObject[taskId] = task;
        }
      });
    };

    // Add options for tasks, WBS, and projects
    const buildOptionsFromProjects = () => {
      Object.entries(projectsObject).forEach(([projectId, project]) => {
        const { projectName, WBSObject } = project;

        // Add project option
        options.push(
          <option value={projectId} key={projectId}>
            {projectName}
          </option>,
        );

        Object.entries(WBSObject).forEach(([wbsId, WBS]) => {
          const { wbsName, taskObject } = WBS;

          // Add WBS option if it has tasks
          if (Object.keys(taskObject).length) {
            options.push(
              <option value={`${projectId}/${wbsId}`} key={`TimeEntryForm_${wbsId}`} disabled>
                {`\u2003WBS: ${wbsName}`}
              </option>,
            );

            Object.entries(taskObject).forEach(([taskId, task]) => {
              const { taskName } = task;

              // Add task option
              options.push(
                <option value={`${projectId}/${wbsId}/${taskId}`} key={`TimeEntryForm_${taskId}`}>
                  {`\u2003\u2003 ↳ ${taskName}`}
                </option>,
              );
            });
          }
        });
      });
    };

    // Build the projects object and options
    buildProjectsObject();
    buildOptionsFromProjects();

    return options;
  };

  /**
   * Rectify: This will run whenever TimeEntryForm is opened, since time entry data does not bound to store states (e.g., userProfile, userProjects, userTasks..)
   * */
  const loadAsyncData = async tuid => {
    setIsAsyncDataLoaded(false);
    try {
      const profileURL = ENDPOINTS.USER_PROFILE(tuid);
      const projectURL = ENDPOINTS.USER_PROJECTS(tuid);
      const taskURL = ENDPOINTS.TASKS_BY_USERID(tuid);

      const profilePromise = axios.get(profileURL);
      const projectPromise = axios.get(projectURL);
      const taskPromise = axios.get(taskURL);

      const [userProfileRes, userProjectsRes, userTasksRes] = await Promise.all([
        profilePromise,
        projectPromise,
        taskPromise,
      ]);
      setTimeEntryFormUserProfile(userProfileRes.data);
      setTimeEntryFormUserProjects(userProjectsRes.data);
      setTimeEntryFormUserTasks(userTasksRes.data);
      setIsAsyncDataLoaded(true);
    } catch (e) {
      toast.error('An error occurred while loading the form data. Please try again later.');
    }
  };

  /* ---------------- useEffects -------------- */
  useEffect(() => {
    if (isAsyncDataLoaded) {
      const options = buildOptions();
      setProjectsAndTasksOptions(options);
    }
  }, [isAsyncDataLoaded]);

  // grab form data before editing
  useEffect(() => {
    if (isOpen) {
      loadAsyncData(timeEntryUserId);
    }
  }, [isOpen, timeEntryUserId]);

  useEffect(() => {
    setFormValues({ ...formValues, ...data });
  }, [data]);

  const fontColor = darkMode ? 'text-light' : '';
  const headerBg = darkMode ? 'bg-space-cadet' : '';
  const bodyBg = darkMode ? 'bg-yinmn-blue' : '';

  return (
    <>
      <Modal
        className={darkMode ? `${fontColor} dark-mode` : ''}
        isOpen={isOpen}
        toggle={toggle}
        data-testid="timeEntryFormModal"
        style={darkMode ? boxStyleDark : {}}
      >
        <ModalHeader toggle={toggle} className={`${headerBg}`}>
          <div>
            {edit ? 'Edit ' : 'Add '}
            {formValues.isTangible ? (
              <span style={{ color: darkMode ? '#007BFF' : 'blue' }}>Tangible </span>
            ) : (
              <span style={{ color: 'orange' }}>Intangible </span>
            )}
            Time Entry
            {viewingUser.userId ? ` for ${viewingUser.firstName} ${viewingUser.lastName} ` : ' '}
            <i
              className="fa fa-info-circle"
              data-tip
              data-for="registerTip"
              aria-hidden="true"
              title="timeEntryTip"
              onClick={aboutModalToggle}
            />
            {!isAsyncDataLoaded && <span> Loading Data...</span>}
          </div>
          <ReactTooltip id="registerTip" place="bottom" effect="solid">
            Click this icon to learn about this time entry form
          </ReactTooltip>
        </ModalHeader>
        <ModalBody className={bodyBg}>
          <Form>
            <FormGroup>
              <Label for="dateOfWork" className={fontColor}>
                Date
              </Label>
              <Input
                type="date"
                name="dateOfWork"
                id="dateOfWork"
                value={formValues.dateOfWork}
                onChange={handleInputChange}
                // min={userProfile?.isFirstTimelog === true ? moment().toISOString().split('T')[0] : userProfile?.startDate.split('T')[0]}
                disabled={!canEditTimeEntryDate}
                className={
                  darkMode ? 'bg-darkmode-liblack text-light border-0 calendar-icon-dark' : ''
                }
              />
              {'dateOfWork' in errors && (
                <div className="text-danger">
                  <small>{errors.dateOfWork}</small>
                </div>
              )}
            </FormGroup>
            <FormGroup>
              <Label for="timeSpent" className={fontColor}>
                Time (HH:MM)
              </Label>
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
                    className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}
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
                    className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}
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
              <Label for="project" className={fontColor}>
                Project/Task
              </Label>
              <Input
                type="select"
                name="projectOrTask"
                id="projectOrTask"
                value={projectOrTaskId || 'title'}
                onChange={handleProjectOrTaskChange}
                className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}
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
              <Label for="notes" className={fontColor}>
                Notes
              </Label>
              <Editor
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                init={TINY_MCE_INIT_OPTIONS}
                id="notes"
                name="notes"
                className="form-control"
                value={formValues.notes}
                onEditorChange={handleEditorChange}
                disabled={!(isSameDayAuthUserEdit || canEditTimeEntryDescription)}
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
                  disabled={!canEditTimeEntryToggleTangible}
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
          <Button
            color="primary"
            onClick={handleSubmit}
            style={darkMode ? boxStyleDark : boxStyle}
            disabled={submitting}
          >
            {(() => {
              if (edit) {
                return submitting ? 'Saving...' : 'Save';
              }
              return submitting ? 'Submitting...' : 'Submit';
            })()}
          </Button>
        </ModalFooter>
      </Modal>
      <TangibleInfoModal
        visible={isTangibleInfoModalVisible}
        setVisible={setTangibleInfoModalVisibility}
        darkMode={darkMode}
      />
      <AboutModal
        visible={isAboutModalVisible}
        setVisible={setAboutModalVisible}
        darkMode={darkMode}
      />
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
      <TimeLogConfirmationModal
        isOpen={isTimelogConfirmationModalVisible}
        toggleModal={handleTangibleTimelogCancel}
        onConfirm={handleTangibleTimelogConfirm}
        onReject={handleTangibleTimelogCancel}
        onIntangible={handleTangibleTimelogConfirm}
        darkMode={darkMode}
      />
    </>
  );
}

TimeEntryForm.propTypes = {
  edit: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  data: PropTypes.any.isRequired,
  handleStop: PropTypes.func,
};

const mapStateToProps = state => ({
  authUser: state.auth.user,
  darkMode: state.theme.darkMode,
});

export default connect(mapStateToProps, {
  hasPermission,
  getUserProfile,
  editTimeEntry,
  postTimeEntry,
  getTimeEntriesForWeek,
})(TimeEntryForm);
