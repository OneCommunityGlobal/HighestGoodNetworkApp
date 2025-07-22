import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import { boxStyle, boxStyleDark } from '~/styles';
import '../Header/DarkMode.css';

function CreateNewTeamPopupComponent(props) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const allTeams = useSelector(state => state.allTeamsData.allTeams);

  const { onClose, onOkClick, teamName, isEdit, open } = props;

  const [newTeam, setNewName] = useState('');

  const closePopup = () => {
    onClose();
  };

  const [isValidTeam, onValidation] = useState(true);
  const [teamExists, setTeamExists] = useState(false);

  useEffect(() => {
    setNewName(teamName);
    onValidation(true);
    setTeamExists(false);
  }, [open, teamName]);

  const handleTeamNameChange = e => {
    const inputTeamName = e.target.value;
    setNewName(inputTeamName);
    onValidation(true);
    setTeamExists(
      allTeams.some(team => team.teamName.toLowerCase() === inputTeamName.toLowerCase()),
    );
  };

  const handleSubmit = async () => {
    if (newTeam !== '') {
      if (!teamExists || isEdit) {
        await onOkClick(newTeam, isEdit);
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
      isOpen={open}
      toggle={closePopup}
      className={darkMode ? 'dark-mode text-light' : ''}
    >
      <ModalHeader toggle={closePopup} className={darkMode ? 'bg-space-cadet' : ''}>
        {isEdit ? 'Update Team Name' : 'Create New Team'}
      </ModalHeader>
      <ModalBody style={{ textAlign: 'start' }} className={darkMode ? 'bg-yinmn-blue' : ''}>
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label htmlFor="teamName" className={darkMode ? 'text-light' : ''}>
          Name of the Team
          <span className="red-asterisk">*</span>
        </label>

        <Input
          autoFocus
          id="teamName"
          placeholder="Please enter a new team name"
          value={newTeam}
          onChange={handleTeamNameChange}
          className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}
          required
        />
        {!isValidTeam && <Alert color="danger">Please enter a team name.</Alert>}
        {teamExists && !isEdit && (
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
}

export const CreateNewTeamPopup = React.memo(CreateNewTeamPopupComponent);
export default CreateNewTeamPopup;
