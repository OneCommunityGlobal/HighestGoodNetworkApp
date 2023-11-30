import React, { useEffect, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import AddTeamsAutoComplete from './AddTeamsAutoComplete';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { postNewTeam, getAllUserTeams } from '../../../../src/actions/allTeamsAction';

const AddTeamPopup = React.memo(props => {
  const dispatch = useDispatch();
  const closePopup = () => {
    props.onClose();
  };

  const [selectedTeam, onSelectTeam] = useState(undefined);
  const [isValidTeam, onValidation] = useState(true);
  const [isValidNewTeam, onNewTeamValidation] = useState(true);
  const [searchText, setSearchText] = useState(''); // add searchText state

  // states and onrs for the new team form
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamIsActive, setNewTeamIsActive] = useState(true);
  const [isDuplicateTeam, setDuplicateTeam] = useState(false);
  const onAssignTeam = () => {
    if (!searchText) {
      // when the user typed nothing
      onValidation(false);
      return;
    }
    if (selectedTeam && !props.userTeamsById.some(x => x._id === selectedTeam._id)) {
      props.onSelectAssignTeam(selectedTeam);
      onSelectTeam(undefined);
    } else {
      // when the user typed something but didn't select a team
      onValidation(false);
    }
    if (props.handleSubmit !== undefined) {
      props.handleSubmit();
      props.onClose();
    }
  };

  const selectTeam = team => {
    onSelectTeam(team);
    onValidation(true);
  };

  const onCreateTeam = async () => {
    if (newTeamName !== '') {
      const response = await dispatch(postNewTeam(newTeamName, newTeamIsActive));
        
      if (response.status === 200) {
        toast.success('Team created successfully'); // toast notification
        setNewTeamName('');
        setNewTeamIsActive(true);
        setDuplicateTeam(false); // Reset duplicate team state
        await dispatch(getAllUserTeams());
      } else if (response.status === 400) {
        setDuplicateTeam(true); // set duplicate team state to true
      } else {
        toast.error('Error occurred while creating team'); // general error message
      }
    } else {
      onNewTeamValidation(false);
    }
  };

  useEffect(() => {
    onValidation(true);
    onNewTeamValidation(true);
  }, [props.open]);

  useEffect(() => {
    dispatch(getAllUserTeams());
  }, [newTeamName, newTeamIsActive, dispatch]);

  return (
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Add Team</ModalHeader>
      <ModalBody style={{ textAlign: 'center' }}>
        <label style={{textAlign: 'left'}}>Add to Team</label>
        <div className="input-group-prepend" style={{ marginBottom: '10px' }}>
          <AddTeamsAutoComplete
            teamsData={props.teamsData}
            onDropDownSelect={selectTeam}
            onCreateNewTeam={onCreateTeam}
            selectedTeam={selectedTeam}
            searchText={searchText}
            setNewTeamName={setNewTeamName} 
            newTeamName={newTeamName}
            setSearchText={setSearchText}  // Added setSearchText prop
          />
          <Button color="primary" style={{ marginLeft: '5px' }} onClick={onAssignTeam}>
            Confirm
          </Button>
        </div>
          {!isValidTeam && searchText && !selectedTeam && (
          <Alert color="danger">Oops, this team does not exist! Create it if you want it.</Alert>
          )}
        {!isValidTeam && !searchText && (
          <Alert color="danger">Hey, You need to pick a team first!</Alert>
        )}
        {!isValidNewTeam && !isDuplicateTeam ? <Alert color="danger">Please enter a team name.</Alert> : null}
        {isDuplicateTeam && (
          <Alert color="danger">A team with this name already exists</Alert>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={closePopup}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

export default AddTeamPopup;