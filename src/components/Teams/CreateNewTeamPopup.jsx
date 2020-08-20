import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap'
import { useState } from 'react'

const CreateNewTeamPopup = React.memo((props) => {
  const [newTeam, onNewName] = useState('')
  const closePopup = (e) => { props.onClose() };

  return
  <Modal isOpen={props.open} toggle={closePopup}>
    <ModalHeader toggle={closePopup}>Create New Team</ModalHeader>
    <ModalBody style={{ textAlign: 'start' }}>
      <label>Name of the Team</label>

      <Input placeholder='Please enter a new team name'

        value={newTeam}
        onChange={(e) => { onNewName(e.target.value) }} required />

    </ModalBody>
    <ModalFooter>
      <Button color="secondary" onClick={closePopup}>Close</Button>
      <Button color="primary" onClick={(e) => props.onOkClick(newTeam)}>OK</Button>
    </ModalFooter>
  </Modal>
});
export default CreateNewTeamPopup