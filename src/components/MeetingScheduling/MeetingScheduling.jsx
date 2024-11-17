import { useState, useEffect } from 'react';
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
// import { toast } from 'react-toastify';

import { getAllUserProfile } from '../../actions/userManagement';
import { postMeeting } from '../../actions/meetings';
import Participants from './components/Participants';
import './MeetingScheduling.css';

const customImageUploadHandler = () =>
  new Promise((_, reject) => {
    // eslint-disable-next-line prefer-promise-reject-errors
    reject({ message: 'Pictures are not allowed here!', remove: true });
  });

const TINY_MCE_INIT_OPTIONS = {
  license_key: 'gpl',
  menubar: false,
  placeholder: 'Describe the details of the meeting',
  plugins: 'advlist autolink autoresize lists link charmap table paste help wordcount',
  toolbar:
    'bold italic underline link removeformat | bullist numlist outdent indent |\
                    styleselect fontsizeselect | table| strikethrough forecolor backcolor |\
                    subscript superscript charmap  | help',
  branding: false,
  min_height: 180,
  max_height: 300,
  autoresize_bottom_margin: 1,
  content_style: 'body { cursor: text !important; }',
  images_upload_handler: customImageUploadHandler,
};

const millisecondsForOneDay = 24 * 60 * 60 * 1000;

function MeetingScheduling(props) {
  const dispatch = useDispatch();

  // props from store
  const { authUser, allUserProfiles, darkMode } = props;

  const initialFormValues = {
    dateOfMeeting: moment()
      .tz('America/Los_Angeles')
      .format('YYYY-MM-DD'),
    startHour: '00',
    startMinute: '00',
    startTimePeriod: 'AM',
    duration: 0,
    participantList: [],
    location: '',
    notes: '',
    organizer: authUser.userid,
  };

  const [formValues, setFormValues] = useState(initialFormValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    props.getAllUserProfile();
  }, []);

  const handleInputChange = event => {
    event.persist();
    const { target } = event;

    switch (target.name) {
      case 'duration':
        setFormValues(prevValues => ({ ...prevValues, duration: +target.value }));
        break;
      default:
        setFormValues(prevValues => ({ ...prevValues, [target.name]: target.value }));
    }
  };

  const handleEditorChange = content => {
    setFormValues(prevValues => ({ ...prevValues, notes: content }));
  };

  const clearForm = () => {
    setFormValues(initialFormValues);
    setErrors({});
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});

    const meeting = {
      ...formValues,
      participantList: formValues.participantList.map(participant => participant.userProfileId),
    };

    const participantMessage = formValues.participantList
      .map(participant => participant.name)
      .join(', ');

    try {
      // currently only consider the create situation
      await dispatch(postMeeting(meeting));

      setModalTitle('Success!');
      setModalMessage(`
        You have scheduled a meeting with the following details:<br> 
        Participants: ${participantMessage}<br>
        Time: ${meeting.startHour}:${meeting.startMinute} ${meeting.startTimePeriod} on ${meeting.dateOfMeeting}<br>
        Duration: ${meeting.duration} minutes<br>
        ${meeting.location ? `Location: ${meeting.location}<br>` : ''}
        ${meeting.notes ? `Notes: ${meeting.notes}<br>` : ''}
      `);
      setFormValues(initialFormValues);
    } catch (err) {
      setModalTitle('Error');
      setModalMessage(`
        An error occurred while attempting to submit your meeting schedules. Error: ${err}`);
      const errorMessage = err?.message || 'An unknown error occurred';
      // const errorObject = err instanceof Error ? err : new Error(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setSubmitting(false);
      setModalOpen(true);
      // console.log("useState errors", errors);
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
    const newParticipantList = formValues.participantList.filter(user => user.userProfileId !== userProfileId);
    setFormValues(prevValues => ({ ...prevValues, participantList: newParticipantList }));
  };

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight: '100%' }}>
      <div className="meeting-scheduling-container">
        <div className="editor">
          <h3>Schedule a New Meeting</h3>
          <Form>
            <FormGroup>
              <Label for="dateOfMeeting">Date</Label>
              <Input
                type="date"
                name="dateOfMeeting"
                id="dateOfMeeting"
                value={formValues.dateOfMeeting}
                onChange={handleInputChange}
                min={new Date(Date.now() - millisecondsForOneDay).toISOString().split('T')[0]}
                // disabled={!canEditTimeEntryDate}
              />
              {'dateOfMeeting' in errors && (
                <div className="text-danger">
                  <small>{errors.dateOfMeeting}</small>
                </div>
              )}
            </FormGroup>

            <FormGroup>
              <Label for="startTimeOfMeeting">Start Time (HH:MM AM/PM)</Label>
              <Row form>
                <Col>
                  <Input
                    type="select"
                    name="startHour"
                    id="startHour"
                    value={formValues.startHour}
                    onChange={handleInputChange}
                  >
                    {[...Array(13).keys()].map(hour => (
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
                    value={formValues.startMinute}
                    onChange={handleInputChange}
                  >
                    {['00', '15', '30', '45'].map(minute => (
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
                    value={formValues.startTimePeriod}
                    onChange={handleInputChange}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </Input>
                </Col>
              </Row>
              {'time' in errors && (
                <div className="text-danger">
                  <small>{errors.time}</small>
                </div>
              )}
            </FormGroup>

            <FormGroup>
              <Label for="duration">Duration</Label>
              <Input
                type="select"
                name="duration"
                id="duration"
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
              <Participants
                authUserId={authUser.userid}
                userProfiles={allUserProfiles.filter(user => user.isActive)}
                participantList={formValues.participantList}
                addParticipant={addParticipant}
                removeParticipant={removeParticipant}
              />
            </FormGroup>

            <FormGroup>
              <Label for="location">Location</Label>
              <div style={{ paddingLeft: '20px' }}>
                <Input
                  type="radio"
                  name="location"
                  id="locationZoom"
                  value="Zoom"
                  checked={formValues.location === 'Zoom'}
                  onChange={handleInputChange}
                />
                <Label for="locationZoom" style={{ marginLeft: '5px' }}>Zoom</Label>
              </div>
              <div style={{ paddingLeft: '20px' }}>
                <Input
                  type="radio"
                  name="location"
                  id="locationPhone"
                  value="Phone call"
                  checked={formValues.location === 'Phone call'}
                  onChange={handleInputChange}
                />
                <Label for="locationPhone" style={{ marginLeft: '5px' }}>Phone call</Label>
              </div>
              <div style={{ paddingLeft: '20px' }}>
                <Input
                  type="radio"
                  name="location"
                  id="locationOnSite"
                  value="On-site"
                  checked={formValues.location === 'On-site'}
                  onChange={handleInputChange}
                />
                <Label for="locationOnSite" style={{ marginLeft: '5px' }}>On-site</Label>
              </div>
              {'location' in errors && (
                <div className="text-danger">
                  <small>{errors.location}</small>
                </div>
              )}
            </FormGroup>

            <FormGroup>
              <Label for="notes">Notes</Label>
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
          </Form>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              onClick={clearForm}
              color="primary"
              // style={darkMode ? boxStyleDark : boxStyle}
            >
              Clear Form
            </Button>
            <Button
              color="primary"
              onClick={handleSubmit}
              // style={darkMode ? boxStyleDark : boxStyle}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
          <Modal isOpen={modalOpen} toggle={toggleModal}>
            <ModalHeader toggle={toggleModal}>{modalTitle}</ModalHeader>
            <ModalBody>
              <div style={{ lineHeight: '2' }} dangerouslySetInnerHTML={{ __html: modalMessage }}/>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={toggleModal}>
                Close
              </Button>
            </ModalFooter>
          </Modal>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = state => ({
  authUser: state.auth.user,
  allUserProfiles: state.allUserProfiles.userProfiles,
  error: state.tasks.error,
  darkMode: state.theme.darkMode,
});

const mapDispatchToProps = dispatch => ({
  getAllUserProfile: () => dispatch(getAllUserProfile()),
});

export default connect(mapStateToProps, mapDispatchToProps)(MeetingScheduling);
