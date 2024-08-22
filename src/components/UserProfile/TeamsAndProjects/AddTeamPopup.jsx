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
    if(searchText === '')  {onValidation(false);  return;}

    const filterTeamData = FilteredToTeamSpecific(true);

    if (filterTeamData) {
      onAssignTeam(filterTeamData);
      onValidation(true);
      !isNotDisplayAlert && setIsNotDisplayAlert(true);
    } else setIsNotDisplayAlert(false);
  };

  const onAssignTeam = result => {
    //  prettier-ignore
    if (!searchText) {onValidation(false);  return;} /* when the user typed nothing  */

    const idToCheck = result ? result._id : selectedTeam._id;

    const some = !props.userTeamsById.some(x => x._id === idToCheck);

    if ((result || selectedTeam) && some) {
      props.onSelectAssignTeam(result ? result : selectedTeam);

      toast.success('Team assigned successfully '); // toast notification
      setSearchText('');

      selectedTeam && (onSelectTeam(undefined), onValidation(false));
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
    if (searchText !== '') {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      const timeout = setTimeout(() => axiosResponseExceededTimeout(source), 20000);

      setIsLoading(true);
      const response = await dispatch(postNewTeam(searchText, true, source));
      clearTimeout(timeout);
      if (response.status === 200) {
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
            setSearchText={setSearchText} // Added setSearchText prop
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