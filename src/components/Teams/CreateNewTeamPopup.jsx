import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap'
import { useState } from 'react'

const CreateNewTeamPopup = React.memo((props) => {
  const [newTeam, onNewName] = useState('')
  const closePopup = (e) => { props.onClose() };
  const [isValidTeam, onValidation] = useState(true);

  return <Modal isOpen={props.open} toggle={closePopup}>
    <ModalHeader toggle={closePopup}>Create New Team</ModalHeader>
    <ModalBody style={{ textAlign: 'start' }}>
      <label>Name of the Team</label>

      <Input placeholder='Please enter a new team name'
        value={newTeam}
        onChange={(e) => {
          onValidation(true);
          onNewName(e.target.value);
        }} required />
      {(isValidTeam === false) ? (
        <Alert color="danger">
          Please enter a team name.
        </Alert>
      ) : <></>}

    </ModalBody>
    <ModalFooter>
      <Button color="secondary" onClick={closePopup}>Close</Button>
      <Button color="primary" onClick={(e) => {
        if (newTeam !== "") {
          props.onOkClick(newTeam)
        } else {
          onValidation(false);
        }
      }}>OK</Button>
    </ModalFooter>
  </Modal>
});
export default CreateNewTeamPopup