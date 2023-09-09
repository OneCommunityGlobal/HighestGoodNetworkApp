import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { USER_STATUS_CHANGE_CONFIRMATION } from '../../languages/en/messages';

/**
 * Modal popup to show the user profile to confirm activation/deactivtion
 */
const ActiveInactiveConfirmationPopup = React.memo(props => {
  const closePopup = () => {
    props.onClose();
  };
  const setActiveInactive = () => {
    props.setActiveInactive(!props.isActive);
  };

  return (
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Change the user status</ModalHeader>
      <ModalBody>
        <p>
          {USER_STATUS_CHANGE_CONFIRMATION(props.fullName, props.isActive ? 'INACTIVE' : 'ACTIVE')}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={setActiveInactive}>
          Ok
        </Button>
        <Button color="secondary" onClick={closePopup}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

export default ActiveInactiveConfirmationPopup;
