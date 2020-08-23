import React from 'react'
import UserProfile from '../UserProfile'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

/**
 * Modal popup to show the user profile in create mode
 */
const NewUserPopup = React.memo((props) => {
  const closePopup = (e) => { props.onUserPopupClose() };
  return <Modal isOpen={props.open} toggle={closePopup}>
    <ModalHeader toggle={closePopup}>New User</ModalHeader>
    <ModalBody>
      <UserProfile />
    </ModalBody>
    <ModalFooter>
      <Button color="secondary" onClick={closePopup}>Close</Button>
    </ModalFooter>
  </Modal>
});

export default NewUserPopup;