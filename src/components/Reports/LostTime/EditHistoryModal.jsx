import { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Form, Row, Col } from 'reactstrap';
import { getFontColor, getBoxStyling } from 'styles';
import { connect, useDispatch } from 'react-redux';
import { getUserProfile } from 'actions/userProfile';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { deleteTimeEntry, editTimeEntry } from 'actions/timeEntries';
import './EditHistoryModal.css';
import '../../Header/DarkMode.css'

function EditHistoryModal(props) {
  const {darkMode} = props;
  const fontColor = getFontColor(darkMode);
  const boxStyling = getBoxStyling(darkMode);

  const initialForm = {
    projectId: props.entryType === 'project'? props.dataId: undefined,
    personId: props.entryType === 'person'? props.dataId: undefined,
    teamId: props.entryType === 'team'? props.dataId: undefined,
    dateOfWork: props.dateOfWork,
    hours: props.hours,
    minutes: props.minutes,
    isTangible: props.isTangible,
  };

  const initialData = props.allData.find(data => data._id === props.dataId);
  const initialName = props.entryType === 'person'? `${initialData.firstName  } ${  initialData.lastName}`: '';

  const dispatch = useDispatch();

  const [isSubmitting, setSubmitting] = useState(false);
  const [inputs, setInputs] = useState(initialForm);
  
  const [searchText, setSearchText] = useState(initialName);
  const [selectedData] = useState(initialData);

  const [errors, setErrors] = useState({});
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    if (editModal && initialForm.personId && props.userProfile._id !== initialForm.personId) {
      props.getUserProfile(initialForm.personId);
    }
  });

  const toggleEdit = () => {
    setEditModal(!editModal)
  };

  const toggleDelete = () => {
    setDeleteModal(!deleteModal)
  };

  const handleFormContent = () => {
    if (props.entryType === 'project') {
      return (
        <FormGroup>
          <Label className={fontColor}>Project Name</Label>
          <Input
            defaultValue={selectedData.projectName}
            className={darkMode ? "bg-darkmode-liblack text-light border-0" : ''}
            disabled
          />
        </FormGroup>
      )
    } if (props.entryType === 'person') {
      return (
        <FormGroup>
            <Label className={fontColor}>Name</Label>
            <Input
              defaultValue={searchText}
              className={darkMode ? "bg-darkmode-liblack text-light border-0" : ''}
              disabled
            />
          </FormGroup>
      )
    } if (props.entryType === 'team') {
      return (
        <FormGroup>
          <Label className={fontColor}>Team Name</Label>
          <Input
            defaultValue={selectedData.teamName}
            className={darkMode ? "bg-darkmode-liblack text-light border-0" : ''}
            disabled
          />
        </FormGroup>
      )
    } 
      return null;
    
  };

  const handleInputChange = event => {
    event.persist();
    setInputs(prevInputs => ({
      ...prevInputs,
      [event.target.name]: event.target.value,
    }));
  };

  const resetForm = () => {
    setInputs(initialForm);
    setSearchText('');
    setErrors({});
  }
  const handleCancel = () => {
    resetForm();
    toggleEdit();
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

    if (props.entryType === 'project' && inputs.projectId === undefined) {
      result.projectId = 'Project is required';
    }
    if (props.entryType === 'person' && inputs.personId === undefined) {
      result.personId = 'Person is required';
    }
    if (props.entryType === 'team' && inputs.teamId === undefined) {
      result.teamId = 'Team is required';
    }

    setErrors(result);
    return isEmpty(result);
  };

  const handleSubmit = async event => {

    if (event) event.preventDefault();
    if (isSubmitting) return;
    if (!validateInputs()) return;

    let isIdEqual = false;
    if (props.entryType === 'person') {
      isIdEqual =  initialForm.personId === inputs.personId;
    } else if (props.entryType === 'project') {
      isIdEqual = initialForm.projectId === inputs.projectId;
    } else {
      isIdEqual = initialForm.teamId === inputs.teamId;
    }

    if (isIdEqual && initialForm.dateOfWork === inputs.dateOfWork
      && initialForm.isTangible === inputs.isTangible
      && initialForm.hours === inputs.hours
      && initialForm.minutes === inputs.minutes) {
        setErrors({});
        if (editModal) toggleEdit();
        return;
    }

    const timeEntry = {
      personId: inputs.personId,
      projectId: inputs.projectId,
      teamId: inputs.teamId,
      dateOfWork: inputs.dateOfWork,
      isTangible: inputs.isTangible,
      entryType: props.entryType,
      hours: parseInt(inputs.hours, 10),
      minutes: parseInt(inputs.minutes, 10),
    };

    setSubmitting(true);
    const timeEntryStatus = await dispatch(editTimeEntry(props._id, timeEntry, initialForm.dateOfWork));
    setSubmitting(false);

    if (timeEntryStatus !== 200) {
      toggleEdit();
      return;
    }

    setInputs(initialForm);
    setErrors({});
    if (editModal) toggleEdit();
    props.reload();
  };

  const handleDelete = async event => {

    if (event) event.preventDefault();

    const timeEntry = {
      _id: props._id,
      personId: inputs.personId,
      projectId: inputs.projectId,
      teamId: inputs.teamId,
      dateOfWork: inputs.dateOfWork,
      isTangible: inputs.isTangible,
      entryType: props.entryType,
      hours: parseInt(inputs.hours, 10),
      minutes: parseInt(inputs.minutes, 10),
    };

    const timeEntryStatus = await dispatch(deleteTimeEntry(timeEntry));
    if (timeEntryStatus !== 200) {
      toggleDelete();
      return;
    }
    if (deleteModal) toggleDelete();
    props.reload();
  }

  return(
    <>
    <Modal isOpen={editModal} toggle={toggleEdit} className={darkMode ? 'text-light dark-mode' : ''}>
      <ModalHeader toggle={toggleEdit} className={darkMode ? 'bg-space-cadet text-light' : ''}>
        Edit Lost Time
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Form>
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
                  <small>{errors.time}</small>
                </div>
              )}
            </FormGroup>
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
        </Form>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button onClick={handleCancel} color="danger" style={boxStyling}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" style={boxStyling}>
          Update
        </Button>
      </ModalFooter>
    </Modal>
    <Modal isOpen={deleteModal} toggle={toggleDelete} className={darkMode ? 'dark-mode text-light' : ''}>
      <ModalHeader toggle={toggleDelete} className={darkMode ? 'bg-space-cadet text-light' : ''}>
        Delete Lost Time
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        Are you sure you want to delete this?
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue text-light' : ''}>
        <Button onClick={toggleDelete} color="primary" style={boxStyling}>
          Close
        </Button>
        <Button onClick={handleDelete} color="danger" style={boxStyling}>
          Confirm
        </Button>
      </ModalFooter>
    </Modal>
    <div className='history-btn-div'>
      <Button className='history-btn' color="primary" onClick={toggleEdit} style={boxStyling}>
        Edit
      </Button>
      <Button className='history-btn' color="danger" onClick={toggleDelete} style={boxStyling}>
        Delete
      </Button>
    </div>
    </>
  );
}

const mapStateToProps = state => ({
  userProfile: state.userProfile,
  auth: state.auth,
  darkMode: state.theme.darkMode,
});

const mapDispatchToProps = dispatch => ({
  getUserProfile: userId => dispatch(getUserProfile(userId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(EditHistoryModal);