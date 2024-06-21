import React, { useEffect, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Spinner } from 'reactstrap';
import AddTeamsAutoComplete from './AddTeamsAutoComplete';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../Header/DarkMode.css';
import { postNewTeam, getAllUserTeams } from '../../../../src/actions/allTeamsAction';
import axios from 'axios';
const AddTeamPopup = React.memo(props => {
  const { darkMode } = props;

  const dispatch = useDispatch();

  const [selectedTeam, onSelectTeam] = useState(undefined);
  const [isValidTeam, onValidation] = useState(true);
  const [isValidNewTeam, onNewTeamValidation] = useState(true);
  const [searchText, setSearchText] = useState(''); // add searchText state

  // states and onrs for the new team form
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamIsActive, setNewTeamIsActive] = useState(true);
  const [isDuplicateTeam, setDuplicateTeam] = useState(false);
  const [isNotDisplayAlert, setIsNotDisplayAlert] = useState(true);
  const [autoComplete, setAutoComplete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const closePopup = () => {
    props.onClose();
    !isNotDisplayAlert && setIsNotDisplayAlert(true);
  };

  const format = result =>
    result
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '');

  const IfTheUserNotSelectedSuggestionAutoComplete = () => {
    // prettier-ignore
    if(searchText === '')  {onValidation(false);  return;}

    const filterTeamData = props.teamsData.allTeams.filter(
      item => format(item.teamName) === format(searchText),
    )[0];

    if (filterTeamData) {
      onAssignTeam(filterTeamData);
      !isNotDisplayAlert && setIsNotDisplayAlert(true);
    } else setIsNotDisplayAlert(false);
  };

  const onAssignTeam = result => {
    const condition = {
      TEAM_NAME: autoComplete === 0,
      obj: autoComplete === 1,
      selectedTeam: selectedTeam,
      result: result,
    };

    if (!searchText) {
      onValidation(false);
      return;
    }
    const some = condition.obj
      ? !props.userTeamsById.some(x => x._id === result._id)
      : condition.TEAM_NAME
      ? !props.userTeamsById.some(x => x._id === selectedTeam._id)
      : null;

    if (condition && some) {
      props.onSelectAssignTeam(condition.TEAM_NAME ? selectedTeam : condition.obj ? result : null);
      setSearchText('');
      onValidation(true);
      toast.success('Team assigned successfully'); //toast notification
    } else {
      // when the user typed something but didn't select a team
      toast.error(
        'Your user has been found in this team. Please select another team to add your user.',
      );
    }
  };

  const selectTeam = team => {
    onSelectTeam(team);
    setSearchText(team.teamName);
    setAutoComplete(0);
  };

  const axiosResponseExceededTimeout = source => {
    setIsLoading(false);
    source.cancel();
  };

  const onCreateTeam = async () => {
    if (newTeamName !== '') {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      const timeout = setTimeout(() => axiosResponseExceededTimeout(source), 20000);

      setIsLoading(true);
      const response = await dispatch(postNewTeam(newTeamName, newTeamIsActive, source));
      clearTimeout(timeout);
      if (response.status === 200) {
        setNewTeamName('');
        setNewTeamIsActive(true);
        setDuplicateTeam(false);

        // Get updated teams list and select the new team
        await dispatch(getAllUserTeams());
        toast.success('Team created successfully');
        const newTeam = response.data; // Assuming response contains the new team data
        onSelectTeam(newTeam);
        setSearchText(newTeam.teamName); // Update search text to reflect new team name
        setIsLoading(false);
      } else {
        setIsLoading(false);
        const messageToastError =
          response.status === 500
            ? 'No response received from the server'
            : 'Error occurred while creating team';
        response.status === 403 ? setDuplicateTeam(true) : toast.error(messageToastError);
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
            onDropDownSelect={selectTeam}
            onCreateNewTeam={onCreateTeam}
            selectedTeam={selectedTeam}
            searchText={searchText}
            setNewTeamName={setNewTeamName}
            newTeamName={newTeamName}
            setSearchText={setSearchText} // Added setSearchText prop
            setAutoComplete={setAutoComplete}
          />
          <Button
            color="primary"
            style={{ marginLeft: '5px' }}
            onClick={() => {
              if (autoComplete === 1) {
                IfTheUserNotSelectedSuggestionAutoComplete();
              } else if (autoComplete === 0) {
                onAssignTeam();
              } else if (!searchText) {
                onValidation(false);
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? <Spinner color="light" size="sm" /> : 'Confirm'}
          </Button>
        </div>
        {!isNotDisplayAlert && (
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
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={closePopup}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

export default AddTeamPopup;
