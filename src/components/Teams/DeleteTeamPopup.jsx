import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';

const DeleteTeamPopup = React.memo((props) => {
  const closePopup = (e) => { props.onClose() };

  return <Modal isOpen={props.open} toggle={closePopup}>
    <ModalHeader toggle={closePopup}>Delete</ModalHeader>
    <ModalBody style={{ textAlign: 'center' }}>
      <span>{props.data}</span>

    </ModalBody>
    <ModalFooter>
      <Button color="secondary" onClick={closePopup}>Close</Button>
    </ModalFooter>
  </Modal>
});
export default DeleteTeamPopup