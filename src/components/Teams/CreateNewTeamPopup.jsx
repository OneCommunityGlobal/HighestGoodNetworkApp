import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import { boxStyle } from 'styles';

const CreateNewTeamPopup = React.memo(props => {
  const [newTeam, onNewName] = useState('');
  const closePopup = () => {
    props.onClose();
  };
  const [isValidTeam, onValidation] = useState(true);
  useEffect(() => {
    onNewName(props.teamName);
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
            onNewName(e.target.value);
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
          onClick={() => {
            if (newTeam !== '') {
              props.onOkClick(newTeam, props.isEdit);
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


/**
 * Create “Limit See-All” option for teams (WIP Ramya)
Other Links>Teams
When this option is turned on for a team, only selected people in the team should be able to see all other members of the team
This is needed so that I can create teams with members that need additional support in a managed group. This should keep them from seeing each other, even if they are on different teams where they CAN see all their other team members

 */