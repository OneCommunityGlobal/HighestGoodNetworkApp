import { useEffect, useState } from 'react';
import { useDispatch, connect, useSelector } from 'react-redux';
import MemberAutoComplete from '~/components/Teams/MembersAutoComplete';
import AddProjectsAutoComplete from '~/components/UserProfile/TeamsAndProjects/AddProjectsAutoComplete';
import AddTeamsAutoComplete from '~/components/UserProfile/TeamsAndProjects/AddTeamsAutoComplete';
import "../reportsPage.css";
import { Editor } from '@tinymce/tinymce-react';
import moment from 'moment-timezone';
import { Button, Col, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import { getFontColor, getBoxStyling } from '~/styles';
import '../../Header/DarkMode.css'
import { isEmpty, isEqual } from 'lodash';
import { getUserProfile } from '~/actions/userProfile';
import { postTimeEntry } from '~/actions/timeEntries';

function AddLostTime(props) {

  const darkMode = useSelector((state) => state.theme.darkMode);
  const fontColor = getFontColor(darkMode);
  const boxStyling = getBoxStyling(darkMode);

  const initialForm = {
    projectId: undefined,
    personId: undefined,
    teamId: undefined,
    dateOfWork: moment()
      .tz('America/Los_Angeles')
      .format('YYYY-MM-DD'),
    hours: 0,
    minutes: 0,
    notes: '',
    isTangible: true,
  };

  const TINY_MCE_INIT_OPTIONS = {
    license_key: 'gpl',
    menubar: false,
    placeholder: '',
    plugins:
      'advlist autolink autoresize lists link charmap table help wordcount',
    toolbar: `bold italic underline link removeformat | bullist numlist outdent indent |
                      styleselect fontsizeselect | table| strikethrough forecolor backcolor |
                      subscript superscript charmap  | help`,
    branding: false,
    min_height: 180,
    max_height: 300,
    autoresize_bottom_margin: 1,
    content_style: 'body { cursor: text !important; }',
    skin: darkMode ? 'oxide-dark' : 'oxide',
    content_css: darkMode ? 'dark' : 'default',
  };

  const dispatch = useDispatch();

  const [entryType, setEntryType] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [inputs, setInputs] = useState(initialForm);
  
  const [selectedTeam, setSelectTeam] = useState(undefined);
  const [selectedProject, setSelectProject] = useState(undefined);
  const [searchText, setSearchText] = useState('');
  const [searchTeamText, setSearchTeamText] = useState('');
  const [newTeamName, setNewTeamName] = useState('');

  const [errors, setErrors] = useState({});

  // const { darkMode } = props

  // const fontColor = darkMode ? 'text-light' : '';
  // const headerBg = darkMode ? 'bg-space-cadet' : '';
  // const bodyBg = darkMode ? 'bg-yinmn-blue' : '';

  const resetForm = () => {
    setInputs(initialForm);
    setEntryType('');
    setSearchText('');
    setSearchTeamText('');
    setErrors({});
  }

  useEffect(() => {
    if (inputs.personId && props.userProfile._id !== inputs.personId) {
      props.getUserProfile(inputs.personId);
    }
  });

  useEffect(() => {
    if (!props.isOpen && entryType !== '') {
      resetForm();
    }
  });

  const selectProject = project => {
    setInputs(prevInputs => ({
      ...prevInputs,
      projectId: project._id,
      personId: undefined,
      teamId: undefined,
    }));
    setSelectProject(project);
  };

  const selectUser = person => {
    if(person){
      setInputs(prevInputs => ({
        ...prevInputs,
        projectId: undefined,
        personId: person._id,
        teamId: undefined,
      }));
    }
  };

  const selectTeam = team => {
    setInputs(prevInputs => ({
      ...prevInputs,
      projectId: undefined,
      personId: undefined,
      teamId: team._id,
    }));
    setSelectTeam(team);
  };

  const handleFormContent = () => {
    if (entryType === 'project') {
      return (
        <FormGroup>
          <Label className={fontColor}>Project Name</Label>
          <span className="red-asterisk">* </span>
          <AddProjectsAutoComplete
            projectsData={props.projects}
            onDropDownSelect={selectProject}
            selectedProject={selectedProject}
          />
          {'projectId' in errors && (
            <div className="text-danger">
              <small style={{ fontWeight: darkMode ? 'bold' : 'normal' }}>{errors.projectId}</small>
            </div>
          )}
        </FormGroup>
      )
    } if (entryType === 'person') {
      return (
        <FormGroup>
            <Label className={fontColor}>Name</Label>
            <span className="red-asterisk">* </span>
            <MemberAutoComplete
              userProfileData={{userProfiles: props.users}}
              onAddUser={selectUser}
              searchText={searchText}
              setSearchText={setSearchText}
            />
            {'personId' in errors && (
              <div className="text-danger">
                <small style={{ fontWeight: darkMode ? 'bold' : 'normal' }}>{errors.personId}</small>
              </div>
            )}
          </FormGroup>
      )
    } if (entryType === 'team') {
      return (
        <FormGroup>
          <Label className={fontColor}>Team Name</Label> 
          <span className="red-asterisk">* </span>
          <AddTeamsAutoComplete
            teamsData={{allTeams: props.teams}}
            onDropDownSelect={selectTeam}
            setNewTeamName={setNewTeamName} 
            setInputs={setInputs}
            newTeamName={newTeamName}
            selectedTeam={selectedTeam}
            searchText={searchTeamText}
            setSearchText={setSearchTeamText}
            addLostHour
          />
          {'teamId' in errors && (
            <div className="text-danger">
              <small style={{ fontWeight: darkMode ? 'bold' : 'normal' }}>{errors.teamId}</small>
            </div>
          )}
        </FormGroup>
      )
    } 
      return null
  };

  const handleInputChange = event => {
    event.persist();
    setInputs(prevInputs => ({
      ...prevInputs,
      [event.target.name]: event.target.value,
    }));
  };

  const handleTypeChange = event => {
    setEntryType(event.target.value);
    if (!isEqual(inputs, initialForm)) {
      setInputs(initialForm);
    }
    if (searchText !== '') {
      setSearchText('');
    }
    if (searchTeamText !== '') {
      setSearchTeamText('');
    }
    if (!isEqual(errors, {})) {
      setErrors({});
    }
  }


  const handleCancel = () => {
    resetForm();
    props.toggle();
  };

  const validateInputs = () => {
    const result = {};

    const date = moment(inputs.dateOfWork);
    const today = moment(
      moment()
        .tz('America/Los_Angeles')
        .format('YYYY-MM-DD'),
    );
    if (!date.isValid()) {
      result.dateOfWork = 'Invalid date';
    } else if (
        today.diff(date, 'days') < 0
    ) {
      result.dateOfWork = 'Cannot add lost time for future dates.';
    }

    if (inputs.hours === 0 && inputs.minutes === 0) {
      result.time = 'Time is required';
    } else {
      const hours = inputs.hours * 1;
      const minutes = inputs.minutes * 1;
      if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
        result.time = 'Hours and minutes should be integers';
      }
      if (hours < 0 || minutes < 0) {
        result.time = 'Time should be greater than 0';
      }
    }
    if (entryType === '') {
      result.events = 'Type is required';
    }
    if (entryType === 'project' && inputs.projectId === undefined) {
      result.projectId = 'Project is required';
    }
    if (entryType === 'person' && inputs.personId === undefined) {
      result.personId = 'Person is required';
    }
    if (entryType === 'team' && inputs.teamId === undefined) {
      result.teamId = 'Team is required';
    }

    setErrors(result);
    return isEmpty(result);
  };

  const handleSubmit = async event => {
    if (event) event.preventDefault();
    if (isSubmitting) return;
    if (!validateInputs()) return;

    const timeEntry = {
      personId: inputs.personId,
      dateOfWork: inputs.dateOfWork,
      hours: parseInt(inputs.hours, 10),
      minutes: parseInt(inputs.minutes, 10),
      notes: inputs.notes,
      projectId: inputs.projectId,
      teamId: inputs.teamId,
      isTangible: inputs.isTangible,
      entryType,
    };

    setSubmitting(true);
    const timeEntryStatus = await dispatch(postTimeEntry(timeEntry));
    setSubmitting(false);

    if (timeEntryStatus !== 200) {
      props.toggle();
      return;
    }

    setInputs(initialForm);
    setErrors({});
    if (props.isOpen) props.toggle();
  };

  const handleEditorChange = (content, editor) => {
    setInputs(formValues => ({ ...formValues, [editor.id]: content }));
  };

  return (
    <Modal isOpen={props.isOpen} toggle={props.toggle} className={darkMode ? 'text-light dark-mode' : ''}>
      <ModalHeader toggle={props.toggle} className={darkMode ? 'bg-space-cadet' : ''}>
        Add Lost Time
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Form>
          <FormGroup>
            <Label for="entryType" className={fontColor} >Type</Label>
            <span className="red-asterisk">* </span>
            <br/>
            <div className={`type-container ${fontColor}`}>
              <div className='type-item' style={{paddingLeft: '20px'}} >
                <Input
                  type="radio"
                  id="project"
                  name='entryType'
                  value="project"
                  onChange={handleTypeChange}
                />
                <Label htmlFor="project" className={fontColor}>Project</Label>
              </div>
              <div className='type-item'>
                <Input  
                  type="radio"
                  id="person"
                  name='entryType'
                  value="person"
                  onChange={handleTypeChange}
                />
                <Label htmlFor="person" className={fontColor}>Person</Label>
              </div>
              <div className='type-item'>
                <Input
                  type="radio"
                  id="team"
                  name='entryType'
                  value="team"
                  onChange={handleTypeChange}
                />
                <Label htmlFor="team" className={fontColor}>Team</Label>
              </div>              
            </div>
            {'events' in errors && (
                  <div className="text-danger">
                    <small>{errors.events}</small>
                  </div>
                )}
          </FormGroup>
          {entryType !== '' && (
            <>
              {handleFormContent()}
              <FormGroup>
                <Label for="dateOfWork" className={fontColor}>Date</Label>
                <Input
                  type="date"
                  name="dateOfWork"
                  id="dateOfWork"
                  value={inputs.dateOfWork}
                  onChange={handleInputChange}
                  className={darkMode ? "bg-darkmode-liblack text-light border-0 calendar-icon-dark" : ''}
                />
                {'dateOfWork' in errors && (
                  <div className="text-danger">
                    <small style={{ fontWeight: darkMode ? 'bold' : 'normal' }}>{errors.dateOfWork}</small>
                  </div>
                )}
              </FormGroup>
              <FormGroup>
              <Label for="timeSpent" className={fontColor}>Time (HH:MM)</Label>
              <span className="red-asterisk">* </span>
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
                    className={darkMode ? "bg-darkmode-liblack text-light border-0" : ''}
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
                    className={darkMode ? "bg-darkmode-liblack text-light border-0" : ''}
                  />
                </Col>
              </Row>
              {'time' in errors && (
                <div className="text-danger">
                  <small style={{ fontWeight: darkMode ? 'bold' : 'normal' }}>{errors.time}</small>
                </div>
              )}
            </FormGroup>
            {entryType === 'person' && (
              <FormGroup>
                <Label for="notes" className={fontColor}>Notes</Label>
                <Editor
                  tinymceScriptSrc="/tinymce/tinymce.min.js"
                  init={TINY_MCE_INIT_OPTIONS}
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
            )}
            <FormGroup check>
              <Label check className={fontColor}>
                <Input
                  type="checkbox"
                  name="isTangible"
                  checked={inputs.isTangible}
                  onChange={e => {
                    e.persist();
                    setInputs(prevInputs => ({
                      ...prevInputs,
                      [e.target.name]: e.target.checked,
                    }));
                  }}
                />
                Tangible
              </Label>
            </FormGroup>
            </>
          )}
        </Form>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button onClick={handleCancel} color="danger" style={boxStyling}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" style={boxStyling}>
          Submit
        </Button>
      </ModalFooter>
    </Modal>
  );
}

const mapStateToProps = state => ({
  userProfile: state.userProfile,
  auth: state.auth,
  darkMode: state.theme.darkMode,
});

export default connect(mapStateToProps, {getUserProfile})(AddLostTime);