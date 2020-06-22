import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
import { useState } from 'react';
import { UserDeleteType } from '../../utils/enums';

/**
 * Modal popup to delete the user profile 
 */
const DeleteUserPopup = React.memo((props) => {

  const closePopup = (e) => { props.onClose() };

  return <Modal isOpen={props.open} toggle={closePopup}>
    <ModalHeader toggle={closePopup}>Choose A Delete Action</ModalHeader>
    <ModalBody>
      <p>Are you sure you want to delete this user? This action cannot be undone.</p>
      <p>Switch them to 'Inactive' if you'd like to keep them in the system or choose “Keep Data”
      if you’d like to still delete them but add their associated data to the “Data Archive”
      instead of completely deleting them and all their data.</p>
      <div style={{ textAlign: "center", paddingTop: "10px" }}>
        <Button color="primary btn-danger" onClick={() => { props.onDelete(UserDeleteType.HardDelete) }}>
          Delete the data forever
        </Button>
        <DivSpacer />
        <Button color="primary btn-warning" onClick={() => { props.onDelete(UserDeleteType.Inactive) }}>
          Make them Inactive
        </Button>
        <DivSpacer />
        <Button color="primary btn-success " onClick={() => { props.onDelete(UserDeleteType.SoftDelete) }}>
          Keep the data and Delete
        </Button>
      </div>
    </ModalBody>
    <ModalFooter>
      <Button color="secondary" onClick={closePopup}>Close</Button>
    </ModalFooter>
  </Modal>
});

const DivSpacer = React.memo(() => {
  return <div style={{ padding: "5px" }}></div>
});

export default DeleteUserPopup;