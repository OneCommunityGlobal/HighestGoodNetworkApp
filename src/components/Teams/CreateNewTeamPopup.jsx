import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import { boxStyle, boxStyleDark } from 'styles';
import '../Header/DarkMode.css'

export const CreateNewTeamPopup = React.memo(props => {
  const darkMode = useSelector(state => state.theme.darkMode)

  const [newTeam, setNewName] = useState('');
  const closePopup = () => {
    props.onClose();
  };
  const [isValidTeam, onValidation] = useState(true);
  useEffect(() => {
    setNewName(props.teamName);
  }, [props.open, props.teamName]);
  return (
    <Modal autoFocus={false} isOpen={props.open} toggle={closePopup} className={darkMode ? 'dark-mode text-light' : ''}>
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
          onChange={e => {
            onValidation(true);
            setNewName(e.target.value);
          }}
          required
        />
        {isValidTeam === false ? <Alert color="danger">Please enter a team name.</Alert> : <></>}
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={closePopup} style={darkMode ? boxStyleDark : boxStyle}>
          Close
        </Button>
        <Button
          color="primary"
          onClick={async () => {
            if (newTeam !== '') {
              await props.onOkClick(newTeam, props.isEdit);
            } else {
              onValidation(false);
            }
          }}
          style={darkMode ? boxStyleDark : boxStyle}
        >
          OK
        </Button>
      </ModalFooter>
    </Modal>
  );
});
export default CreateNewTeamPopup;
