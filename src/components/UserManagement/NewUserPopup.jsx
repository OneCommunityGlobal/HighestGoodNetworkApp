import React from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import UserProfile from '../UserProfile/AddNewUserProfile';
import { useHistory } from 'react-router-dom';

/**
 * Modal popup to show the user profile in create mode
 */
const NewUserPopup = React.memo((props) => {
  const closePopup = (e) => { props.onUserPopupClose(); };
  const history = useHistory()
  return (
    <Modal isOpen={props.open} toggle={closePopup} className={"modal-dialog modal-lg"}>
      <ModalHeader toggle={closePopup}>New User</ModalHeader>
      <ModalBody>
        <UserProfile isAddNewUser={true} history={history} />
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={closePopup}>Close</Button>
      </ModalFooter>
    </Modal>
  );
});

export default NewUserPopup;
