import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import { boxStyle } from 'styles';

export const CreateNewTeamPopup = React.memo(props => {
  const [newTeam, setNewName] = useState('');
  const closePopup = () => {
    props.onClose();
  };
  const [isValidTeam, onValidation] = useState(true);
  useEffect(() => {
    setNewName(props.teamName);
  }, [props.open, props.teamName]);
  return (
    <Modal autoFocus={false} isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>
        {props.isEdit ? 'Update Team Name' : 'Create New Team'}
      </ModalHeader>
      <ModalBody style={{ textAlign: 'start' }}>
        <label>Name of the Team</label>
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
      <ModalFooter>
        <Button color="secondary" onClick={closePopup} style={boxStyle}>
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
          style={boxStyle}
        >
          OK
        </Button>
      </ModalFooter>
    </Modal>
  );
});
export default CreateNewTeamPopup;
