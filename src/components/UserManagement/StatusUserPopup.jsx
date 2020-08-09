import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
import { useState } from 'react';
import { ACTIVE } from '../../languages/en/ui';

const StatusUserPopup = React.memo((props) => {
  const closePopup = (e) => { props.onclose() };

  return <Modal isOpen={props.open} toggle={closePopup}>
    <ModalHeader toggle={closePopup}>Current Status</ModalHeader>
    <ModalBody style={{ textAlign: 'center' }}>
      <span style={{ color: 'blue' }}>{props.status === true ? "ACTIVE" : "INACTIVE"}</span>
    </ModalBody>
    <ModalFooter>
      <Button color="secondary" onClick={closePopup}>Close</Button>
    </ModalFooter>
  </Modal>
});
export default StatusUserPopup