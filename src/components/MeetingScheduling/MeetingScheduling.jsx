import { useState, useEffect } from 'react';
import { useDispatch, connect } from 'react-redux';
import { Form, FormGroup, Label, Input, Row, Col, Button } from 'reactstrap';
import { Editor } from '@tinymce/tinymce-react';
import moment from 'moment-timezone';
import { toast } from 'react-toastify';

import { getAllUserProfile } from '../../actions/userManagement';
import { postMeeting } from '../../actions/meetings';
import Participants from './components/Participants';

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
  const { authUser, allUserProfiles, error, darkMode } = props;

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

  // console.log('IMPORTANT! authUser', authUser);

  const [formValues, setFormValues] = useState(initialFormValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    props.getAllUserProfile();
    // setFormValues(prevValues => ({ ...prevValues, organizer: authUser.userid }));
  }, []);

  const handleInputChange = event => {
    event.persist();
    const { target } = event;
    // if (target.name === 'notes') {
    //   console.log(target.value, typeof target.value);
    // }
    switch (target.name) {
      // case 'startHour':
      //   if (+target.value < 0 || +target.value > 12) return;
      //   setFormValues(prevValues => ({ ...prevValues, startHour: target.value.padStart(2, '0') }));
      //   break;
      // case 'startMinute':
      //   if (+target.value < 0 || +target.value > 59) return;
      //   setFormValues(prevValues => ({ ...prevValues, startMinute: target.value.padStart(2, '0') }));
      //   break;
      case 'duration':
        setFormValues(prevValues => ({ ...prevValues, duration: +target.value }));
        break;
      default:
        setFormValues(prevValues => ({ ...prevValues, [target.name]: target.value }));
    }
  };

  const handleEditorChange = content => {
    // console.log(content, typeof content);
    setFormValues(prevValues => ({ ...prevValues, notes: content }));
  };

  const clearForm = () => {
    setFormValues(initialFormValues);
    // setReminder({ ...initialReminder });
    setErrors({});
  };

  // check TimeEntryForm.jsx handleSubmit
  const handleSubmit = async event => {
    event.preventDefault();
    setSubmitting(true);

    // TimeEntryForm has code for editing situation code here

    // now suppose that the time needs to be created or updated

    const meeting = {
      ...formValues,
      participantList: formValues.participantList.map(participant => participant.userProfileId),
    };
    // const notifications = meeting.participantList.map(participant => ({
    //   message: `You have a new meeting scheduled on
    //             ${meeting.dateOfMeeting} ${meeting.startHour} ${meeting.startMinute} for ${meeting.duration}/n
    //             with . Notes: ${meeting.notes}`,
    //   sender: null,
    //   recipient: participant,
    //   isSystemGenerated: false,
    //   isRead: false,
    // }));
    console.log('Submit', meeting);

    try {
      // currently only consider the create situation
      await dispatch(postMeeting(meeting));
      
      setFormValues(initialFormValues);
      setSubmitting(false);
    } catch (error) {
      toast.error(`An error occurred while attempting to submit your meeting schedules. Error: ${error}`);
      setSubmitting(false);
    }
  }

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

  return (
    <div>
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
                // disabled={!canChangeTime}
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
                // disabled={!canChangeTime}
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
            // disabled={!(isSameDayAuthUserEdit || canEditTimeEntryDescription)}
          />

          {'notes' in errors && (
            <div className="text-danger">
              <small>{errors.notes}</small>
            </div>
          )}
        </FormGroup>
      </Form>
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
