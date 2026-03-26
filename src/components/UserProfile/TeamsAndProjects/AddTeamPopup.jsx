import React, { useEffect, useMemo, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Spinner } from 'reactstrap';
import AddTeamsAutoComplete from './AddTeamsAutoComplete';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../Header/index.css';
import { postNewTeam, getAllUserTeams } from '../../../../src/actions/allTeamsAction';
// eslint-disable-next-line import/no-named-as-default-member
import axios from 'axios';

// eslint-disable-next-line react/display-name
const AddTeamPopup = React.memo((props) => {
  const { darkMode } = props;
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
    if (!searchText) {
      onNewTeamValidation(false);
      return;
    }

    // eslint-disable-next-line import/no-named-as-default-member
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const timeout = setTimeout(() => axiosResponseExceededTimeout(source), 20000);

    try {
      setIsLoading(true);
      const response = await dispatch(postNewTeam(searchText, true, source));
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
        onAssignTeam(created);
      } else {
        setIsLoading(false);
        const messageToastError =
          response?.status === 500
            ? 'No response received from the server'
            : 'Error occurred while creating team';
        response?.status === 403 ? setDuplicateTeam(true) : toast.error(messageToastError);
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
    onValidation(true);
    onNewTeamValidation(true);
    setIsNotDisplayAlert(true);
    setDuplicateTeam(false);
  }, [props.open]);

  return (
    <Modal
      isOpen={props.open}
      toggle={closePopup}
      className={darkMode ? 'text-light dark-mode' : ''}
    >
      <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={closePopup}>
        Add Team
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''} style={{ textAlign: 'center' }}>
        <label  htmlFor="team-search" className={darkMode ? 'text-light' : ''} style={{ textAlign: 'left' }}>
          Add to Team
        </label>

        <div className="input-group-prepend" style={{ marginBottom: '10px' }}>
          <AddTeamsAutoComplete
            teamsData={{ allTeams }}   // always pass an array; from local state
            onCreateNewTeam={onCreateTeam}
            searchText={searchText}
            setInputs={onSelectTeam}   // passes TEAM OBJECT back
            setSearchText={setSearchText}
          />
          <Button
            color="primary"
            style={{ marginLeft: '5px' }}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? <Spinner color="light" size="sm" /> : 'Confirm'}
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
              <Button color="danger" onClick={() => setIsNotDisplayAlert(true)}>
                <b>Cancel team creation </b>
              </Button>
            </div>
          </>
        )}

        {!isValidTeam && !searchText && !selectedTeam && (
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
