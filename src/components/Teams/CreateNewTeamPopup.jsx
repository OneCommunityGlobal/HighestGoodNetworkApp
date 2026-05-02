/* eslint-disable jsx-a11y/no-autofocus */
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import { boxStyle, boxStyleDark } from '~/styles';
import '../Header/index.css';
const TEAM_NAME_MAX_LENGTH = 100;

export const CreateNewTeamPopup = React.memo(props => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const allTeams = useSelector(state => state.allTeamsData.allTeams);

  const [newTeam, setNewName] = useState('');
  const [isValidTeam, onValidation] = useState(true);
  const [teamExists, setTeamExists] = useState(false);

  const closePopup = () => props.onClose();

  useEffect(() => {
    setNewName(props.teamName);
    onValidation(true);
    setTeamExists(false);
  }, [props.open, props.teamName]);

  const handleTeamNameChange = e => {
    const teamName = e.target.value;
    // Only update if within character limit
    if (teamName.length <= TEAM_NAME_MAX_LENGTH) {
      setNewName(teamName);
      onValidation(true);
      setTeamExists(allTeams.some(team => team.teamName.toLowerCase() === teamName.toLowerCase()));
    }
  };

  const handleSubmit = async () => {
    if (newTeam !== '') {
      if (!teamExists || props.isEdit) {
        await props.onOkClick(newTeam, props.isEdit);
      } else {
        setTeamExists(true);
      }
    } else {
      onValidation(false);
    }
  };

  return (
    <Modal
      autoFocus={false}
      isOpen={props.open}
      toggle={closePopup}
      className={darkMode ? 'dark-mode text-light' : ''}
    >
      <ModalHeader toggle={closePopup} className={darkMode ? 'bg-space-cadet' : ''}>
        {props.isEdit ? 'Update Team Name' : 'Create New Team'}
      </ModalHeader>
      <ModalBody style={{ textAlign: 'start' }} className={darkMode ? 'bg-yinmn-blue' : ''}>
        <label htmlFor="teamName" className={darkMode ? 'text-light' : ''}>
          Name of the Team<span className="red-asterisk">* </span>
        </label>
        <Input
          autoFocus
          id="teamName"
          placeholder="Please enter a new team name"
          value={newTeam}
          onChange={handleTeamNameChange}
          maxLength={TEAM_NAME_MAX_LENGTH}
          className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}
          required
        />
        <small
          className={darkMode ? 'text-light' : 'text-muted'}
          style={{ display: 'block', marginTop: '0.25rem' }}
        >
          {newTeam.length}/{TEAM_NAME_MAX_LENGTH} characters
        </small>
        {!isValidTeam && <Alert color="danger">Please enter a team name.</Alert>}
        {teamExists && !props.isEdit && (
          <Alert color="warning">
            That’s a great team name! So great that someone else already created that team. Please
            choose a new name or use the existing team.
          </Alert>
        )}
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={closePopup} style={darkMode ? boxStyleDark : boxStyle}>
          Close
        </Button>
        <Button color="primary" onClick={handleSubmit} style={darkMode ? boxStyleDark : boxStyle}>
          OK
        </Button>
      </ModalFooter>
    </Modal>
  );
});

CreateNewTeamPopup.displayName = 'CreateNewTeamPopup';

export default CreateNewTeamPopup;
