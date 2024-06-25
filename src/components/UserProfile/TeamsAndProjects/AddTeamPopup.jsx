import React, { useEffect, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';
import AddTeamsAutoComplete from './AddTeamsAutoComplete';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../Header/DarkMode.css';
import { postNewTeam, getAllUserTeams } from '../../../../src/actions/allTeamsAction';

const AddTeamPopup = React.memo(props => {
  const { darkMode } = props;

  const dispatch = useDispatch();
  const closePopup = () => {
    props.onClose();
    !isNotDisplayAlert && setIsNotDisplayAlert(true);
  };

  const format = result =>
    result
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '');

  const FilteredToTeamSpecific = arrayOrObj => {
    const result = props.teamsData.allTeams.filter(
      item => format(item.teamName) === format(searchText),
    );
    if (result.length > 0) {
      if (arrayOrObj) return result[0];
      else return result;
    } else return undefined;
  };

  const validation = () => {
    // prettier-ignore
    if(searchText === '')  {onValidation(false);  return;}

    const filterTeamData = FilteredToTeamSpecific(true);

    if (filterTeamData) {
      onAssignTeam(filterTeamData, null);
      onValidation(true);
      //! selectTeam(filterTeamData);
      !isNotDisplayAlert && setIsNotDisplayAlert(true);
    } else setIsNotDisplayAlert(false);
  };

  const [selectedTeam, onSelectTeam] = useState(undefined);
  const [isValidTeam, onValidation] = useState(true);
  const [isValidNewTeam, onNewTeamValidation] = useState(true);
  const [searchText, setSearchText] = useState(''); // add searchText state

  // states and onrs for the new team form
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamIsActive, setNewTeamIsActive] = useState(true);
  const [isDuplicateTeam, setDuplicateTeam] = useState(false);
  const [isNotDisplayAlert, setIsNotDisplayAlert] = useState(true);

  const onAssignTeam = (result, newTeam) => {
    if (!searchText) {
      // when the user typed nothing
      onValidation(false);
      return;
    }

    const some = result
      ? !props.userTeamsById.some(x => x._id === result._id)
      : !props.userTeamsById.some(x => x._id === newTeam._id);

    //? new team 2020

    if ((result || newTeam) && some) {
      props.onSelectAssignTeam(result ? result : newTeam);
      //  prettier-ignore
      const messageSuccess = result
        ? ' Team assigned successfully '
        : ' Team created and assigned successfully';

      toast.success(messageSuccess); // toast notification
      setSearchText('');

      //!onSelectTeam(undefined);
      //!onValidation(false);
    } else {
      //    when the user typed something but didn't select a team
      onValidation(false);
    }
  };

  //! const selectTeam = team => {
  //!  onSelectTeam(team);
  //! onValidation(true);
  //! onAssignTeam(team, null);
  //! };

  const onCreateTeam = async () => {
    if (newTeamName !== '') {
      const response = await dispatch(postNewTeam(newTeamName, newTeamIsActive));

      if (response.status === 200) {
        setIsNotDisplayAlert(true);
        setNewTeamName('');
        setNewTeamIsActive(true);
        setDuplicateTeam(false);

        // Get updated teams list and select the new team
        await dispatch(getAllUserTeams());
        const newTeam = response.data; // Assuming response contains the new team data
        //!  onSelectTeam(newTeam);
        setSearchText(newTeam.teamName); // Update search text to reflect new team name
        onAssignTeam(null, newTeam);
      } else if (response.status === 400) {
        setDuplicateTeam(true);
      } else {
        toast.error('Error occurred while creating team');
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
    <Modal
      isOpen={props.open}
      toggle={closePopup}
      autoFocus={false}
      className={darkMode ? 'text-light dark-mode' : ''}
    >
      <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={closePopup}>
        Add Team
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''} style={{ textAlign: 'center' }}>
        <label className={darkMode ? 'text-light' : ''} style={{ textAlign: 'left' }}>
          Add to Team
        </label>
        <div className="input-group-prepend" style={{ marginBottom: '10px' }}>
          <AddTeamsAutoComplete
            teamsData={props.teamsData}
            //!onDropDownSelect={selectTeam}
            onCreateNewTeam={onCreateTeam}
            //! selectedTeam={selectedTeam}
            searchText={searchText}
            setNewTeamName={setNewTeamName}
            newTeamName={newTeamName}
            setSearchText={setSearchText} // Added setSearchText prop
            setIsNotDisplayAlert={setIsNotDisplayAlert}
            isNotDisplayAlert={isNotDisplayAlert}
          />
          <Button
            color="primary"
            style={{ marginLeft: '5px' }}
            onClick={validation}
            disabled={!isNotDisplayAlert}
          >
            Confirm
          </Button>
        </div>
        {!isNotDisplayAlert && (
          <>
            <Alert color="danger">Oops, this team does not exist! Create it if you want it.</Alert>
            <div
              style={{
                marginBottom: '10px',
                display: 'flex',
                flexDirection: 'row',
                gap: '10px',
                justifyContent: 'center',
              }}
            >
              <Button color="info" onClick={onCreateTeam}>
                <b>Create Team</b>
              </Button>

              <Button color="danger" onClick={() => setIsNotDisplayAlert(true)}>
                <b>Cancel team creation </b>
              </Button>
            </div>
          </>
        )}
        {!isValidTeam && !searchText && (
          <Alert color="danger">Hey, You need to pick a team first!</Alert>
        )}
        {!isValidNewTeam && !isDuplicateTeam ? (
          <Alert color="danger">Please enter a team name.</Alert>
        ) : null}
        {isDuplicateTeam && <Alert color="danger">A team with this name already exists</Alert>}
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={closePopup}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

export default AddTeamPopup;
