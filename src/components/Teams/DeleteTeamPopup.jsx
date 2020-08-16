import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
// import { useState } from 'react';

const DeleteTeamPopup = React.memo((props) => {

  const closePopup = (e) => { props.onClose() };
  debugger;
  return <Modal isOpen={props.open} toggle={closePopup}>
    <ModalHeader toggle={closePopup}>Delete</ModalHeader>
    <ModalBody style={{ textAlign: 'center' }}>
      <span>Are you sure you want to delete the team with name"{props.data}"? This action cannot be undone.Switch this team to Inactive If you'd like to keep in the system.</span>

    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={closePopup}>Close</Button>
      <Button color="danger">Confirm</Button>
      <Button color="warning" onClick={closePopup}>Set Inactive</Button>
    </ModalFooter>
  </Modal>
});
export default DeleteTeamPopup