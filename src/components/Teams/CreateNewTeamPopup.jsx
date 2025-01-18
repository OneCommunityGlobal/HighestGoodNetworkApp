import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import { boxStyle, boxStyleDark } from 'styles';
import '../Header/DarkMode.css';

export const CreateNewTeamPopup = React.memo(props => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const allTeams = useSelector(state => state.allTeamsData.allTeams);

  const [newTeam, setNewName] = useState('');

  const closePopup = () => {
    props.onClose();
  };

  const [isValidTeam, onValidation] = useState(true);
  const [teamExists, setTeamExists] = useState(false);

  useEffect(() => {
    setNewName(props.teamName);
    onValidation(true);
    setTeamExists(false);
  }, [props.open, props.teamName]);

  const handleTeamNameChange = e => {
    const teamName = e.target.value;
    setNewName(teamName);
    onValidation(true);
    setTeamExists(allTeams.some(team => team.teamName.toLowerCase() === teamName.toLowerCase()));
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
        <label className={darkMode ? 'text-light' : ''}>Name of the Team</label>
        <Input
          autoFocus
          id="teamName"
          placeholder="Please enter a new team name"
          value={newTeam}
          onChange={handleTeamNameChange}
          required
        />
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
export default CreateNewTeamPopup;
