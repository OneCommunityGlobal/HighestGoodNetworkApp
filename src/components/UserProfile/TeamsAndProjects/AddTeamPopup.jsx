import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Spinner } from 'reactstrap';
import AddTeamsAutoComplete from './AddTeamsAutoComplete';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import darkModeStyles from '../../Header/DarkMode.module.css';
import { postNewTeam, getAllUserTeams } from '../../../../src/actions/allTeamsAction';
// eslint-disable-next-line import/no-named-as-default-member
import axios from 'axios';

function runConfirmStrategy(trimmedSearchText, selectedTeam, exactMatch, matches, callbacks) {
  const {
    onValidation,
    onNewTeamValidation,
    setIsNotDisplayAlert,
    setDuplicateTeam,
    onAssignTeam,
  } = callbacks;
  if (!trimmedSearchText && !selectedTeam) {
    onValidation(false);
    onNewTeamValidation(true);
    setIsNotDisplayAlert(true);
    return;
  }
  if (selectedTeam) {
    onValidation(true);
    setDuplicateTeam(true);
    setIsNotDisplayAlert(true);
    return;
  }
  if (exactMatch) {
    onValidation(true);
    setDuplicateTeam(true);
    setIsNotDisplayAlert(true);
    return;
  }
  if (matches.length === 1) {
    onValidation(true);
    setIsNotDisplayAlert(true);
    onAssignTeam(matches[0]);
    return;
  }
  setIsNotDisplayAlert(false);
}

function generateValidTeamCode(name) {
  if (!name?.trim()) return 'TEAM-1';
  const firstLetter = name.charAt(0).toUpperCase();
  const remainingLetters = name.slice(1, 5).toUpperCase().padEnd(4, 'A');
  return `${firstLetter}-${remainingLetters}`;
}

function handleEditInputChange(nextValue, ctx) {
  const { setSearchText, setDuplicateTeam, onNewTeamValidation, allTeams, normalize, teamId } = ctx;
  const trimmedTeamName = nextValue.trim();
  setSearchText(nextValue);
  if (!trimmedTeamName) {
    setDuplicateTeam(false);
    onNewTeamValidation(false);
    return;
  }
  onNewTeamValidation(true);
  const existingTeam = allTeams.find(
    (team) => normalize(team.teamName) === normalize(trimmedTeamName) && team._id !== teamId
  );
  setDuplicateTeam(!!existingTeam);
}

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

  const handleSearchTextChange = (value) => {
    setSearchText(value);
    if (selectedTeam) {
      onSelectTeam(undefined);
    }
    if (isDuplicateTeam) {
      setDuplicateTeam(false);
    }
    if (!value.trim()) {
      onNewTeamValidation(true);
    }
  };

  const axiosResponseExceededTimeout = (source) => {
    setIsLoading(false);
    source.cancel();
  };

  const extractTeams = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.allTeams)) return payload.allTeams;
    if (Array.isArray(payload.data?.allTeams)) return payload.data.allTeams;
    if (payload.status && Array.isArray(payload.data)) return payload.data;
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

  const applyCreateResponse = async (response) => {
    if (response?.status === 200) {
      setDuplicateTeam(false);
      !isNotDisplayAlert && setIsNotDisplayAlert(true);
      await refreshTeams();
      toast.success('Team created successfully');
      const created =
        allTeams.find((t) => normalize(t.teamName) === normalize(searchText)) ||
        extractTeams(response)?.[0] ||
        response?.data;
      setIsLoading(false);
      props.onSelectAssignTeam ? onAssignTeam(created) : closePopup();
      return;
    }
    setIsLoading(false);
    const isDuplicate =
      response?.status === 403 ||
      response?.data?.message?.toLowerCase().includes('already exists');
    if (isDuplicate) {
      setDuplicateTeam(true);
    } else {
      const msg =
        response?.status === 500
          ? 'No response received from the server'
          : 'Error occurred while creating team';
      toast.error(msg);
    }
  };

  const onCreateTeam = async () => {
    const trimmedTeamName = searchText?.trim();
    if (!trimmedTeamName) {
      onNewTeamValidation(false);
      return;
    }
    const existingTeam = allTeams.find(
      (team) => normalize(team.teamName) === normalize(trimmedTeamName)
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
      setDuplicateTeam(false);
      const response = await dispatch(postNewTeam(trimmedTeamName, true, source));
      clearTimeout(timeout);
      await applyCreateResponse(response);
    } catch (e) {
      clearTimeout(timeout);
      setIsLoading(false);
      toast.error('Error occurred while creating team');
    }
  };

  const onConfirm = () => {
    const trimmedSearchText = searchText.trim();
    const exact = findExact();
    const matches = findCandidates();
    runConfirmStrategy(trimmedSearchText, selectedTeam, exact, matches, {
      onValidation,
      onNewTeamValidation,
      setIsNotDisplayAlert,
      setDuplicateTeam,
      onAssignTeam,
    });
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

  const applyEditResult = (result) => {
    if (result?.status === 200) {
      toast.success('Team updated successfully');
      setSearchText('');
      setDuplicateTeam(false);
      setIsLoading(false);
      closePopup();
      return;
    }
    if (result?.status === 403) {
      setDuplicateTeam(true);
      toast.error('A team with this name already exists');
      return;
    }
    if (result?.status === 400) {
      const msg = result.data?.errors?.teamCode?.message ?? result.data?.message ?? 'Invalid team data';
      toast.error(msg);
      return;
    }
    if (typeof result === 'string') {
      toast.error(result);
      return;
    }
    if (result?.message) {
      toast.error(result.message);
      return;
    }
    toast.error('Failed to update team. Please try again.');
  };

  const onEditTeam = async () => {
    const trimmedTeamName = searchText?.trim();
    if (!trimmedTeamName) {
      onNewTeamValidation(false);
      return;
    }
    const existingTeam = allTeams.find(
      (team) => normalize(team.teamName) === normalize(trimmedTeamName) && team._id !== teamId
    );
    if (existingTeam) {
      setDuplicateTeam(true);
      setIsLoading(false);
      return;
    }
    const validTeamCode = teamCode?.trim() ? teamCode : generateValidTeamCode(trimmedTeamName);
    setIsLoading(true);
    setDuplicateTeam(false);
    try {
      const result = await onUpdateTeam(trimmedTeamName, teamId, isActive, validTeamCode);
      setIsLoading(false);
      applyEditResult(result);
    } catch (error) {
      setIsLoading(false);
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error updating team:', error);
      }
      toast.error('An unexpected error occurred while updating the team');
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
      className={darkMode ? `text-light ${darkModeStyles['dark-mode']}` : ''}
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
              onChange={(e) =>
                handleEditInputChange(e.target.value, {
                  setSearchText,
                  setDuplicateTeam,
                  onNewTeamValidation,
                  allTeams,
                  normalize,
                  teamId,
                })
              }
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
              setSearchText={handleSearchTextChange}
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
                closePopup();
              }}>
                <b>Cancel team creation </b>
              </Button>
            </div>
          </>
        )}

        {!isValidTeam && !searchText && !selectedTeam && (
          <Alert color="danger">Team name cannot be empty.</Alert>
        )}

        {!isValidNewTeam && !isDuplicateTeam ? (
          <Alert color="danger">
            {isEdit ? 'Team name cannot be empty.' : 'Please enter a team name.'}
          </Alert>
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

AddTeamPopup.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  teamsData: PropTypes.shape({
    allTeams: PropTypes.arrayOf(PropTypes.object),
  }),
  userTeamsById: PropTypes.arrayOf(PropTypes.object),
  onSelectAssignTeam: PropTypes.func,
  darkMode: PropTypes.bool,
  isEdit: PropTypes.bool,
  teamName: PropTypes.string,
  teamId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  teamCode: PropTypes.string,
  isActive: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  onUpdateTeam: PropTypes.func,
};

AddTeamPopup.defaultProps = {
  teamsData: {},
  userTeamsById: [],
  onSelectAssignTeam: undefined,
  darkMode: false,
  isEdit: false,
  teamName: '',
  teamId: undefined,
  teamCode: '',
  isActive: '',
  onUpdateTeam: undefined,
};

export default AddTeamPopup;
