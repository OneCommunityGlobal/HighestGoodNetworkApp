import React, { useEffect, useMemo, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Spinner } from 'reactstrap';
import AddTeamsAutoComplete from './AddTeamsAutoComplete';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../Header/DarkMode.css';
import { postNewTeam, getAllUserTeams } from '../../../../src/actions/allTeamsAction';
// eslint-disable-next-line import/no-named-as-default-member
import axios from 'axios';

// eslint-disable-next-line react/display-name
const AddTeamPopup = React.memo((props) => {
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

  const findExact = () => {
    const q = normalize(searchText);
    if (!q) return undefined;
    return allTeams.find((t) => normalize(t.teamName) === q);
  };

  const onAssignTeam = (result) => {
    if (!result && !selectedTeam) {
      onValidation(false);
      return;
    }
    const toAssign = result || selectedTeam;
    const idToCheck = toAssign?._id;

    const notAlreadyMember = !props.userTeamsById?.some((x) => x._id === idToCheck);
    if (toAssign && notAlreadyMember) {
      props.onSelectAssignTeam(toAssign);
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

  // Safely extract teams from various thunk/response shapes
  const extractTeams = (payload) => {
    if (!payload) return [];
    // common shapes: array, {data: [...]}, {allTeams: [...]}, {data: {allTeams: [...]}}
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.allTeams)) return payload.allTeams;
    if (payload.data && Array.isArray(payload.data.allTeams)) return payload.data.allTeams;
    // some thunks return {status, data}
    if (payload.status && Array.isArray(payload.data)) return payload.data;
    if (payload.status && payload.data && Array.isArray(payload.data.allTeams)) return payload.data.allTeams;
    return [];
  };

  const refreshTeams = async () => {
    try {
      setTeamsLoading(true);
      const resp = await dispatch(getAllUserTeams());
      const list = extractTeams(resp);
      if (list.length) setTeams(list);
    } finally {
      setTeamsLoading(false);
    }
  };

  const onCreateTeam = async () => {
    if (!searchText || searchText.trim() === '') {
      onNewTeamValidation(false);
      return;
    }

    // Client-side duplicate check
    const trimmedTeamName = searchText.trim();
    const existingTeam = allTeams.find(
      team => normalize(team.teamName) === normalize(trimmedTeamName)
    );
    
    if (existingTeam) {
      setDuplicateTeam(true);
      setIsLoading(false);
      return;
    }

    // eslint-disable-next-line import/no-named-as-default-member
    const CancelToken = axios.CancelToken;
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

        // refresh list, then assign
        await refreshTeams();

        toast.success('Team created successfully');
        // find newly created team by exact name match
        const created =
          allTeams.find((t) => normalize(t.teamName) === normalize(searchText)) ||
          extractTeams(response)?.[0] ||
          response?.data;

        setIsLoading(false);
        if (props.onSelectAssignTeam) {
          onAssignTeam(created);
        } else {
          closePopup();
        }
      } else {
        setIsLoading(false);
        const messageToastError =
          response?.status === 500
            ? 'No response received from the server'
            : 'Error occurred while creating team';
        
        // Check for duplicate team error (403 or specific error message)
        if (response?.status === 403 || 
            (response?.data && response.data.message && 
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
  };

  const onConfirm = () => {
    const trimmedSearchText = searchText.trim();
    if (!trimmedSearchText && !selectedTeam) {
      onValidation(false);
      onNewTeamValidation(true);
      setIsNotDisplayAlert(true);
      return;
    }

    if (selectedTeam) {
      onValidation(true);
      !isNotDisplayAlert && setIsNotDisplayAlert(true);
      onAssignTeam(selectedTeam);
      return;
    }

    const exact = findExact();
    if (exact) {
      onValidation(true);
      !isNotDisplayAlert && setIsNotDisplayAlert(true);
      onAssignTeam(exact);
      return;
    }

    const matches = findCandidates();
    if (matches.length === 1) {
      onValidation(true);
      !isNotDisplayAlert && setIsNotDisplayAlert(true);
      onAssignTeam(matches[0]);
      return;
    }

    setIsNotDisplayAlert(false);
  };

  // Fetch/refresh teams whenever the modal opens
  useEffect(() => {
    if (props.open) {
      refreshTeams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open]);

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

  const generateValidTeamCode = (teamName) => {
    if (!teamName || teamName.trim() === '') {
      return 'TEAM-1';
    }
    
    // Take first letter and create a format like A-AAAA
    const firstLetter = teamName.charAt(0).toUpperCase();
    const remainingLetters = teamName.slice(1, 5).toUpperCase().padEnd(4, 'A');
    return `${firstLetter}-${remainingLetters}`;
  };

  const onEditTeam = async () => {
    if (searchText !== '' && searchText.trim() !== '') {
      // Client-side duplicate check (ignore current team name)
      const trimmedTeamName = searchText.trim();
      const existingTeam = allTeams.find(
        team => normalize(team.teamName) === normalize(trimmedTeamName) && team._id !== teamId
      );
      if (existingTeam) {
        setDuplicateTeam(true);
        setIsLoading(false);
        return;
      }
      
      // Use existing teamCode or generate a new one if it's missing
      const validTeamCode = teamCode && teamCode.trim() !== '' ? teamCode : generateValidTeamCode(trimmedTeamName);
      
      setIsLoading(true);
      setDuplicateTeam(false);
      
      try {
        // Call the action creator directly (it's already connected via mapDispatchToProps)
        const result = await onUpdateTeam(trimmedTeamName, teamId, isActive, validTeamCode);
        setIsLoading(false);
        
        // Check if the action was successful
        if (result && result.status === 200) {
          toast.success('Team updated successfully');
          // Reset state and close popup
          setSearchText('');
          setDuplicateTeam(false);
          setIsLoading(false);
          closePopup();
        } else if (result && result.status === 403) {
          setDuplicateTeam(true);
          toast.error('A team with this name already exists');
        } else if (result && result.status === 400) {
          // Handle validation errors
          if (result.data && result.data.errors && result.data.errors.teamCode) {
            toast.error(result.data.errors.teamCode.message);
          } else {
            toast.error(result.data?.message || 'Invalid team data');
          }
        } else if (result && typeof result === 'string') {
          // Handle error response from the action creator
          toast.error(result);
        } else if (result) {
          toast.error(result.message || 'Error updating team');
        } else {
          toast.error('Failed to update team. Please try again.');
        }
      } catch (error) {
        setIsLoading(false);
        // eslint-disable-next-line no-console
        console.error('Error updating team:', error);
        toast.error('An unexpected error occurred while updating the team');
      }
    } else {
      onNewTeamValidation(false);
    }
  };

  const handleConfirm = () => {
    if (isEdit) {
      onEditTeam();
    } else {
      onConfirm();
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
        <label htmlFor="team-search" className={darkMode ? 'text-light' : ''} style={{ textAlign: 'left', fontWeight: isEdit ? 'bold' : 'normal' }}>
          {isEdit ? (
            <>
              Name of the Team<span className="red-asterisk">* </span>
            </>
          ) : (
            'Add to Team'
          )}
        </label>

        <div className="input-group-prepend" style={{ marginBottom: '10px' }}>
          {isEdit ? (
            <input
              type="text"
              className={`form-control ${darkMode ? 'bg-darkmode-liblack text-light' : ''}`}
              value={searchText}
              onChange={e => {
                setSearchText(e.target.value);
                const trimmedTeamName = e.target.value.trim();
                const existingTeam = allTeams.find(
                  team => normalize(team.teamName) === normalize(trimmedTeamName) && team._id !== teamId
                );
                setDuplicateTeam(!!existingTeam);
              }}
              placeholder="Enter new team name"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
          ) : (
            <AddTeamsAutoComplete
              teamsData={{ allTeams }}
              onCreateNewTeam={onCreateTeam}
              searchText={searchText}
              setInputs={onSelectTeam}
              setSearchText={setSearchText}
            />
          )}
          <Button
            color="primary"
            style={{ marginLeft: '5px' }}
            onClick={isEdit ? handleConfirm : onConfirm}
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
              <Button color="info" onClick={onCreateTeam}>
                <b>Create Team</b>
              </Button>
              <Button color="danger" onClick={() => {
                setIsNotDisplayAlert(true);
                setDuplicateTeam(false);
              }}>
                <b>Cancel team creation </b>
              </Button>
            </div>
          </>
        )}

        {!isValidTeam && !searchText && !selectedTeam && (
          <Alert color="danger">Hey, You need to pick a team first!</Alert>
        )}

        {!isValidNewTeam && !isDuplicateTeam && searchText.trim().length > 0 ? (
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
