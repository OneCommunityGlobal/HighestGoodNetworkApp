import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Form, Row, Col } from 'reactstrap';
import { boxStyle } from 'styles';
import { connect, useDispatch } from 'react-redux';
import { getUserProfile } from 'actions/userProfile';
import AddProjectsAutoComplete from 'components/UserProfile/TeamsAndProjects/AddProjectsAutoComplete';
import MemberAutoComplete from 'components/Teams/MembersAutoComplete';
import AddTeamsAutoComplete from 'components/UserProfile/TeamsAndProjects/AddTeamsAutoComplete';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { deleteTimeEntry, editTimeEntry } from 'actions/timeEntries';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import './EditHistoryModal.css';

const EditHistoryModal = props => {

  const initialForm = {
    projectId: props.entryType == 'project'? props.dataId: undefined,
    personId: props.entryType == 'person'? props.dataId: undefined,
    teamId: props.entryType == 'team'? props.dataId: undefined,
    dateOfWork: props.dateOfWork,
    hours: props.hours,
    minutes: props.minutes,
    isTangible: props.isTangible,
  };

  const initialData = props.allData.find(data => data._id == props.dataId);
  const initialName = props.entryType == 'person'? initialData.firstName + " " + initialData.lastName: '';

  const dispatch = useDispatch();

  const [isSubmitting, setSubmitting] = useState(false);
  const [inputs, setInputs] = useState(initialForm);
  
  const [searchText, setSearchText] = useState(initialName);
  const [selectedData, setSelectedData] = useState(initialData);

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

  const selectData = data => {
    if(props.entryType == 'project') {
      setInputs(inputs => ({
        ...inputs,
        projectId: data._id,
        personId: undefined,
        teamId: undefined,
      }));
      setSelectedData(data);
    } else if (props.entryType == 'person') {
      if(data){
        setInputs(inputs => ({
          ...inputs,
          projectId: undefined,
          personId: data._id,
          teamId: undefined,
        }));
      }
    } else if (props.entryType == 'team') {
      setInputs(inputs => ({
        ...inputs,
        projectId: undefined,
        personId: undefined,
        teamId: data._id,
      }));
      setSelectedData(data);
    }
  }

  const handleFormContent = () => {
    if (props.entryType == 'project') {
      return (
        <FormGroup>
          <Label>Project Name</Label>
          <AddProjectsAutoComplete
            projectsData={props.allData}
            onDropDownSelect={selectData}
            selectedProject={selectedData}
          />
          {'projectId' in errors && (
            <div className="text-danger">
              <small>{errors.projectId}</small>
            </div>
          )}
        </FormGroup>
      )
    } else if (props.entryType == 'person') {
      return (
        <>
          <FormGroup>
            <Label>Name</Label>
            <MemberAutoComplete
              userProfileData={{userProfiles: props.allData}}
              onAddUser={selectData}
              searchText={searchText}
              setSearchText={setSearchText}
            />
            {'personId' in errors && (
              <div className="text-danger">
                <small>{errors.personId}</small>
              </div>
            )}
          </FormGroup>
        </>
      )
    } else if (props.entryType == 'team') {
      return (
        <FormGroup>
          <Label>Team Name</Label>
          <AddTeamsAutoComplete
            teamsData={{allTeams: props.allData}}
            onDropDownSelect={selectData}
            selectedTeam={selectedData}
          />
          {'teamId' in errors && (
            <div className="text-danger">
              <small>{errors.teamId}</small>
            </div>
          )}
        </FormGroup>
      )
    } else {
      return (<></>)
    }
  };

  const handleInputChange = event => {
    event.persist();
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }));
  };

  const resetForm = () => {
    setInputs(initialForm);
    setSearchText('');
    setErrors({});
  }
  const handleCancel = closed => {
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

    if (props.entryType == 'project' && inputs.projectId == undefined) {
      result.projectId = 'Project is required';
    }
    if (props.entryType == 'person' && inputs.personId == undefined) {
      result.personId = 'Person is required';
    }
    if (props.entryType == 'team' && inputs.teamId == undefined) {
      result.teamId = 'Team is required';
    }

    setErrors(result);
    return isEmpty(result);
  };

  const updateHours = async (userProfile, timeEntry, hours, minutes) => {
    const { hoursByCategory } = userProfile;
    const { isTangible, personId } = timeEntry;

    const oldEntryTime = parseFloat(initialForm.hours) + parseFloat(initialForm.minutes) / 60;
    const currEntryTime = parseFloat(hours) + parseFloat(minutes) / 60;
    const timeDifference = currEntryTime - oldEntryTime;

    if (initialForm.isTangible == 'true' && isTangible == 'true') {
      hoursByCategory['unassigned'] += timeDifference;
    } else if (initialForm.isTangible == 'false' && isTangible == 'false') {
      userProfile.totalIntangibleHrs += timeDifference;
    } else if (initialForm.isTangible == 'true' && isTangible == 'false') {
      hoursByCategory['unassigned'] -= oldEntryTime;
      userProfile.totalIntangibleHrs += currEntryTime;
    } else {
      userProfile.totalIntangibleHrs -= oldEntryTime;
      hoursByCategory['unassigned'] += currEntryTime;
    }

    try {
      // const url = ENDPOINTS.USER_PROFILE(personId);
      const url = ENDPOINTS.USER_PROFILE_PROPERTY(personId);
      // await axios.put(url, userProfile);
      await axios.patch(url, { key: 'hoursByCategory', value: hoursByCategory });
      await axios.patch(url, { key: 'totalIntangibleHrs', value: userProfile.totalIntangibleHrs });
    } catch (error) {
      console.log(error);
    }
  };

  const deleteHours = async (userProfile, timeEntry) => {
    const { hoursByCategory } = userProfile;
    const { isTangible, personId } = timeEntry;

    const entryTime = parseFloat(initialForm.hours) + parseFloat(initialForm.minutes) / 60;

    if (isTangible == 'true') {
      hoursByCategory['unassigned'] -= entryTime;
    } else {
      userProfile.totalIntangibleHrs -= entryTime;
    }

    try {
      const url = ENDPOINTS.USER_PROFILE_PROPERTY(personId);
      await axios.patch(url, { key: 'hoursByCategory', value: hoursByCategory });
      await axios.patch(url, { key: 'totalIntangibleHrs', value: userProfile.totalIntangibleHrs });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async event => {

    if (event) event.preventDefault();
    if (isSubmitting) return;
    if (!validateInputs()) return;

    let isIdEqual = false;
    if (props.entryType == 'person') {
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
      isTangible: inputs.isTangible.toString(),
      entryType: props.entryType,
      hours: parseInt(inputs.hours),
      minutes: parseInt(inputs.minutes),
    };

    if(inputs.personId) {
      updateHours(props.userProfile, timeEntry, inputs.hours, inputs.minutes);
    }

    setSubmitting(true);
    let timeEntryStatus;
    timeEntryStatus = await dispatch(editTimeEntry(props._id, timeEntry, initialForm.dateOfWork));
    setSubmitting(false);

    if (timeEntryStatus !== 200) {
      toggleEdit();
      alert(
        `An error occurred while attempting to update your time entry. Error code: ${timeEntryStatus}`,
      );
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
      isTangible: inputs.isTangible.toString(),
      entryType: props.entryType,
      hours: parseInt(inputs.hours),
      minutes: parseInt(inputs.minutes),
    };

    if(inputs.personId) {
      deleteHours(props.userProfile, timeEntry);
    }

    const timeEntryStatus = await dispatch(deleteTimeEntry(timeEntry));
    if (timeEntryStatus !== 200) {
      toggleDelete();
      alert(
        `An error occurred while attempting to delete your time entry. Error code: ${timeEntryStatus}`,
      );
      return;
    }
    if (deleteModal) toggleDelete();
    props.reload();
  }

  return(
    <>
    <Modal isOpen={editModal} toggle={toggleEdit}>
      <ModalHeader toggle={toggleEdit}>
        Edit Lost Time
      </ModalHeader>
      <ModalBody>
        <Form>
          <>
            {handleFormContent()}
            <FormGroup>
              <Label for="dateOfWork">Date</Label>
              <Input
                type="date"
                name="dateOfWork"
                id="dateOfWork"
                value={inputs.dateOfWork}
                onChange={handleInputChange}
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
              <Label check>
                <Input
                  type="checkbox"
                  name="isTangible"
                  checked={inputs.isTangible}
                  onChange={e => {
                    e.persist();
                    setInputs(inputs => ({
                      ...inputs,
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
      <ModalFooter>
        <Button onClick={handleCancel} color="danger" style={boxStyle}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" style={boxStyle}>
          Update
        </Button>
      </ModalFooter>
    </Modal>
    <Modal isOpen={deleteModal} toggle={toggleDelete}>
      <ModalHeader toggle={toggleDelete}>
        Delete Lost Time
      </ModalHeader>
      <ModalBody>
        Are you sure you want to delete this?
      </ModalBody>
      <ModalFooter>
        <Button onClick={toggleDelete} color="primary" style={boxStyle}>
          Close
        </Button>
        <Button onClick={handleDelete} color="danger" style={boxStyle}>
          Confirm
        </Button>
      </ModalFooter>
    </Modal>
    <div className='history-btn-div'>
      <Button className='history-btn' color="primary" onClick={toggleEdit} style={boxStyle}>
        Edit
      </Button>
      <Button className='history-btn' color="danger" onClick={toggleDelete} style={boxStyle}>
        Delete
      </Button>
    </div>
    </>
  );
};

const mapStateToProps = state => ({
  userProfile: state.userProfile,
  auth: state.auth,
});

export default connect(mapStateToProps, {getUserProfile})(EditHistoryModal);