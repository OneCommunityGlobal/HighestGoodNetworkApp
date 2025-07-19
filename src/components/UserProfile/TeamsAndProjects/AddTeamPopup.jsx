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
  const [isDuplicateTeam, setDuplicateTeam] = useState(false);
  const [isNotDisplayAlert, setIsNotDisplayAlert] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const closePopup = () => {
    props.onClose();
    !isNotDisplayAlert && setIsNotDisplayAlert(true);
    setDuplicateTeam(false);
    onValidation(true);
    onNewTeamValidation(true);
    setSearchText('');
  };

  // prettier-ignore
  const format = result => result.toLowerCase().trim().replace(/\s+/g, '');

  const FilteredToTeamSpecific = arrayOrObj => {
    const result = props.teamsData.allTeams.filter(
      item => format(item.teamName) === format(searchText),
    );
    if (result.length > 0) {
      if (arrayOrObj) return result[0];
      else return result;
    } else return undefined;
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

    const idToCheck = result ? result._id : selectedTeam._id;

    const some = !props.userTeamsById.some(x => x._id === idToCheck);

    if ((result || selectedTeam) && some) {
      props.onSelectAssignTeam(result ? result : selectedTeam);

      setSearchText('');

      selectedTeam && (onSelectTeam(undefined), onValidation(false));
      closePopup(); // automatically closes the popup after team assigned
    } else
      toast.error(
        'Your user has been found in this team. Please select another team to add your user.',
      );
  };

  const axiosResponseExceededTimeout = source => {
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

      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      const timeout = setTimeout(() => axiosResponseExceededTimeout(source), 20000);

      setIsLoading(true);
      setDuplicateTeam(false); // Clear duplicate error when attempting to create
      const response = await dispatch(postNewTeam(trimmedTeamName, true, source));
      clearTimeout(timeout);
      if (response.status === 200) {
        setDuplicateTeam(false);
        !isNotDisplayAlert && setIsNotDisplayAlert(true);
        // Get updated teams list and select the new team
        await dispatch(getAllUserTeams());
        toast.success('Team created successfully');
        const newTeam = response.data; // Assuming response contains the new team data
        setIsLoading(false);
        onAssignTeam(newTeam);
      } else {
        setIsLoading(false);
        const messageToastError =
          response.status === 500
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
    onValidation(true);
    onNewTeamValidation(true);
    setDuplicateTeam(false);
    setIsNotDisplayAlert(true);
    setSearchText('');
  }, [props.open]);

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
            onCreateNewTeam={onCreateTeam}
            searchText={searchText}
            setInputs={onSelectTeam}
            setSearchText={handleSearchTextChange} // Use the new handler
          />
          <Button
            color="primary"
            style={{ marginLeft: '5px' }}
            onClick={() => {
              if (!searchText) onValidation(false);
              else IfTheUserNotSelectedSuggestionAutoComplete();
            }}
            disabled={isLoading}
          >
            {isLoading ? <Spinner color="light" size="sm" /> : 'Confirm'}
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

        {!isValidTeam && !searchText && (
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
