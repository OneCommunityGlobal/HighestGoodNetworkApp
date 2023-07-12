import React, { useEffect, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import AddTeamsAutoComplete from './AddTeamsAutoComplete';
import { useDispatch } from 'react-redux';
import { postNewTeam, getAllUserTeams } from '../../../../src/actions/allTeamsAction';

const AddTeamPopup = React.memo(props => {
  const dispatch = useDispatch();
  const closePopup = () => {
    props.onClose();
  };

  const [selectedTeam, onSelectTeam] = useState(undefined);
  const [isValidTeam, onValidation] = useState(true);
  const [isValidNewTeam, onNewTeamValidation] = useState(true);

  // states and onrs for the new team form
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamIsActive, setNewTeamIsActive] = useState(true);

  const onNameChange = (e) => {
    setNewTeamName(e.target.value);
    onNewTeamValidation(true);
  };

  const onAssignTeam = () => {
    if (selectedTeam && !props.userTeamsById.some(x => x._id === selectedTeam._id)) {
      props.onSelectAssignTeam(selectedTeam);
      onSelectTeam(undefined);
    } else {
      onValidation(false);
    }
  };

  const selectTeam = team => {
    onSelectTeam(team);
    onValidation(true);
  };

  const onCreateTeam = async () => {
    if (newTeamName !== '') {
      await dispatch(postNewTeam(newTeamName, newTeamIsActive));
      await dispatch(getAllUserTeams());
      alert('Team added successfully');
      setNewTeamName('');
      setNewTeamIsActive(true);
    } else {
      onNewTeamValidation(false);
    }
  };

  useEffect(() => {
    onValidation(true);
    onNewTeamValidation(true);
  }, [props.open]);

  useEffect(() => {
    // Update teams data when newTeamName or newTeamIsActive changes
    dispatch(getAllUserTeams());
  }, [newTeamName, newTeamIsActive, dispatch]);

  return (
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Add Team</ModalHeader>
      <ModalBody style={{ textAlign: 'center' }}>
        <div className="input-group-prepend" style={{ marginBottom: '10px' }}>
          <AddTeamsAutoComplete
            teamsData={props.teamsData}
            onDropDownSelect={selectTeam}
            selectedTeam={selectedTeam}
          />
          <Button color="primary" style={{ marginLeft: '5px' }} onClick={onAssignTeam}>
            Confirm
          </Button>
        </div>
        {!isValidTeam && (
          <Alert color="danger">Hey, You need to pick a team first!</Alert>
        )}
        <div className="input-group mb-3">
          <Input
            placeholder="Please enter a new team name"
            value={newTeamName}
            onChange={onNameChange}
          />
          <Button color="primary" style={{ marginLeft: '5px' }} onClick={onCreateTeam}>
            Create New Team
          </Button>
        </div>
        {!isValidNewTeam ? <Alert color="danger">Please enter a team name.</Alert> : null}
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
