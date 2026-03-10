import React, { useEffect, useMemo, useState } from 'react';
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
import '../../Header/index.css';
import { postNewTeam, getAllUserTeams } from '../../../../src/actions/allTeamsAction';
import axios, { CancelToken } from 'axios';

// eslint-disable-next-line react/display-name
const AddTeamPopup = React.memo((props) => {
  const { darkMode } = props;
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
    onValidation(true);
    onNewTeamValidation(true);
    setIsNotDisplayAlert(true);
    setDuplicateTeam(false);
  }, [props.open]);

  return (
    <Modal
      isOpen={props.open}
      toggle={closePopup}
      centered
      size="lg"
      className={darkMode ? 'text-light dark-mode' : ''}
    >
      <ModalHeader className={darkMode ? 'bg-space-cadet text-light' : ''} toggle={closePopup}>
        Add Team
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
            Add to Team
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
            Team Name
          </label>

          <div
            style={{
              display: 'flex',
              alignItems: 'stretch',
              gap: '0.75rem',
              width: '100%',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                flex: '1 1 420px',
                minWidth: '260px',
              }}
            >
              <AddTeamsAutoComplete
                teamsData={{ allTeams }}
                onCreateNewTeam={onCreateTeam}
                searchText={searchText}
                setInputs={onSelectTeam}
                setSearchText={setSearchText}
              />
            </div>

            <Button
              color="primary"
              onClick={onConfirm}
              disabled={isLoading}
              style={{
                minWidth: '120px',
                height: '48px',
                fontWeight: 600,
              }}
            >
              {isLoading ? <Spinner color="light" size="sm" /> : 'Confirm'}
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

          {!isNotDisplayAlert && (
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
              Hey, you need to pick a team first!
            </Alert>
          )}

          {!isValidNewTeam && !isDuplicateTeam && (
            <Alert color="danger" style={{ marginBottom: 0 }}>
              Please enter a team name.
            </Alert>
          )}

          {isDuplicateTeam && (
            <Alert color="danger" style={{ marginBottom: 0 }}>
              A team with this name already exists.
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

export default AddTeamPopup;