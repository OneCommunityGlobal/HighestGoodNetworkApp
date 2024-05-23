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
  const [isNotDisplayToast, setIsNotDisplayToast] = useState(false);

  const onAssignTeam = () => {
    if (!searchText) {
      // when the user typed nothing
      onValidation(false);
      return;
    }

    isNotDisplayToast && toast.warn('Please wait for the team to be created to add your user.');

    if (selectedTeam && selectedTeam.members.length > 0 && !isNotDisplayToast) {
      const userId = props.userProfile._id;
      const usersTeam = selectedTeam.members.map(item => item.userId);
      const userIsAlreadyInATeam = usersTeam.includes(userId);
      userIsAlreadyInATeam &&
        toast.error(
          'Your user has been found in this team. Please select another team to add your user.',
        );
    }

    if (
      selectedTeam &&
      !props.userTeamsById.some(x => x._id === selectedTeam._id) &&
      !isNotDisplayToast
    ) {
      props.onSelectAssignTeam(selectedTeam);
      toast.success('Team assigned successfully'); // toast notification
      onSelectTeam(undefined);
    } else {
      // when the user typed something but didn't select a team
      onValidation(false);
    }
  };

  const selectTeam = team => {
    onSelectTeam(team);
    onValidation(true);
  };

  const onCreateTeam = async () => {
    if (newTeamName !== '') {
      setIsNotDisplayToast(true);
      const response = await dispatch(postNewTeam(newTeamName, newTeamIsActive));
      try {
        if (response.status === 200) {
          toast.success('Team created successfully');
          setNewTeamName('');
          setNewTeamIsActive(true);
          setDuplicateTeam(false);

          // Get updated teams list and select the new team
          await dispatch(getAllUserTeams());
          const newTeam = response.data; // Assuming response contains the new team data
          onSelectTeam(newTeam);
          setSearchText(newTeam.teamName); // Update search text to reflect new team name
        }
      } catch (error) {
        if (response.status === 400) {
          setDuplicateTeam(true);
        } else {
          toast.error('Error occurred while creating team');
        }
      } finally {
        setIsNotDisplayToast(false);
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
    <Modal isOpen={props.open} toggle={closePopup} autoFocus={false}>
      <ModalHeader toggle={closePopup}>Add Team</ModalHeader>
      <ModalBody style={{ textAlign: 'center' }}>
        <label style={{ textAlign: 'left' }}>Add to Team</label>
        <div className="input-group-prepend" style={{ marginBottom: '10px' }}>
          <AddTeamsAutoComplete
            teamsData={props.teamsData}
            onDropDownSelect={selectTeam}
            onCreateNewTeam={onCreateTeam}
            selectedTeam={selectedTeam}
            searchText={searchText}
            setNewTeamName={setNewTeamName}
            newTeamName={newTeamName}
            setSearchText={setSearchText} // Added setSearchText prop
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
        {!isValidNewTeam && !isDuplicateTeam ? (
          <Alert color="danger">Please enter a team name.</Alert>
        ) : null}
        {isDuplicateTeam && <Alert color="danger">A team with this name already exists</Alert>}
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
