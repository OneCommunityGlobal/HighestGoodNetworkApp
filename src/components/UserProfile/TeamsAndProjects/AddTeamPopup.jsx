import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  Spinner,
} from 'reactstrap';
import AddTeamsAutoComplete from './AddTeamsAutoComplete';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import darkModeStyles from '../../Header/DarkMode.module.css';
import { postNewTeam, getAllUserTeams } from '../../../../src/actions/allTeamsAction';
import axios, { CancelToken } from 'axios';

function generateValidTeamCode(name) {
  if (!name?.trim()) return 'TEAM-1';
  const firstLetter = name.charAt(0).toUpperCase();
  const remainingLetters = name.slice(1, 4).toUpperCase().padEnd(3, 'A');
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

  const [teams, setTeams] = useState(() => props.teamsData?.allTeams ?? []);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [selectedTeam, onSelectTeam] = useState(undefined);
  const [isValidTeam, onValidation] = useState(true);
  const [isValidNewTeam, onNewTeamValidation] = useState(true);
  const [searchText, setSearchText] = useState('');

  const [isDuplicateTeam, setDuplicateTeam] = useState(false);
  const [isNotDisplayAlert, setIsNotDisplayAlert] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(props.teamsData?.allTeams) && props.teamsData.allTeams.length) {
      setTeams(props.teamsData.allTeams);
    }
  }, [props.teamsData?.allTeams]);

  const closePopup = () => {
    props.onClose();
    if (!isNotDisplayAlert) setIsNotDisplayAlert(true);
    setSearchText('');
    onSelectTeam(undefined);
    onValidation(true);
    onNewTeamValidation(true);
    setDuplicateTeam(false);
  };

  const normalize = (s) => (s ?? '').toString().toLowerCase().trim().replace(/\s+/g, ' ');

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
      onSelectTeam(undefined);
      onValidation(true);
      closePopup();
    } else {
      toast.error(
        'Your user has been found in this team. Please select another team to add your user.',
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
    if (payload.data && Array.isArray(payload.data.allTeams)) return payload.data.allTeams;
    if (Array.isArray(payload.data?.allTeams)) return payload.data.allTeams;
    if (payload.status && Array.isArray(payload.data)) return payload.data;
    if (payload.status && payload.data && Array.isArray(payload.data.allTeams)) {
      return payload.data.allTeams;
    }
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
    if (!searchText?.trim()) {
      onNewTeamValidation(false);
      return;
    }

    const source = CancelToken.source();
    const timeout = setTimeout(() => axiosResponseExceededTimeout(source), 20000);
    try {
      setIsLoading(true);
      const teamName = searchText.trim();
      const response = await dispatch(postNewTeam(teamName, true, source));
      clearTimeout(timeout);

      if (response?.status === 200) {
        setDuplicateTeam(false);
        if (!isNotDisplayAlert) setIsNotDisplayAlert(true);

        await refreshTeams();

        toast.success('Team created successfully');

        const created =
          extractTeams(response)?.find((t) => normalize(t.teamName) === normalize(teamName)) ||
          allTeams.find((t) => normalize(t.teamName) === normalize(teamName)) ||
          response?.data;

        setIsLoading(false);
        onAssignTeam(created);
      } else {
        setIsLoading(false);
        const messageToastError =
          response?.status === 500
            ? 'No response received from the server'
            : 'Error occurred while creating team';

        if (response?.status === 403) {
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
    if (!searchText && !selectedTeam) {
      onValidation(false);
      return;
    }

    if (selectedTeam) {
      onValidation(true);
      if (!isNotDisplayAlert) setIsNotDisplayAlert(true);
      onAssignTeam(selectedTeam);
      return;
    }

    const exact = findExact();
    if (exact) {
      onValidation(true);
      if (!isNotDisplayAlert) setIsNotDisplayAlert(true);
      onAssignTeam(exact);
      return;
    }

    const matches = findCandidates();
    if (matches.length === 1) {
      onValidation(true);
      if (!isNotDisplayAlert) setIsNotDisplayAlert(true);
      onAssignTeam(matches[0]);
      return;
    }

    setIsNotDisplayAlert(false);
  };

  useEffect(() => {
    if (props.open) {
      refreshTeams();
    }
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
      centered
      className={darkMode ? `text-light ${darkModeStyles['dark-mode']}` : ''}
    >
      <ModalHeader className={darkMode ? 'bg-space-cadet text-light' : ''} toggle={closePopup}>
        {isEdit ? 'Update Team Name' : 'Add Team'}
      </ModalHeader>

      <ModalBody
        className={darkMode ? 'bg-yinmn-blue text-light' : ''}
        style={{
          padding: '1.25rem 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              fontSize: '1.4rem',
              fontWeight: 700,
              marginBottom: '0.5rem',
            }}
          >
            {isEdit ? 'Update Team Name' : 'Add to Team'}
          </div>

          <label
            htmlFor="team-search"
            className={darkMode ? 'text-light' : ''}
            style={{
              textAlign: 'left',
              fontWeight: 600,
              marginBottom: '0.2rem',
            }}
          >
            {isEdit ? (
              <>
                Name of the Team<span className="red-asterisk">* </span>
              </>
            ) : (
              'Team Name'
            )}
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'stretch',
              gap: '0.75rem',
              width: '100%',
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
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
            </div>

            <Button
              color="primary"
              onClick={handleConfirm}
              disabled={isLoading}
              style={{
                width: '140px',
                height: '38px',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {isLoading ? <Spinner color="light" size="sm" /> : isEdit ? 'OK' : 'Confirm'}
            </Button>
          </div>

          {teamsLoading && (
            <div
              style={{
                fontSize: '13px',
                color: darkMode ? '#cbd5e1' : '#6b7280',
                textAlign: 'left',
              }}
            >
              Loading teams...
            </div>
          )}

          {!isNotDisplayAlert && !isEdit && (
            <>
              <Alert color="danger" style={{ marginBottom: 0 }}>
                {findCandidates().length > 1
                  ? 'More than one team matches your text. Please refine or pick from the dropdown.'
                  : 'Oops, this team does not exist! Create it if you want it.'}
              </Alert>

              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Button color="info" onClick={onCreateTeam}>
                  <b>Create Team</b>
                </Button>
                <Button color="danger" onClick={() => setIsNotDisplayAlert(true)}>
                  <b>Cancel Team Creation</b>
                </Button>
              </div>
            </>
          )}

          {!isValidTeam && !searchText && !selectedTeam && (
            <Alert color="danger" style={{ marginBottom: 0 }}>
              {isEdit ? 'Team name cannot be empty.' : 'Hey, you need to pick a team first!'}
            </Alert>
          )}

          {!isValidNewTeam && !isDuplicateTeam && (
            <Alert color="danger" style={{ marginBottom: 0 }}>
              {isEdit ? 'Team name cannot be empty.' : 'Please enter a team name.'}
            </Alert>
          )}

          {isDuplicateTeam && (
            <Alert color="danger" style={{ marginBottom: 0 }}>
              {isEdit
                ? 'A team with this name already exists'
                : 'A team with this name already exists.'}
            </Alert>
          )}
        </div>
      </ModalBody>

      <ModalFooter
        className={darkMode ? 'bg-yinmn-blue' : ''}
        style={{
          padding: '0.75rem 1.5rem',
        }}
      >
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
