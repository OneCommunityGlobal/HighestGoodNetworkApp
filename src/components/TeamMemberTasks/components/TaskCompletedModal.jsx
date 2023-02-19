import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

/**
 * Modal popup to delete the user profile
 */
const DuplicateNamePopup = React.memo(props => {
  const closePopup = e => {
    props.onClose();
  };

  return (
    <Modal isOpen={props.isOpen} toggle={() => props.popupClose()}>
      <ModalHeader toggle={() => props.popupClose()}>Mark as Done</ModalHeader>
      <ModalBody>
        <p>Are you sure you want to mark this task as done?</p>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => {
              props.createUserProfile(true);
              props.onClose();
            }}
          >
            Confirm
          </Button>
          <Button onClick={() => props.popupClose()}>Cancel</Button>
        </ModalFooter>
      </ModalBody>
    </Modal>
  );
});

const DivSpacer = React.memo(() => {
  return <div style={{ padding: '5px' }}></div>;
});

export default DuplicateNamePopup;
