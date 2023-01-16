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
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Duplicate Names</ModalHeader>
      <ModalBody>
        <p>There is already a user with the same name.</p>
        <p>Do you wish to proceed and have duplicate names?</p>
        <div style={{ textAlign: 'center', paddingTop: '10px' }}>
          <Button
            color="primary btn-danger"
            onClick={() => {
              props.setAllowDuplicateName(true);
              closePopup();
            }}
          >
            Yes
          </Button>
          <DivSpacer />
          <Button color="primary btn-warning" onClick={closePopup}>
            No
          </Button>
          <DivSpacer />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={closePopup}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

const DivSpacer = React.memo(() => {
  return <div style={{ padding: '5px' }}></div>;
});

export default DuplicateNamePopup;
