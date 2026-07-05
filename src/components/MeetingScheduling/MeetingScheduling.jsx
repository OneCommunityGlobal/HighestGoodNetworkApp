import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, connect } from 'react-redux';
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
import { Editor } from '@tinymce/tinymce-react';
import moment from 'moment-timezone';
import { boxStyle, boxStyleDark } from '../../styles';
import { getAllUserProfile } from '../../actions/userManagement';
import { postMeeting } from '../../actions/meetings';
import Participants from './components/Participants';
import TimeZoneDropDown from '../UserProfile/TimeZoneDropDown/TimeZoneDropDown';
import {
  buildMeetingMoment,
  formatMeetingDateTimeShort,
  getParticipantLocalTime,
  hasValidMeetingSchedule,
  resolveUserTimeZone,
  stripHtmlToPlainText,
} from '../../utils/meetingTime';
import '../../App.module.css';
import styles from './MeetingScheduling.module.css';
import { useHistory } from 'react-router-dom';

const customImageUploadHandler = () => {
  const uploadError = new Error('Pictures are not allowed here!');
  uploadError.remove = true;
  return Promise.reject(uploadError);
};

function MeetingModalHeader({ children, onClose }) {
  return (
    <div className={styles.customHeader}>
      <h5 className={styles.customHeaderTitle}>{children}</h5>
      <button
        type="button"
        className={styles.customHeaderClose}
        onClick={onClose}
        aria-label="Close"
      >
        <span aria-hidden="true">&#215;</span>
      </button>
    </div>
  );
}

MeetingModalHeader.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

const TINY_MCE_INIT_OPTIONS = {
  license_key: 'gpl',
  menubar: false,
  placeholder: 'Describe the details of the meeting',
  plugins: 'advlist autolink autoresize lists link charmap table paste help wordcount',
  toolbar: [
    'bold italic underline link removeformat',
    'bullist numlist outdent indent',
    'styleselect fontsizeselect',
    'table',
    'strikethrough forecolor backcolor',
    'subscript superscript charmap',
    'help',
  ].join(' | '),
  branding: false,
  min_height: 180,
  max_height: 300,
  autoresize_bottom_margin: 1,
  content_style: 'body { cursor: text !important; }',
  images_upload_handler: customImageUploadHandler,
};

const LOCATION_TYPES_REQUIRING_DETAILS = ['Zoom', 'Phone call', 'On-site'];
const HOUR_OPTIONS = Array.from({ length: 13 }, (_, hour) => hour);
const MINUTE_OPTIONS = ['00', '15', '30', '45'];

const getMeetingPageClassName = darkMode =>
  darkMode ? `${styles.page} ${styles.pageDark} bg-oxford-blue text-light` : styles.page;

const validateMeetingForm = (formValues, notesPlainText) => {
  const validationErrors = {};

  if (!formValues.dateOfMeeting) {
    validationErrors.dateOfMeeting = 'Date is required.';
  }
  if (!formValues.startHour || !formValues.startMinute || !formValues.startTimePeriod) {
    validationErrors.time = 'Start time is required.';
  }
  if (!formValues.timeZone) {
    validationErrors.timeZone = 'Time zone is required.';
  }
  if (!formValues.duration) {
    validationErrors.duration = 'Duration is required.';
  }
  if (formValues.participantList.length === 0) {
    validationErrors.participantList = 'At least one participant is required.';
  }
  if (!formValues.location) {
    validationErrors.location = 'Location is required.';
  }
  if (
    LOCATION_TYPES_REQUIRING_DETAILS.includes(formValues.location) &&
    !formValues.locationDetails
  ) {
    validationErrors.locationDetails = 'Location details are required.';
  }
  if (!notesPlainText) {
    validationErrors.notes = 'Notes are required.';
  }

  const meetingMoment = buildMeetingMoment(formValues);
  if (!meetingMoment.isValid()) {
    validationErrors.time = 'Please enter a valid meeting date and time.';
  }

  return validationErrors;
};

const buildMeetingPayload = (formValues, notesHtml, allUserProfiles) => {
  const notesPlainText = stripHtmlToPlainText(notesHtml);
  const validationErrors = validateMeetingForm(formValues, notesPlainText);

  if (Object.keys(validationErrors).length > 0) {
    return { validationErrors };
  }

  const meetingMoment = buildMeetingMoment(formValues);
  const meeting = {
    ...formValues,
    notes: notesHtml,
    dateTime: meetingMoment.toISOString(),
    participantList: formValues.participantList.map(participant => participant.userProfileId),
  };

  const participantSummaries = formValues.participantList.map(participant => {
    const profile = allUserProfiles.find(user => user._id === participant.userProfileId);
    const localTime = getParticipantLocalTime(formValues, profile?.timeZone);
    return `${participant.name}: ${localTime || 'time unavailable'}`;
  });

  const participantNames = formValues.participantList
    .map(participant => participant.name)
    .join(', ');

  return {
    meeting,
    confirmationDetails: {
      participants: participantNames,
      organizerTime: formatMeetingDateTimeShort(meeting.dateTime, formValues.timeZone),
      participantTimes: participantSummaries,
      duration: `${meeting.duration} minutes`,
      location: meeting.location,
      locationDetails: meeting.locationDetails,
      notes: meeting.notes,
    },
  };
};

const getNotesPlainText = stripHtmlToPlainText;

const getFormControlClassName = darkMode =>
  darkMode ? 'bg-darkmode-liblack text-light border-0 calendar-icon-dark' : '';

const millisecondsForOneDay = 24 * 60 * 60 * 1000;

const createInitialFormValues = (authUser, userProfile) => {
  const timeZone = resolveUserTimeZone(userProfile?.timeZone);
  return {
    dateOfMeeting: moment()
      .tz(timeZone)
      .format('YYYY-MM-DD'),
    startHour: '00',
    startMinute: '00',
    startTimePeriod: 'AM',
    duration: 0,
    participantList: [],
    location: '',
    locationDetails: '',
    notes: '',
    timeZone,
    organizer: authUser?.userid,
  };
};

function MeetingScheduling(props) {
  const dispatch = useDispatch();
  const { authUser, allUserProfiles, darkMode, userProfile } = props;

  const [formValues, setFormValues] = useState(() =>
    createInitialFormValues(authUser, userProfile),
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingMeetingDetails, setPendingMeetingDetails] = useState(null);
  const [modalMessage, setModalMessage] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const history = useHistory();
  const pageRef = useRef(null);

  useEffect(() => {
    props.getAllUserProfile();
  }, []);

  useEffect(() => {
    const headerEl = document.querySelector('[data-testid="header"]');
    const pageEl = pageRef.current;
    if (!headerEl || !pageEl) return undefined;

    const syncPageScrollArea = () => {
      const headerHeight = headerEl.getBoundingClientRect().height;
      pageEl.style.setProperty('--meeting-page-header-offset', `${Math.ceil(headerHeight)}px`);
    };

    syncPageScrollArea();
    window.addEventListener('resize', syncPageScrollArea);

    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(syncPageScrollArea);
    if (resizeObserver) {
      resizeObserver.observe(headerEl);
    }

    return () => {
      window.removeEventListener('resize', syncPageScrollArea);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (userProfile?.timeZone) {
      setFormValues(prevValues => ({
        ...prevValues,
        timeZone: resolveUserTimeZone(userProfile.timeZone),
      }));
    }
  }, [userProfile?.timeZone]);

  const organizerMeetingTime = useMemo(() => {
    if (!hasValidMeetingSchedule(formValues)) return null;
    return formatMeetingDateTimeShort(
      buildMeetingMoment(formValues).toISOString(),
      formValues.timeZone,
    );
  }, [formValues]);

  // Notes live in refs so typing does not re-render the page and reset TinyMCE cursor.
  const lastNotesRef = useRef('');
  const notesSeedRef = useRef('');
  const [editorInstanceKey, setEditorInstanceKey] = useState(0);
  const prevDarkModeRef = useRef(darkMode);

  useEffect(() => {
    if (prevDarkModeRef.current !== darkMode) {
      notesSeedRef.current = lastNotesRef.current;
      setEditorInstanceKey(key => key + 1);
      prevDarkModeRef.current = darkMode;
    }
  }, [darkMode]);

  const tinymceInitOptions = useMemo(
    () => ({
      ...TINY_MCE_INIT_OPTIONS,
      ...(darkMode
        ? {
            skin: 'oxide-dark',
            content_css: 'dark',
            content_style:
              'body { cursor: text !important; background-color: #1c1c1c; color: #f8f9fa; } ' +
              '.mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before { color: #6c757d !important; }',
          }
        : {
            content_style:
              'body { cursor: text !important; } ' +
              '.mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before { color: #6c757d !important; }',
          }),
    }),
    [darkMode],
  );

  const formControlClassName = getFormControlClassName(darkMode);

  const handleInputChange = event => {
    const { target } = event;

    if (target.name === 'duration') {
      setFormValues(prevValues => ({ ...prevValues, duration: +target.value }));
      return;
    }

    setFormValues(prevValues => ({ ...prevValues, [target.name]: target.value }));
  };

  const handleTimeZoneChange = event => {
    setFormValues(prevValues => ({ ...prevValues, timeZone: event.target.value }));
  };

  const handleEditorChange = content => {
    lastNotesRef.current = content;
  };

  const resetForm = useCallback(() => {
    lastNotesRef.current = '';
    notesSeedRef.current = '';
    setFormValues(createInitialFormValues(authUser, userProfile));
    setErrors({});
    setEditorInstanceKey(key => key + 1);
  }, [authUser, userProfile]);

  const buildMeetingPayloadForSubmit = () =>
    buildMeetingPayload(formValues, lastNotesRef.current, allUserProfiles);

  const handleSubmit = async event => {
    event.preventDefault();
    setErrors({});

    const payload = buildMeetingPayloadForSubmit();
    if (payload.validationErrors) {
      setErrors(payload.validationErrors);
      return;
    }

    setPendingMeetingDetails(payload);
    setConfirmModalOpen(true);
  };

  const confirmScheduleMeeting = async () => {
    if (!pendingMeetingDetails) return;

    setSubmitting(true);
    setErrors({});

    try {
      await dispatch(postMeeting(pendingMeetingDetails.meeting));
      setModalTitle('Success!');
      setIsSuccessModal(true);
      setModalMessage(pendingMeetingDetails.confirmationDetails);
      resetForm();
      setConfirmModalOpen(false);
      setPendingMeetingDetails(null);
      setModalOpen(true);
    } catch (err) {
      setModalTitle('Error');
      setIsSuccessModal(false);
      setModalMessage(err?.message || 'An unknown error occurred while scheduling the meeting.');
      setErrors({ general: err?.message || 'An unknown error occurred' });
      setConfirmModalOpen(false);
      setPendingMeetingDetails(null);
      setModalOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const addParticipant = (userProfileId, firstName, lastName) => {
    const newParticipantList = [
      {
        userProfileId,
        name: `${firstName} ${lastName}`,
      },
      ...formValues.participantList,
    ];
    setFormValues(prevValues => ({ ...prevValues, participantList: newParticipantList }));
  };

  const removeParticipant = userProfileId => {
    const newParticipantList = formValues.participantList.filter(
      user => user.userProfileId !== userProfileId,
    );
    setFormValues(prevValues => ({ ...prevValues, participantList: newParticipantList }));
  };

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    history.push('/dashboard');
  };

  const meetingModalClass = darkMode
    ? 'meeting-scheduling-modal meeting-scheduling-modal--dark'
    : 'meeting-scheduling-modal';
  const meetingModalContentClass = darkMode ? 'meeting-scheduling-modal-panel--dark' : '';
  const meetingModalSectionClass = darkMode ? 'bg-yinmn-blue text-white border-0' : '';

  const renderModalHeader = (title, onClose) =>
    darkMode ? (
      <MeetingModalHeader onClose={onClose}>{title}</MeetingModalHeader>
    ) : (
      <ModalHeader toggle={onClose}>{title}</ModalHeader>
    );

  const renderMeetingSummary = (details, introText) => (
    <div className="meeting-scheduling-modal-content">
      <p className="meeting-modal-intro">{introText}</p>
      <p>
        <strong>{details.participants}</strong>
      </p>
      <p>Your time: {details.organizerTime}</p>
      {details.participantTimes?.length > 0 && (
        <div>
          <p>Participant local times:</p>
          <ul>
            {details.participantTimes.map(entry => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        </div>
      )}
      <p>Duration: {details.duration}</p>
      {details.location && <p>Location: {details.location}</p>}
      {details.locationDetails && <p>Location Details: {details.locationDetails}</p>}
      {details.notes && <p>Notes: {getNotesPlainText(details.notes)}</p>}
    </div>
  );

  return (
    <div ref={pageRef} className={getMeetingPageClassName(darkMode)}>
      <div className="meeting-scheduling-container">
        <div className="meeting-scheduling-form-card">
          <h3 className="meeting-scheduling-title">Schedule a New Meeting</h3>
          <div className="meeting-scheduling-info-box">
            <strong>What happens when you schedule:</strong>
            <ul>
              <li>
                Each selected participant receives an in-app meeting notification when they log in.
              </li>
              <li>
                If the meeting is within the next <strong>3 days</strong>, their bell icon will show
                an alert, a reminder bar appears at the top, and they can add the meeting to their
                calendar.
              </li>
              <li>
                Notifications reset after the participant views and dismisses them. A new unread
                meeting will trigger the bell again.
              </li>
            </ul>
            <small className="meeting-helper-text">
              Choose the meeting time in your selected time zone. Participants see reminders in
              their own time zone.
            </small>
          </div>
          <Form className="meeting-scheduling-form">
            <FormGroup>
              <Label for="dateOfMeeting" className={darkMode ? 'text-light' : ''}>
                Date
              </Label>
              <Input
                type="date"
                name="dateOfMeeting"
                id="dateOfMeeting"
                className={formControlClassName}
                value={formValues.dateOfMeeting}
                onChange={handleInputChange}
                onClick={e => {
                  try {
                    e.target.showPicker();
                  } catch {
                    /* unsupported browser */
                  }
                }}
                min={new Date(Date.now() - millisecondsForOneDay).toISOString().split('T')[0]}
                style={{ cursor: 'pointer' }}
              />
              {'dateOfMeeting' in errors && (
                <div className="text-danger">
                  <small>{errors.dateOfMeeting}</small>
                </div>
              )}
            </FormGroup>

            <FormGroup>
              <Label for="meetingTimeZone" className={darkMode ? 'text-light' : ''}>
                Meeting Time Zone
              </Label>
              <TimeZoneDropDown
                id="meetingTimeZone"
                name="timeZone"
                selected={formValues.timeZone}
                onChange={handleTimeZoneChange}
              />
              <small className="meeting-helper-text">
                The date and start time below are interpreted in this time zone.
              </small>
              {'timeZone' in errors && (
                <div className="text-danger">
                  <small>{errors.timeZone}</small>
                </div>
              )}
            </FormGroup>

            <FormGroup>
              <Label for="startTimeOfMeeting" className={darkMode ? 'text-light' : ''}>
                Start Time (HH:MM AM/PM)
              </Label>
              <Row form className="meeting-time-row">
                <Col>
                  <Input
                    type="select"
                    name="startHour"
                    id="startHour"
                    className={formControlClassName}
                    value={formValues.startHour}
                    onChange={handleInputChange}
                  >
                    {HOUR_OPTIONS.map(hour => (
                      <option key={hour} value={hour.toString().padStart(2, '0')}>
                        {hour.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </Input>
                </Col>
                <Col>
                  <Input
                    type="select"
                    name="startMinute"
                    id="startMinute"
                    className={formControlClassName}
                    value={formValues.startMinute}
                    onChange={handleInputChange}
                  >
                    {MINUTE_OPTIONS.map(minute => (
                      <option key={minute} value={minute}>
                        {minute}
                      </option>
                    ))}
                  </Input>
                </Col>
                <Col>
                  <Input
                    type="select"
                    name="startTimePeriod"
                    id="startTimePeriod"
                    className={formControlClassName}
                    value={formValues.startTimePeriod}
                    onChange={handleInputChange}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </Input>
                </Col>
              </Row>
              {organizerMeetingTime && (
                <small className="meeting-helper-text">
                  Your selected time: {organizerMeetingTime}
                </small>
              )}
              {'time' in errors && (
                <div className="text-danger">
                  <small>{errors.time}</small>
                </div>
              )}
            </FormGroup>

            <FormGroup>
              <Label for="duration" className={darkMode ? 'text-light' : ''}>
                Duration
              </Label>
              <Input
                type="select"
                name="duration"
                id="duration"
                className={formControlClassName}
                value={formValues.duration}
                onChange={handleInputChange}
              >
                <option value="">Select Duration</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={180}>3 hours</option>
              </Input>
              {'duration' in errors && (
                <div className="text-danger">
                  <small>{errors.duration}</small>
                </div>
              )}
            </FormGroup>

            <FormGroup>
              <Label for="participants" className={darkMode ? 'text-light' : ''}>
                Participants
              </Label>
              <Participants
                authUserId={authUser.userid}
                userProfiles={allUserProfiles.filter(user => user.isActive)}
                participantList={formValues.participantList}
                addParticipant={addParticipant}
                removeParticipant={removeParticipant}
                darkMode={darkMode}
                formValues={formValues}
              />
              {'participantList' in errors && (
                <div className="text-danger">
                  <small>{errors.participantList}</small>
                </div>
              )}
            </FormGroup>

            <FormGroup>
              <Label for="locationZoom" className={darkMode ? 'text-light' : ''}>
                Location
              </Label>
              <div className="meeting-location-options">
                {[
                  { id: 'locationZoom', value: 'Zoom', label: 'Zoom' },
                  { id: 'locationPhone', value: 'Phone call', label: 'Phone call' },
                  { id: 'locationOnSite', value: 'On-site', label: 'On-site' },
                ].map(option => (
                  <div key={option.id} className="meeting-location-group">
                    <label
                      htmlFor={option.id}
                      className={`meeting-location-option${darkMode ? ' text-light' : ''}`}
                    >
                      <input
                        type="radio"
                        className="meeting-location-radio"
                        name="location"
                        id={option.id}
                        value={option.value}
                        checked={formValues.location === option.value}
                        onChange={handleInputChange}
                      />
                      <span className="meeting-location-label">{option.label}</span>
                    </label>
                    {formValues.location === option.value && (
                      <div className="meeting-location-details">
                        <Label
                          for={`locationDetails${option.id}`}
                          className={darkMode ? 'text-light' : ''}
                        >
                          Location Details
                        </Label>
                        <Input
                          type="text"
                          name="locationDetails"
                          id={`locationDetails${option.id}`}
                          className={formControlClassName}
                          value={formValues.locationDetails || ''}
                          onChange={handleInputChange}
                          placeholder="Enter location details"
                        />
                        {'locationDetails' in errors && (
                          <div className="text-danger">
                            <small>{errors.locationDetails}</small>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {'location' in errors && (
                <div className="text-danger">
                  <small>{errors.location}</small>
                </div>
              )}
            </FormGroup>

            <FormGroup>
              <Label for="notes" className={darkMode ? 'text-light' : ''}>
                Notes
              </Label>
              <div className="meeting-notes-editor">
                <Editor
                  key={editorInstanceKey}
                  tinymceScriptSrc="/tinymce/tinymce.min.js"
                  init={tinymceInitOptions}
                  id="notes"
                  name="notes"
                  initialValue={notesSeedRef.current}
                  onEditorChange={handleEditorChange}
                />
              </div>

              {'notes' in errors && (
                <div className="text-danger">
                  <small>{errors.notes}</small>
                </div>
              )}
            </FormGroup>
          </Form>
          {'general' in errors && (
            <div className="text-danger mb-2">
              <small>{errors.general}</small>
            </div>
          )}
          <div className="meeting-form-actions">
            <Button onClick={resetForm} color="primary" style={darkMode ? boxStyleDark : boxStyle}>
              Clear Form
            </Button>
            <Button
              color="primary"
              onClick={handleSubmit}
              style={darkMode ? boxStyleDark : boxStyle}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
          <Modal
            isOpen={confirmModalOpen}
            toggle={() => setConfirmModalOpen(false)}
            className={meetingModalClass}
            contentClassName={meetingModalContentClass}
          >
            {renderModalHeader('Confirm Meeting Schedule', () => setConfirmModalOpen(false))}
            <ModalBody className={meetingModalSectionClass}>
              {pendingMeetingDetails?.confirmationDetails && (
                <>
                  {renderMeetingSummary(
                    pendingMeetingDetails.confirmationDetails,
                    'You are about to schedule a meeting with:',
                  )}
                  <div className="meeting-scheduling-modal-content meeting-modal-notify-block">
                    <p>
                      <strong>Who gets notified:</strong>{' '}
                      {pendingMeetingDetails.confirmationDetails.participants}
                    </p>
                    <p>
                      Each listed participant will receive an in-app notification and calendar
                      options when they log in. If the meeting is within 3 days, their bell icon
                      will alert them until they view and dismiss the reminder.
                    </p>
                  </div>
                </>
              )}
            </ModalBody>
            <ModalFooter className={meetingModalSectionClass}>
              <Button
                color="secondary"
                onClick={() => setConfirmModalOpen(false)}
                style={darkMode ? boxStyleDark : boxStyle}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onClick={confirmScheduleMeeting}
                style={darkMode ? boxStyleDark : boxStyle}
                disabled={submitting}
              >
                {submitting ? 'Scheduling...' : 'Confirm & Schedule'}
              </Button>
            </ModalFooter>
          </Modal>
          <Modal
            isOpen={modalOpen}
            toggle={toggleModal}
            className={meetingModalClass}
            contentClassName={meetingModalContentClass}
          >
            {renderModalHeader(modalTitle, toggleModal)}
            <ModalBody className={meetingModalSectionClass}>
              {isSuccessModal && modalMessage ? (
                <>
                  {renderMeetingSummary(
                    modalMessage,
                    'You have scheduled a meeting with the following details:',
                  )}
                  <div className="meeting-scheduling-modal-content meeting-modal-notify-block">
                    <p>
                      Meeting scheduled successfully. Calendar options and in-app notifications have
                      been prepared for: <strong>{modalMessage.participants}</strong>.
                    </p>
                    <p>
                      Recipients will see a bell alert, reminder bar, and calendar download links
                      when they log in if the meeting is within the next 3 days. The alert resets
                      after they view it, and will appear again for any new upcoming meeting.
                    </p>
                  </div>
                </>
              ) : (
                <div className="meeting-scheduling-modal-content">
                  <p>{modalMessage}</p>
                </div>
              )}
            </ModalBody>
            <ModalFooter className={meetingModalSectionClass}>
              <Button
                color="primary"
                onClick={isSuccessModal ? toggleModal : () => setModalOpen(false)}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Close
              </Button>
            </ModalFooter>
          </Modal>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  authUser: state.auth.user,
  userProfile: state.userProfile,
  allUserProfiles: state.allUserProfiles.userProfiles,
  error: state.tasks.error,
  darkMode: state.theme.darkMode,
});

const mapDispatchToProps = dispatch => ({
  getAllUserProfile: () => dispatch(getAllUserProfile()),
});

MeetingScheduling.propTypes = {
  authUser: PropTypes.shape({
    userid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  userProfile: PropTypes.shape({
    timeZone: PropTypes.string,
  }),
  allUserProfiles: PropTypes.arrayOf(PropTypes.object),
  darkMode: PropTypes.bool,
  getAllUserProfile: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(MeetingScheduling);
