import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
// import { useState } from 'react';

const DeleteTeamPopup = React.memo((props) => {

  const closePopup = (e) => { props.onClose() };
  debugger;
  return <Modal isOpen={props.open} toggle={closePopup}>
    <ModalHeader toggle={closePopup}>Delete</ModalHeader>
    <ModalBody style={{ textAlign: 'center' }}>
      <span>Are you sure you want to delete the team with name "{props.selectedTeamName}" ? This action cannot be undone.Switch this team to "Inactive" if you'd like to keep in the system.</span>

    </ModalBody>
    <ModalFooter>

      <Button color="danger" onClick={(e) => { props.onDeleteClick(props.selectedTeamId) }}>Confirm</Button>
      <Button color="warning" onClick={closePopup}>Set Inactive</Button>
      <Button color="primary" onClick={closePopup}>Close</Button>
    </ModalFooter>
  </Modal>
});
export default DeleteTeamPopup