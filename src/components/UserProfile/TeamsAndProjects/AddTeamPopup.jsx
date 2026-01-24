import React, { useEffect, useMemo, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Spinner } from 'reactstrap';
import AddTeamsAutoComplete from './AddTeamsAutoComplete';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../Header/index.css';
import { postNewTeam, getAllUserTeams } from '../../../../src/actions/allTeamsAction';
import axios, { CancelToken } from 'axios';

// eslint-disable-next-line react/display-name
const AddTeamPopup = React.memo(props => {
  const { darkMode, isEdit, teamName, teamId, teamCode, isActive, onUpdateTeam } = props;
  const dispatch = useDispatch();

  // ---- Local source of truth for teams (avoids relying on store shape)
  const [teams, setTeams] = useState(() => props.teamsData?.allTeams ?? []);
  const [teamsLoading, setTeamsLoading] = useState(false);

  const [selectedTeam, onSelectTeam] = useState(undefined);
  const [isValidTeam, onValidation] = useState(true);
  const [isValidNewTeam, onNewTeamValidation] = useState(true);
  const [searchText, setSearchText] = useState('');

  const [isDuplicateTeam, setDuplicateTeam] = useState(false);
  const [isNotDisplayAlert, setIsNotDisplayAlert] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Keep local teams in sync if parent props change later
  useEffect(() => {
    if (Array.isArray(props.teamsData?.allTeams) && props.teamsData.allTeams.length) {
      setTeams(props.teamsData.allTeams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.teamsData?.allTeams]);

  const closePopup = () => {
    props.onClose();
    !isNotDisplayAlert && setIsNotDisplayAlert(true);
    setDuplicateTeam(false);
    onValidation(true);
    onNewTeamValidation(true);
    setSearchText('');
  };

  const normalize = (s) =>
    (s ?? '').toString().toLowerCase().trim().replace(/\s+/g, ' ');

  const allTeams = useMemo(() => teams ?? [], [teams]);

  const findCandidates = () => {
    const q = normalize(searchText);
    if (!q) return [];
    return allTeams.filter((t) => normalize(t.teamName).includes(q));
  };

  const IfTheUserNotSelectedSuggestionAutoComplete = () => {
    // prettier-ignore
    if(searchText === '' || searchText.trim() === '')  {onValidation(false);  return;}

    const filterTeamData = FilteredToTeamSpecific(true);

    if (filterTeamData) {
      onAssignTeam(filterTeamData);
      onValidation(true);
      !isNotDisplayAlert && setIsNotDisplayAlert(true);
      setDuplicateTeam(false);
    } else setIsNotDisplayAlert(false);
  };

  const onAssignTeam = result => {
    //  prettier-ignore
    if (!searchText || searchText.trim() === '') {onValidation(false);  return;} /* when the user typed nothing  */

    const idToCheck = result ? result._id : (selectedTeam ? selectedTeam._id : null);

    const some = !props.userTeamsById.some(x => x._id === idToCheck);

    if ((result || selectedTeam) && some) {
      props.onSelectAssignTeam(result ? result : selectedTeam);
      setSearchText('');
      if (selectedTeam) {
        onSelectTeam(undefined);
        onValidation(false);
      }
      closePopup();
    } else {
      toast.error(
        'Your user has been found in this team. Please select another team to add your user.'
      );
    }
  };

  const axiosResponseExceededTimeout = (source) => {
    setIsLoading(false);
    source.cancel();
  };

  const onCreateTeam = async () => {
    if (searchText !== '' && searchText.trim() !== '') {
      // Client-side duplicate check
      const trimmedTeamName = searchText.trim();
      const existingTeam = props.teamsData.allTeams.find(
        team => team.teamName.toLowerCase().trim() === trimmedTeamName.toLowerCase()
      );
      
      if (existingTeam) {
        setDuplicateTeam(true);
        setIsLoading(false);
        return;
      }

      const source = CancelToken.source();
      const timeout = setTimeout(() => axiosResponseExceededTimeout(source), 20000);

      try {
        setIsLoading(true);
        setDuplicateTeam(false); // Clear duplicate error when attempting to create
        const response = await dispatch(postNewTeam(trimmedTeamName, true, source));
        clearTimeout(timeout);

        if (response?.status === 200) {
          setDuplicateTeam(false);
          !isNotDisplayAlert && setIsNotDisplayAlert(true);

          toast.success('Team created successfully');
          setIsLoading(false);
          
          // For new teams, we can pass the team name or object if available
          // logic to find the new team object would be ideal here similar to development
           const created = response?.data;
           onAssignTeam(created);

        } else {
          setIsLoading(false);
          const messageToastError =
            response?.status === 500
              ? 'No response received from the server'
              : 'Error occurred while creating team';
          
          // Check for duplicate team error (403 or specific error message)
          if (response.status === 403 || 
              (response.data && response.data.message && 
               response.data.message.toLowerCase().includes('already exists'))) {
            setDuplicateTeam(true);
          } else {
            toast.error(messageToastError);
          }
        }
      } catch (e) {
        clearTimeout(timeout);
        setIsLoading(false);
        toast.error('Error occurred while creating team');
      }
    } else {
      onNewTeamValidation(false);
    }
  };

  const checkForDuplicateTeam = (teamName) => {
    if (!teamName || !teamName.trim()) {
      setDuplicateTeam(false);
      return;
    }
    
    const trimmedTeamName = teamName.trim();
    const existingTeam = props.teamsData.allTeams.find(
      team => team.teamName.toLowerCase().trim() === trimmedTeamName.toLowerCase()
    );
    
    setDuplicateTeam(!!existingTeam);
  };

  const handleSearchTextChange = (newText) => {
    setSearchText(newText);
    checkForDuplicateTeam(newText);
  };

  useEffect(() => {
    if (isEdit && teamName) {
      setSearchText(teamName);
    } else {
      setSearchText('');
    }
    onValidation(true);
    onNewTeamValidation(true);
    setDuplicateTeam(false);
    setIsNotDisplayAlert(true);
  }, [props.open, isEdit, teamName]);

  const onEditTeam = async () => {
    if (searchText !== '' && searchText.trim() !== '') {
      // Client-side duplicate check (ignore current team name)
      const trimmedTeamName = searchText.trim();
      const existingTeam = props.teamsData.allTeams.find(
        team => team.teamName.toLowerCase().trim() === trimmedTeamName.toLowerCase() && team._id !== teamId
      );
      if (existingTeam) {
        setDuplicateTeam(true);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setDuplicateTeam(false);
      const response = await onUpdateTeam(trimmedTeamName, teamId, isActive, teamCode);
      setIsLoading(false);
      if (response && response.status === 200) {
        toast.success('Team updated successfully');
        closePopup();
      } else if (response && response.status === 403) {
        setDuplicateTeam(true);
      } else if (response) {
        toast.error(response.data?.message || 'Error updating team');
      }
    } else {
      onNewTeamValidation(false);
    }
  };

  const handleConfirm = () => {
    if (isEdit) {
      onEditTeam();
    } else {
      onCreateTeam();
    }
  };

  return (
    <Modal
      isOpen={props.open}
      toggle={closePopup}
      className={darkMode ? 'text-light dark-mode' : ''}
    >
      <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={closePopup}>
        {isEdit ? 'Update Team Name' : 'Add Team'}
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''} style={{ textAlign: 'center' }}>
        <label
          htmlFor="team-name-input"
          className={darkMode ? 'text-light' : ''}
          style={{ textAlign: 'left', fontWeight: 'bold' }}
        >
          Name of the Team<span className="red-asterisk">* </span>
        </label>

        <div className="input-group-prepend" style={{ marginBottom: '10px' }}>
          {isEdit ? (
            <input
              id="team-name-input"
              type="text"
              className={`form-control ${darkMode ? 'bg-darkmode-liblack text-light' : ''}`}
              value={searchText}
              onChange={e => handleSearchTextChange(e.target.value)}
              placeholder="Enter new team name"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
          ) : (
            <AddTeamsAutoComplete
              teamsData={props.teamsData}
              onCreateNewTeam={onCreateTeam}
              searchText={searchText}
              setInputs={onSelectTeam}
              setSearchText={handleSearchTextChange}
            />
          )}
          <Button
            color="primary"
            style={{ marginLeft: '5px' }}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? <Spinner color="light" size="sm" /> : 'OK'}
          </Button>
        </div>

        {/* Helpful hint while loading the list the first time */}
        {teamsLoading && (
          <div style={{ fontSize: 13, color: darkMode ? '#cbd5e1' : '#6b7280', marginTop: -6 }}>
            Loading teams…
          </div>
        )}

        {!isNotDisplayAlert && (
          <>
            <Alert color="danger">
              {findCandidates().length > 1
                ? 'More than one team matches your text. Please refine or pick from the dropdown.'
                : 'Oops, this team does not exist! Create it if you want it.'}
            </Alert>
            <div
              style={{
                marginBottom: '10px',
                display: 'flex',
                flexDirection: 'row',
                gap: '10px',
                justifyContent: 'center',
              }}
            >
              {/* prettier-ignore  */}
              <Button color="info" onClick={onCreateTeam}><b>Create Team</b></Button>
              {/* prettier-ignore  */}
              <Button color="danger" onClick={() => {
                setIsNotDisplayAlert(true);
                setDuplicateTeam(false);
              }}><b>Cancel team creation </b></Button>
            </div>
          </>
        )}

        {!isValidTeam && !searchText && !selectedTeam && (
          <Alert color="danger">Hey, You need to pick a team first!</Alert>
        )}

        {!isValidNewTeam && !isDuplicateTeam ? (
          <Alert color="danger">Please enter a team name.</Alert>
        ) : null}
        {isDuplicateTeam && (
          <Alert color="warning">
            <strong>A team with this name already exists!</strong> Please choose a different name.
          </Alert>
        )}
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
